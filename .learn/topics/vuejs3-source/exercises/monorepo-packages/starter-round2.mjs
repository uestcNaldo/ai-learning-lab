/**
 * Monorepo 与包结构 — Intermediate Round 2
 *
 * 把每个 TODO 替换成准确的解释或实现。
 * 然后运行：
 *
 *   node starter-round2.mjs
 */

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

const simplifiedDeps = {
  "@vue/runtime-dom": ["@vue/runtime-core", "@vue/shared"],
  "@vue/compiler-sfc": ["@vue/shared", "@vue/compiler-core", "@vue/compiler-dom"],
  vue: ["@vue/shared", "@vue/runtime-dom", "@vue/compiler-sfc"],
}

// 来自你本地 Vue 源码中的 package.json 文件。
const realWorkspaceDeps = {
  "@vue/runtime-dom": ["@vue/shared", "@vue/runtime-core", "@vue/reactivity"],
  "@vue/compiler-sfc": [
    "@vue/compiler-core",
    "@vue/compiler-dom",
    "@vue/compiler-ssr",
    "@vue/shared",
  ],
  vue: [
    "@vue/shared",
    "@vue/compiler-dom",
    "@vue/runtime-dom",
    "@vue/compiler-sfc",
    "@vue/server-renderer",
  ],
}

const apiOwners = {
  reactive: "@vue/reactivity",
  ref: "@vue/reactivity",
  effect: "@vue/reactivity",
  createRenderer: "@vue/runtime-core",
  createApp: "@vue/runtime-dom",
  h: "@vue/runtime-core",
  parse: "@vue/compiler-core",
  compileTemplate: "@vue/compiler-sfc",
}

function explainApiOwner(apiName) {
  const owner = apiOwners[apiName]

  // TODO: 至少为下面这些 API 返回不同解释：
  // reactive, createRenderer, createApp, parse, compileTemplate.
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
  // TODO: 返回存在于 realWorkspaceDeps 但不存在于 simplifiedDeps 的依赖。
  // 顺序不重要。
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
  // TODO: 返回以下分类之一："shared", "reactivity", "runtime", "compiler", "entry"。
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
  if (packageName === "@vue/compiler-core" || packageName === "@vue/compiler-dom" || packageName === "@vue/compiler-sfc") {
    return "compiler"
  }
}

// === 测试辅助函数 ===

function assertEqual(actual, expected, label) {
  if (actual !== expected) {
    throw new Error(`${label}: expected ${expected}, got ${actual}`)
  }
}

function assertIncludes(text, expected, label) {
  if (!text.includes(expected)) {
    throw new Error(`${label}: expected text to include ${expected}, got ${text}`)
  }
}

function assertSameMembers(actual, expected, label) {
  const actualJson = JSON.stringify([...actual].sort())
  const expectedJson = JSON.stringify([...expected].sort())
  if (actualJson !== expectedJson) {
    throw new Error(`${label}: expected ${expectedJson}, got ${actualJson}`)
  }
}

console.log("Running monorepo package map round 2 tests...")

assertIncludes(packageRoles.vue, "主入口", "vue role should mention main entry")
assertIncludes(packageRoles.vue, "聚合", "vue role should mention aggregation")
assertIncludes(packageRoles.vue, "runtime", "vue role should mention runtime")

assertIncludes(explainApiOwner("reactive"), "@vue/reactivity", "reactive owner explanation")
assertIncludes(explainApiOwner("reactive"), "响应式", "reactive reason")
assertIncludes(explainApiOwner("createRenderer"), "@vue/runtime-core", "createRenderer owner explanation")
assertIncludes(explainApiOwner("createRenderer"), "平台无关", "createRenderer reason")
assertIncludes(explainApiOwner("createApp"), "@vue/runtime-dom", "createApp owner explanation")
assertIncludes(explainApiOwner("createApp"), "DOM", "createApp reason")
assertIncludes(explainApiOwner("parse"), "@vue/compiler-core", "parse owner explanation")
assertIncludes(explainApiOwner("compileTemplate"), "@vue/compiler-sfc", "compileTemplate owner explanation")
assertIncludes(explainApiOwner("compileTemplate"), "SFC", "compileTemplate reason")

assertSameMembers(
  getRealExtraDeps("@vue/runtime-dom"),
  ["@vue/reactivity"],
  "runtime-dom real extra dependencies",
)
assertSameMembers(
  getRealExtraDeps("@vue/compiler-sfc"),
  ["@vue/compiler-ssr"],
  "compiler-sfc real extra dependencies",
)
assertSameMembers(
  getRealExtraDeps("vue"),
  ["@vue/compiler-dom", "@vue/server-renderer"],
  "vue real extra dependencies",
)

assertEqual(classifyRelation("@vue/shared"), "shared", "shared classification")
assertEqual(classifyRelation("@vue/reactivity"), "reactivity", "reactivity classification")
assertEqual(classifyRelation("@vue/runtime-core"), "runtime", "runtime-core classification")
assertEqual(classifyRelation("@vue/runtime-dom"), "runtime", "runtime-dom classification")
assertEqual(classifyRelation("@vue/compiler-sfc"), "compiler", "compiler-sfc classification")
assertEqual(classifyRelation("vue"), "entry", "vue classification")

console.log("All round 2 tests passed")
