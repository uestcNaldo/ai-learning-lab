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
    role: "与平台无关的运行时核心，负责VNode、组件、renderer、调度器等核心逻辑",
    dependsOn: ["@vue/shared", "@vue/reactivity"],
  },
  "@vue/runtime-dom": {
    role: "TODO",
    dependsOn: ["TODO", "TODO"],
  },
  "@vue/compiler-core": {
    role: "TODO",
    dependsOn: ["TODO"],
  },
  "@vue/compiler-dom": {
    role: "TODO",
    dependsOn: ["TODO", "TODO"],
  },
  "@vue/compiler-sfc": {
    role: "TODO",
    dependsOn: ["TODO", "TODO", "TODO"],
  },
  vue: {
    role: "TODO",
    dependsOn: ["TODO", "TODO", "TODO"],
  },
}

const apiOwners = {
  reactive: "TODO",
  ref: "TODO",
  effect: "TODO",
  createRenderer: "TODO",
  createApp: "TODO",
  h: "TODO",
  parse: "TODO",
  compileTemplate: "TODO",
}

function dependencyChainToVueRuntimeDom() {
  // TODO: return the dependency chain from the lowest shared layer to runtime-dom.
  // Expected shape: ["@vue/shared", "...", "@vue/runtime-dom"]
  return []
}

function explainApiOwner(apiName) {
  // TODO: return a sentence like:
  // "reactive belongs to @vue/reactivity because ..."
  const owner = apiOwners[apiName]
  return `${apiName} belongs to ${owner} because TODO`
}

// === Test cases ===

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

function assertIncludes(text, expected, label) {
  if (!text.includes(expected)) {
    throw new Error(`${label}: expected text to include ${expected}, got ${text}`)
  }
}

console.log("Running monorepo package map tests...")

assertEqual(packageMap["@vue/shared"].dependsOn.length, 0, "shared has no internal dependency")
assertDeepEqual(
  packageMap["@vue/reactivity"].dependsOn,
  ["@vue/shared"],
  "reactivity dependency",
)
assertDeepEqual(
  packageMap["@vue/runtime-core"].dependsOn,
  ["@vue/shared", "@vue/reactivity"],
  "runtime-core dependencies",
)
assertDeepEqual(
  packageMap["@vue/runtime-dom"].dependsOn,
  ["@vue/runtime-core", "@vue/shared"],
  "runtime-dom dependencies",
)
assertDeepEqual(
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
