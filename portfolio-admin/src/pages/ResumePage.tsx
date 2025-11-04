import { useState, useEffect } from 'react'
import { Plus, Pencil, User, Briefcase, GraduationCap, Code, Award, Trash2 } from 'lucide-react'
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
      const { data, error } = await supabase
        .from('resume_sections')
        .select('*')
        .order('display_order', { ascending: true })
        .order('created_at', { ascending: false })

      if (error) throw error

      setSections(data || [])
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
    setEditingSection(undefined)
    setFormOpen(false)
    loadResumeSections()
  }
  
  function handleCloseForm(open: boolean) {
    setFormOpen(open)
    if (!open) {
      setEditingSection(undefined)
    }
  }

  async function handleDeleteSection(id: string) {
    if (!confirm('确定要删除这个简历板块吗？')) return

    try {
      const { error } = await supabase
        .from('resume_sections')
        .delete()
        .eq('id', id)

      if (error) throw error

      loadResumeSections()
    } catch (error) {
      console.error('删除简历板块失败:', error)
      alert('删除失败')
    }
  }

  const getSectionIcon = (type: string) => {
    const icons: Record<string, any> = {
      profile: User,
      work_experience: Briefcase,
      education: GraduationCap,
      tech_stack: Code,
      skills: Award,
    }
    return icons[type] || User
  }

  const groupedSections = sections.reduce((acc, section) => {
    const type = section.section_type
    if (!acc[type]) acc[type] = []
    acc[type].push(section)
    return acc
  }, {} as Record<string, ResumeSection[]>)

  const renderSectionContent = (section: ResumeSection) => {
    try {
      const metadata = section.metadata
      
      switch (section.section_type) {
        case 'profile':
          return (
            <div className="space-y-3">
              {metadata.avatar_url && (
                <img src={metadata.avatar_url} alt="Avatar" className="w-20 h-20 rounded-full object-cover" />
              )}
              <div>
                <div className="font-medium text-lg">{metadata.name}</div>
                <div className="text-stone-600">{metadata.title}</div>
                <div className="text-sm text-stone-500 mt-2">{metadata.bio}</div>
              </div>
              {(metadata.email || metadata.phone || metadata.location) && (
                <div className="text-sm text-stone-600 space-y-1">
                  {metadata.email && <div>📧 {metadata.email}</div>}
                  {metadata.phone && <div>📱 {metadata.phone}</div>}
                  {metadata.location && <div>📍 {metadata.location}</div>}
                </div>
              )}
            </div>
          )
        
        case 'work_experience':
          return (
            <div className="space-y-4">
              {metadata.experiences?.map((exp: any, idx: number) => (
                <div key={idx} className="border-l-2 border-stone-300 pl-4">
                  <div className="font-medium">{exp.position}</div>
                  <div className="text-stone-600">{exp.company}</div>
                  <div className="text-sm text-stone-500">
                    {exp.start_date} - {exp.current ? '至今' : exp.end_date}
                  </div>
                  <div className="text-sm mt-2">{exp.description}</div>
                </div>
              ))}
            </div>
          )
        
        case 'education':
          return (
            <div className="space-y-4">
              {metadata.education?.map((edu: any, idx: number) => (
                <div key={idx} className="border-l-2 border-stone-300 pl-4">
                  <div className="font-medium">{edu.school}</div>
                  <div className="text-stone-600">{edu.degree} - {edu.major}</div>
                  <div className="text-sm text-stone-500">
                    {edu.start_date} - {edu.current ? '在读' : edu.end_date}
                  </div>
                  {edu.gpa && <div className="text-sm">GPA: {edu.gpa}</div>}
                  {edu.description && <div className="text-sm mt-2">{edu.description}</div>}
                </div>
              ))}
            </div>
          )
        
        case 'tech_stack':
          return (
            <div className="space-y-3">
              {metadata.stacks?.map((stack: any, idx: number) => (
                <div key={idx}>
                  <div className="font-medium text-sm text-stone-700 mb-2">{stack.category}</div>
                  <div className="flex flex-wrap gap-2">
                    {stack.technologies?.map((tech: any, techIdx: number) => (
                      <span
                        key={techIdx}
                        className="px-3 py-1 bg-stone-100 text-stone-700 rounded-full text-sm"
                      >
                        {tech.name} <span className="text-xs text-stone-500">({tech.level})</span>
                      </span>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          )
        
        case 'skills':
          return (
            <div className="space-y-2">
              {metadata.skills?.map((skill: any, idx: number) => (
                <div key={idx} className="border-l-2 border-stone-300 pl-4">
                  <div className="font-medium">{skill.name}</div>
                  {skill.description && <div className="text-sm text-stone-600">{skill.description}</div>}
                </div>
              ))}
            </div>
          )
        
        default:
          return <p className="text-stone-700 whitespace-pre-wrap">{section.content}</p>
      }
    } catch (error) {
      return <p className="text-stone-700 whitespace-pre-wrap">{section.content}</p>
    }
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
        <div className="space-y-8">
          {Object.entries(groupedSections).map(([type, typeSections]) => {
            const Icon = getSectionIcon(type)
            return (
              <div key={type}>
                <div className="flex items-center gap-2 mb-4">
                  <Icon size={20} className="text-stone-600" />
                  <h3 className="text-xl font-serif text-stone-900">
                    {typeSections[0].title}
                  </h3>
                  <span className="text-xs text-stone-500">({typeSections.length})</span>
                </div>
                
                <div className="space-y-4">
                  {typeSections.map((section) => (
                    <Card key={section.id} className="p-6 hover:shadow-md transition-shadow">
                      <div className="flex items-start justify-between mb-4">
                        <span className="inline-block px-2 py-1 text-xs font-medium bg-stone-100 text-stone-600 rounded uppercase">
                          {section.section_type}
                        </span>
                        <div className="flex gap-2">
                          <Button
                            variant="outline"
                            size="sm"
                            className="gap-1.5"
                            onClick={() => handleEditSection(section)}
                          >
                            <Pencil size={14} />
                            编辑
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            className="gap-1.5 text-red-600 hover:text-red-700 hover:bg-red-50"
                            onClick={() => handleDeleteSection(section.id)}
                          >
                            <Trash2 size={14} />
                            删除
                          </Button>
                        </div>
                      </div>

                      <div className="prose prose-stone max-w-none">
                        {renderSectionContent(section)}
                      </div>
                    </Card>
                  ))}
                </div>
              </div>
            )
          })}
        </div>
      )}

      {/* Resume Form Dialog */}
      <ResumeForm
        open={formOpen}
        onOpenChange={handleCloseForm}
        section={editingSection}
        onSuccess={handleFormSuccess}
      />
    </div>
  )
}
