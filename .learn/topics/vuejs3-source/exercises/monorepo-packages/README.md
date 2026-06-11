# Monorepo 与包结构 — Beginner Practice

## Goal

通过补全一张 Vue 3 package 地图，练习把常见 API、源码职责和 package 分层对应起来。

完成后你应该能回答：

- `reactive` 属于哪一层，为什么它不依赖 DOM？
- `createRenderer` 为什么在 `runtime-core`，而浏览器应用常用的 `createApp` 为什么来自 `runtime-dom`？
- `compiler-core`、`compiler-dom`、`compiler-sfc` 的边界分别是什么？
- `vue` 主包为什么更像聚合入口，而不是全部实现本身？

## Background

Vue 3 的源码不是一个巨大的单包，而是由多个 `packages/*` 组成。官方源码文档中，`@vue/runtime-core` 是自定义 renderer 的基础；`@vue/runtime-dom` 提供浏览器 DOM 渲染入口；`@vue/reactivity` 可以独立发布，也会被面向用户的 renderer 重新导出。

这次练习不要求你真实克隆 Vue 源码。先把“包职责”和“依赖方向”练清楚，后面读源码会轻很多。

## Files

- `starter.mjs`：你要编辑的练习文件。

## Requirements

- [ ] 补全 `packageMap` 中每个 package 的 `role`。
- [ ] 补全 `packageMap` 中每个 package 的 `dependsOn`。
- [ ] 补全 `apiOwners`，把 API 映射到最合适的 package。
- [ ] 实现 `dependencyChainToVueRuntimeDom()`。
- [ ] 实现 `explainApiOwner(apiName)`。
- [ ] 运行 `node starter.mjs`，让所有测试通过。

## Package Hints

<details>
<summary>点开看 package 职责提示</summary>

- `@vue/shared`：跨包共享工具、常量、类型判断。
- `@vue/reactivity`：响应式核心，包含 `reactive`、`ref`、`effect`、`computed`。
- `@vue/runtime-core`：平台无关运行时，包含 VNode、组件、调度、renderer 抽象、`createRenderer`。
- `@vue/runtime-dom`：浏览器 DOM 平台运行时，包含 DOM 操作、事件、属性 patch、浏览器版 `createApp`。
- `@vue/compiler-core`：平台无关模板编译核心，包含 parse、transform、codegen。
- `@vue/compiler-dom`：DOM 平台模板编译规则。
- `@vue/compiler-sfc`：`.vue` 单文件组件编译。
- `vue`：面向应用开发者的主入口，聚合并导出常用能力。

</details>

## Related Concepts

- 当前概念：`monorepo-packages`
- 建议后续：`shared-utils`
- 再后续：`reactive-proxy`

## Done Signal

当 `node starter.mjs` 输出 `All tests passed` 后，告诉我“练习完成”，我会读取你的代码并给反馈。
