# 共享工具与辅助：normalizeClass / normalizeStyle / normalizeProps — 学习记录

日期: 2026-06-17
主题: Vue.js 3.x 源码学习
路径: 工程架构 (Project Architecture) → 共享工具与辅助 → normalizeClass / normalizeStyle / normalizeProps
水平: 中级

## 1. 这个小主题在 Vue 里的位置

`normalizeClass`、`normalizeStyle`、`normalizeProps` 位于 `@vue/shared`，它们不是 DOM 操作，也不是响应式系统，而是 Vue 多个包共同依赖的“输入标准化工具”。

它们解决的问题是：用户在模板或渲染函数里可以用很多种写法表达 `class` 和 `style`，但运行时、SSR、hydration、compiler 需要面对更稳定、更可预测的数据形态。

可以把它们理解成进入渲染管线前的“安检口”：用户可以带字符串、数组、对象进来，但进入后续流程前，Vue 要先把它们整理成统一格式。

## 2. 为什么需要 normalize

Vue 官方文档允许这些写法：

```vue
<div :class="'active'" />
<div :class="{ active: isActive, disabled: isDisabled }" />
<div :class="['btn', { active: isActive }]" />

<div :style="{ color: activeColor, fontSize: fontSize + 'px' }" />
<div :style="[baseStyles, overridingStyles]" />
```

这些写法对用户友好，但如果每个包都自己判断字符串、数组、对象，代码会重复，行为也容易不一致。

所以 Vue 把公共规则放在 `@vue/shared`：

- `class` 最终更适合变成一个空格分隔的字符串。
- `style` 可能保持字符串，也可能变成一个 style object。
- `props` 作为外层对象，只负责把其中的 `class` 和 `style` 交给对应 normalize 函数处理。

## 3. normalizeClass：把 class 输入整理成字符串

源码核心逻辑可以简化为：

```ts
function normalizeClass(value: unknown): string {
  let res = ''

  if (typeof value === 'string') {
    res = value
  } else if (Array.isArray(value)) {
    for (const item of value) {
      const normalized = normalizeClass(item)
      if (normalized) {
        res += normalized + ' '
      }
    }
  } else if (value && typeof value === 'object') {
    for (const name in value) {
      if ((value as Record<string, unknown>)[name]) {
        res += name + ' '
      }
    }
  }

  return res.trim()
}
```

关键点：

- 字符串：直接返回，例如 `'btn active'`。
- 数组：递归展开，例如 `['btn', ['primary'], { active: true }]`。
- 对象：只取 truthy value 对应的 key，例如 `{ active: true, hidden: false }` 变成 `'active'`。
- 结尾用 `trim()` 去掉多余空格。

它不会做 class 去重。`['btn', 'btn']` 仍然会得到 `'btn btn'`。这是一个很重要的边界：normalize 的目标是统一形态，不是做语义优化。

## 4. normalizeStyle：把 style 输入整理成字符串或对象

`normalizeStyle` 的返回值不是永远的 object，而是：

```ts
NormalizedStyle | string | undefined
```

原因是 Vue 支持直接传 style 字符串：

```ts
normalizeStyle('color: red;')
// 'color: red;'
```

如果传入数组，Vue 会逐项 normalize，并合并成一个 object：

```ts
normalizeStyle([
  'color: red;',
  { fontSize: '14px' },
  { color: 'blue' },
])
// { color: 'blue', fontSize: '14px' }
```

这里同名 key 后面的值会覆盖前面的值，因为本质上是对象赋值：

```ts
res[key] = normalized[key]
```

如果数组里出现 style 字符串，Vue 会用 `parseStringStyle` 把它解析成 object。生产源码里的解析比普通 `split(';')` 更谨慎，因为 CSS 函数内部也可能出现分号，例如：

```css
background: linear-gradient(red; blue)
```

所以源码使用正则避免错误拆分括号里的内容，并会移除 CSS 注释。

## 5. stringifyStyle：SSR 和字符串输出需要它

`normalizeStyle` 负责把输入变成稳定形态，而 `stringifyStyle` 负责把 style object 输出成 CSS 字符串：

```ts
stringifyStyle({ fontSize: '14px', color: 'red' })
// 'font-size:14px;color:red;'
```

