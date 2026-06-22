# 练习记录 - 2026-06-16

## 练习概念
- 概念: Monorepo 与包结构 | 难度: 中级 | 练习: 依赖层级与构建场景

## 用户提交的代码
```javascript
function getTransitiveDeps(graph, packageName) {
  const deps = new Set()
  const stack = [...(graph[packageName] || [])]

  while (stack.length > 0) {
    const depName = stack.pop()
    if (depName === packageName || deps.has(depName)) {
      continue
    }

    deps.add(depName)
    stack.push(...(graph[depName] || []))
  }

  return [...deps].sort()
}

function getBuildProfilePackages(graph, profile) {
  switch (profile) {
    case "runtime-only-browser":
      return ["@vue/runtime-dom", ...getTransitiveDeps(graph, "@vue/runtime-dom")].sort()
    case "full-browser":
      return ["@vue/runtime-dom", ...getTransitiveDeps(graph, "@vue/runtime-dom"), "@vue/compiler-dom", ...getTransitiveDeps(graph, "@vue/compiler-dom")].sort()
    case "sfc-tooling":
      return ["@vue/compiler-sfc", ...getTransitiveDeps(graph, "@vue/compiler-sfc")].sort()
    default:
      throw new Error(`Unknown profile: ${profile}`)
  }
}
```

## AI 反馈
这轮完成得很扎实：你已经从“按分类过滤包”推进到了“从入口包沿 workspace dependency graph 走传递依赖”，这正是 round4 要抓住的核心。`getTransitiveDeps` 用 `Set + stack` 处理重复依赖和潜在环路，`getBuildProfilePackages` 也能用入口包表达三种场景：`runtime-only-browser` 从 `@vue/runtime-dom` 出发，`full-browser` 在 runtime 基础上加入 `@vue/compiler-dom`，`sfc-tooling` 从 `@vue/compiler-sfc` 出发。

我想追问你两个巩固问题：第一，为什么 `full-browser` 要包含 `@vue/compiler-dom`，但不包含 `@vue/compiler-sfc`？第二，为什么 `sfc-tooling` 会包含 `@vue/compiler-ssr`，但不应该包含 `@vue/runtime-dom`？如果你能不用看代码讲清楚这两个问题，这个概念就很接近掌握了。

边界上还有一个小的代码质量点：`full-browser` 当前会把 runtime deps 和 compiler deps 拼接后排序，但没有显式去重。现在测试能过，是因为这组依赖重复不影响 `assertIncludes/assertExcludes`；如果后面要把结果当作严格包清单，建议像 runtime-only 那样统一经过 `new Set([...])`。

Context7 查到的 Vue 官方说明与你这次模型一致：runtime-only build 在模板已预编译时排除 compiler，full build 为浏览器内模板编译包含 compiler；`@vue/compiler-sfc` 属于 SFC 工具链，SFC 通常由构建工具预编译成标准 JavaScript 模块。

## 评估
- 理解程度: 扎实
- 状态: needs_practice → needs_practice | 信心值: 0.50 → 0.62
