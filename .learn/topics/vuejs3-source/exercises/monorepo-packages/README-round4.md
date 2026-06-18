# Monorepo 与包结构 — Dependency Layers and Build Profiles

## Goal

第四轮练习从“读取真实 `package.json` 依赖图”推进到“解释 Vue 包的层级边界和构建场景”。

完成后你应该能回答：

- `@vue/runtime-dom`、`@vue/runtime-core`、`@vue/reactivity`、`@vue/shared` 的依赖方向是什么？
- 为什么 `@vue/compiler-sfc` 是 `vue` 主包依赖的一部分，但普通浏览器业务包不应该把 SFC compiler 当成运行时代码发出去？
- runtime-only build、full build、SFC tooling 三种场景分别需要哪些包？
- 为什么 `package.json` 依赖图和最终 bundle 内容不是一回事？

## Background

Context7 查询到的 Vue 官方资料给出几个重要边界：

- SFC 通常由 Vite、Vue CLI 等构建工具借助 `@vue/compiler-sfc` 预编译成普通 JavaScript 模块。
- runtime-only build 不包含 compiler，适用于模板已经在构建阶段预编译的情况。
- full build 包含 compiler，用于支持浏览器内模板编译，但体积更大。
- `@vue/compiler-sfc` 是低层 SFC 处理工具，应该通过 `vue/compiler-sfc` deep import 保持与 Vue runtime 版本同步。

这意味着：你可以从 `packages/*/package.json` 读出真实 workspace 依赖，但还需要建立“源码包依赖”和“具体构建产物包含内容”之间的区别。嘿，这里正是 Vue monorepo 有趣的地方：依赖图像地图，bundle 像路线规划。

## Files

- `starter-round4.mjs`：你要编辑的练习文件。
- `README-round4.md`：本说明文件。

## Requirements

- [ ] 实现 `readPackageJson(packageDir)`。
- [ ] 实现 `isWorkspaceRange(value)`，只接受字符串形式的 `workspace:` 依赖。
- [ ] 实现 `getWorkspaceDeps(packageJson)`，只统计 `dependencies`。
- [ ] 实现 `buildWorkspaceDependencyGraph(packagesDir)`。
- [ ] 实现 `getTransitiveDeps(graph, packageName)`。
- [ ] 实现 `classifyPackage(packageName)`。
- [ ] 实现 `getBuildProfilePackages(graph, profile)`。
- [ ] 运行 `node starter-round4.mjs`，让所有测试通过。

## Profiles

`getBuildProfilePackages(graph, profile)` 需要支持三个 profile：

- `runtime-only-browser`：浏览器运行时，不包含 compiler。
- `full-browser`：浏览器运行时 + template compiler，用于浏览器内模板编译。
- `sfc-tooling`：SFC 工具链，以 `@vue/compiler-sfc` 为入口读取其传递依赖。

## Hints

<details>
<summary>点开看提示</summary>

- `getTransitiveDeps` 可以用 DFS 或 BFS，注意不要把入口包本身放进依赖集合。
- `runtime-only-browser` 可以从 `@vue/runtime-dom` 的传递依赖开始，再加上 `@vue/runtime-dom` 自己。
- `full-browser` 可以在 runtime-only 的基础上加入 `@vue/compiler-dom` 及其传递依赖。
- `sfc-tooling` 可以从 `@vue/compiler-sfc` 的传递依赖开始，再加上 `@vue/compiler-sfc` 自己。
- `Array.from(set).sort()` 可以让测试输出稳定。
- `classifyPackage` 不需要覆盖所有包，但至少要覆盖 entry、shared、reactivity、runtime、compiler、server、other。

</details>

## Done Signal

当 `node starter-round4.mjs` 输出 `All round 4 tests passed` 后，告诉我“第四轮练习完成”。我会读取你的代码、给反馈，并根据表现更新学习状态。
