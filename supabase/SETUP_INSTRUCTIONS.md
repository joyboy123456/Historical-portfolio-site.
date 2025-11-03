# Supabase 项目设置指南

## 📋 完整设置步骤

请按照以下顺序在 Supabase Dashboard 中执行设置：

**项目信息**：
- Project: `jcxlgmmudtbizyinqyrq`
- URL: `https://jcxlgmmudtbizyinqyrq.supabase.co`

---

## 步骤 1️⃣：创建数据库表

### A. 创建 projects 表

在 **SQL Editor** 中执行：

```sql
-- 创建作品表
CREATE TABLE IF NOT EXISTS projects (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    title VARCHAR(255) NOT NULL,
    description TEXT,
    image_url TEXT,
    tags TEXT[] DEFAULT '{}',
    category VARCHAR(100),
    featured BOOLEAN DEFAULT false,
    display_order INTEGER DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 添加约束
ALTER TABLE projects
    ADD CONSTRAINT title_length CHECK (char_length(title) > 0 AND char_length(title) <= 255);

-- 添加索引
CREATE INDEX IF NOT EXISTS idx_projects_display_order ON projects(display_order);
CREATE INDEX IF NOT EXISTS idx_projects_category ON projects(category);
CREATE INDEX IF NOT EXISTS idx_projects_featured ON projects(featured);
CREATE INDEX IF NOT EXISTS idx_projects_created_at ON projects(created_at DESC);

-- 添加注释
COMMENT ON TABLE projects IS '设计作品表';
COMMENT ON COLUMN projects.title IS '作品标题';
COMMENT ON COLUMN projects.description IS '作品描述';
COMMENT ON COLUMN projects.image_url IS '作品图片URL';
COMMENT ON COLUMN projects.tags IS '作品标签数组';
COMMENT ON COLUMN projects.category IS '作品分类';
COMMENT ON COLUMN projects.featured IS '是否为精选作品';
COMMENT ON COLUMN projects.display_order IS '显示顺序（越小越靠前）';
```

---

### B. 创建 resume_sections 表

```sql
-- 创建简历部分表
CREATE TABLE IF NOT EXISTS resume_sections (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    section_type VARCHAR(50) NOT NULL,
    title VARCHAR(255) NOT NULL,
    content TEXT,
    metadata JSONB DEFAULT '{}',
    display_order INTEGER DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 添加约束
ALTER TABLE resume_sections
    ADD CONSTRAINT title_not_empty CHECK (char_length(title) > 0 AND char_length(title) <= 255),
    ADD CONSTRAINT valid_section_type CHECK (section_type IN ('hero', 'about', 'skills', 'experience', 'education', 'contact', 'other'));

-- 添加索引
CREATE INDEX IF NOT EXISTS idx_resume_sections_section_type ON resume_sections(section_type);
CREATE INDEX IF NOT EXISTS idx_resume_sections_display_order ON resume_sections(display_order);
CREATE INDEX IF NOT EXISTS idx_resume_sections_created_at ON resume_sections(created_at DESC);

-- 添加注释
COMMENT ON TABLE resume_sections IS '简历内容部分表';
COMMENT ON COLUMN resume_sections.section_type IS '区域类型 (hero/about/skills/experience/education/contact/other)';
COMMENT ON COLUMN resume_sections.title IS '标题';
COMMENT ON COLUMN resume_sections.content IS '内容';
COMMENT ON COLUMN resume_sections.metadata IS '元数据（JSON格式）';
COMMENT ON COLUMN resume_sections.display_order IS '显示顺序';
```

---

### C. 创建自动更新触发器

```sql
-- 创建或替换自动更新 updated_at 的函数
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- 为 projects 表添加触发器
DROP TRIGGER IF EXISTS update_projects_updated_at ON projects;
CREATE TRIGGER update_projects_updated_at
    BEFORE UPDATE ON projects
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- 为 resume_sections 表添加触发器
DROP TRIGGER IF EXISTS update_resume_sections_updated_at ON resume_sections;
CREATE TRIGGER update_resume_sections_updated_at
    BEFORE UPDATE ON resume_sections
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();
```

