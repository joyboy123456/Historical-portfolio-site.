-- =============================================
-- 数据库迁移脚本
-- 为 projects 和 resume_sections 表添加索引、触发器和 RLS
-- =============================================

-- ============= PROJECTS 表优化 =============

-- 1. 添加索引以提升查询性能
CREATE INDEX IF NOT EXISTS idx_projects_display_order ON projects(display_order);
CREATE INDEX IF NOT EXISTS idx_projects_category ON projects(category);
CREATE INDEX IF NOT EXISTS idx_projects_featured ON projects(featured);
CREATE INDEX IF NOT EXISTS idx_projects_created_at ON projects(created_at DESC);

-- 2. 创建自动更新 updated_at 的函数
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- 3. 为 projects 表添加触发器
DROP TRIGGER IF EXISTS update_projects_updated_at ON projects;
CREATE TRIGGER update_projects_updated_at
    BEFORE UPDATE ON projects
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- 4. 添加字段约束
ALTER TABLE projects
    ALTER COLUMN title SET NOT NULL,
    ADD CONSTRAINT title_length CHECK (char_length(title) > 0 AND char_length(title) <= 255);

-- 5. 启用 RLS (Row Level Security)
ALTER TABLE projects ENABLE ROW LEVEL SECURITY;

-- 6. 创建 RLS 策略 - 允许所有人读取
DROP POLICY IF EXISTS "Allow public read access" ON projects;
CREATE POLICY "Allow public read access" ON projects
    FOR SELECT
    USING (true);

-- 7. 创建 RLS 策略 - 允许认证用户完全访问
DROP POLICY IF EXISTS "Allow authenticated users full access" ON projects;
CREATE POLICY "Allow authenticated users full access" ON projects
    FOR ALL
    USING (auth.role() = 'authenticated')
    WITH CHECK (auth.role() = 'authenticated');

-- ============= RESUME_SECTIONS 表优化 =============

-- 1. 添加索引以提升查询性能
CREATE INDEX IF NOT EXISTS idx_resume_sections_section_type ON resume_sections(section_type);
CREATE INDEX IF NOT EXISTS idx_resume_sections_display_order ON resume_sections(display_order);
CREATE INDEX IF NOT EXISTS idx_resume_sections_created_at ON resume_sections(created_at DESC);

-- 2. 为 resume_sections 表添加触发器
DROP TRIGGER IF EXISTS update_resume_sections_updated_at ON resume_sections;
CREATE TRIGGER update_resume_sections_updated_at
    BEFORE UPDATE ON resume_sections
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- 3. 添加字段约束和枚举
ALTER TABLE resume_sections
    ALTER COLUMN section_type SET NOT NULL,
    ALTER COLUMN title SET NOT NULL,
    ADD CONSTRAINT title_not_empty CHECK (char_length(title) > 0 AND char_length(title) <= 255);

-- 4. 添加 section_type 的检查约束（可选，根据需求调整）
ALTER TABLE resume_sections
    DROP CONSTRAINT IF EXISTS valid_section_type;

ALTER TABLE resume_sections
    ADD CONSTRAINT valid_section_type
    CHECK (section_type IN ('hero', 'about', 'skills', 'experience', 'education', 'contact', 'other'));

-- 5. 启用 RLS
ALTER TABLE resume_sections ENABLE ROW LEVEL SECURITY;

-- 6. 创建 RLS 策略 - 允许所有人读取
DROP POLICY IF EXISTS "Allow public read access" ON resume_sections;
CREATE POLICY "Allow public read access" ON resume_sections
    FOR SELECT
    USING (true);

-- 7. 创建 RLS 策略 - 允许认证用户完全访问
DROP POLICY IF EXISTS "Allow authenticated users full access" ON resume_sections;
CREATE POLICY "Allow authenticated users full access" ON resume_sections
    FOR ALL
    USING (auth.role() = 'authenticated')
    WITH CHECK (auth.role() = 'authenticated');

-- ============= 验证和性能优化 =============

-- 分析表以更新统计信息
ANALYZE projects;
ANALYZE resume_sections;

-- 输出完成信息
DO $$
BEGIN
    RAISE NOTICE '✅ 数据库迁移完成！';
    RAISE NOTICE '已添加:';
    RAISE NOTICE '  - 索引: display_order, category, featured, section_type, created_at';
    RAISE NOTICE '  - 触发器: 自动更新 updated_at 字段';
    RAISE NOTICE '  - RLS 策略: 公开读取，认证用户完全访问';
    RAISE NOTICE '  - 字段约束: 标题长度限制，section_type 枚举';
END $$;
