# 共享工具与辅助 — 学习记录

> **日期:** 2026-06-18
> **主题:** Vue.js 3.x 源码学习
> **路径:** 工程架构 (Project Architecture) → 共享工具与辅助 → reactive() 入口：isObject 如何决定哪些值能被 Proxy
> **水平:** 入门/中级

---

## 定位

`reactive()` 入口里的 `isObject` 是 Vue 响应式系统的第一道类型闸门：它决定一个值是否有资格进入 `Proxy` 代理流程。

## 类比

可以把 `reactive()` 想成一个“响应式加工厂”，`Proxy` 是工厂里的大型机器。

不是所有东西都能塞进这台机器。对象、数组、Map、Set 这类“有属性/成员可拦截”的值可以加工；数字、字符串、布尔值、`null` 这种原始值不能加工。`isObject` 就是机器入口的安检员：它不负责加工，只负责判断“这个东西能不能进机器”。

这个判断看起来很小，但它让 `reactive()` 的入口保持安全：能代理的才代理，不能代理的就原样返回。

## 核心机制

Vue 官方 API 把 `reactive()` 描述为“返回对象的响应式代理”，类型也是：

```ts
function reactive<T extends object>(target: T): UnwrapNestedRefs<T>
```

这里的关键是 `T extends object`。从 API 设计上，`reactive()` 面向的是对象，而不是任意值。

在源码里，`reactive()` 本身只是一个入口函数：

```ts
// /Users/naldomac/Projects/vuejs/core/packages/reactivity/src/reactive.ts:85-99
export function reactive<T extends object>(target: T): Reactive<T>
export function reactive(target: object) {
  if (isReadonly(target)) {
    return target
  }
  return createReactiveObject(
    target,
    false,
    mutableHandlers,
    mutableCollectionHandlers,
    reactiveMap,
  )
}
```

真正的入口检查发生在 `createReactiveObject()`：

```ts
// /Users/naldomac/Projects/vuejs/core/packages/reactivity/src/reactive.ts:262-278
function createReactiveObject(
  target: Target,
  isReadonly: boolean,
  baseHandlers: ProxyHandler<any>,
  collectionHandlers: ProxyHandler<any>,
  proxyMap: WeakMap<Target, any>,
) {
  if (!isObject(target)) {
    if (__DEV__) {
      warn(
        `value cannot be made ${isReadonly ? 'readonly' : 'reactive'}: ${String(
          target,
        )}`,
      )
    }
    return target
  }
}
```

`isObject` 的定义在 `@vue/shared`：

```ts
// /Users/naldomac/Projects/vuejs/core/packages/shared/src/general.ts:53-54
export const isObject = (val: unknown): val is Record<any, any> =>
  val !== null && typeof val === 'object'
```

这行代码同时做了两件事：

- 排除 `null`，因为 `typeof null === 'object'` 是 JavaScript 历史遗留坑。
- 排除 primitive 和 function，只允许真正进入对象处理分支的值继续往下走。

为什么这个判断必须在 `new Proxy()` 之前？因为 JavaScript 的 `Proxy` 只能代理对象。如果直接执行：

```ts
new Proxy(1, {})
```

运行时会抛错。Vue 不希望用户调用 `reactive(1)` 时直接炸掉，所以在开发环境给出 warning，在运行逻辑上返回原值。

这个入口判断还影响了深层响应式。比如读取一个 reactive 对象的嵌套属性时，Vue 会在 getter 里判断读出来的值是不是对象：

```ts
// /Users/naldomac/Projects/vuejs/core/packages/reactivity/src/baseHandlers.ts:126-130
if (isObject(res)) {
  // Convert returned value into a proxy as well.
  return isReadonly ? readonly(res) : reactive(res)
}
```

这说明 Vue 不是在一开始把整个对象树全部递归代理完，而是在访问嵌套对象时，按需把嵌套对象变成 reactive。`isObject` 在这里仍然是入口闸门：只有读出来的是对象，才需要继续代理。

