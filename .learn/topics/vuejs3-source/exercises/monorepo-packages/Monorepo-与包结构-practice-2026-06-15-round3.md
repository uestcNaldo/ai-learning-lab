# Practice Session - 2026-06-15

## Concept Practiced
- Concept: Monorepo 与包结构 | Difficulty: Challenge | Exercise: Vue 3 source package dependency graph

## User's Submitted Code
```javascript
import fs from "node:fs"
import path from "node:path"

const VUE_PACKAGES_DIR = "/Users/naldomac/Projects/vuejs/core/packages"

function readPackageJson(packageDir) {
  return JSON.parse(fs.readFileSync(path.join(packageDir, "package.json"), "utf-8"))
}

function getWorkspaceDeps(packageJson) {
  return Object.keys(packageJson.dependencies || {})
    .filter(dep => packageJson.dependencies[dep].startsWith("workspace:"))
}

function buildWorkspaceDependencyGraph(packagesDir) {
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
  return Object.keys(graph).filter(packageName => graph[packageName].includes(targetPackage))
}

function classifyPackage(packageName) {
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
    default:
      return "other"
  }
}
```

## AI Feedback
这次第三轮练习完成得很好，已经从“手写 Vue 包依赖图”升级到了“读取真实 Vue 源码 package.json 并自动生成 workspace 依赖图”。这一步很关键，因为源码学习不能长期停留在记忆图谱上，最终要能让代码和文件系统自己告诉你事实。

你做得好的地方：

1. `readPackageJson(packageDir)` 已经正确使用 `fs.readFileSync` 和 `JSON.parse` 读取真实源码文件，不再依赖手写数据。
2. `getWorkspaceDeps(packageJson)` 能从 `dependencies` 中筛选 `workspace:` 依赖，方向正确，也避免把 `devDependencies` 混进源码主依赖图。
3. `buildWorkspaceDependencyGraph(packagesDir)` 已经能遍历 `packages` 下的直接子目录，并用 `packageJson.name` 作为 graph key。这修正了之前使用目录名 `runtime-dom` 而不是真实包名 `@vue/runtime-dom` 的问题。
4. `getDependents(graph, "@vue/shared")` 能反向找依赖者，这说明你已经开始从“一个包依赖谁”扩展到“谁依赖一个包”的图分析视角。

还可以继续打磨的地方：

1. `getWorkspaceDeps(packageJson)` 现在假设 dependency value 一定是字符串。为了更稳，可以写成 `typeof version === "string" && version.startsWith("workspace:")`。
2. `buildWorkspaceDependencyGraph()` 现在假设每个子目录都有 package.json。真实工具里可以先检查 `fs.existsSync(packageJsonPath)`，这样遇到非包目录时不会崩。
3. `classifyPackage("@vue/compiler-dom")` 目前会返回 `other`，但它概念上应该是 `compiler`。虽然测试没覆盖，但建议你补上。

Context7 对照 Vue 官方文档后，本轮练习的理解方向是成立的：`@vue/compiler-sfc` 是处理 SFC 的低层工具，并作为主 Vue 包依赖；SFC 通常通过构建工具预编译；runtime-only build 会排除 compiler，而 full build 才包含浏览器内模板编译能力。

## Assessment
- Understanding: Solid
- Status: needs_practice → needs_practice | Confidence: 0.3 → 0.45