它会把 camelCase 转成 kebab-case，例如 `fontSize` → `font-size`。

但 CSS custom property 不会被转换：

```ts
stringifyStyle({ '--brand-color': 'red' })
// '--brand-color:red;'
```

这说明 `@vue/shared` 里不只是“工具函数”，还沉淀了 Vue 对 Web 平台细节的兼容规则。

## 6. normalizeProps：统一处理 props 里的 class 和 style

`normalizeProps` 是更外层的入口：

```ts
function normalizeProps(props: Record<string, any> | null) {
  if (!props) return null

  const { class: klass, style } = props

  if (klass && typeof klass !== 'string') {
    props.class = normalizeClass(klass)
  }

  if (style) {
    props.style = normalizeStyle(style)
  }

  return props
}
```

它有几个细节：

- `null` 直接返回 `null`。
- 它会修改原来的 `props` 对象，而不是一定创建新对象。
- `class` 如果已经是字符串，就不重复处理。
- `style` 只要存在，就交给 `normalizeStyle`。

这让编译器生成的 helper、运行时创建 vnode、SSR 输出属性时，都可以共享同一套 class/style 规则。

## 7. 它们在源码里的使用关系

在 Vue 3 源码中，这组函数大致被这些模块使用：

```text
@vue/shared
  ├─ normalizeClass
  ├─ normalizeStyle
  ├─ stringifyStyle
  └─ normalizeProps

@vue/runtime-core
  ├─ createVNode: 创建 vnode 时标准化 class/style
  └─ mergeProps: 合并多个 props 时合并 class/style

@vue/server-renderer
  ├─ ssrRenderClass: SSR 输出 class 字符串
  └─ ssrRenderStyle: SSR 输出 style 字符串

@vue/compiler-core / @vue/compiler-dom
  └─ 在生成 helper 或静态字符串化时复用这些规则
```

这也解释了为什么它们放在 `@vue/shared`，而不是 `@vue/runtime-dom`：这些逻辑并不只属于浏览器 DOM，它们同时服务 runtime、compiler 和 SSR。

## 8. 一个完整例子

```ts
const props = {
  class: ['btn', { active: true, disabled: false }, ['primary']],
  style: ['color: red;', { fontSize: '14px' }, { color: 'blue' }],
}

normalizeProps(props)
```

结果接近：

```ts
{
  class: 'btn active primary',
  style: {
    color: 'blue',
    fontSize: '14px',
  },
}
```

这里可以看到三件事：

- class 数组被递归拍平。
- class object 只保留 truthy key。
- style 数组被合并，后面的 `color: 'blue'` 覆盖前面的 `color: 'red'`。

## 9. 常见误区

- `normalizeClass` 不负责去重，只负责展开、过滤、拼接。
- `normalizeStyle` 不一定返回 object，传入字符串时可以直接返回字符串。
- `normalizeProps` 会修改传入的 props 对象，不是纯 clone。
- 这组函数不是 `runtime-dom` 专属逻辑，SSR 和 compiler 也需要它们。
- `style` array 的合并是有顺序的，后面的同名属性会覆盖前面的。

## 10. 本节一句话总结

`normalizeClass`、`normalizeStyle`、`normalizeProps` 的核心价值是：让 Vue 对外支持灵活的 `class/style` 写法，对内保持稳定、统一、可复用的数据形态。

如果说 PatchFlags / ShapeFlags 是“告诉渲染器怎么看 vnode”，那么 normalize 系列就是“在 vnode 进入渲染流程前，把用户输入整理干净”。

## 11. 自测问题

1. 为什么 `{ active: true }` 会变成 `'active'`，而不是 `'true'`？
2. 为什么 `normalizeClass(['a', ['b'], { c: true }])` 需要递归？
3. 为什么 `normalizeStyle('color: red;')` 可以直接返回字符串？
4. 为什么 `style` 数组里后面的同名 key 会覆盖前面的？
5. 为什么这些函数放在 `@vue/shared`，而不是 `@vue/runtime-dom`？

## 12. 下一步建议

下一步可以继续顺着这条线学习 `createVNode` 如何调用 class/style normalization，再进入 vnode 创建、props 合并和 patch 前置处理。
