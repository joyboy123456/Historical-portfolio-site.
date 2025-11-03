# 作品集内容管理系统

## 项目简介

为极简主义作品集网站添加了完整的后端管理功能，实现作品和简历的增删改查（CRUD）操作。

## 快速访问

- **前端网站：** https://2dgyckp48ynq.space.minimaxi.com
- **管理后台：** https://2dgyckp48ynq.space.minimaxi.com/admin.html
- **完整文档：** [CMS_DOCUMENTATION.md](./CMS_DOCUMENTATION.md)

## 核心功能

### 后端系统
- **数据库：** Supabase PostgreSQL
  - projects 表（作品管理）
  - resume_sections 表（简历管理）
- **Edge Functions：** 
  - projects-api（作品CRUD）
  - resume-api（简历CRUD）
  - image-upload（图片上传）
- **存储：** portfolio-images 存储桶（10MB限制）

### 管理后台
- ✅ 作品管理（列表、添加、编辑、删除）
- ✅ 简历管理（查看、编辑）
- ✅ 标签管理（添加、删除）
- ✅ 图片URL配置
- ✅ 显示顺序控制
- ✅ 精选作品标记

### 前端展示
- ✅ 动态加载作品（从API获取）
- ✅ 响应式设计（桌面/平板/移动）
- ✅ Editorial极简设计风格
- ✅ 流畅的动画效果

## 技术栈

- **前端：** HTML + CSS + JavaScript
- **后端：** Supabase (Edge Functions + PostgreSQL + Storage)
- **设计：** Editorial极简风格

## 使用指南

### 管理作品

1. 访问管理后台：https://2dgyckp48ynq.space.minimaxi.com/admin.html
2. 点击"添加新作品"
3. 填写作品信息（标题、描述、图片URL、标签等）
4. 保存后，前端网站会自动显示

### 编辑简历

1. 切换到"简历管理"标签页
2. 点击要编辑的区域的"编辑"按钮
3. 修改内容并保存

### API调用示例

```javascript
// 获取所有作品
const { data } = await supabase.functions.invoke('projects-api');

// 创建作品
const { data } = await supabase.functions.invoke('projects-api', {
  method: 'POST',
  body: {
    title: '新作品',
    description: '作品描述',
    image_url: 'images/new.jpg',
    tags: ['标签1', '标签2'],
    category: '分类',
    featured: true,
    display_order: 1
  }
});
```

## 项目结构

```
portfolio-website/
├── index.html              # 前端主页
├── admin.html              # 管理后台
├── css/
│   └── styles.css          # 样式文件
├── js/
│   ├── main.js             # 前端主逻辑
│   └── admin.js            # 管理后台逻辑
├── images/                 # 图片资源
└── CMS_DOCUMENTATION.md    # 完整文档

supabase/
└── functions/
    ├── projects-api/       # 作品管理API
    ├── resume-api/         # 简历管理API
    └── image-upload/       # 图片上传API
```

## 数据库表结构

### projects（作品表）
```sql
id              UUID PRIMARY KEY
title           VARCHAR(255)
description     TEXT
image_url       TEXT
tags            TEXT[]
category        VARCHAR(100)
featured        BOOLEAN
display_order   INTEGER
created_at      TIMESTAMPTZ
updated_at      TIMESTAMPTZ
```

### resume_sections（简历表）
```sql
id              UUID PRIMARY KEY
section_type    VARCHAR(50)
title           VARCHAR(255)
content         TEXT
metadata        JSONB
display_order   INTEGER
created_at      TIMESTAMPTZ
updated_at      TIMESTAMPTZ
```

## 初始数据

系统已预置：
- **8个作品项目**（覆盖移动端设计、设计系统、产品设计等）
- **4个简历区域**（Hero、关于、技能、联系）

## 设计规范

- **配色：** 黑白灰 + 红色点缀（#B8001F）
- **字体：** Playfair Display（标题）+ Georgia（正文）+ Inter（UI）
- **间距：** 8pt网格系统
- **圆角：** 4-8px
- **阴影：** 轻微克制

## API端点

- **作品管理：** `https://jcxlgmmudtbizyinqyrq.supabase.co/functions/v1/projects-api`
- **简历管理：** `https://jcxlgmmudtbizyinqyrq.supabase.co/functions/v1/resume-api`
- **图片上传：** `https://jcxlgmmudtbizyinqyrq.supabase.co/functions/v1/image-upload`

## 安全性

- ✅ RLS策略配置（公开读取，限制写入）
- ✅ 存储桶公开读取
- ✅ Edge Function权限控制
- ✅ 文件大小和类型限制

## 后续优化建议

1. 集成图片直接上传UI
2. 添加富文本编辑器
3. 实现拖拽排序
4. 添加管理员认证
5. 数据统计面板

## 完整文档

详细的API文档、使用指南和技术说明请参考：[CMS_DOCUMENTATION.md](./CMS_DOCUMENTATION.md)

---

**开发完成时间：** 2025-11-02  
**作者：** MiniMax Agent
