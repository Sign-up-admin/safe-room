#!/usr/bin/env node

/**
 * 批量生成Vue组件文档脚本
 */

const fs = require('fs');
const path = require('path');

// 组件列表（完整列表）
const components = [
  'NotificationCenter',
  'NotificationItem',
  'NotificationToast',
  'NotificationSettings',
  'FileUpload',
  'Editor',
  'img',
  'timeable',
  'Breadcrumb',
  'CookieConsent',
  'CountDown',
  'CourseCard',
  'HeroSection',
  'ServiceCards',
  'CoachNetwork',
  'MembershipCard',
  'MembershipBenefits',
  'MembershipComparison',
  'PaymentStepper',
  'PaymentResult',
  'PaymentMethodCard',
  'BookingSummary',
  'BookingCalendar',
  'GoalSelector',
  'SchedulePlanner',
  'CoursePicker',
  'RecommendationCard',
  'TechCard',
  'TechButton',
  'TechStepper',
  'SafeHtml',
  'VerifyCode',
  'RotateVerify',
  'MobileForm',
  'Stepper',
  'Equipment3DViewer',
  'DiscussionComposer',
  'DiscussionReplies',
  'AdvancedFilters',
  'TopicCloud',
  'FavoritesOverview',
  'ModuleForm',
  'ModuleDetail',
  'ModuleList',
  'CoachRecommend',
  'BookingRecommend',
  'Testimonials',
  'Footer',
  'FloatingServiceButton',
  'SmartHeader',
  'MobilePaymentConfirm',
  'CourseBenefitsChart',
  'FocusManagement',
  'KeyboardNavigation',
  'HotTopics',
  'MessageCenter',
  'PricingEngine',
  'NotificationWebSocket',
  'Theme',
  'Motion',
  'MembershipSelection',
  'BookingConflict',
  'PaymentStatus',
  'SuccessAnimation',
  'StepTransition',
  'LoadingGlow',
  'PageTransition',
  'HoverGlow',
  'ScrollAnimation',
  'ParticleSystem',
  'Animations',
  'AdvancedSearch',
  'Home',
  'Login',
  'Register',
  'Center',
  'Index',
  'Pay',
  'NewsList',
  'NewsDetail',
  'EquipmentDetail',
  'ErrorPage',
  'Privacy',
  'Terms',
  'Requirements',
  'Disclaimer',
  'ApiDocs',
  'NotFound',
  'SharedModuleFormPage',
  'SharedModuleDetailPage',
  'SharedModuleListPage',
  'ChatAdd',
  'ChatList',
  'StoreUp',
  'DiscussFitnessCourse',
  'FitnessEquipment',
  'MembershipRenewal',
  'MembershipPurchase',
  'ExpirationReminder',
  'CourseRefund',
  'CourseType',
  'CoachAdd',
  'PrivateCoachBooking',
  'UserAdd',
  'MembershipCardDetail',
  'MembershipCardAdd',
  'CourseBookingDetail',
  'UserList',
  'UserDetail',
  'FitnessCourseAdd',
  'FitnessCourseDetail',
  'FitnessCoachDetail',
  'NewsTypeDetail',
  'NewsTypeList',
  'NewsTypeAdd',
  'DiscussFitnessCourseDetail',
  'DiscussFitnessCourseAdd',
  'FitnessEquipmentDetail',
  'FitnessEquipmentAdd',
  'MembershipRenewalDetail',
  'MembershipRenewalAdd',
  'MembershipPurchaseDetail',
  'ExpirationReminderDetail',
  'ExpirationReminderAdd',
  'CourseRefundDetail',
  'CourseRefundAdd',
  'CourseTypeDetail',
  'CourseTypeAdd',
  'PrivateCoachBookingDetail',
  'MembershipCardList'
];

console.log(`开始批量生成 ${components.length} 个Vue组件文档...`);

components.forEach(compName => {
  const docName = compName.toUpperCase();
  const docPath = `docs/technical/frontend/components/${docName}.md`;

  if (!fs.existsSync(docPath)) {
    const content = `---
title: ${compName.toUpperCase()}
version: v1.0.0
last_updated: 2025-11-16
status: draft
category: technical
tags: [vue, component, frontend]
---

# ${compName} 组件文档

> **版本**：v1.0.0
> **更新日期**：2025-11-16
> **适用范围**：[组件适用场景]
> **关键词**：Vue组件, 前端组件

---

## 📋 目录

- [概述](#概述)
- [功能特性](#功能特性)
- [安装使用](#安装使用)
- [API文档](#api文档)
- [示例代码](#示例代码)
- [注意事项](#注意事项)

---

## 📖 概述

### 组件介绍

${compName} 组件的功能描述和使用场景。

### 设计理念

组件的设计理念和目标。

---

## ✨ 功能特性

- [ ] 核心功能特性
- [ ] 用户体验优化
- [ ] 兼容性保证

---

## 🚀 安装使用

### 基础用法

\`\`\`vue
<template>
  <${compName}
    v-model="value"
    :prop1="propValue"
    @event1="handleEvent"
  />
</template>

<script setup lang="ts">
import ${compName} from '@/components/${compName}.vue'

const value = ref('')
const propValue = 'example'

const handleEvent = (data) => {
  console.log('Event:', data)
}
</script>
\`\`\`

---

## 📚 API文档

### Props 属性

| 属性名 | 类型 | 默认值 | 必需 | 说明 |
|--------|------|--------|------|------|
| v-model | \`string\` | \`''\` | 否 | 双向绑定值 |

### Events 事件

| 事件名 | 参数 | 说明 |
|--------|------|------|
| change | \`(value: any)\` | 值改变时触发 |

---

## 💡 示例代码

### 基础示例

\`\`\`vue
<template>
  <${compName} />
</template>

<script setup lang="ts">
import { ref } from 'vue'
</script>
\`\`\`

---

## ⚠️ 注意事项

### 使用限制

- [ ] Vue 3.x 环境
- [ ] 正确导入组件

### 性能考虑

- [ ] 大数据量优化

---

**最后更新**：2025-11-16
**维护责任人**：[组件开发者]
**联系方式**：[开发者邮箱]
`;

    fs.writeFileSync(docPath, content, 'utf-8');
    console.log(`✅ 生成: ${docPath}`);
  } else {
    console.log(`⏭️  跳过: ${docPath} (已存在)`);
  }
});

console.log('组件文档批量生成完成！');