---

### D. 配置 RLS (Row Level Security)

```sql
-- 启用 RLS
ALTER TABLE projects ENABLE ROW LEVEL SECURITY;
ALTER TABLE resume_sections ENABLE ROW LEVEL SECURITY;

-- Projects 表策略
-- 允许所有人读取
DROP POLICY IF EXISTS "Allow public read access" ON projects;
CREATE POLICY "Allow public read access" ON projects
    FOR SELECT
    USING (true);

-- 允许认证用户完全访问（创建、更新、删除）
DROP POLICY IF EXISTS "Allow authenticated users full access" ON projects;
CREATE POLICY "Allow authenticated users full access" ON projects
    FOR ALL
    USING (auth.role() = 'authenticated')
    WITH CHECK (auth.role() = 'authenticated');

-- Resume Sections 表策略
-- 允许所有人读取
DROP POLICY IF EXISTS "Allow public read access" ON resume_sections;
CREATE POLICY "Allow public read access" ON resume_sections
    FOR SELECT
    USING (true);

-- 允许认证用户完全访问
DROP POLICY IF EXISTS "Allow authenticated users full access" ON resume_sections;
CREATE POLICY "Allow authenticated users full access" ON resume_sections
    FOR ALL
    USING (auth.role() = 'authenticated')
    WITH CHECK (auth.role() = 'authenticated');
```

---

## 步骤 2️⃣：创建存储桶

在 **Storage** 部分：

### A. 创建存储桶
1. 点击 "New bucket"
2. 名称：`portfolio-images`
3. 公开访问：✅ **Public bucket** (启用)
4. 点击 "Create bucket"

### B. 配置存储桶策略

进入 `portfolio-images` 存储桶，在 **Policies** 标签中：

```sql
-- 允许所有人读取图片
CREATE POLICY "Allow public read access"
ON storage.objects FOR SELECT
USING (bucket_id = 'portfolio-images');

-- 允许所有人上传图片（注意：生产环境应该限制为认证用户）
CREATE POLICY "Allow public upload"
ON storage.objects FOR INSERT
WITH CHECK (bucket_id = 'portfolio-images');

-- 如果只想让认证用户上传，使用这个策略：
-- CREATE POLICY "Allow authenticated upload"
-- ON storage.objects FOR INSERT
-- WITH CHECK (bucket_id = 'portfolio-images' AND auth.role() = 'authenticated');
```

---

## 步骤 3️⃣：部署 Edge Functions

### 方法 A：使用 Supabase CLI（推荐）

```bash
# 1. 安装 Supabase CLI（如果还没安装）
npm install -g supabase

# 2. 登录
supabase login

# 3. 链接到你的项目
supabase link --project-ref jcxlgmmudtbizyinqyrq

# 4. 设置环境变量（在 .env 文件中）
echo "SUPABASE_SERVICE_ROLE_KEY=你的Service_Role_Key" > .env

# 5. 部署所有 Functions
cd /Users/wujieai/project/package
supabase functions deploy projects-api
supabase functions deploy resume-api
supabase functions deploy image-upload

# 6. 验证部署
supabase functions list
```

### 方法 B：在 Dashboard 手动部署

如果 CLI 不可用，在 **Edge Functions** 中手动创建：

#### 1. projects-api
- 名称：`projects-api`
- 复制 `supabase/functions/projects-api/index.ts` 的内容
- 环境变量：
  ```
  SUPABASE_SERVICE_ROLE_KEY=<从 Settings > API 获取>
  SUPABASE_URL=https://jcxlgmmudtbizyinqyrq.supabase.co
  ```

#### 2. resume-api
- 名称：`resume-api`
- 复制 `supabase/functions/resume-api/index.ts` 的内容
- 环境变量：同上

