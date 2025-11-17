# 后台仪表盘页面需求文档（Admin Dashboard v1.0）

> 版本：v1.0  
> 更新日期：2025-11-15（计划日期）  
> 适用路由：`/`（默认 Home）  
> 关联组件：`src/views/home.vue`

---

## 0. 设计关键词

实时监控 · 数据洞察 · 安全提示 · 自定义卡片 · 响应式栅格

---

## 1. 页面逻辑结构

| 顺序 | 区块 | 目的 |
| --- | --- | --- |
| ① | 顶部欢迎区域 | 显示管理员昵称、角色、当前时间/班次 |
| ② | 指标总览卡片（Stats Grid） | 快速查看核心 KPI（会员、课程、预约、收益等） |
| ③ | 图表栅格（Charts Grid） | 展示趋势/对比（收入、退课、卡种销量、续费趋势） |
| ④ | 快速导航 / 通知 | （可选）链接至常用模块、显示系统公告 |

---

## 2. 视觉规范

### 2.1 背景
- 使用浅色背景 `#F3F3F3`  
- 保持与 Overview 文档一致的浅色主题

### 2.2 指标卡片

| 属性 | 规范 |
| --- | --- |
| 布局 | `grid-template-columns: repeat(auto-fill, minmax(220px, 1fr))` |
| 背景 | `#FFFFFF`，圆角 8px，阴影 `0 2px 8px rgba(0,0,0,0.08)` |
| 内容 | Icon + 数值 + 标签 |
| Icon 容器 | 48x48px，浅蓝色背景 `rgba(58,128,255,0.1)`，圆角 12px |
| 数值 | 18px，字重 600，颜色 `#333` |
| 标签 | 13px，颜色 `#666` |
| Hover | 轻微放大 1.02×，阴影加强 `0 4px 12px rgba(0,0,0,0.12)` |

### 2.3 图表卡片

- 尺寸：最小宽度 320px，高度 320px  
- 背景：`#FFFFFF`，边框 `1px solid rgba(0,0,0,0.06)`，圆角 8px，阴影 `0 2px 8px rgba(0,0,0,0.08)`  
- 标题：14px，字体颜色 `#333`，字重 600  
- 图表主题：浅色，轴线颜色 `#E0E0E0`，文本 `#666`，网格线 `#F5F5F5`

---

## 3. 功能需求

### 3.1 数据总览卡片

| 指标名称 | 接口路径 | 权限控制 | 数据类型 | 说明 |
| --- | --- | --- | --- | --- |
| 会员总数 | `/yonghu/count` | `yonghu/Home Total` | 数值 | 总注册会员数量 |
| 健身课程数 | `/jianshenkecheng/count` | `jianshenkecheng/Home Total` | 数值 | 发布的课程总数 |
| 课程预约数 | `/kechengyuyue/count` | `kechengyuyue/Home Total` | 数值 | 所有课程预约总数 |
| 会员卡购买数 | `/huiyuankagoumai/count` | `huiyuankagoumai/Home Total` | 数值 | 会员卡销售总数 |
| 教练总数 | `/jianshenjiaolian/count` | `jianshenjiaolian/Home Total` | 数值 | 注册教练数量 |
| 私教预约数 | `/sijiaoyuyue/count` | `sijiaoyuyue/Home Total` | 数值 | 私教服务预约总数 |
| 会员续费数 | `/huiyuanxufei/count` | `huiyuanxufei/Home Total` | 数值 | 会员续费记录总数 |
| 健身器材数 | `/jianshenqicai/count` | `jianshenqicai/Home Total` | 数值 | 设备资产总数 |

**卡片状态管理**：
- **Loading状态**：显示骨架屏，提升加载体验
- **Error状态**：接口失败时显示错误提示和重试按钮
- **权限控制**：无权限时显示"无权限查看"占位符
- **数据格式化**：自动格式化大数字（K/M单位）

> 所有卡片支持配置化：通过 `statsConfig` 数组配置，集成权限检查和动态数据获取。

### 3.2 图表模块

**已实现图表**（基于实际代码配置）：

