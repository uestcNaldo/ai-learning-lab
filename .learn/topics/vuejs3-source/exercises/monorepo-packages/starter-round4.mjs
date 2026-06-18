/**
 * Monorepo 与包结构 — Dependency Layers and Build Profiles
 *
 * Replace every TODO with real implementation. Then run:
 *
 *   node starter-round4.mjs
 */

import fs from "node:fs"
import path from "node:path"

const VUE_PACKAGES_DIR = "/Users/naldomac/Projects/vuejs/core/packages"

function readPackageJson(packageDir) {
  return JSON.parse(fs.readFileSync(path.join(packageDir, "package.json"), "utf8"))
}

function isWorkspaceRange(value) {
  // TODO: return true only when value is a string starting with "workspace:".
  // Only workspace ranges point to other packages inside this monorepo.
  if (typeof value === "string" && value.startsWith("workspace:")) {
    return true
  }
  return false
}

function getWorkspaceDeps(packageJson) {
  // TODO: return dependency names whose version is a workspace range.
  // Only inspect packageJson.dependencies, not devDependencies.
  // dependencies describe package-to-package edges; devDependencies are tooling/test edges.
  return Object.keys(packageJson.dependencies || {}).filter(depName => {
    const depVersion = packageJson.dependencies[depName]
    return isWorkspaceRange(depVersion)
  })
}

function buildWorkspaceDependencyGraph(packagesDir) {
  const graph = {}
  const children = fs.readdirSync(packagesDir, { withFileTypes: true })

  for (const child of children) {
    if (!child.isDirectory()) {
      continue
    }

    const packageDir = path.join(packagesDir, child.name)
    const packageJsonPath = path.join(packageDir, "package.json")
    if (!fs.existsSync(packageJsonPath)) {
      continue
    }

    const packageJson = readPackageJson(packageDir)
    graph[packageJson.name] = getWorkspaceDeps(packageJson)
  }

  return graph
}

function getTransitiveDeps(graph, packageName) {
  // Do not include packageName itself in the returned array.
  // Return a sorted array for stable output.
  // Walk the dependency graph from the entry package and collect every reachable package.
  const deps = new Set()
  const stack = [...(graph[packageName] || [])]

  while (stack.length > 0) {
    const depName = stack.pop()
    // Set membership prevents duplicate output and avoids loops in cyclic graphs.
    if (depName === packageName || deps.has(depName)) {
      continue
    }

    deps.add(depName)
    stack.push(...(graph[depName] || []))
  }

  return [...deps].sort()
}

function classifyPackage(packageName) {
  // TODO: classify into one of:
  // "entry", "shared", "reactivity", "runtime", "compiler", "server", "other"
  // This is a small teaching taxonomy for build profiles, not a full Vue package catalog.
  switch (packageName) {
    case "vue":
      return "entry"
    case "@vue/shared":
      return "shared"
    case "@vue/reactivity":
      return "reactivity"
    case "@vue/runtime-core":
    case "@vue/runtime-dom":
      return "runtime"
    case "@vue/compiler-core":
    case "@vue/compiler-sfc":
    case "@vue/compiler-dom":
    case "@vue/compiler-ssr":
      return "compiler"
    case "@vue/server-renderer":
      return "server"
    default:
      return "other"
  }
}

