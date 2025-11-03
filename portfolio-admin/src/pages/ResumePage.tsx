import { useState, useEffect } from 'react'
import { Plus, Pencil } from 'lucide-react'
import { supabase, type ResumeSection } from '../lib/supabase'
import { Button } from '../components/ui/button'
import { Card } from '../components/ui/card'
import { ResumeForm } from '../components/ResumeForm'

export function ResumePage() {
  const [sections, setSections] = useState<ResumeSection[]>([])
  const [loading, setLoading] = useState(true)
  const [formOpen, setFormOpen] = useState(false)
  const [editingSection, setEditingSection] = useState<ResumeSection | undefined>()

  useEffect(() => {
    loadResumeSections()
  }, [])

  async function loadResumeSections() {
    try {
      setLoading(true)
      const response = await supabase.functions.invoke('resume-api')

      if (response.error) throw response.error

      setSections(response.data?.data || [])
    } catch (error) {
      console.error('加载简历失败:', error)
    } finally {
      setLoading(false)
    }
  }

  function handleAddSection() {
    setEditingSection(undefined)
    setFormOpen(true)
  }

  function handleEditSection(section: ResumeSection) {
    setEditingSection(section)
    setFormOpen(true)
  }

  function handleFormSuccess() {
    loadResumeSections()
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
          <h2 className="text-3xl font-serif text-stone-900">简历管理</h2>
          <p className="mt-1 text-sm text-stone-500">编辑你的个人简历内容</p>
        </div>
        <Button className="gap-2" onClick={handleAddSection}>
          <Plus size={18} />
          添加内容
        </Button>
      </div>

      {/* Sections */}
      {sections.length === 0 ? (
        <Card className="p-12 text-center">
          <h3 className="text-lg font-medium text-stone-900 mb-2">还没有简历内容</h3>
          <p className="text-stone-500 mb-6">开始添加你的简历各个部分</p>
          <Button className="gap-2" onClick={handleAddSection}>
            <Plus size={18} />
            添加内容
          </Button>
        </Card>
      ) : (
        <div className="space-y-6">
          {sections.map((section) => (
            <Card key={section.id} className="p-6">
              <div className="flex items-start justify-between mb-4">
                <div>
                  <h3 className="text-2xl font-serif text-stone-900 mb-1">
                    {section.title}
                  </h3>
                  <span className="inline-block px-2 py-1 text-xs font-medium bg-stone-100 text-stone-600 rounded uppercase">
                    {section.section_type}
                  </span>
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  className="gap-1.5"
                  onClick={() => handleEditSection(section)}
                >
                  <Pencil size={14} />
                  编辑
                </Button>
              </div>

              <div className="prose prose-stone max-w-none">
                <p className="text-stone-700 whitespace-pre-wrap leading-relaxed">
                  {section.content}
                </p>
              </div>

              {section.metadata && Object.keys(section.metadata).length > 0 && (
                <details className="mt-4">
                  <summary className="cursor-pointer text-sm text-stone-500 hover:text-stone-700">
                    查看元数据
                  </summary>
                  <pre className="mt-2 p-3 bg-stone-50 rounded text-xs overflow-x-auto">
                    {JSON.stringify(section.metadata, null, 2)}
                  </pre>
                </details>
              )}
            </Card>
          ))}
        </div>
      )}

      {/* Resume Form Dialog */}
      <ResumeForm
        open={formOpen}
        onOpenChange={setFormOpen}
        section={editingSection}
        onSuccess={handleFormSuccess}
      />
    </div>
  )
}