| 图表名称 | 接口路径 | 图表类型 | 权限控制 | 数据维度 | 说明 |
| --- | --- | --- | --- | --- | --- |
| 课程预约日收入 | `/kechengyuyue/value/yuyueshijian/kechengjiage/day` | 柱状图 | `kechengyuyue/Home Statistics` | 预约时间/课程价格 | 每日课程预约收入统计 |
| 课程退课日收入 | `/kechengtuike/value/shenqingshijian/kechengjiage/day` | 柱状图 | `kechengtuike/Home Statistics` | 申请时间/课程价格 | 每日退课冲销金额统计 |
| 会员卡购买统计 | `/huiyuankagoumai/group/huiyuankamingcheng` | 柱状图 | `huiyuankagoumai/Home Statistics` | 会员卡名称 | 不同卡种销售数量统计 |
| 会员续费日收入 | `/huiyuanxufei/value/xufeishijian/jiage/day` | 折线图 | `huiyuanxufei/Home Statistics` | 续费时间/价格 | 会员续费收入趋势图 |

**图表状态管理**：
- **Loading状态**：显示骨架屏和加载动画
- **Error状态**：显示错误信息和重试按钮
- **Empty状态**：无数据时显示空状态提示
- **权限控制**：无权限时隐藏图表卡片

**图表交互功能**：
- 悬停显示数据详情
- 图表自适应容器大小
- 单独刷新功能
- 响应式布局适配

### 3.3 权限驱动

**权限检查机制**：
- 使用 `isAuth(tableName, authKey)` 函数进行权限验证
- 卡片权限键：`Home Total`（如：`yonghu/Home Total`）
- 图表权限键：`Home Statistics`（如：`kechengyuyue/Home Statistics`）

**权限控制逻辑**：
```typescript
// 卡片权限检查
const displayStats = computed(() =>
  stats.map((item) => ({
    ...item,
    canView: isAuth(item.table, 'Home Total'),
    value: statValues[item.id] || 0,
  }))
)

// 图表权限检查
const displayCharts = computed(() =>
  charts.map((item) => ({
    ...item,
    canView: isAuth(item.table, 'Home Statistics'),
  }))
)
```

**无权限处理**：
- 卡片：显示"无权限查看"占位符，带锁图标
- 图表：完全隐藏图表卡片，避免布局跳动
- 数据：前端不请求无权限的接口数据

### 3.4 实时信息

- 顶部显示当前时间，`dayjs` 每秒刷新  
- 可扩展“系统公告/即将到期提醒”横幅，点击跳转对应模块

---

## 4. 交互与动效

| 场景 | 行为 |
| --- | --- |
| 页面加载 | Skeleton 占位 → 数据填充；图表淡入 |
| 卡片 Hover | 阴影增强、图标背景亮度提升 |
| 图表 Resize | 监听 `window.resize`，200ms 防抖 |
| 数据刷新 | 提供“刷新全部”按钮，或定时轮询（默认 5 分钟） |
| 错误处理 | 接口失败时在卡片内部显示 `ElResult` + 重试按钮 |

---

## 5. 可配置性

1. `stats` 与 `charts` 数组支持从配置文件或接口注入，便于新增业务指标。  
2. 每个模块定义 `authKey`、`endpoint`、`type`、`xField`、`valueField`。  
3. 支持用户自定义排序/显示，持久化至本地或服务端。  
4. 图表主题采用浅色主题，与整体设计保持一致。

---

## 6. 性能与监控

- 首页接口并发请求控制：使用 `Promise.all`，失败单独兜底  
- 图表数据缓存 60s，避免频繁请求  
- 使用 `echarts.dispose()` 清理实例防内存泄露  
- 记录数据加载耗时，写入监控（可选：`performance.mark`）

---

## 7. 响应式策略

| 终端 | 处理 |
| --- | --- |
| >1440px | 4 列指标卡，图表 2×2 栅格 |
| 992-1440px | 3 列指标卡，图表自动折行 |
| <992px | 指标卡两列，图表全宽；提示“建议使用桌面端” |

---

## 8. 验收标准

| 维度 | 标准 |
| --- | --- |
| 功能 | 指标/图表与接口数据一致；权限控制正确 |
| 体验 | 首屏加载 ≤ 2s；界面无抖动；可手动刷新 |
| 稳定性 | 接口失败有提示，图表销毁重建无报错 |
| 可用性 | 键盘 Tab 可聚焦到刷新/筛选按钮；ARIA 标签齐全 |

---

## 9. 待办/扩展

- [ ] 增加“门店维度”切换（多店支持）  
- [ ] 引入“实时预警”组件（用 WebSocket 推送异常）  
- [ ] 允许导出仪表盘数据快照（PDF/PNG）

---***

