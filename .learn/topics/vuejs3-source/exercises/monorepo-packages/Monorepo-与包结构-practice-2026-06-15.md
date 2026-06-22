# 练习记录 - 2026-06-15

## 练习概念
- 概念: Monorepo 与包结构 | 难度: 入门 | 练习: Vue 3 package map

## 用户提交的代码
```javascript
/**
 * Monorepo 与包结构 — Beginner
 *
 * Replace every TODO with the best package role, dependency list, or function
 * implementation. Then run:
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
  // TODO: return the dependency chain from the lowest shared layer to runtime-dom.
  // Expected shape: ["@vue/shared", "...", "@vue/runtime-dom"]
  return ["@vue/shared", "@vue/reactivity", "@vue/runtime-core", "@vue/runtime-dom"]
}

function explainApiOwner(apiName) {
  // TODO: return a sentence like:
  // "reactive belongs to @vue/reactivity because ..."
  const owner = apiOwners[apiName]
  return `${apiName} belongs to ${owner} because reactive是响应式系统的核心API，而@vue/reactivity是负责实现响应式系统的包，所以reactive属于@vue/reactivity。`
}
```

## AI 反馈
你这次练习的核心完成度是好的：你已经把 Vue 3 monorepo 的主要分层抓住了，尤其是 `@vue/shared` 作为底层工具包、`@vue/reactivity` 作为响应式核心、`@vue/runtime-core` 作为平台无关运行时、`@vue/runtime-dom` 作为浏览器平台运行时，这条 runtime 主线已经能连起来。

比较值得表扬的是，你指出了练习测试里的一个设计问题：`dependsOn` 本质上表达依赖集合，不应该要求固定顺序；而 `dependencyChainToVueRuntimeDom()` 表达从底层到上层的链路，顺序才应该严格。这说明你不是机械迎合测试，而是在判断测试是否符合概念本身。这个意识很重要。

需要继续打磨的点有两个：

1. `explainApiOwner(apiName)` 目前无论传入什么 API，理由都写成 `reactive` 的解释。测试只检查返回值包含 owner，所以它通过了，但从学习质量看，应该让解释根据 `apiName` 分支变化。例如 `createRenderer` 应解释为 renderer 抽象属于 `@vue/runtime-core`，`createApp` 应解释为浏览器应用入口属于 `@vue/runtime-dom`。
2. `vue` 包的 role 还可以更精确一些。它不是“导出一个 Vue 实例”，而是“面向用户的主入口聚合包”，会根据不同 build / deep import 暴露 runtime、compiler-sfc、server-renderer 等能力。

边界提醒：当前练习是入门简化版。真实 Vue 3 源码里，`@vue/runtime-dom` 的 package.json 还直接声明了 `@vue/reactivity`，`@vue/compiler-sfc` 还依赖 `@vue/compiler-ssr`，`vue` 主包还声明了 `@vue/server-renderer`。这些可以放到下一轮挑战练习里处理。

Context7 对照 Vue 官方文档后，练习方向是成立的：官方说明 `@vue/compiler-sfc` 是处理 SFC 的低层工具，并作为主 Vue 包的依赖；runtime-only build 会排除 compiler，模板通常在构建阶段预编译，从而减少浏览器端负担。

## 评估
- 理解程度: 良好
- 状态: in_progress → needs_practice | 信心值: 0.1 → 0.15
