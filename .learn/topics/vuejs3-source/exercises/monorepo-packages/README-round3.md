# Monorepo 与包结构 — 源码阅读挑战

## 练习目标

第三轮练习从“手写依赖图”升级为“读取真实 Vue 源码 package.json，自动生成 workspace 依赖图”。

完成后你应该能回答：

- 如何从 `packages/*/package.json` 识别 Vue workspace 内部依赖？
- 为什么真实依赖图比学习简化图更复杂？
- 哪些包直接依赖 `@vue/shared`？
- 哪些包是 `vue` 主入口发布时暴露的能力组成部分？

## 背景

你前两轮已经能手写常见包角色和简化依赖关系。这一轮要求你让代码自己去读真实源码：

```text
/Users/naldomac/Projects/vuejs/core/packages/*/package.json
```

核心规则：

- 只统计 Vue workspace 内部依赖，也就是 dependency value 以 `workspace:` 开头的依赖。
- 只统计 `dependencies`，不统计 `devDependencies`。
- 输出依赖图时，key 是 package name，例如 `@vue/runtime-dom` 或 `vue`。
- value 是该包的 Vue workspace 依赖数组。

## 文件

- `starter-round3.mjs`：你要编辑的源码实读练习文件。
- `README-round3.md`：本说明文件。

## 实现要求

- [ ] 实现 `readPackageJson(packageDir)`。
- [ ] 实现 `getWorkspaceDeps(packageJson)`。
- [ ] 实现 `buildWorkspaceDependencyGraph(packagesDir)`。
- [ ] 实现 `getDependents(graph, targetPackage)`。
- [ ] 实现 `classifyPackage(packageName)`。
- [ ] 运行 `node starter-round3.mjs`，让所有测试通过。

## 提示

<details>
<summary>点开看提示</summary>

- Node ESM 中可以使用 `import fs from "node:fs"` 和 `import path from "node:path"`。
- `fs.readdirSync(packagesDir, { withFileTypes: true })` 可以列出子目录。
- `JSON.parse(fs.readFileSync(file, "utf8"))` 可以读取 package.json。
- `Object.entries(packageJson.dependencies ?? {})` 可以遍历依赖。
- `version.startsWith("workspace:")` 可以判断 workspace 依赖。
- `getDependents(graph, "@vue/shared")` 的意思是：哪些包的依赖数组里包含 `@vue/shared`。

</details>

## 期望掌握的真实源码事实

根据你本地的 Vue 源码，测试会检查这些事实：

- `@vue/runtime-dom` 依赖 `@vue/shared`、`@vue/runtime-core`、`@vue/reactivity`。
- `@vue/compiler-sfc` 依赖 `@vue/compiler-core`、`@vue/compiler-dom`、`@vue/compiler-ssr`、`@vue/shared`。
- `vue` 依赖 `@vue/shared`、`@vue/compiler-dom`、`@vue/runtime-dom`、`@vue/compiler-sfc`、`@vue/server-renderer`。
- `@vue/shared` 应被多个包依赖。

## 完成信号

当 `node starter-round3.mjs` 输出 `All round 3 tests passed` 后，告诉我“第三轮练习完成”，我会读取你的代码、给反馈，并更新学习状态。
