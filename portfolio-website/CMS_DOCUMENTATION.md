# 作品集内容管理系统 - 完整文档

## 项目概述

为极简主义作品集网站添加了完整的后端管理功能，实现了作品和简历内容的动态管理。

**部署地址：**
- 前端网站：https://2dgyckp48ynq.space.minimaxi.com
- 管理后台：https://2dgyckp48ynq.space.minimaxi.com/admin.html

---

## 系统架构

### 技术栈
- **前端**：原生HTML + CSS + JavaScript
- **后端**：Supabase（数据库 + Edge Functions + 存储）
- **设计风格**：Editorial极简风格（保持与原网站一致）

### 数据库表结构

#### 1. projects（作品表）
```sql
- id: UUID（主键）
- title: VARCHAR(255) - 项目标题
- description: TEXT - 项目描述
- image_url: TEXT - 项目图片URL
- tags: TEXT[] - 项目标签数组
- category: VARCHAR(100) - 项目分类
- featured: BOOLEAN - 是否精选项目
- display_order: INTEGER - 显示顺序
- created_at: TIMESTAMPTZ - 创建时间
- updated_at: TIMESTAMPTZ - 更新时间
```

#### 2. resume_sections（简历表）
```sql
- id: UUID（主键）
- section_type: VARCHAR(50) - 区域类型（hero, about, skills, contact）
- title: VARCHAR(255) - 区域标题
- content: TEXT - 区域内容
- metadata: JSONB - 额外数据
- display_order: INTEGER - 显示顺序
- created_at: TIMESTAMPTZ - 创建时间
- updated_at: TIMESTAMPTZ - 更新时间
```

### 存储桶
- **portfolio-images**：用于存储作品图片
  - 大小限制：10MB
  - 支持格式：jpg, jpeg, png, webp

---

## API接口

所有API接口均通过Supabase Edge Functions实现。

### 1. 作品管理API（projects-api）

**地址：** `https://jcxlgmmudtbizyinqyrq.supabase.co/functions/v1/projects-api`

#### 获取所有作品
```http
GET /projects-api
```

**参数：**
- `category`（可选）：按分类筛选
- `featured=true`（可选）：只获取精选作品

**响应：**
```json
{
  "data": [
    {
      "id": "uuid",
      "title": "作品标题",
      "description": "作品描述",
      "image_url": "images/xxx.jpg",
      "tags": ["标签1", "标签2"],
      "category": "分类",
      "featured": true,
      "display_order": 1,
      "created_at": "2025-11-02T...",
      "updated_at": "2025-11-02T..."
    }
  ]
}
```

#### 获取单个作品
```http
GET /projects-api/{id}
```

#### 创建作品
```http
POST /projects-api
Content-Type: application/json

{
  "title": "作品标题",
  "description": "作品描述",
  "image_url": "images/xxx.jpg",
  "tags": ["标签1", "标签2"],
  "category": "分类",
  "featured": true,
  "display_order": 1
}
```

#### 更新作品
```http
PUT /projects-api/{id}
Content-Type: application/json

{
  "title": "新标题",
  "description": "新描述"
  // 只需提供要更新的字段
}
```

#### 删除作品
```http
DELETE /projects-api/{id}
```

### 2. 简历管理API（resume-api）

**地址：** `https://jcxlgmmudtbizyinqyrq.supabase.co/functions/v1/resume-api`

#### 获取所有简历区域
```http
GET /resume-api
```

**参数：**
- `section_type`（可选）：按类型筛选（hero, about, skills, contact）

#### 更新简历区域
```http
PUT /resume-api/{id}
Content-Type: application/json

{
  "title": "新标题",
  "content": "新内容",
  "metadata": {"key": "value"}
}
```

### 3. 图片上传API（image-upload）

**地址：** `https://jcxlgmmudtbizyinqyrq.supabase.co/functions/v1/image-upload`

```http
POST /image-upload
Content-Type: application/json

{
  "imageData": "data:image/png;base64,iVBORw0KG...",
  "fileName": "my-image.png"
}
```

**响应：**
```json
{
  "data": {
    "url": "https://.../storage/v1/object/public/portfolio-images/timestamp-my-image.png",
    "path": "timestamp-my-image.png",
    "size": 12345,
    "mimeType": "image/png"
  }
}
```

---

## 管理后台使用指南

### 访问管理后台

访问 https://2dgyckp48ynq.space.minimaxi.com/admin.html

### 功能说明

#### 1. 作品管理

**添加新作品：**
1. 点击"添加新作品"按钮
2. 填写表单：
   - 作品标题（必填）
   - 作品描述（必填）
   - 图片URL（必填，格式：images/your-image.jpg）
   - 分类（必填）
   - 标签（在输入框中输入后按回车添加）
   - 是否精选（勾选框）
   - 显示顺序（数字，越小越靠前）
3. 点击"保存"

**编辑作品：**
1. 在作品卡片上点击"编辑"按钮
2. 修改表单内容
3. 点击"保存"

**删除作品：**
1. 在作品卡片上点击"删除"按钮
2. 确认删除操作

