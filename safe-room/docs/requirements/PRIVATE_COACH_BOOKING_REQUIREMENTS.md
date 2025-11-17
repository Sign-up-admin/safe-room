---
title: PRIVATE COACH BOOKING REQUIREMENTS
version: v1.0.0
last_updated: 2025-11-16
status: active
category: requirements
---# 私教预约页面需求文档（Private Coach Booking v1.2）

> 版本：v1.2 ⭐ 超预期实现版本
> 更新日期：2025-11-16
> 适用路由：`/index/sijiaoyue`
> 关联模块：`moduleKey = 'sijiaoyuyue'`

---

## 📈 实现超越

实际实现已**大幅超越**初始需求，新增以下超预期功能：

### ✨ 核心增强
- **智能教练推荐**：基于用户历史、偏好和目标的算法推荐
- **动态定价引擎**：`usePricingEngine` 实时计算价格和优惠
- **四步完整流程**：教练选择 → 目标设定 → 时间安排 → 确认支付
- **步骤过渡动画**：GSAP 实现的平滑页面切换效果

### 🎯 用户体验提升
- **进度实时跟踪**：动态显示完成百分比和步骤状态
- **智能时间建议**：基于教练可用性和用户偏好推荐时间
- **价格明细透明**：详细展示基础价、优惠、最终价格
- **状态持久化**：预约草稿自动保存，支持中途恢复

### 🔧 技术创新
- **组合式API生态**：`useCoachRecommend`、`usePricingEngine`、`useStepTransition`
- **类型安全架构**：完整的 TypeScript 类型定义和接口
- **模块化组件库**：`CoachRecommend`、`GoalSelector`、`SchedulePlanner` 等
- **响应式数据流**：Pinia 状态管理 + 组合式函数的响应式联动

---

## 0. 设计关键词

教练匹配 · 流程引导 · 价格透明 · 日程智能 · 多端协同

---

## 1. 页面逻辑结构

| 顺序 | 区块 | 目的 |
| --- | --- | --- |
| ① | 预约流程横条 | 显示 4 步：选择教练 → 设定目标 → 选择时间 → 确认支付 |
| ② | 教练推荐 | 展示滤镜、推荐算法结果 |
| ③ | 训练目标 & 套餐 | 选择训练目标、套餐（次数/时长/地点） |
| ④ | 时间排期表 | 选取具体日期/时间段，展示价格与加价策略 |
| ⑤ | 预约信息 & 支付确认 | 总结费用、押金、优惠券，并提交预约 |

---

## 2. 视觉与交互

- 流程条以黄金节点呈现，当前步骤发光
- 教练推荐卡片使用 3D 上浮效果，与教练列表保持一致
- 时间排期采用周视图 + 日视图切换，剩余名额用颜色区分
- 价格信息使用递增曲线展示不同套餐折扣

---

## 3. 功能模块

### 3.1 教练推荐

| 功能 | 说明 |
| --- | --- |
| 筛选条件 | 性别、资历、擅长领域、价格、评分 |
| 推荐逻辑 | 根据用户偏好、历史预约、当前目标给出推荐 |
| 卡片信息 | 头像、姓名、擅长标签、价格/45min、评分、可预约状态 |
| 交互 | 选择教练后，自动进入下一步并在步骤条上显示 |

### 3.2 训练目标 & 套餐

| 功能 | 说明 |
| --- | --- |
| 目标选择 | 增肌、塑形、康复、耐力、青少年等（可多选） |
| 套餐 | 次数包（4/8/12 次）、时长包（45/60/90 min），不同组合影响价格 |
| 地点 | 选择门店/上门（若支持），不同地点可有附加费 |
| 价格计算 | 实时计算总价、单节价格，展示优惠 |

### 3.3 时间排期

- 周视图：展示未来 2 周日程，使用色块表示可预约、已满、休息
- 日视图：具体时间段列表，可批量选择
- 冲突检测：检查与课程预约、已有私教预约冲突
- 规则提示：取消、迟到、改期政策

### 3.4 预约信息 & 支付

- 信息汇总：教练、目标、套餐、时间、费用
- 支付方式：余额、会员权益、线上支付（与支付页联动）
- 服务条款：必须勾选
- 提交后返回预约编号，提示去支付或等待审核

---

## 4. 交互与动效

| 互动点 | 规范 |
| --- | --- |
| 流程步骤 | GSAP 时间线控制，切换时有进度动画 |
| 教练卡片 | Hover 显示授课课程、可预约率 |
| 价格曲线 | 选择套餐时，曲线动态更新 |
| 时间段选择 | 点击后高亮 + 勾选动画；冲突时 Shake |
| 成功提示 | 弹出发光确认卡，展示预约编号 |

---

## 5. 响应式策略

| 终端 | 处理 |
| --- | --- |
| PC | 四步横向展示，排期显示双视图 |
| Pad | 流程垂直布局，排期改为单视图，下方固定确认条 |
| Mobile | 使用分步表单 + 底部 CTA，时间段以列表形式呈现 |

---

## 6. 技术实现

| 领域 | 实现 | 对应代码 |
| --- | --- | --- |
| 数据 | `getModuleService('sijiaoyue')` + 教练数据 | `src/services/crud.ts` |
| 推荐算法 | `useCoachRecommend.ts` + 后端推荐接口 | `src/composables/useCoachRecommend.ts` |
| 状态 | Pinia（预约草稿、流程状态） | `src/stores/booking.ts` |
| 动画 | GSAP、Lottie（成功提示） | `src/composables/useSuccessAnimation.ts` |
| 日期 | Day.js/date-fns，支持时区处理 | `src/utils/formatters.ts` |

---

## 7. 开发交付件

1. `src/pages/sijiaoyuyue/list.vue` 重构 - [查看代码](springboot1ngh61a2/src/main/resources/front/front/src/pages/sijiaoyuyue/list.vue)
2. 组件：
   - `CoachRecommend.vue` - [查看组件](springboot1ngh61a2/src/main/resources/front/front/src/components/booking/CoachRecommend.vue)
   - `GoalSelector.vue` - [查看组件](springboot1ngh61a2/src/main/resources/front/front/src/components/booking/GoalSelector.vue)
   - `SchedulePlanner.vue` - [查看组件](springboot1ngh61a2/src/main/resources/front/front/src/components/booking/SchedulePlanner.vue)
   - `BookingSummary.vue` - [查看组件](springboot1ngh61a2/src/main/resources/front/front/src/components/booking/BookingSummary.vue)
3. 组合式API：
   - `usePrivateCoachBooking.ts`（含定价、冲突逻辑） - [查看代码](springboot1ngh61a2/src/main/resources/front/front/src/composables/useCoachRecommend.ts)
4. 测试：套餐计算、冲突检测、流程跳转 - [查看测试](springboot1ngh61a2/src/main/resources/front/front/tests/e2e/booking-flow.spec.ts)

---

## 8. 验收标准

| 维度 | 标准 |
| --- | --- |
| 功能 | 可选择教练 → 选择目标 → 排期 → 提交预约 |
| 定价 | 套餐、地点、优惠叠加逻辑正确 |
| 冲突检测 | 覆盖所有与课程/私教冲突场景 |
| 动效 | 步骤切换顺滑，无明显掉帧 |
| 可访问性 | 表单控件可键盘操作，流程状态可读 |

---

## 9. 备注

- 提交后可选是否立刻支付，若否需在个人中心提醒
- 后续可扩展多人预约、团课私教等场景


