# 练习记录 - 2026-06-16

## 练习概念
- 概念: Monorepo 与包结构 | 难度: 中级 | 练习: 源码阅读挑战

## 用户提交的代码
```javascript
/**
 * Monorepo 与包结构 — Source Reading Challenge
 *
 * Replace every TODO with real implementation. Then run:
 *
 *   node starter-round3.mjs
 */

import fs from "node:fs"
import path from "node:path"

const VUE_PACKAGES_DIR = "/Users/naldomac/Projects/vuejs/core/packages"

function readPackageJson(packageDir) {
  // TODO: read and parse package.json inside packageDir.
  // Return the parsed JSON object.
  return JSON.parse(fs.readFileSync(path.join(packageDir, "package.json"), "utf-8"))
}

function getWorkspaceDeps(packageJson) {
  // TODO: return dependency names whose version starts with "workspace:".
  // Only inspect packageJson.dependencies, not devDependencies.
  return Object.keys(packageJson.dependencies || {})
    .filter(dep => packageJson.dependencies[dep].startsWith("workspace:"))
}

function buildWorkspaceDependencyGraph(packagesDir) {
  // TODO:
  // 1. read all direct child directories under packagesDir
  // 2. read each package.json
  // 3. return an object: { [packageName]: workspaceDependencyNames[] }
  const graph = {}
  const packageDirs = fs.readdirSync(packagesDir, { withFileTypes: true })
    .filter(dirent => dirent.isDirectory())
    .map(dirent => dirent.name)

  for (const packageDir of packageDirs) {
    const packageJson = readPackageJson(path.join(packagesDir, packageDir))
    graph[packageJson.name] = getWorkspaceDeps(packageJson)
  }

  return graph
}

function getDependents(graph, targetPackage) {
  // TODO: return package names whose dependency list includes targetPackage.
  return Object.keys(graph).filter(packageName => graph[packageName].includes(targetPackage))
}

function classifyPackage(packageName) {
  // TODO: classify into one of:
  // "entry", "shared", "reactivity", "runtime", "compiler", "server", "other"
  switch (packageName) {
    case "vue":
      return "entry"
    case "@vue/shared":
      return "shared"
    case "@vue/reactivity":
      return "reactivity"
    case "@vue/runtime-core":
      return "runtime"
    case "@vue/runtime-dom":
      return "runtime"
    case "@vue/compiler-core":
      return "compiler"
    case "@vue/server-renderer":
      return "server"
    case "@vue/compiler-sfc":
      return "compiler"
    case "@vue/compiler-ssr":
      return "compiler"
    case "@vue/compiler-dom":
      return "compiler"
    default:
      return "other"
  }
}

// === Test helpers ===

function assertEqual(actual, expected, label) {
  if (actual !== expected) {
    throw new Error(`${label}: expected ${expected}, got ${actual}`)
  }
}

function assertTruthy(value, label) {
  if (!value) {
    throw new Error(`${label}: expected a truthy value, got ${value}`)
  }
}

function assertIncludes(collection, expected, label) {
  if (!collection.includes(expected)) {
    throw new Error(`${label}: expected ${JSON.stringify(collection)} to include ${expected}`)
  }
}

function assertSameMembers(actual, expected, label) {
  const actualJson = JSON.stringify([...actual].sort())
  const expectedJson = JSON.stringify([...expected].sort())
  if (actualJson !== expectedJson) {
    throw new Error(`${label}: expected ${expectedJson}, got ${actualJson}`)
  }
}

console.log("Running monorepo package map round 3 tests...")

assertTruthy(fs.existsSync(VUE_PACKAGES_DIR), "Vue packages directory exists")

const vuePackage = readPackageJson(path.join(VUE_PACKAGES_DIR, "vue"))
assertEqual(vuePackage.name, "vue", "readPackageJson reads vue package")

assertSameMembers(
  getWorkspaceDeps(vuePackage),
  [
    "@vue/shared",
    "@vue/compiler-dom",
    "@vue/runtime-dom",
    "@vue/compiler-sfc",
    "@vue/server-renderer",
  ],
  "vue workspace dependencies",
)

const graph = buildWorkspaceDependencyGraph(VUE_PACKAGES_DIR)
console.log(graph)

assertTruthy(graph.vue, "graph includes vue")
assertTruthy(graph["@vue/runtime-dom"], "graph includes runtime-dom")
assertTruthy(graph["@vue/compiler-sfc"], "graph includes compiler-sfc")

assertSameMembers(
  graph["@vue/runtime-dom"],
  ["@vue/shared", "@vue/runtime-core", "@vue/reactivity"],
  "runtime-dom real dependencies",
)
assertSameMembers(
  graph["@vue/compiler-sfc"],
  ["@vue/compiler-core", "@vue/compiler-dom", "@vue/compiler-ssr", "@vue/shared"],
  "compiler-sfc real dependencies",
)
assertIncludes(graph.vue, "@vue/server-renderer", "vue depends on server-renderer")
assertIncludes(graph.vue, "@vue/compiler-dom", "vue depends on compiler-dom")

const sharedDependents = getDependents(graph, "@vue/shared")
assertIncludes(sharedDependents, "@vue/reactivity", "shared dependent includes reactivity")
assertIncludes(sharedDependents, "@vue/runtime-core", "shared dependent includes runtime-core")
assertIncludes(sharedDependents, "vue", "shared dependent includes vue")

assertEqual(classifyPackage("vue"), "entry", "vue classification")
assertEqual(classifyPackage("@vue/shared"), "shared", "shared classification")
assertEqual(classifyPackage("@vue/reactivity"), "reactivity", "reactivity classification")
assertEqual(classifyPackage("@vue/runtime-dom"), "runtime", "runtime-dom classification")
assertEqual(classifyPackage("@vue/compiler-sfc"), "compiler", "compiler-sfc classification")
assertEqual(classifyPackage("@vue/server-renderer"), "server", "server-renderer classification")
assertEqual(classifyPackage("@vue/compat"), "other", "compat classification")

console.log("All round 3 tests passed")
```

