/**
 * 共享工具与辅助 — Beginner
 * 打开 README.md 查看完整说明。把 TODO 替换成你的实现。
 *
 * 参考源码：
 * - /Users/naldomac/Projects/vuejs/core/packages/shared/src/general.ts:33-54
 * - /Users/naldomac/Projects/vuejs/core/packages/shared/src/general.ts:142-144
 * - /Users/naldomac/Projects/vuejs/core/packages/shared/src/normalizeProp.ts:5-95
 * - /Users/naldomac/Projects/vuejs/core/packages/reactivity/src/reactive.ts:262-278
 */

import assert from "node:assert/strict"

function isObject(value) {
  // TODO: 只在 value 是非 null 对象时返回 true。
  return typeof value === 'object' && value !== null
}

function hasChanged(value, oldValue) {
  // TODO: 使用 Object.is 语义。NaN 和 NaN 不应算作变化。
  return !Object.is(value, oldValue)
}

const hasOwnProperty = Object.prototype.hasOwnProperty

function hasOwn(value, key) {
  // TODO: 安全检查 key 是否是 value 自身拥有的属性。
  return hasOwnProperty.call(value, key)
}

function parseStringStyle(cssText) {
  // TODO: 把 "color: red; font-size: 14px;" 转成 { color: "red", "font-size": "14px" }。
  // 这个入门版本保持简单：先按分号拆分，再按每一项里的第一个冒号拆分。
  const cssStyleObj = {}
  const styleArr = cssText.split(';').filter(item => item !== '')
  for (const style of styleArr) {
    const styleItem = style.split(':')
    const key = styleItem[0].trim()
    const value = styleItem[1].trim()
    cssStyleObj[key] = value
  }
  return cssStyleObj
}

function normalizeClass(value) {
  // TODO: 支持 string、array、嵌套 array 和 object 语法。
  // 示例：
  // normalizeClass(["btn", ["primary"], { active: true, hidden: false }])
  // -> "btn primary active"
}

function normalizeStyle(value) {
  // TODO: 支持 string、object 和 array。
  // 顶层 string 应保持 string；只有出现在 array 内部时，才需要解析并合并。
}

function normalizeProps(props) {
  // TODO: 传入 null 时返回 null；否则在存在 props.class 和 props.style 时进行标准化。
}

function createReactiveGate(value) {
  // TODO: 如果 value 不是对象，原样返回。
  // 如果 value 是对象，返回一个通过 Reflect 支持基础 get/set 的 Proxy。
}

function runTests() {
  console.log("Running shared-utils practice tests...")

  assert.equal(isObject({}), true, "plain object is object")
  assert.equal(isObject([]), true, "array is object")
  assert.equal(isObject(null), false, "null is not object")
  assert.equal(isObject(1), false, "number is not object")
  assert.equal(isObject("vue"), false, "string is not object")
  assert.equal(isObject(() => {}), false, "function is not object for this Vue helper")

  assert.equal(hasChanged(1, 1), false, "same number has not changed")
  assert.equal(hasChanged(1, 2), true, "different numbers changed")
  assert.equal(hasChanged(NaN, NaN), false, "NaN should not count as changed")
  assert.equal(hasChanged(+0, -0), true, "+0 and -0 follow Object.is semantics")

  const proto = { inherited: true }
  const child = Object.create(proto)
  child.own = true
  assert.equal(hasOwn(child, "own"), true, "own property is found")
  assert.equal(hasOwn(child, "inherited"), false, "inherited property is not own")

  const nullProto = Object.create(null)
  nullProto.answer = 42
  assert.equal(hasOwn(nullProto, "answer"), true, "Object.create(null) is supported")

  assert.equal(normalizeClass("btn active"), "btn active", "string class stays string")
  assert.equal(
    normalizeClass(["btn", ["primary"], { active: true, hidden: false }]),
    "btn primary active",
    "array and object class syntax is flattened",
  )
  assert.equal(normalizeClass([null, false, undefined, { shown: 1 }]), "shown")

  assert.deepEqual(parseStringStyle("color: red; font-size: 14px;"), {
    color: "red",
    "font-size": "14px",
  })

  assert.equal(normalizeStyle("color: red;"), "color: red;", "top-level style string stays string")
  assert.deepEqual(
    normalizeStyle(["color: red;", { fontSize: "14px" }, { color: "blue" }]),
    { color: "blue", fontSize: "14px" },
    "style array is parsed and merged from left to right",
  )

  const props = normalizeProps({
    class: ["btn", { active: true }],
    style: ["color: red;", { fontSize: "14px" }],
  })
  assert.deepEqual(props, {
    class: "btn active",
    style: { color: "red", fontSize: "14px" },
  })
  assert.equal(normalizeProps(null), null, "null props stays null")

  assert.equal(createReactiveGate(1), 1, "primitive returns as-is")
  const reactiveObject = createReactiveGate({ count: 0 })
  reactiveObject.count = 1
  assert.equal(reactiveObject.count, 1, "object is proxied with get/set")

  console.log("All shared-utils practice tests passed")
}

runTests()
