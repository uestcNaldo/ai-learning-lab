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
