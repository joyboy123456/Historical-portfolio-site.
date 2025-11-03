// 官方 Supabase 配置
const supabaseUrl = "https://jcxlgmmudtbizyinqyrq.supabase.co";
const supabaseAnonKey = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImpjeGxnbW11ZHRiaXp5aW5xeXJxIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjE2MTc3MzksImV4cCI6MjA3NzE5MzczOX0.SYmaIOEVhS5P-wJmlUoP_mhOlrhVQo7OaEZYbDGKuVg";

const { createClient } = supabase;
const supabaseClient = createClient(supabaseUrl, supabaseAnonKey);

// 全局变量
let currentTags = [];
let currentEditingProject = null;

// 页面加载
document.addEventListener('DOMContentLoaded', function() {
    // 标签页切换
    const tabs = document.querySelectorAll('.admin-tab');
    tabs.forEach(tab => {
        tab.addEventListener('click', function() {
            const tabName = this.getAttribute('data-tab');
            switchTab(tabName);
        });
    });

    // 标签输入
    const tagInput = document.getElementById('tagInput');
    if (tagInput) {
        tagInput.addEventListener('keypress', function(e) {
            if (e.key === 'Enter') {
                e.preventDefault();
                addTag(this.value.trim());
                this.value = '';
            }
        });
    }

    // 表单提交
    const projectForm = document.getElementById('projectForm');
    if (projectForm) {
        projectForm.addEventListener('submit', handleProjectSubmit);
    }

    // 加载数据
    loadProjects();
    loadResumeSections();
});

function switchTab(tabName) {
    // 切换标签页样式
    document.querySelectorAll('.admin-tab').forEach(tab => {
        tab.classList.remove('active');
    });
    document.querySelector(`[data-tab="${tabName}"]`).classList.add('active');

    // 切换内容
    document.querySelectorAll('.tab-content').forEach(content => {
        content.classList.remove('active');
    });
    document.getElementById(`tab-${tabName}`).classList.add('active');
}

// ==================== 作品管理 ====================

async function loadProjects() {
    const loading = document.getElementById('projects-loading');
    const grid = document.getElementById('projects-grid');
    const empty = document.getElementById('projects-empty');

    loading.style.display = 'block';
    grid.style.display = 'none';
    empty.style.display = 'none';

    try {
        const { data, error } = await supabaseClient.functions.invoke('projects-api');

        if (error) throw error;

        const projects = data.data;

        if (!projects || projects.length === 0) {
            empty.style.display = 'block';
            loading.style.display = 'none';
            return;
        }

        grid.innerHTML = projects.map(project => `
            <div class="project-card-admin">
                <img src="${project.image_url}" alt="${project.title}" class="project-image-admin" onerror="this.src='data:image/svg+xml,%3Csvg xmlns=\\'http://www.w3.org/2000/svg\\' width=\\'400\\' height=\\'300\\'%3E%3Crect fill=\\'%23f0f0f0\\' width=\\'400\\' height=\\'300\\'/%3E%3Ctext x=\\'50%25\\' y=\\'50%25\\' dominant-baseline=\\'middle\\' text-anchor=\\'middle\\' fill=\\'%23999\\' font-family=\\'Arial\\' font-size=\\'18\\'%3E图片加载失败%3C/text%3E%3C/svg%3E'">
                <h3 class="project-title-admin">${project.title}</h3>
                <p style="font-size: 14px; color: #4A4A4A; margin-bottom: 12px;">${project.description.substring(0, 100)}...</p>
                <div style="display: flex; flex-wrap: wrap; gap: 6px; margin-bottom: 12px;">
                    ${project.tags.map(tag => `<span class="tag">${tag}</span>`).join('')}
                </div>
                <div class="project-actions">
                    <button class="btn btn-small btn-primary" onclick='editProject(${JSON.stringify(project)})'>编辑</button>
                    <button class="btn btn-small btn-danger" onclick="deleteProject('${project.id}', '${project.title}')">删除</button>
                </div>
            </div>
        `).join('');

        grid.style.display = 'grid';
        loading.style.display = 'none';

    } catch (error) {
        console.error('加载作品失败:', error);
        alert('加载作品失败: ' + error.message);
        loading.style.display = 'none';
    }
}

function openProjectModal(project = null) {
    const modal = document.getElementById('projectModal');
    const title = document.getElementById('projectModalTitle');
    const form = document.getElementById('projectForm');

    if (project) {
        title.textContent = '编辑作品';
        currentEditingProject = project;
        
        document.getElementById('projectId').value = project.id;
        document.getElementById('projectTitle').value = project.title;
        document.getElementById('projectDescription').value = project.description;
        document.getElementById('projectImageUrl').value = project.image_url;
        document.getElementById('projectCategory').value = project.category;
        document.getElementById('projectFeatured').checked = project.featured;
        document.getElementById('projectOrder').value = project.display_order;
        
        currentTags = [...project.tags];
        renderTags();
    } else {
        title.textContent = '添加作品';
        currentEditingProject = null;
        form.reset();
        currentTags = [];
        renderTags();
    }

    modal.classList.add('active');
}

function closeProjectModal() {
    const modal = document.getElementById('projectModal');
    modal.classList.remove('active');
    currentEditingProject = null;
    currentTags = [];
}

function editProject(project) {
    openProjectModal(project);
}

