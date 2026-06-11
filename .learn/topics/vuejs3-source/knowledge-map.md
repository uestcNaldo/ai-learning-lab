# Vue.js 3.x 源码学习

> 0/29 mastered · 0% complete

## 响应式系统 (Reactivity)

- ⚪ **reactive 与 Proxy 代理** (unexplored)
  - Proxy handlers (get/set/deleteProperty/has/ownKeys)
  - ReactFlags 与 targetMap
  - 浅层响应式 shallowReactive
- ⚪ **ref 与 RefImpl** (unexplored)
  - RefImpl 类设计
  - toRefs / toRef
  - shallowRef
  - triggerRef 手动触发
- ⚪ **effect 与副作用** (unexplored)
  - ReactiveEffect 类
  - 依赖收集 track()
  - 触发更新 trigger()
  - effect scope
- ⚪ **computed 实现** (unexplored)
  - 懒求值与缓存机制
  - dirty flag 设计
  - ComputedRefImpl
- ⚪ **watch 与 watchEffect** (unexplored)
  - traverse 深度遍历
  - scheduler 调度
  - cleanup 机制
- ⚪ **调度器 Scheduler** (unexplored)
  - queueFlush 与微任务队列
  - nextTick 实现
  - job 优先级排序

## 虚拟 DOM (Virtual DOM)

- ⚪ **VNode 设计与创建** (unexplored)
  - VNode 接口定义
  - createVNode / \_createVNode
  - Fragment / Text / Comment
- ⚪ **ShapeFlags 与 PatchFlags** (unexplored)
  - ShapeFlags 位掩码 (ELEMENT/STATEFUL\_COMPONENT等)
  - PatchFlags 优化标记
  - Block 与 dynamicChildren
- ⚪ **Diff 算法 (patchKeyedChildren)** (unexplored)
  - 5步处理: 头头/尾尾/头尾/尾头/乱序
  - 最长递增子序列 (LIS)
  - 移动与卸载策略
- ⚪ **Renderer 渲染器** (unexplored)
  - createRenderer 工厂函数
  - patch / mount / unmount
  - processElement / processComponent
  - DOM 操作封装 (nodeOps)

## 组件系统 (Component System)

- ⚪ **组件实例 ComponentInternalInstance** (unexplored)
  - 实例属性与上下文
  - vnode -> instance 映射
  - proxy 代理对象
- ⚪ **组件挂载流程** (unexplored)
  - mountComponent
  - setup 函数执行
  - renderEffect 创建与首次渲染
- ⚪ **组件更新流程** (unexplored)
  - updateComponent
  - subTree 对比
  - 优化路径: 复用 vs 重渲染
- ⚪ **Props 与 Emit** (unexplored)
  - initProps / updateProps
  - emit 类型推导与实现
  - attrs 透传
- ⚪ **Slots 实现** (unexplored)
  - Slots 类型 (正常/作用域/动态)
  - ensureValidVNode
  - 编译时与运行时协作
- ⚪ **Provide / Inject** (unexplored)
  - 组件链上的注入链
  - Symbol key 与默认值
  - 响应式注入
- ⚪ **生命周期钩子** (unexplored)
  - 钩子注册与调用时机
  - setup 中的钩子 (onMounted等)
  - 当前实例注入 (currentInstance)

## 编译器 (Compiler)

- ⚪ **模板解析器 Parser** (unexplored)
  - 有限状态机解析
  - AST 节点类型
  - 指令与表达式解析
- ⚪ **Transform 转换插件** (unexplored)
  - transformElement
  - vIf / vFor 转换
  - vModel 转换
  - slotOutlet 转换
- ⚪ **代码生成 Codegen** (unexplored)
  - generate 函数
  - 渲染函数字符串拼接
  - 辅助函数 (\_ctx, \_push 等)
- ⚪ **静态提升与优化** (unexplored)
  - 静态节点提升 (hoistStatic)
  - PatchFlags 标记
  - Block Tree 收集动态节点
- ⚪ **SFC 编译** (unexplored)
  - @vue/compiler-sfc
  - parse 解析 SFC
  - compileScript / compileTemplate / compileStyle

## 应用架构 (Application Architecture)

- ⚪ **createApp 与应用实例** (unexplored)
  - ensureRenderer
  - app.mount 流程
  - app.unmount
- ⚪ **插件系统** (unexplored)
  - app.use 实现
  - install 约定
  - provide 注入插件上下文
- ⚪ **自定义渲染器 Custom Renderer** (unexplored)
  - createRenderer 抽象
  - nodeOps 替换 (Canvas/Native)
  - 运行时与平台无关设计
- ⚪ **内置组件** (unexplored)
  - KeepAlive 缓存策略
  - Teleport 移动节点
  - Suspense 异步依赖
  - Transition 动画钩子

## 工程架构 (Project Architecture)

- 🔵 **Monorepo 与包结构** (in progress)
  - packages 目录结构
  - 包间依赖关系
  - rollup/esbuild 构建
- ⚪ **TypeScript 类型系统** (unexplored)
  - 核心类型定义
  - 泛型推导
  - 类型体操 (ExtractComputedReturns等)
- ⚪ **共享工具与辅助** (unexplored)
  - @vue/shared 工具函数
  - 全局变量 (\_\_DEV\_\_, \_\_TEST\_\_)
  - 通用缓存 (LRU)
