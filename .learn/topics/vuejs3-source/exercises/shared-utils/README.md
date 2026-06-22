# 共享工具与辅助 — 练习

## 练习目标

实现一组 Vue 3 `@vue/shared` 风格的小工具，并把它们串进一个最小的 props 标准化和 reactive 入口判断流程里。

本练习对应你刚学过的：

- `isObject`
- `hasChanged`
- `hasOwn`
- `normalizeClass`
- `normalizeStyle`
- `normalizeProps`

参考源码：

- `/Users/naldomac/Projects/vuejs/core/packages/shared/src/general.ts:33-54`
- `/Users/naldomac/Projects/vuejs/core/packages/shared/src/general.ts:142-144`
- `/Users/naldomac/Projects/vuejs/core/packages/shared/src/normalizeProp.ts:5-95`
- `/Users/naldomac/Projects/vuejs/core/packages/reactivity/src/reactive.ts:262-278`

## 实现要求

打开 `starter.mjs`，把每个 `TODO` 替换成你的实现。

检查清单：

- `isObject(value)` 只在传入值是非 `null` 对象时返回 `true`。
- `hasChanged(value, oldValue)` 使用 `Object.is` 语义，所以 `NaN` 和 `NaN` 不算发生变化。
- `hasOwn(object, key)` 安全检查对象自身属性，需要支持 `Object.create(null)`。
- `normalizeClass(value)` 支持 string、array、嵌套 array、object 语法。
- `normalizeStyle(value)` 支持 string、object，以及由 string/object 组成的 array。
- `normalizeProps(props)` 标准化 `class` 和 `style`，并且在传入 `null` 时返回 `null`。
- `createReactiveGate(value)` 对 primitive 原样返回，对 object 包一层极简 `Proxy`。

## 运行方式

```bash
node .learn/topics/vuejs3-source/exercises/shared-utils/starter.mjs
```

最终期望输出：

```text
Running shared-utils practice tests...
All shared-utils practice tests passed
```

## 提示

<details>
<summary>提示 1：hasChanged</summary>

不要使用 `!==`。Vue 使用 `!Object.is(value, oldValue)`，这样才能正确处理 `NaN`。

</details>

<details>
<summary>提示 2：normalizeClass</summary>

处理 array 时可以使用递归。处理 object 语法时，只在 value 为 truthy 时拼接对应的 key。

</details>

<details>
<summary>提示 3：normalizeStyle</summary>

处理 array 时，先标准化每一项，再把 key 合并到同一个 object 里。靠后的同名 key 应该覆盖靠前的同名 key。

</details>

<details>
<summary>提示 4：hasOwn</summary>

使用 `Object.prototype.hasOwnProperty.call(obj, key)`，不要使用 `obj.hasOwnProperty(key)`。

</details>

## 相关概念

- `@vue/shared` 工具函数
- `reactive()` 入口的 `isObject` 闸门
- props 标准化
- class/style binding
