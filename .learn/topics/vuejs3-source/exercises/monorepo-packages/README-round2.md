# Monorepo 与包结构 — Intermediate Practice

## Goal

第二轮练习不再只追求测试通过，而是训练你把“练习简化图”和“Vue 3 真实源码依赖图”区分清楚，并能用自己的话解释 package 边界。

完成后你应该能回答：

- `vue` 主包为什么是“主入口聚合包”，而不是“导出一个 Vue 实例”？
- 为什么 `dependsOn` 是依赖集合，顺序通常不重要？
- 为什么 `dependencyChain` 是链路，顺序必须重要？
- `@vue/runtime-dom`、`@vue/compiler-sfc`、`vue` 的真实源码依赖，比 beginner 简化图多了什么？

## Background

你已经完成第一轮 beginner 练习，当前概念状态是 `needs_practice`。这一轮要把两个能力补上：

1. **表达能力**：`explainApiOwner(apiName)` 不能所有 API 都复用 `reactive` 的解释，要按 API 角色给出不同原因。
2. **源码对照能力**：练习图是为了建立心智模型，真实 Vue 3 源码的 package.json 会包含更多依赖，例如 SSR、SFC、类型和外部工具链依赖。

Context7 对照 Vue 官方文档后，本轮重点是合理的：`@vue/compiler-sfc` 是处理 SFC 的低层工具，并作为主 Vue 包依赖；runtime-only build 不包含 compiler，full build 才支持浏览器内模板编译。

## Files

- `starter-round2.mjs`：你要编辑的第二轮练习文件。
- `starter.mjs`：第一轮已通过，保留作为参考，不建议继续改它。

## Requirements

- [ ] 优化 `packageRoles.vue`，说明 `vue` 是面向用户的主入口聚合包。
- [ ] 实现 `explainApiOwner(apiName)`，让不同 API 返回不同解释。
- [ ] 实现 `getRealExtraDeps(packageName)`，返回真实源码里比简化图多出来的 Vue workspace 依赖。
- [ ] 实现 `classifyRelation(packageName)`，区分 runtime、compiler、entry、shared。
- [ ] 运行 `node starter-round2.mjs`，让所有测试通过。

## Hints

<details>
<summary>点开看提示</summary>

- `reactive`、`ref`、`effect` 属于 `@vue/reactivity`，因为它们是响应式系统核心。
- `createRenderer` 属于 `@vue/runtime-core`，因为它是平台无关 renderer 抽象。
- `createApp` 属于 `@vue/runtime-dom`，因为浏览器平台需要 DOM renderer 和 mount 行为。
- `compileTemplate` 属于 `@vue/compiler-sfc`，因为它处理 `.vue` SFC 中的 `<template>`。
- 真实 `@vue/runtime-dom` 还直接声明了 `@vue/reactivity`。
- 真实 `@vue/compiler-sfc` 还依赖 `@vue/compiler-ssr`。
- 真实 `vue` 主包还依赖 `@vue/compiler-dom` 和 `@vue/server-renderer`。

</details>

## Done Signal

当 `node starter-round2.mjs` 输出 `All round 2 tests passed` 后，告诉我“第二轮练习完成”，我会读取你的代码、给反馈，并更新学习状态。