`toReactive()` 也体现了同一个思想：

```ts
// /Users/naldomac/Projects/vuejs/core/packages/reactivity/src/reactive.ts:434-435
export const toReactive = <T extends unknown>(value: T): T =>
  isObject(value) ? reactive(value) : value
```

它的语义非常干净：对象就转成 reactive，非对象就原样返回。

## 代码示例

> **📁 Source:** `/Users/naldomac/Projects/vuejs/core/packages/reactivity/src/reactive.ts:85-99`, `/Users/naldomac/Projects/vuejs/core/packages/reactivity/src/reactive.ts:262-278`, `/Users/naldomac/Projects/vuejs/core/packages/shared/src/general.ts:53-54`

```ts
// 📁 /Users/naldomac/Projects/vuejs/core/packages/shared/src/general.ts:53-54
function isObject(val: unknown): val is Record<any, any> {
  return val !== null && typeof val === 'object'
}

// A simplified version of Vue's createReactiveObject gate.
function createReactiveObject<T>(target: T): T {
  if (!isObject(target)) {
    console.warn(`value cannot be made reactive: ${String(target)}`)
    return target
  }

  return new Proxy(target, {
    get(obj, key, receiver) {
      const value = Reflect.get(obj, key, receiver)
      return isObject(value) ? createReactiveObject(value) : value
    },
    set(obj, key, value, receiver) {
      return Reflect.set(obj, key, value, receiver)
    },
  })
}

const a = createReactiveObject(1)
const b = createReactiveObject({ count: 0, nested: { msg: 'hi' } })

console.log(a) // 1
console.log(b.nested.msg) // 'hi'
```

这段示例保留了 Vue 源码里的核心思想：

- `createReactiveObject(1)` 会被 `isObject` 拦住，直接返回 `1`。
- `createReactiveObject({ count: 0 })` 可以进入 `Proxy`。
- 读取 `b.nested` 时，getter 再次用 `isObject(value)` 判断嵌套值是否需要继续代理。

真实 Vue 源码还会继续处理 readonly、已有 Proxy、`ReactiveFlags.SKIP`、不可扩展对象、collection handlers、proxy 缓存等分支；但第一道门就是 `isObject`。

## 常见误区

- 误区 1：`reactive()` 可以让任何值都响应式。更准确地说，`reactive()` 面向对象；primitive 应该优先用 `ref()`。
- 误区 2：`isObject` 只是为了 TypeScript 类型好看。不是，它也是运行时安全检查，避免把 primitive 传给 `Proxy`。
- 误区 3：Vue 会一开始深度遍历整个对象树并全部代理。实际更接近“懒代理”：访问到嵌套对象时，再通过 `isObject` 判断是否继续 reactive。
- 误区 4：函数也是对象，所以应该能过 `isObject`。Vue 这里的 `isObject` 使用 `typeof val === 'object'`，函数不会通过，它关注的是响应式对象处理场景。

## 思考检查

1. 为什么 `reactive(1)` 不应该直接调用 `new Proxy(1, handlers)`？答案是：`Proxy` 的 target 必须是对象，primitive 会导致运行时错误，所以 Vue 需要先用 `isObject` 拦住。
2. 为什么嵌套对象可以在访问时才变成 reactive？答案是：getter 读取到嵌套值后，再用 `isObject(res)` 判断它是否需要进入 `reactive(res)`，这就是按需代理的入口。

---

## 快速总结

- `reactive()` 的公开语义是“创建对象的响应式代理”，不是代理任意值。
- `isObject` 是 `createReactiveObject()` 里的第一道运行时闸门，非对象会被原样返回。
- 深层响应式也依赖 `isObject`：读取嵌套对象时，Vue 才按需继续创建代理。

## 下一步

(Will be updated after the user chooses a sub-topic direction)