async function deleteProject(id, title) {
    if (!confirm(`确定要删除作品"${title}"吗？`)) {
        return;
    }

    try {
        const { error } = await supabaseClient.functions.invoke(`projects-api/${id}`, {
            method: 'DELETE'
        });

        if (error) throw error;

        alert('作品删除成功');
        loadProjects();

    } catch (error) {
        console.error('删除作品失败:', error);
        alert('删除作品失败: ' + error.message);
    }
}

async function handleProjectSubmit(e) {
    e.preventDefault();

    const projectId = document.getElementById('projectId').value;
    const projectData = {
        title: document.getElementById('projectTitle').value,
        description: document.getElementById('projectDescription').value,
        image_url: document.getElementById('projectImageUrl').value,
        category: document.getElementById('projectCategory').value,
        tags: currentTags,
        featured: document.getElementById('projectFeatured').checked,
        display_order: parseInt(document.getElementById('projectOrder').value)
    };

    try {
        let result;
        if (projectId) {
            // 更新
            result = await supabaseClient.functions.invoke(`projects-api/${projectId}`, {
                method: 'PUT',
                body: projectData
            });
        } else {
            // 创建
            result = await supabaseClient.functions.invoke('projects-api', {
                method: 'POST',
                body: projectData
            });
        }

        if (result.error) throw result.error;

        alert(projectId ? '作品更新成功' : '作品创建成功');
        closeProjectModal();
        loadProjects();

    } catch (error) {
        console.error('保存作品失败:', error);
        alert('保存作品失败: ' + error.message);
    }
}

function addTag(tag) {
    if (tag && !currentTags.includes(tag)) {
        currentTags.push(tag);
        renderTags();
    }
}

function removeTag(tag) {
    currentTags = currentTags.filter(t => t !== tag);
    renderTags();
}

function renderTags() {
    const container = document.getElementById('tagsContainer');
    const input = document.getElementById('tagInput');
    
    // 清空容器但保留输入框
    const existingInput = input.cloneNode(true);
    container.innerHTML = '';
    
    // 添加标签
    currentTags.forEach(tag => {
        const tagElement = document.createElement('span');
        tagElement.className = 'tag-item';
        tagElement.innerHTML = `
            ${tag}
            <span class="tag-remove" onclick="removeTag('${tag}')">&times;</span>
        `;
        container.appendChild(tagElement);
    });
    
    // 重新添加输入框
    container.appendChild(existingInput);
    
    // 重新绑定事件
    existingInput.addEventListener('keypress', function(e) {
        if (e.key === 'Enter') {
            e.preventDefault();
            addTag(this.value.trim());
            this.value = '';
        }
    });
}

// ==================== 简历管理 ====================

async function loadResumeSections() {
    const loading = document.getElementById('resume-loading');
    const container = document.getElementById('resume-sections');

    loading.style.display = 'block';
    container.style.display = 'none';

    try {
        const { data, error } = await supabaseClient.functions.invoke('resume-api');

        if (error) throw error;

        const sections = data.data;

        if (!sections || sections.length === 0) {
            container.innerHTML = '<div class="empty-state"><p class="empty-state-text">还没有简历内容</p></div>';
            container.style.display = 'block';
            loading.style.display = 'none';
            return;
        }

        container.innerHTML = sections.map(section => `
            <div style="background: #F9F9F7; border: 1px solid #E5E5E0; border-radius: 8px; padding: 24px; margin-bottom: 24px;">
                <div style="display: flex; justify-content: space-between; align-items: start; margin-bottom: 16px;">
                    <div>
                        <h3 style="font-family: 'Playfair Display', serif; font-size: 24px; color: #1A1A1A; margin-bottom: 8px;">
                            ${section.title}
                        </h3>
                        <span style="font-family: 'Inter', sans-serif; font-size: 14px; color: #6B6B6B; text-transform: uppercase;">
                            ${section.section_type}
                        </span>
                    </div>
                    <button class="btn btn-small btn-primary" onclick='editResumeSection(${JSON.stringify(section)})'>编辑</button>
                </div>
                <p style="font-family: Georgia, serif; font-size: 16px; color: #4A4A4A; line-height: 1.6; white-space: pre-wrap;">
                    ${section.content}
                </p>
                ${section.metadata && Object.keys(section.metadata).length > 0 ? `
                    <details style="margin-top: 16px;">
                        <summary style="cursor: pointer; font-family: Inter, sans-serif; font-size: 14px; color: #4A4A4A;">查看元数据</summary>
                        <pre style="margin-top: 8px; padding: 12px; background: white; border-radius: 4px; overflow-x: auto; font-size: 12px;">${JSON.stringify(section.metadata, null, 2)}</pre>
                    </details>
                ` : ''}
            </div>
        `).join('');

        container.style.display = 'block';
        loading.style.display = 'none';

    } catch (error) {
        console.error('加载简历失败:', error);
        alert('加载简历失败: ' + error.message);
        loading.style.display = 'none';
    }
}

function editResumeSection(section) {
    const newContent = prompt('编辑内容:', section.content);
    if (newContent === null) return;

    updateResumeSection(section.id, { content: newContent });
}

async function updateResumeSection(id, updates) {
    try {
        const { error } = await supabaseClient.functions.invoke(`resume-api/${id}`, {
            method: 'PUT',
            body: updates
        });

        if (error) throw error;

        alert('简历内容更新成功');
        loadResumeSections();

    } catch (error) {
        console.error('更新简历失败:', error);
        alert('更新简历失败: ' + error.message);
    }
}