#### 3. image-upload
- 名称：`image-upload`
- 复制 `supabase/functions/image-upload/index.ts` 的内容
- 环境变量：同上

---

## 步骤 4️⃣：验证设置

### A. 验证数据库表

在 **SQL Editor** 中运行：

```sql
-- 检查表是否创建成功
SELECT table_name FROM information_schema.tables
WHERE table_schema = 'public'
AND table_name IN ('projects', 'resume_sections');

-- 检查索引
SELECT indexname FROM pg_indexes
WHERE tablename IN ('projects', 'resume_sections');

-- 检查触发器
SELECT trigger_name, event_object_table
FROM information_schema.triggers
WHERE trigger_schema = 'public';

-- 检查 RLS 策略
SELECT schemaname, tablename, policyname
FROM pg_policies
WHERE tablename IN ('projects', 'resume_sections');
```

### B. 验证存储桶

在 **Storage** 中：
- 确认 `portfolio-images` 存储桶存在
- 确认 "Public" 标记已启用
- 确认策略已配置

### C. 验证 Edge Functions

在 **Edge Functions** 中：
- 确认三个 Functions 都已部署
- 点击每个 Function，查看 "Logs" 确认没有错误
- 测试 Function：
  ```bash
  curl -X GET \
    https://jcxlgmmudtbizyinqyrq.supabase.co/functions/v1/projects-api \
    -H "Authorization: Bearer <你的 anon key>"
  ```

---

## 步骤 5️⃣：插入测试数据（可选）

### 测试作品数据

```sql
INSERT INTO projects (title, description, image_url, tags, category, featured, display_order)
VALUES
    ('测试作品 1', '这是第一个测试作品的描述', 'https://picsum.photos/400/300',
     ARRAY['UI设计', '移动端'], 'UI设计', true, 1),
    ('测试作品 2', '这是第二个测试作品的描述', 'https://picsum.photos/400/301',
     ARRAY['品牌设计'], '品牌设计', false, 2);
```

### 测试简历数据

```sql
INSERT INTO resume_sections (section_type, title, content, display_order)
VALUES
    ('hero', '设计师简介', '我是一名专业的UI/UX设计师，专注于创造优雅简洁的用户体验。', 1),
    ('about', '关于我', '拥有5年设计经验，擅长品牌设计、UI设计和交互设计。', 2),
    ('skills', '技能', 'Figma, Sketch, Adobe Creative Suite, Prototyping', 3);
```

---

## 🎯 完成检查清单

设置完成后，请确认：

- [ ] ✅ `projects` 表已创建，包含所有字段和索引
- [ ] ✅ `resume_sections` 表已创建，包含所有字段和索引
- [ ] ✅ 触发器已创建（自动更新 updated_at）
- [ ] ✅ RLS 策略已配置（公开读取，认证用户完全访问）
- [ ] ✅ `portfolio-images` 存储桶已创建并设为公开
- [ ] ✅ 存储桶策略已配置
- [ ] ✅ `projects-api` Edge Function 已部署
- [ ] ✅ `resume-api` Edge Function 已部署
- [ ] ✅ `image-upload` Edge Function 已部署
- [ ] ✅ 测试数据已插入（可选）

---

## 🐛 常见问题

### 问题：RLS 策略导致无法写入
**解决方案**：确认你使用了 `service_role` key（在 Edge Functions 中）或者配置了正确的认证策略。

### 问题：Edge Functions 部署失败
**解决方案**：
1. 检查 Deno 版本是否兼容
2. 确认环境变量已正确设置
3. 查看 Function Logs 获取详细错误

### 问题：图片上传失败
**解决方案**：
1. 确认存储桶是公开的
2. 确认存储桶策略已正确配置
3. 检查图片大小是否超过 10MB

---

**设置完成！** 🎉

现在你可以：
1. 访问 React 管理后台：http://localhost:5173/
2. 打开前端网站：portfolio-website/index.html
3. 开始添加你的作品和简历内容

如果遇到问题，请查看 Supabase Dashboard 的 Logs 部分。