## AI 反馈
你这轮练习的核心完成得不错：代码能够从真实 Vue 源码仓库的 `packages/*/package.json` 中读取 workspace 依赖，并且测试确认了 `vue`、`@vue/runtime-dom`、`@vue/compiler-sfc`、`@vue/shared` 这些关键包的关系。尤其是 `@vue/compiler-dom`、`@vue/compiler-sfc`、`@vue/compiler-ssr` 都被归到 compiler，这说明你已经不只是记包名，而是在按“运行时 / 编译器 / 入口 / 共享工具”的职责边界理解包结构。

我想追问你两个问题来巩固：第一，为什么 `vue` 主包会依赖 `@vue/compiler-sfc`，但普通浏览器运行时又不应该把 SFC compiler 发到最终业务包里？第二，`@vue/runtime-dom` 同时依赖 `@vue/runtime-core` 和 `@vue/reactivity`，这说明 DOM runtime 与平台无关 runtime、响应式系统之间是什么方向的依赖关系？

边界上可以再补一层鲁棒性：`getWorkspaceDeps` 当前假设 dependency value 一定是字符串，如果真实或测试数据里出现非字符串值，`.startsWith()` 会报错；`buildWorkspaceDependencyGraph` 也默认每个子目录都有合法 `package.json`。作为源码阅读练习这没问题，但作为可复用工具，下一轮可以练“容错读取 + 分层输出”。

代码质量上，`console.log(graph)` 对学习很有帮助，它让依赖图一眼可见；但如果把这个文件作为测试练习提交，建议把它改成可选调试输出，或者在测试通过后删除。Context7 查到的 Vue 官方说明也支持这条理解线：SFC 通常由构建工具预编译，runtime-only build 不包含 compiler；`@vue/compiler-sfc` 是低层 SFC 处理工具，并通过 `vue/compiler-sfc` deep import 保持与运行时版本同步。

## 评估
- 理解程度: 良好
- 状态: needs_practice → needs_practice | 信心值: 0.45 → 0.50
