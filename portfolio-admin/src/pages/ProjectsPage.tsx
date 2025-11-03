import { useState, useEffect } from 'react'
import { Plus, Pencil, Trash2, Star, Briefcase } from 'lucide-react'
import { callEdgeFunction, type Project } from '../lib/supabase'
import { Button } from '../components/ui/button'
import { Card } from '../components/ui/card'
import { ProjectForm } from '../components/ProjectForm'

export function ProjectsPage() {
  const [projects, setProjects] = useState<Project[]>([])
  const [loading, setLoading] = useState(true)
  const [formOpen, setFormOpen] = useState(false)
  const [editingProject, setEditingProject] = useState<Project | undefined>()

  useEffect(() => {
    loadProjects()
  }, [])

  async function loadProjects() {
    try {
      setLoading(true)
      const response = await callEdgeFunction('projects-api')

      console.log('🔍 API Response:', response)
      console.log('🔍 Response.data:', response.data)

      const projectsData = response.data || []
      console.log('🔍 Projects to set:', projectsData)
      console.log('🔍 Projects length:', projectsData.length)

      setProjects(projectsData)
    } catch (error) {
      console.error('❌ 加载作品失败:', error)
    } finally {
      setLoading(false)
    }
  }

  async function deleteProject(id: string, title: string) {
    if (!confirm(`确定要删除作品"${title}"吗？`)) {
      return
    }

    try {
      await callEdgeFunction(`projects-api/${id}`, {
        method: 'DELETE'
      })

      await loadProjects()
    } catch (error) {
      console.error('删除作品失败:', error)
      alert('删除作品失败')
    }
  }

  function handleAddProject() {
    setEditingProject(undefined)
    setFormOpen(true)
  }

  function handleEditProject(project: Project) {
    setEditingProject(project)
    setFormOpen(true)
  }

  function handleFormSuccess() {
    loadProjects()
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-stone-500">加载中...</div>
      </div>
    )
  }

  return (
    <div>
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h2 className="text-3xl font-serif text-stone-900">作品管理</h2>
          <p className="mt-1 text-sm text-stone-500">管理你的设计作品集</p>
        </div>
        <Button className="gap-2" onClick={handleAddProject}>
          <Plus size={18} />
          添加作品
        </Button>
      </div>

      {/* Projects Grid */}
      {projects.length === 0 ? (
        <Card className="p-12 text-center">
          <div className="text-stone-400 mb-4">
            <Briefcase size={48} className="mx-auto" />
          </div>
          <h3 className="text-lg font-medium text-stone-900 mb-2">还没有作品</h3>
          <p className="text-stone-500 mb-6">开始添加你的第一个设计项目</p>
          <Button className="gap-2" onClick={handleAddProject}>
            <Plus size={18} />
            添加作品
          </Button>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {projects.map((project) => (
            <Card key={project.id} className="overflow-hidden group">
              {/* Image */}
              <div className="aspect-[4/3] overflow-hidden bg-stone-100">
                <img
                  src={project.image_url}
                  alt={project.title}
                  className="w-full h-full object-cover transition-transform group-hover:scale-105"
                  onError={(e) => {
                    e.currentTarget.src = 'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" width="400" height="300"%3E%3Crect fill="%23f5f5f4" width="400" height="300"/%3E%3Ctext x="50%25" y="50%25" dominant-baseline="middle" text-anchor="middle" fill="%23a8a29e" font-family="Arial" font-size="14"%3E图片加载失败%3C/text%3E%3C/svg%3E'
                  }}
                />
              </div>

              {/* Content */}
              <div className="p-4">
                <div className="flex items-start justify-between mb-2">
                  <h3 className="font-serif text-lg text-stone-900 flex-1">
                    {project.title}
                  </h3>
                  {project.featured && (
                    <Star size={16} className="text-amber-500 fill-amber-500 flex-shrink-0 ml-2" />
                  )}
                </div>

                <p className="text-sm text-stone-600 mb-3 line-clamp-2">
                  {project.description}
                </p>

                {/* Tags */}
                {project.tags && project.tags.length > 0 && (
                  <div className="flex flex-wrap gap-1.5 mb-4">
                    {project.tags.map((tag, index) => (
                      <span
                        key={index}
                        className="px-2 py-0.5 text-xs bg-stone-100 text-stone-600 rounded"
                      >
                        {tag}
                      </span>
                    ))}
                  </div>
                )}

                {/* Actions */}
                <div className="flex gap-2 pt-3 border-t border-stone-100">
                  <Button
                    variant="outline"
                    size="sm"
                    className="flex-1 gap-1.5"
                    onClick={() => handleEditProject(project)}
                  >
                    <Pencil size={14} />
                    编辑
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    className="gap-1.5 text-red-600 hover:text-red-700 hover:bg-red-50"
                    onClick={() => deleteProject(project.id, project.title)}
                  >
                    <Trash2 size={14} />
                    删除
                  </Button>
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}

      {/* Project Form Dialog */}
      <ProjectForm
        open={formOpen}
        onOpenChange={setFormOpen}
        project={editingProject}
        onSuccess={handleFormSuccess}
      />
    </div>
  )
}