**标签管理：**
- 添加标签：在标签输入框中输入内容后按回车键
- 删除标签：点击标签右侧的"×"按钮

#### 2. 简历管理

**编辑简历内容：**
1. 切换到"简历管理"标签页
2. 找到要编辑的区域
3. 点击"编辑"按钮
4. 在弹出的提示框中输入新内容
5. 确认保存

**简历区域类型：**
- **hero**：首屏区域（姓名、职位）
- **about**：关于我区域
- **skills**：核心技能区域
- **contact**：联系方式区域

---

## 前端动态加载

### 工作原理

前端网站（index.html）通过JavaScript自动从Supabase API加载作品数据：

1. 页面加载时，显示"加载作品中..."提示
2. 调用 `projects-api` 获取所有作品
3. 动态生成作品卡片HTML
4. 应用动画效果（淡入、上浮）
5. 隐藏加载提示，显示作品网格

### 代码示例

```javascript
async function loadPortfolioProjects() {
    const { data, error } = await supabaseClient.functions.invoke('projects-api');
    
    if (error) {
        console.error('加载作品失败:', error);
        return;
    }
    
    const projects = data.data || [];
    
    // 渲染作品卡片
    grid.innerHTML = projects.map(project => `
        <article class="portfolio-item">
            <div class="portfolio-image">
                <img src="${project.image_url}" alt="${project.title}">
            </div>
            <div class="portfolio-content">
                <h3 class="portfolio-title">${project.title}</h3>
                <p class="portfolio-description">${project.description}</p>
                <div class="portfolio-tags">
                    ${project.tags.map(tag => `<span class="tag">${tag}</span>`).join('')}
                </div>
            </div>
        </article>
    `).join('');
}
```

---

## 设计规范

### 配色方案
- **主文本色：** #1A1A1A
- **次要文本色：** #4A4A4A
- **辅助文本色：** #6B6B6B
- **主背景色：** #FEFEFE
- **卡片背景：** #F9F9F7
- **分隔线：** #E5E5E0
- **点缀色：** #B8001F（CTA按钮、活跃链接）

### 字体系统
- **标题：** Playfair Display（衬线字体）
- **正文：** Georgia（衬线字体）
- **UI元素：** Inter（无衬线字体）

### 间距系统（8pt网格）
- xs: 8px
- sm: 16px
- md: 24px
- lg: 32px
- xl: 48px
- 2xl: 64px
- 3xl: 96px

---

## 数据初始化

系统已预置以下数据：

### 作品（8个）
1. Loktra 时尚电商APP
2. 电商移动端UI套件
3. 产品详情页优化设计
4. 香氛品牌响应式网站
5. 购物车体验优化
6. 极简主义产品页
7. 运动服饰移动购物车
8. 产品页数据分析仪表板

### 简历区域（4个）
1. Hero区域（李明 - 电商体验设计师）
2. 关于我区域
3. 核心技能区域
4. 联系方式区域

---

## 安全性说明

### RLS策略
所有数据库表都启用了行级安全（RLS）策略：

- **公开读取：** 所有人都可以读取作品和简历内容
- **写入权限：** 允许通过Edge Function（anon和service_role角色）进行插入、更新、删除操作

### 存储安全
- **portfolio-images** 存储桶配置为公开读取
- 上传权限通过Edge Function控制
- 文件大小限制：10MB
- 允许的文件类型：image/jpeg, image/png, image/jpg, image/webp

---

## 常见问题

### Q: 如何上传图片？
A: 目前需要先将图片文件放到服务器的 `images/` 目录，然后在添加作品时填写图片路径（如：images/your-image.jpg）。未来可以集成图片上传功能。

### Q: 作品显示顺序如何控制？
A: 通过 `display_order` 字段控制，数字越小越靠前。相同顺序的作品按创建时间降序排列。

### Q: 如何添加新的简历区域？
A: 可以通过API直接添加，或使用数据库管理工具插入新记录。区域类型可以自定义。

### Q: 前端网站会自动更新吗？
A: 是的，前端网站每次加载时都会从API获取最新数据，管理后台的任何修改都会立即反映到前端。

---

## 技术细节

### Edge Function特点
- **无服务器：** 自动扩展，按需付费
- **CORS支持：** 允许跨域访问
- **类型安全：** 使用TypeScript开发
- **环境变量：** 通过Deno.env访问敏感信息

### 数据库查询优化
- 使用索引优化排序查询（display_order, created_at）
- 使用JSONB类型存储灵活的元数据
- 数组类型（TEXT[]）存储标签

---

## 后续优化建议

1. **图片上传功能：** 在管理后台集成图片上传UI，直接上传到存储桶
2. **富文本编辑器：** 为简历内容添加富文本编辑器（如Quill.js）
3. **拖拽排序：** 实现作品的拖拽排序功能
4. **批量操作：** 支持批量删除、批量修改分类等
5. **数据统计：** 添加作品访问统计、分类统计等
6. **权限管理：** 添加管理员登录和权限控制

---

## 联系方式

如有问题或建议，请联系开发者。

**项目完成时间：** 2025-11-02
**作者：** MiniMax Agent
