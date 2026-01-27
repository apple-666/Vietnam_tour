# 代码结构说明

## 项目概述

这是一个纯前端旅游助手应用，使用 HTML、CSS、JavaScript 和 Leaflet.js 地图库构建。

---

## 项目结构

```
Vietnam_tour/
├── data/
│   └── data.js          # 核心数据文件（酒店、景点、行程等）
├── docs/
│   ├── index.html       # 主页面
│   ├── app.js           # 应用逻辑
│   ├── style.css        # 样式文件
│   └── tiles/           # 离线地图瓦片（可选）
└── CLAUDE.md            # 本文件
```

---

## 核心模块

### 1. 地图系统 (Leaflet.js)

**文件**: `docs/app.js`

- `initMap()` - 地图初始化
- `addHotelMarkers()` - 酒店标记管理
- `addAttractionMarkers()` - 景点标记管理
- `addAirportMarkers()` - 机场标记管理
- `showDayRoute(day)` - 显示指定天数的路线
- `toggleDayRoute()` - 切换路线显示/隐藏
- `focusLocation(value)` - 快速定位功能

### 2. 数据管理

**文件**: `data/data.js`

所有数据存储在 `tourData` 对象中：

- `hotels` - 酒店信息数组
- `attractions` - 景点信息数组
- `itinerary` - 4天行程安排
- `tips` - 旅游提示
- `emergencyContacts` - 紧急联系方式
- `flights` - 航班信息

### 3. 用户界面

**文件**: `docs/style.css`

- `.sidebar` - 侧边栏样式
- `.panel` - 信息卡片样式
- `.day-item` - 行程列表项样式
- `.btn` - 按钮样式
- 响应式断点：1024px、768px

---

## 地图标记颜色规范

| 类型 | 颜色 | 说明 |
|------|------|------|
| 第 1 天景点 | `#1E88E5` | 蓝色 |
| 第 2 天景点 | `#43A047` | 绿色 |
| 第 3 天景点 | `#FB8C00` | 橙色 |
| 第 4 天景点 | `#8E24AA` | 紫色 |
| 酒店 | `#E53935` | 红色 |
| 机场 | `#424242` | 深灰色 |

路线颜色与对应天数的标记颜色一致。

---

## 数据格式规范

### 景点数据

```javascript
{
  id: 'attr-1',              // 唯一ID
  name: '景点名称',           // 中文名称
  nameEn: 'Attraction Name', // 英文名称
  lat: 10.7740,              // 纬度
  lng: 106.6900,             // 经度
  day: 1,                    // 第几天（1-4）
  order: 1,                  // 当天顺序
  openingHours: '8:00-17:00' // 开放时间
}
```

### 行程数据

```javascript
{
  day: 1,                          // 第几天
  date: '2026年1月23日',           // 日期
  title: '抵达胡志明市',           // 标题
  activities: [...],               // 活动列表
  attractionIds: ['attr-1', ...]   // 景点ID列表
}
```

---

## 常见修改

### 添加新景点

1. 在 `data/data.js` 的 `tourData.attractions` 数组中添加对象
2. 将景点 ID 添加到对应天数的 `attractionIds` 数组中
3. 更新 `DATA_VERSION` 和 `DATA_LAST_UPDATED`

### 修改航班信息

编辑 `data/data.js` 中的 `tourData.flights` 对象

### 更新数据版本

```javascript
const DATA_VERSION = 'x.x.x';           // 修改版本号
const DATA_LAST_UPDATED = 'YYYY-MM-DD'; // 修改日期
```

---

## 技术栈

- **HTML5** - 页面结构
- **CSS3** - 样式和响应式设计
- **JavaScript (ES6+)** - 应用逻辑
- **Leaflet.js 1.9.4** - 地图库
- **OpenStreetMap** - 地图数据

所有依赖通过 CDN 加载，无需 npm 安装。

---

## 注意事项

- 文件编码：UTF-8
- 坐标格式：十进制度数 (WGS84)
- 修改数据后需刷新浏览器
- 地图需要互联网连接（除非使用离线瓦片）

---

**文档更新**: 2026-01-27
**项目状态**: 已归档
