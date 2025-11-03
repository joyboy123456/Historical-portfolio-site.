# 阿里云 Supabase 迁移指南

## ✅ 已完成的工作

### 1. 更新配置文件 ✅
所有前端和管理后台的 Supabase 配置已更新为阿里云实例：

**已更新的文件**：
- ✅ `portfolio-admin/src/lib/supabase.ts` - React 管理后台
- ✅ `portfolio-website/js/main.js` - 前端网站
- ✅ `portfolio-website/js/admin.js` - 原生管理后台

**新配置信息**：
```
URL: https://sbp-wr4ou14e0jdmzgzw.supabase.opentrust.net
Anon Key: eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9...
```

---

## 🔧 需要手动完成的步骤

### 步骤 1️⃣：创建数据库表

登录阿里云 Supabase 控制台，在 **SQL Editor** 中按顺序执行以下脚本：

#### A. 创建 projects 表
```sql
CREATE TABLE projects (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    title VARCHAR(255) NOT NULL,
    description TEXT,
    image_url TEXT,
    tags TEXT[],
    category VARCHAR(100),
    featured BOOLEAN DEFAULT false,
    display_order INTEGER DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);
```

#### B. 创建 resume_sections 表
```sql
CREATE TABLE resume_sections (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    section_type VARCHAR(50) NOT NULL,
    title VARCHAR(255),
    content TEXT,
    metadata JSONB,
    display_order INTEGER DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);
```

#### C. 运行优化脚本
复制 `supabase/tables/migrations.sql` 的全部内容到 SQL Editor 并执行。

这会添加：
- ✅ 索引（提升查询性能）
- ✅ 自动更新 `updated_at` 触发器
- ✅ RLS 安全策略
- ✅ 字段约束

---

### 步骤 2️⃣：创建存储桶（Storage）

在 Supabase 控制台的 **Storage** 部分：

1. 创建新存储桶：
   - 名称：`portfolio-images`
   - 公开访问：✅ 启用（Public bucket）

2. 设置存储桶策略（Policies）：
   ```sql
   -- 允许所有人读取
   CREATE POLICY "Allow public read access"
   ON storage.objects FOR SELECT
   USING (bucket_id = 'portfolio-images');

   -- 允许认证用户上传
   CREATE POLICY "Allow authenticated upload"
   ON storage.objects FOR INSERT
   WITH CHECK (bucket_id = 'portfolio-images' AND auth.role() = 'authenticated');
   ```

---

### 步骤 3️⃣：部署 Edge Functions

#### 方法 A：使用 Supabase CLI（推荐）

1. 安装 Supabase CLI
```bash
npm install -g supabase
```

2. 登录到阿里云 Supabase
```bash
supabase login
```

3. 链接到你的项目
```bash
supabase link --project-ref sbp-wr4ou14e0jdmzgzw
```

4. 部署所有 Functions
```bash
cd /Users/wujieai/project/package
supabase functions deploy projects-api
supabase functions deploy resume-api
supabase functions deploy image-upload
```

#### 方法 B：手动部署（如果 CLI 不可用）

在 Supabase 控制台的 **Edge Functions** 部分，手动创建以下三个函数：

1. **projects-api**
   - 复制 `supabase/functions/projects-api/index.ts` 的内容
   - 环境变量：
     - `SUPABASE_SERVICE_ROLE_KEY`: （从控制台获取）
     - `SUPABASE_URL`: `https://sbp-wr4ou14e0jdmzgzw.supabase.opentrust.net`

2. **resume-api**
   - 复制 `supabase/functions/resume-api/index.ts` 的内容
   - 环境变量：同上

3. **image-upload**
   - 复制 `supabase/functions/image-upload/index.ts` 的内容
   - 环境变量：同上

---

### 步骤 4️⃣：测试验证

#### A. 测试 API 连接
```bash
# 测试 projects-api
curl -X GET \
  https://sbp-wr4ou14e0jdmzgzw.supabase.opentrust.net/functions/v1/projects-api \
  -H "Authorization: Bearer eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9..."

# 应该返回：{"data": []}
```

#### B. 测试前端网站
1. 打开 `portfolio-website/index.html`
2. 查看浏览器控制台，确认没有 CORS 错误
3. 作品列表应该正常加载（即使是空的）

#### C. 测试 React 管理后台
1. 访问 http://localhost:5173/
2. 点击"添加作品"，尝试创建一个测试作品
3. 测试图片上传功能

---

## 📋 迁移检查清单

完成后请勾选：

- [ ] ✅ 在 SQL Editor 中创建 `projects` 表
- [ ] ✅ 在 SQL Editor 中创建 `resume_sections` 表
- [ ] ✅ 执行 `migrations.sql` 优化脚本
- [ ] ✅ 创建 `portfolio-images` 存储桶
- [ ] ✅ 配置存储桶为公开访问
- [ ] ✅ 部署 `projects-api` Edge Function
- [ ] ✅ 部署 `resume-api` Edge Function
- [ ] ✅ 部署 `image-upload` Edge Function
- [ ] ✅ 测试前端网站能否加载作品
- [ ] ✅ 测试 React 管理后台能否创建作品
- [ ] ✅ 测试图片上传功能

---

## 🔍 故障排查

### 问题 1：CORS 错误
**症状**：浏览器控制台显示跨域请求被阻止

**解决方案**：
- 确认 Edge Functions 已正确部署
- 检查 CORS 头是否正确配置（代码中已包含）

### 问题 2：图片上传失败
**症状**：上传图片时报错 "Upload failed"

**解决方案**：
- 确认存储桶 `portfolio-images` 已创建
- 确认存储桶策略已正确配置
- 检查图片大小是否超过 10MB

### 问题 3：Edge Functions 无法调用
**症状**：API 请求返回 404

**解决方案**：
- 确认 Functions 已成功部署
- 检查 Function 名称是否正确
- 查看 Function Logs 获取详细错误信息

---

## 🎯 下一步

完成迁移后，你可以：

1. **添加测试数据**
   - 在管理后台创建几个作品
   - 添加简历内容

2. **部署到生产环境**
   - 前端网站部署到阿里云 OSS / CDN
   - 管理后台部署到 Vercel / Netlify

3. **添加身份认证**
   - 保护管理后台访问
   - 使用 Supabase Auth

---

## 📞 需要帮助？

如果遇到问题，请检查：
- Supabase 控制台的 Logs
- 浏览器开发者工具的 Console
- Network 面板查看 API 请求详情

**迁移日期**: 2025-11-02
**迁移者**: Claude AI
