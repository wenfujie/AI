# 测试模式

**分析日期：** 2026-05-25

## 测试框架

**Runner：**
- Vitest（版本来源：`pnpm-workspace.yaml` `catalogs.dev.vitest`）
- 配置位置：`vite.config.ts`（`test.environment = 'jsdom'`）

**断言库：**
- Vitest 内置断言（当前仓库无测试样例文件）

**执行命令：**
```bash
pnpm run typecheck      # 类型校验（已存在）
pnpm run lint           # 规范校验（已存在）
pnpm run test           # CI 期望存在，但当前未定义
```

## 测试文件组织

**位置：**
- 当前未检测到 `*.test.*` / `*.spec.*` 文件
- 建议采用“同目录共置”策略，如 `src/composables/dark.spec.ts`

**命名：**
- 推荐 `<module>.spec.ts` 或 `<page>.spec.ts`

**结构：**
```text
src/
  composables/
    dark.ts
    dark.spec.ts
  pages/
    index.vue
    index.spec.ts
```

## 测试结构

**套件组织：**
```typescript
describe('dark composable', () => {
  it('toggles theme state', () => {
    // arrange -> act -> assert
  })
})
```

**模式：**
- 初始化：在 `beforeEach` 重置 DOM/存储状态
- 断言：优先断言可观察行为（class 切换、响应值变化）
- 清理：在 `afterEach` 回收 mock 与全局副作用

## Mock 策略

**框架：**
- 建议使用 `vi.mock`（Vitest 标准能力）

**模式：**
```typescript
vi.mock('@vueuse/core', () => ({
  useDark: () => ref(false),
  useToggle: (v: Ref<boolean>) => () => (v.value = !v.value),
}))
```

**应 Mock：**
- 外部 SDK、浏览器 API 边界、时间与随机性依赖

**不应 Mock：**
- 纯函数与简单状态转换逻辑

## 固件与工厂

**测试数据：**
```typescript
const createThemeState = (initial = false) => ref(initial)
```

**位置：**
- 建议 `src/test-utils/` 或功能目录内 `__tests__/fixtures`

## 覆盖率

**要求：**
- 当前未检测到覆盖率门禁

**查看覆盖率：**
```bash
pnpm vitest --coverage
```

## 测试类型

**单元测试：**
- 重点覆盖 composable（`src/composables/*.ts`）和纯工具逻辑

**集成测试：**
- 重点覆盖 `src/main.ts` 路由初始化与根组件渲染

**E2E 测试：**
- 当前未检测到 Playwright/Cypress 配置

## 常见模式

**异步测试：**
```typescript
it('updates after nextTick', async () => {
  await nextTick()
  expect(true).toBe(true)
})
```

**错误场景测试：**
```typescript
expect(() => someFn()).toThrow()
```

---

*测试分析：2026-05-25*