function getBuildProfilePackages(graph, profile) {
  // TODO: return sorted package names for these profiles:
  // - "runtime-only-browser"
  // - "full-browser"
  // - "sfc-tooling"
  // Throw an Error for unknown profiles.
  // Model each profile from its entry package plus the transitive workspace deps it needs.
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

function assertExcludes(collection, unexpected, label) {
  if (collection.includes(unexpected)) {
    throw new Error(`${label}: expected ${JSON.stringify(collection)} to exclude ${unexpected}`)
  }
}

function assertSameMembers(actual, expected, label) {
  const actualJson = JSON.stringify([...actual].sort())
  const expectedJson = JSON.stringify([...expected].sort())
  if (actualJson !== expectedJson) {
    throw new Error(`${label}: expected ${expectedJson}, got ${actualJson}`)
  }
}

function assertThrows(fn, label) {
  try {
    fn()
  } catch {
    return
  }
  throw new Error(`${label}: expected function to throw`)
}

console.log("Running monorepo package map round 4 tests...")

assertTruthy(fs.existsSync(VUE_PACKAGES_DIR), "Vue packages directory exists")

assertEqual(isWorkspaceRange("workspace:*"), true, "workspace star range")
assertEqual(isWorkspaceRange("workspace:^"), true, "workspace caret range")
assertEqual(isWorkspaceRange("^1.0.0"), false, "normal semver range")
assertEqual(isWorkspaceRange(undefined), false, "undefined range")
assertEqual(isWorkspaceRange({ value: "workspace:*" }), false, "non-string range")

const vuePackage = readPackageJson(path.join(VUE_PACKAGES_DIR, "vue"))
assertEqual(vuePackage.name, "vue", "readPackageJson reads vue package")

const fakePackage = {
  dependencies: {
    "@vue/shared": "workspace:*",
    "plain-lib": "^1.2.3",
    "bad-lib": { version: "workspace:*" },
  },
  devDependencies: {
    "@vue/dev-only": "workspace:*",
  },
}
assertSameMembers(getWorkspaceDeps(fakePackage), ["@vue/shared"], "filters workspace deps robustly")

const graph = buildWorkspaceDependencyGraph(VUE_PACKAGES_DIR)
assertTruthy(graph.vue, "graph includes vue")
assertTruthy(graph["@vue/runtime-dom"], "graph includes runtime-dom")
assertTruthy(graph["@vue/compiler-sfc"], "graph includes compiler-sfc")

assertSameMembers(
  graph["@vue/runtime-dom"],
  ["@vue/shared", "@vue/runtime-core", "@vue/reactivity"],
  "runtime-dom direct dependencies",
)

assertSameMembers(
  getTransitiveDeps(graph, "@vue/runtime-dom"),
  ["@vue/shared", "@vue/runtime-core", "@vue/reactivity"],
  "runtime-dom transitive dependencies",
)

assertIncludes(
  getTransitiveDeps(graph, "@vue/compiler-sfc"),
  "@vue/compiler-core",
  "compiler-sfc transitive dependencies include compiler-core",
)
assertIncludes(
  getTransitiveDeps(graph, "@vue/compiler-sfc"),
  "@vue/shared",
  "compiler-sfc transitive dependencies include shared",
)

assertEqual(classifyPackage("vue"), "entry", "vue classification")
assertEqual(classifyPackage("@vue/shared"), "shared", "shared classification")
assertEqual(classifyPackage("@vue/reactivity"), "reactivity", "reactivity classification")
assertEqual(classifyPackage("@vue/runtime-core"), "runtime", "runtime-core classification")
assertEqual(classifyPackage("@vue/runtime-dom"), "runtime", "runtime-dom classification")
assertEqual(classifyPackage("@vue/compiler-core"), "compiler", "compiler-core classification")
assertEqual(classifyPackage("@vue/compiler-dom"), "compiler", "compiler-dom classification")
assertEqual(classifyPackage("@vue/compiler-sfc"), "compiler", "compiler-sfc classification")
assertEqual(classifyPackage("@vue/server-renderer"), "server", "server-renderer classification")
assertEqual(classifyPackage("@vue/compat"), "other", "compat classification")

const runtimeOnly = getBuildProfilePackages(graph, "runtime-only-browser")
assertIncludes(runtimeOnly, "@vue/runtime-dom", "runtime-only includes runtime-dom")
assertIncludes(runtimeOnly, "@vue/runtime-core", "runtime-only includes runtime-core")
assertIncludes(runtimeOnly, "@vue/reactivity", "runtime-only includes reactivity")
assertIncludes(runtimeOnly, "@vue/shared", "runtime-only includes shared")
assertExcludes(runtimeOnly, "@vue/compiler-dom", "runtime-only excludes compiler-dom")
assertExcludes(runtimeOnly, "@vue/compiler-sfc", "runtime-only excludes compiler-sfc")
assertExcludes(runtimeOnly, "@vue/server-renderer", "runtime-only excludes server-renderer")

const fullBrowser = getBuildProfilePackages(graph, "full-browser")
assertIncludes(fullBrowser, "@vue/runtime-dom", "full-browser includes runtime-dom")
assertIncludes(fullBrowser, "@vue/compiler-dom", "full-browser includes compiler-dom")
assertIncludes(fullBrowser, "@vue/compiler-core", "full-browser includes compiler-core")
assertExcludes(fullBrowser, "@vue/compiler-sfc", "full-browser excludes compiler-sfc")
assertExcludes(fullBrowser, "@vue/server-renderer", "full-browser excludes server-renderer")

const sfcTooling = getBuildProfilePackages(graph, "sfc-tooling")
assertIncludes(sfcTooling, "@vue/compiler-sfc", "sfc-tooling includes compiler-sfc")
assertIncludes(sfcTooling, "@vue/compiler-dom", "sfc-tooling includes compiler-dom")
assertIncludes(sfcTooling, "@vue/compiler-ssr", "sfc-tooling includes compiler-ssr")
assertIncludes(sfcTooling, "@vue/shared", "sfc-tooling includes shared")
assertExcludes(sfcTooling, "@vue/runtime-dom", "sfc-tooling excludes runtime-dom")

assertThrows(
  () => getBuildProfilePackages(graph, "unknown-profile"),
  "unknown profile should throw",
)

console.log("All round 4 tests passed")
