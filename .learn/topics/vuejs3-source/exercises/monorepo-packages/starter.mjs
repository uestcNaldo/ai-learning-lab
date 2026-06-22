/**
 * Monorepo 与包结构 — Beginner
 *
 * 把每个 TODO 替换成最合适的 package 角色、依赖列表或函数实现。
 * 然后运行：
 *
 *   node starter.mjs
 */

const packageMap = {
  "@vue/shared": {
    role: "公共工具函数和常量",
    dependsOn: [],
  },
  "@vue/reactivity": {
    role: "响应式系统：包含 reactive、ref、effect、readonly、computed、track、trigger 等核心 API",
    dependsOn: ["@vue/shared"],
  },
  "@vue/runtime-core": {
    role: "与平台无关的运行时核心，负责VNode、组件实例、组件挂载和更新、生命周期、renderer、调度器、依赖响应式的 render effect、createRenderer这类renderer的抽象",
    dependsOn: ["@vue/shared", "@vue/reactivity"],
  },
  "@vue/runtime-dom": {
    role: "浏览器 DOM 平台运行时，它在@vue/runtime-core的renderer抽象上实现了针对浏览器DOM的具体操作，如nodeOps、patchProp、DOM 事件、DOM 属性、Transition、vShow、vModel 等",
    dependsOn: ["@vue/runtime-core", "@vue/shared"],
  },
  "@vue/compiler-core": {
    role: "平台无关模板编译核心，负责将模板字符串编译成渲染函数的 AST 转换和代码生成",
    dependsOn: ["@vue/shared"],
  },
  "@vue/compiler-dom": {
    role: "浏览器 DOM 平台模板编译，它基于 @vue/compiler-core 的抽象，将模板字符串编译成渲染函数的 AST 树转换和代码生成，包含针对浏览器 DOM 的特定优化和指令处理",
    dependsOn: ["@vue/shared", "@vue/compiler-core"],
  },
  "@vue/compiler-sfc": {
    role: ".vue文件的编译器，负责将.vue文件编译成render函数和组件选项对象，包含对单文件组件特有的语法和功能的支持，如<template>、<script>、<style>块的处理，以及热重载等",
    dependsOn: ["@vue/shared", "@vue/compiler-core", "@vue/compiler-dom"],
  },
  vue: {
    role: "入口模块，它负责将所有其他模块组合在一起，并导出一个 Vue 实例",
    dependsOn: ["@vue/shared", "@vue/runtime-dom", "@vue/compiler-sfc"],
  },
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

function dependencyChainToVueRuntimeDom() {
  // TODO: 返回从最底层 shared 到 runtime-dom 的依赖链路。
  // 期望形状：["@vue/shared", "...", "@vue/runtime-dom"]
  return ["@vue/shared", "@vue/reactivity", "@vue/runtime-core", "@vue/runtime-dom"]
}

function explainApiOwner(apiName) {
  // TODO: 返回类似下面这样的句子：
  // "reactive belongs to @vue/reactivity because ..."
  const owner = apiOwners[apiName]
  return `${apiName} belongs to ${owner} because reactive是响应式系统的核心API，而@vue/reactivity是负责实现响应式系统的包，所以reactive属于@vue/reactivity。`
}

// === 测试用例 ===

function assertEqual(actual, expected, label) {
  if (actual !== expected) {
    throw new Error(`${label}: expected ${expected}, got ${actual}`)
  }
}

function assertDeepEqual(actual, expected, label) {
  const actualJson = JSON.stringify(actual)
  const expectedJson = JSON.stringify(expected)
  if (actualJson !== expectedJson) {
    throw new Error(`${label}: expected ${expectedJson}, got ${actualJson}`)
  }
}

function assertSameMembers(actual, expected, label) {
  assertDeepEqual([...actual].sort(), [...expected].sort(), label)
}

function assertIncludes(text, expected, label) {
  if (!text.includes(expected)) {
    throw new Error(`${label}: expected text to include ${expected}, got ${text}`)
  }
}

console.log("Running monorepo package map tests...")

assertEqual(packageMap["@vue/shared"].dependsOn.length, 0, "shared has no internal dependency")
assertSameMembers(
  packageMap["@vue/reactivity"].dependsOn,
  ["@vue/shared"],
  "reactivity dependency",
)
assertSameMembers(
  packageMap["@vue/runtime-core"].dependsOn,
  ["@vue/shared", "@vue/reactivity"],
  "runtime-core dependencies",
)
assertSameMembers(
  packageMap["@vue/runtime-dom"].dependsOn,
  ["@vue/runtime-core", "@vue/shared"],
  "runtime-dom dependencies",
)
assertSameMembers(
  packageMap["@vue/compiler-dom"].dependsOn,
  ["@vue/compiler-core", "@vue/shared"],
  "compiler-dom dependencies",
)

assertEqual(apiOwners.reactive, "@vue/reactivity", "reactive owner")
assertEqual(apiOwners.ref, "@vue/reactivity", "ref owner")
assertEqual(apiOwners.effect, "@vue/reactivity", "effect owner")
assertEqual(apiOwners.createRenderer, "@vue/runtime-core", "createRenderer owner")
assertEqual(apiOwners.createApp, "@vue/runtime-dom", "createApp owner")
assertEqual(apiOwners.h, "@vue/runtime-core", "h owner")
assertEqual(apiOwners.parse, "@vue/compiler-core", "parse owner")
assertEqual(apiOwners.compileTemplate, "@vue/compiler-sfc", "compileTemplate owner")

assertDeepEqual(
  dependencyChainToVueRuntimeDom(),
  ["@vue/shared", "@vue/reactivity", "@vue/runtime-core", "@vue/runtime-dom"],
  "runtime-dom dependency chain",
)

assertIncludes(explainApiOwner("reactive"), "@vue/reactivity", "reactive explanation")
assertIncludes(explainApiOwner("createRenderer"), "@vue/runtime-core", "createRenderer explanation")
assertIncludes(explainApiOwner("createApp"), "@vue/runtime-dom", "createApp explanation")

console.log("All tests passed")
