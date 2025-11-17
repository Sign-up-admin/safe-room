---
title: DESIGN SYSTEM OVERVIEW
version: v1.0.0
last_updated: 2025-11-16
status: active
category: technical
---
# 前台设计系统概览

> 版本：v2.0 · 更新日期：2025-11-16
> 覆盖范围：`springboot1ngh61a2/src/main/resources/front/front`

## 1. 设计基线

| 维度 | 指南 |
| --- | --- |
| 视觉主题 | 黑金科技风（背景深黑 #0a0a0a + 霓虹黄 #ffd700 高光） |
| 字体体系 | 主标题：Montserrat Bold；正文：HarmonyOS Sans/PingFang SC；数据：Monaco |
| 组件风格 | 玻璃拟物卡片（backdrop-filter blur + gradient border）+ Pill 按钮 + 悬浮阴影 |
| 动效规范 | hover 上浮 4px + 发光增强 8%，过渡时间 0.3s cubic-bezier(0.4, 0, 0.2, 1) |

## 2. Design Token 结构

所有 Token 定义于 `src/styles/design-tokens.scss`。除 CSS Variable 外，提供 SCSS Mixin 与 Function：

- **颜色**：`--tech-color-*` 与 `$color-*` 保持同步。
- **空间**：`--tech-spacing-{xs…xl}`、`spacing($size)`。
- **混合**：
  - `@mixin glass-card($background,$radius)`：打造玻璃卡片。
  - `@mixin yellow-button($isOutline,$height)`：统一按钮。
  - `@mixin hover-glow($scale,$glow)`：卡片/按钮 hover。
  - `@mixin card-heading($eyebrow)`：标题区域排版。
  - `@mixin form-field-dark`：Element Plus 表单深色皮肤。

### 使用示例
```scss
.stat-card {
  @include glass-card();
  padding: spacing(lg);

  .stat-card__header {
    @include card-heading;
  }

  &:hover {
    @include hover-glow(1.03);
  }
}
```

## 3. Element Plus 主题覆盖

已在设计 Token 中重写以下变量，确保 Element Plus 组件与全局视觉一致：

- `--el-color-primary` / `--el-text-color-*` / `--el-bg-color`
- 表单输入统一使用 `form-field-dark` mixin，以避免默认浅色交互。

## 4. 组件层规范

| 组件类别 | 说明 |
| --- | --- |
| `TechButton` | 包装 `yellow-button`，支持 `primary / outline / ghost / text` 四种风格。 |
| `TechCard` | 默认启用 `glass-card` + 可选 `variant` (`solid / layered / minimal`)。 |
| Booking/Payment 系列 | 在 `src/components/booking` / `src/components/payment` 下形成可复用步骤、卡片、日历。 |

> 统一要求：组件外层 padding 使用 `spacing()` 函数；hover/active 状态使用 `hover-glow`。

## 5. 页面布局指导

1. **Hero 区域**：`section-eyebrow`（小写字母 + 0.35em 间距）+ H1 + 描述。
2. **网格**：使用 `repeat(auto-fit, minmax())` 自适应，间距使用 `spacing(lg)`。
3. **CTA 区域**：`TechCard variant="layered"` + `TechButton size="lg"`。
4. **表单**：引用 `form-field-dark`，保持统一占位符颜色和 focus 动画。

## 6. Token 扩展流程

1. 在 `design-tokens.scss` 中新增 CSS 变量 + SCSS 常量。
2. 如需对外暴露混合宏/函数，追加于同文件底部。
3. 页面或组件引用 Token 后，补充文档（本文件）对应章节。

## 7. 待办

- [ ] 为 Element Plus Dialog / Notification 创建专用主题。
- [ ] 输出 Figma Token 与代码同步脚本。
- [ ] 为 `TechCard` 提供浅色 `variant="ghost"` 设计稿。

---

> 任何 Token 调整请先在设计稿/需求中确认，再提交 `DESIGN_SYSTEM_OVERVIEW.md` 更新记录。***

