# 共享工具与辅助：PatchFlags / ShapeFlags — Learning Session

> **Date:** 2026-06-16
> **Topic:** Vue.js 3.x 源码学习
> **Path:** 工程架构 (Project Architecture) → 共享工具与辅助 → PatchFlags / ShapeFlags
> **Level:** intermediate

---

## Positioning

`PatchFlags / ShapeFlags` 是 `@vue/shared` 中最重要的跨包协议之一：compiler 用它们给 VNode 打标签，runtime 用它们快速判断“这个节点是什么”和“更新时只需要做哪些事”。

## Analogy

可以把 Vue 的渲染过程想成快递分拣中心。

`ShapeFlags` 像包裹类型标签：这是文件、易碎品、生鲜，还是大件？分拣员看到标签，就知道要走哪条传送带。在 Vue 里，runtime 看到 `ShapeFlags.ELEMENT` 就按普通 DOM 元素处理，看到 `ShapeFlags.COMPONENT` 就按组件处理，看到 `ShapeFlags.TEXT_CHILDREN` 就按文本子节点处理。

`PatchFlags` 像包裹上的“只检查这一项”的更新标签：这个包裹只改了地址，不用重新称重；只改了收件人电话，不用重新检查包装。在 Vue 里，如果 compiler 知道某个节点只有 `class` 是动态的，就生成 `PatchFlags.CLASS`，runtime 更新时就不用完整 diff 所有 props。

所以两者的直觉区别是：

- `ShapeFlags` 解决“它是什么形状？”
- `PatchFlags` 解决“更新它时哪里可能变？”

## Core Mechanism

`ShapeFlags` 和 `PatchFlags` 都放在 `@vue/shared`，因为它们不是单个包的私有实现，而是多个包之间必须共享的协议。

`ShapeFlags` 主要由 runtime 创建 VNode 时设置。它描述 VNode 的结构类型，例如：

- `ELEMENT`：普通 DOM 元素。
- `STATEFUL_COMPONENT`：有状态组件。
- `FUNCTIONAL_COMPONENT`：函数式组件。
- `TEXT_CHILDREN`：子节点是文本。
- `ARRAY_CHILDREN`：子节点是数组。
- `SLOTS_CHILDREN`：子节点是 slots。
- `TELEPORT`、`SUSPENSE`：特殊内置组件。
- `COMPONENT`：组合标记，等于 `STATEFUL_COMPONENT | FUNCTIONAL_COMPONENT`。

源码里 `createVNode` 会根据 `type` 推出基础 `shapeFlag`：字符串类型通常是元素，对象类型通常是有状态组件，函数类型通常是函数式组件。之后如果有 children，还会继续给 VNode 追加 `TEXT_CHILDREN` 或 `ARRAY_CHILDREN`。

`PatchFlags` 主要由 compiler 生成，runtime 消费。它描述“这个 VNode 更新时哪些部分是动态的”。常见标记包括：

- `TEXT`：动态文本。
- `CLASS`：动态 class。
- `STYLE`：动态 style。
- `PROPS`：动态 props，且 dynamicProps 里会列出可能变化的 key。
- `FULL_PROPS`：动态 key，必须完整 diff props。
- `KEYED_FRAGMENT`：有 key 的 fragment 子节点。
- `UNKEYED_FRAGMENT`：无 key 的 fragment 子节点。
- `NEED_PATCH`：需要 patch，但不是普通 props 变化，例如 ref 或 directive。
- `DYNAMIC_SLOTS`：动态 slots。
- `CACHED`、`BAIL`：特殊负数标记，不参与普通位运算判断。

Vue 官方 Rendering Mechanism 文档也强调了这一点：compiler 会把更新类型编码进 VNode 创建调用里，runtime renderer 用位运算检查这些 patch flags，从而只做最少更新。

核心收益是“用编译时信息换运行时性能”。没有 `PatchFlags` 时，runtime 只能保守地比较很多东西：class 有没有变？style 有没有变？每个 prop 有没有变？children 要不要 diff？有了 compiler 提供的 flag，runtime 就可以走快路径。

例如模板：

```vue
<div :class="{ active }">hello</div>
```

编译器知道只有 class 是动态的，于是生成类似：

```js
createElementVNode(
  "div",
  { class: normalizeClass({ active: _ctx.active }) },
  "hello",
  PatchFlags.CLASS
)
```

runtime 更新时看到 `PatchFlags.CLASS`，就只比较并更新 class，不需要完整扫描所有 props。

`ShapeFlags` 则更偏 runtime 结构分流。比如 renderer 里经常出现这种判断：

```ts
if (shapeFlag & ShapeFlags.ELEMENT) {
  processElement(...)
} else if (shapeFlag & ShapeFlags.COMPONENT) {
  processComponent(...)
}
```

这比每次都用复杂条件判断 VNode 类型更直接，也方便一个 VNode 同时携带多个结构信息。例如一个普通元素同时可以有数组子节点：

```ts
ShapeFlags.ELEMENT | ShapeFlags.ARRAY_CHILDREN
```

位运算的好处是一个数字就可以携带多个布尔标签：

