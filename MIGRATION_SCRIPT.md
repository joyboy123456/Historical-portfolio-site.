# 简历数据迁移脚本

## 使用方法

1. 在浏览器中打开管理后台：http://localhost:5173
2. 按 F12 打开开发者工具
3. 切换到 Console（控制台）标签
4. 复制下面的脚本，粘贴到控制台，按回车执行

## 迁移脚本

```javascript
// 简历数据迁移脚本
(async function() {
    console.log('🚀 开始迁移简历数据...');
    
    const { createClient } = supabase;
    const db = createClient(
        "https://jcxlgmmudtbizyinqyrq.supabase.co",
        "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImpjeGxnbW11ZHRiaXp5aW5xeXJxIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjE2MTc3MzksImV4cCI6MjA3NzE5MzczOX0.SYmaIOEVhS5P-wJmlUoP_mhOlrhVQo7OaEZYbDGKuVg"
    );
    
    // 步骤 1: 查看现有数据
    console.log('📋 步骤 1: 查看现有数据...');
    const { data: oldData } = await db.from('resume_sections').select('*');
    console.log(`找到 ${oldData?.length || 0} 条旧数据:`, oldData);
    
    // 步骤 2: 删除旧数据
    if (confirm('确定要删除所有旧数据吗？\n\n这将删除 ' + (oldData?.length || 0) + ' 条记录。')) {
        console.log('🗑️ 步骤 2: 删除旧数据...');
        await db.from('resume_sections').delete().neq('id', '00000000-0000-0000-0000-000000000000');
        console.log('✅ 旧数据已删除');
    } else {
        console.log('❌ 取消迁移');
        return;
    }
    
    // 步骤 3: 创建新数据
    console.log('📝 步骤 3: 创建新格式数据...');
    
    const newData = [
        {
            section_type: 'profile',
            title: '个人信息',
            content: '{"name":"贝贝","title":"电商设计师"}',
            metadata: {
                name: '贝贝',
                title: '电商设计师',
                avatar_url: '',
                bio: '从传统家纺行业起步，深度参与电商数字化转型浪潮。多年实战经验涵盖品牌视觉构建、产品包装设计、电商全链路视觉营销，擅长将产品特性转化为打动消费者的视觉语言。',
                location: '杭州',
                email: 'boyj31639@gmail.com',
                phone: '+86 138 0000 0000',
                website: 'https://yourwebsite.com'
            },
            display_order: 1
        },
        {
            section_type: 'work_experience',
            title: '工作经历',
            content: '{"experiences":[]}',
            metadata: {
                experiences: [{
                    company: 'ABC电商公司',
                    position: '高级电商设计师',
                    start_date: '2020-01',
                    end_date: '',
                    current: true,
                    description: '负责电商平台视觉设计，包括产品详情页、活动页面、品牌视觉等。提升转化率20%，完成多个爆款产品的视觉设计。'
                }]
            },
            display_order: 2
        },
        {
            section_type: 'education',
            title: '教育背景',
            content: '{"education":[]}',
            metadata: {
                education: [{
                    school: '某某大学',
                    degree: '本科',
                    major: '视觉传达设计',
                    start_date: '2015-09',
                    end_date: '2019-06',
                    current: false,
                    gpa: '3.8/4.0',
                    description: '主修平面设计、品牌设计、数字媒体设计等课程'
                }]
            },
            display_order: 3
        },
        {
            section_type: 'tech_stack',
            title: '技术栈',
            content: '{"stacks":[]}',
            metadata: {
                stacks: [
                    {
                        category: '设计工具',
                        technologies: [
                            { name: 'Figma', level: 'expert' },
                            { name: 'Sketch', level: 'advanced' },
                            { name: 'Adobe Creative Suite', level: 'expert' }
                        ]
                    },
                    {
                        category: '原型工具',
                        technologies: [
                            { name: '墨刀', level: 'advanced' },
                            { name: 'Axure', level: 'intermediate' }
                        ]
                    }
                ]
            },
            display_order: 4
        },
        {
            section_type: 'skills',
            title: '专业技能',
            content: '{"skills":[]}',
            metadata: {
                skills: [
                    { name: '用户界面设计', description: '精通电商UI设计，擅长提升用户体验和转化率' },
                    { name: '用户体验设计', description: '深入理解用户行为，优化购物流程' },
                    { name: '电商设计', description: '熟悉电商全链路设计，包括详情页、活动页等' },
                    { name: '设计系统', description: '建立和维护设计规范，提升团队效率' },
                    { name: '品牌设计', description: '品牌视觉识别系统设计与应用' }
                ]
            },
            display_order: 5
        }
    ];
    
    const { data: created, error } = await db.from('resume_sections').insert(newData).select();
    
    if (error) {
        console.error('❌ 创建失败:', error);
    } else {
        console.log('✅ 成功创建 ' + created.length + ' 个简历板块！');
        console.log('创建的数据:', created);
        console.log('🎉 迁移完成！刷新页面查看新数据。');
        
        // 自动刷新页面
        setTimeout(() => {
            window.location.reload();
        }, 2000);
    }
})();
```

## 说明

执行后会：
1. 显示当前所有数据
2. 询问是否删除（需要确认）
3. 创建5个新格式的简历板块
4. 自动刷新页面

新创建的板块包括：
- ✅ 个人信息（头像、姓名、联系方式）
- ✅ 工作经历
- ✅ 教育背景
- ✅ 技术栈
- ✅ 专业技能

所有数据都可以在管理后台中独立编辑。
