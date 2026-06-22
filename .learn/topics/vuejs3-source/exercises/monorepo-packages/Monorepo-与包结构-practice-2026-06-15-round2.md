# 练习记录 - 2026-06-15

## 练习概念
- 概念: Monorepo 与包结构 | 难度: 中级 | 练习: Vue 3 package map round 2

## 用户提交的代码
```javascript
const packageRoles = {
  "@vue/shared": "跨包共享工具、常量和类型判断",
  "@vue/reactivity": "响应式系统核心，提供 reactive、ref、effect、computed 等能力",
  "@vue/runtime-core": "平台无关运行时核心，负责 VNode、组件、调度器和 renderer 抽象",
  "@vue/runtime-dom": "浏览器 DOM 平台运行时，基于 runtime-core 接入 DOM 操作、事件和 createApp",
  "@vue/compiler-core": "平台无关模板编译核心，负责 parse、transform、codegen",
  "@vue/compiler-dom": "DOM 平台模板编译器，提供 DOM 指令和 DOM 优化规则",
  "@vue/compiler-sfc": "SFC 编译协调层，处理 .vue 文件中的 template、script 和 style",
  vue: "vue是面向用户的主入口聚合包，聚合 runtime、compiler-sfc、server-renderer 等能力。",
}

function explainApiOwner(apiName) {
  const owner = apiOwners[apiName]

  if (apiName === "reactive") {
    return `${apiName} belongs to ${owner} because reactive是响应式系统的核心API，而@vue/reactivity是负责实现响应式系统的包，所以reactive属于@vue/reactivity。`
  }
  if (apiName === "createRenderer") {
    return `${apiName} belongs to ${owner} because createRenderer是平台无关运行时核心的API，createRenderer是抽象类，而@vue/runtime-core是负责实现运行时核心的包，所以createRenderer属于@vue/runtime-core。`
  }
  if (apiName === "createApp") {
    return `${apiName} belongs to ${owner} because createApp是浏览器DOM平台运行时的API，而@vue/runtime-dom是负责实现DOM平台运行时的包，所以createApp属于@vue/runtime-dom。`
  }
  if (apiName === "h") {
    return `${apiName} belongs to ${owner} because h是运行时核心的API，而@vue/runtime-core是负责实现运行时核心的包，所以h属于@vue/runtime-core。`
  }
  if (apiName === "parse") {
    return `${apiName} belongs to ${owner} because parse是模板编译核心的API，而@vue/compiler-core是负责实现模板编译核心的包，所以parse属于@vue/compiler-core。`
  }
  if (apiName === "compileTemplate") {
    return `${apiName} belongs to ${owner} because compileTemplate是SFC编译协调层的API，而@vue/compiler-sfc是负责实现SFC编译的包，所以compileTemplate属于@vue/compiler-sfc。`
  }
}

function getRealExtraDeps(packageName) {
  if (packageName === "@vue/runtime-dom") {
    return ["@vue/reactivity"]
  }
  if (packageName === "@vue/compiler-sfc") {
    return ["@vue/compiler-ssr"]
  }
  if (packageName === "vue") {
    return ["@vue/compiler-dom", "@vue/server-renderer"]
  }
}

function classifyRelation(packageName) {
  if (packageName === "vue") {
    return "entry"
  }
  if (packageName === "@vue/shared") {
    return "shared"
  }
  if (packageName === "@vue/reactivity") {
    return "reactivity"
  }
  if (packageName === "@vue/runtime-core" || packageName === "@vue/runtime-dom") {
    return "runtime"
  }
  if (packageName === "@vue/compiler-core" || packageName === "@vue/compiler-sfc") {
    return "compiler"
  }
}
```

## AI 反馈
第二轮练习已经通过，说明你不只是记住了第一轮的 package 名称，而是开始能区分三层东西：包的角色、API 的归属原因、练习简化图和真实源码 package.json 的差异。

做得好的地方：

1. `vue` 的描述已经从“导出 Vue 实例”修正为“面向用户的主入口聚合包”，这比第一轮准确很多。Vue 3 的主包确实是对 runtime、compiler-sfc、server-renderer 等能力做统一入口暴露。
2. `explainApiOwner(apiName)` 已经按 API 分支解释，不再所有 API 都套用 `reactive` 的理由。特别是 `createRenderer` 对应平台无关的 `@vue/runtime-core`、`createApp` 对应 DOM 平台的 `@vue/runtime-dom`，这条边界很关键。
3. `getRealExtraDeps(packageName)` 最终能正确做“真实依赖 - 简化依赖”的差集：`@vue/runtime-dom` 多 `@vue/reactivity`，`@vue/compiler-sfc` 多 `@vue/compiler-ssr`，`vue` 多 `@vue/compiler-dom` 和 `@vue/server-renderer`。

还可以继续打磨的地方：

1. `getRealExtraDeps(packageName)` 现在是手写分支，可以通过真实数据计算差集来降低重复。比如从 `realWorkspaceDeps[packageName]` 过滤掉 `simplifiedDeps[packageName]` 中已有的项。
2. `explainApiOwner(apiName)` 对未知 API 没有兜底返回值。实际写工具函数时，最好返回类似 `Unknown API: ${apiName}`，否则调用方会拿到 `undefined`。
3. `classifyRelation(packageName)` 目前没有覆盖 `@vue/compiler-dom`，虽然测试没查它，但从概念完整性看它也应归类为 `compiler`。

Context7 对照 Vue 官方文档后，本轮判断成立：`@vue/compiler-sfc` 是处理 SFC 的低层工具，并作为主 Vue 包依赖；runtime-only build 会排除 compiler，full build 才支持浏览器内模板编译；SFC 通常通过构建工具预编译成标准 ES module。

## 评估
- 理解程度: 扎实
- 状态: needs_practice → needs_practice | 信心值: 0.15 → 0.3