```ts
const flag = ShapeFlags.ELEMENT | ShapeFlags.ARRAY_CHILDREN

Boolean(flag & ShapeFlags.ELEMENT) // true
Boolean(flag & ShapeFlags.TEXT_CHILDREN) // false
```

所以可以这样总结：

`ShapeFlags` 是 VNode 自身形状的 runtime 标签。它回答“这个 VNode 应该走哪类处理流程”。

`PatchFlags` 是 compiler 给 runtime 的更新提示。它回答“这个 VNode 更新时有哪些动态部分需要检查”。

## Code Example

```ts
enum ShapeFlags {
  ELEMENT = 1,
  STATEFUL_COMPONENT = 1 << 2,
  TEXT_CHILDREN = 1 << 3,
  ARRAY_CHILDREN = 1 << 4,
  COMPONENT = STATEFUL_COMPONENT,
}

enum PatchFlags {
  TEXT = 1,
  CLASS = 1 << 1,
  STYLE = 1 << 2,
  PROPS = 1 << 3,
  FULL_PROPS = 1 << 4,
}

type VNode = {
  type: string | object
  props: Record<string, unknown>
  children: string | VNode[]
  shapeFlag: number
  patchFlag: number
}

function createMiniVNode(
  type: string | object,
  props: Record<string, unknown>,
  children: string | VNode[],
  patchFlag = 0,
): VNode {
  let shapeFlag = typeof type === 'string'
    ? ShapeFlags.ELEMENT
    : ShapeFlags.STATEFUL_COMPONENT

  shapeFlag |= typeof children === 'string'
    ? ShapeFlags.TEXT_CHILDREN
    : ShapeFlags.ARRAY_CHILDREN

  return {
    type,
    props,
    children,
    shapeFlag,
    patchFlag,
  }
}

function patchElement(oldVNode: VNode, newVNode: VNode) {
  const { patchFlag } = newVNode

  if (patchFlag > 0) {
    if (patchFlag & PatchFlags.CLASS) {
      console.log('只更新 class')
    }

    if (patchFlag & PatchFlags.STYLE) {
      console.log('只更新 style')
    }

    if (patchFlag & PatchFlags.TEXT) {
      console.log('只更新 text children')
    }

    return
  }

  console.log('没有 compiler 提示，走完整 diff')
}

const oldVNode = createMiniVNode(
  'div',
  { class: 'btn' },
  'hello',
)

const newVNode = createMiniVNode(
  'div',
  { class: 'btn active' },
  'hello',
  PatchFlags.CLASS,
)

console.log(Boolean(newVNode.shapeFlag & ShapeFlags.ELEMENT))
console.log(Boolean(newVNode.shapeFlag & ShapeFlags.TEXT_CHILDREN))
patchElement(oldVNode, newVNode)
```

这个例子做了三件事。

第一，`createMiniVNode` 根据 `type` 和 `children` 设置 `shapeFlag`。如果 `type` 是字符串，就认为它是普通元素；如果 children 是字符串，就追加 `TEXT_CHILDREN`。

第二，`newVNode` 带着 `PatchFlags.CLASS`。这表示它更新时只有 class 需要特别检查。

第三，`patchElement` 看到 `patchFlag > 0` 后进入优化路径，只处理 flag 指出的动态部分。如果没有 patch flag，才退回完整 diff。

这就是 Vue compiler 和 runtime 的协作方式：compiler 越能准确描述动态点，runtime 就越能少做无用判断。

## Common Misconceptions

误区一：认为 `ShapeFlags` 和 `PatchFlags` 是一回事。它们都用位运算，但语义不同：`ShapeFlags` 描述 VNode 的结构类型，`PatchFlags` 描述更新时的动态部分。

误区二：认为 `PatchFlags` 是 runtime 自己推导出来的。大多数正向 patch flags 来自 compiler，因为 compiler 看过模板，知道哪些绑定是动态的。

误区三：认为有了 `PatchFlags` 就完全不需要 diff。不是这样。它只是让 Vue 在某些场景走更窄的 diff 路径；遇到动态 key、手写 render function、BAIL 等情况，还是可能退回完整 diff。

误区四：认为位运算只是炫技。这里位运算的价值很实际：一个数字可以同时表达多个标签，检查时也很便宜。

误区五：认为 `PatchFlags.CLASS` 表示 class 一定变了。更准确地说，它表示 class 是动态的，runtime 仍会比较 old/new class，再决定是否真正 patch DOM。

## Socratic Check

如果一个 VNode 的 `shapeFlag` 同时包含 `ELEMENT` 和 `ARRAY_CHILDREN`，runtime 可以从这两个标签推断出什么处理路径？

如果 compiler 没有给一个节点生成 `PatchFlags.CLASS`，runtime 为什么可能需要更保守地检查 props？

---

## Quick Summary
- `ShapeFlags` 是 VNode 形状标签，帮助 runtime 快速选择处理流程。
- `PatchFlags` 是 compiler 给 runtime 的更新提示，帮助 patch 阶段少做无用 diff。
- 两者都放在 `@vue/shared`，因为它们是 compiler、runtime、VNode 创建逻辑之间共享的协议。

## Next Steps
(Will be updated after the user chooses a sub-topic direction)
