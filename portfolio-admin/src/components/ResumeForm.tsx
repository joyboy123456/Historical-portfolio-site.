import { useState, useRef, useEffect } from 'react'
import { supabase, type ResumeSection } from '../lib/supabase'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from './ui/dialog'
import { Button } from './ui/button'
import { Label } from './ui/label'
import { ProfileForm, type ProfileFormData } from './resume/ProfileForm'
import { WorkExperienceForm, type WorkExperienceFormData } from './resume/WorkExperienceForm'
import { EducationForm, type EducationFormData } from './resume/EducationForm'
import { TechStackForm, type TechStackFormData } from './resume/TechStackForm'
import { SkillsForm, type SkillsFormData } from './resume/SkillsForm'
import { LegacyTextForm, type LegacyTextFormData } from './resume/LegacyTextForm'
import { User, Briefcase, GraduationCap, Code, Award } from 'lucide-react'

type SectionType = 'profile' | 'work_experience' | 'education' | 'tech_stack' | 'skills'

interface ResumeFormProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  section?: ResumeSection
  onSuccess: () => void
}

const sectionTypes = [
  { value: 'profile', label: '个人信息', icon: User, description: '头像、姓名、联系方式等基本信息' },
  { value: 'work_experience', label: '工作经历', icon: Briefcase, description: '工作经验、职位、公司等' },
  { value: 'education', label: '教育背景', icon: GraduationCap, description: '学校、专业、学位等' },
  { value: 'tech_stack', label: '技术栈', icon: Code, description: '掌握的技术和工具' },
  { value: 'skills', label: '专业技能', icon: Award, description: '核心技能和特长' },
]

export function ResumeForm({ open, onOpenChange, section, onSuccess }: ResumeFormProps) {
  const [loading, setLoading] = useState(false)
  const [selectedType, setSelectedType] = useState<SectionType>('profile')
  const formRef = useRef<HTMLFormElement>(null)

  // 当 dialog 打开/关闭或 section 变化时，重置状态
  useEffect(() => {
    if (open) {
      setSelectedType((section?.section_type as SectionType) || 'profile')
    } else {
      // 关闭时重置为默认值
      setSelectedType('profile')
    }
  }, [open, section])

  const handleFormSubmit = async (formData: any) => {
    try {
      setLoading(true)

      // 如果是编辑旧格式数据，保持原有格式
      const resumeData = section && isLegacyFormat()
        ? {
            section_type: section.section_type, // 保持原有类型
            title: formData.title,
            content: formData.content,
            metadata: section.metadata || {}, // 保持原有 metadata
            display_order: section.display_order || 0,
          }
        : {
            section_type: selectedType,
            title: getSectionTitle(selectedType),
            content: JSON.stringify(formData),
            metadata: formData,
            display_order: section?.display_order || 0,
          }

      if (section) {
        // 更新 - 直接使用 Supabase 客户端
        const { data, error } = await supabase
          .from('resume_sections')
          .update({
            ...resumeData,
            updated_at: new Date().toISOString(),
          })
          .eq('id', section.id)
          .select()

        if (error) {
          console.error('更新错误详情:', error)
          throw new Error(error.message || '更新失败')
        }
        console.log('更新成功:', data)
      } else {
        // 创建 - 直接使用 Supabase 客户端
        const { data, error } = await supabase
          .from('resume_sections')
          .insert([resumeData])
          .select()

        if (error) {
          console.error('创建错误详情:', error)
          throw new Error(error.message || '创建失败')
        }
        console.log('创建成功:', data)
      }

      onSuccess()
      onOpenChange(false)
    } catch (error: any) {
      console.error('保存简历失败:', error)
      const errorMessage = error?.message || error?.error_description || error?.hint || '未知错误'
      alert(`保存简历失败:\n${errorMessage}`)
    } finally {
      setLoading(false)
    }
  }

  const getSectionTitle = (type: SectionType): string => {
    const titles: Record<SectionType, string> = {
      profile: '个人信息',
      work_experience: '工作经历',
      education: '教育背景',
      tech_stack: '技术栈',
      skills: '专业技能',
    }
    return titles[type]
  }

  // 判断是否是旧格式数据
  const isLegacyFormat = () => {
    if (!section) return false
    const legacyTypes = ['hero', 'about', 'contact', 'skills']
    return legacyTypes.includes(section.section_type.toLowerCase())
  }

  const getDefaultValues = () => {
    // 如果是旧格式，返回 title 和 content
    if (isLegacyFormat() && section) {
      return {
        title: section.title,
        content: section.content,
      }
    }
    
    // 新格式：从 metadata 获取
    if (!section?.metadata) return undefined
    if (section.metadata && typeof section.metadata === 'object') {
      return section.metadata
    }
    
    return undefined
  }

  const renderForm = () => {
    const defaultValues = getDefaultValues()

    // 如果是编辑旧格式数据，显示简单文本表单
    if (section && isLegacyFormat()) {
      return (
        <LegacyTextForm
          defaultValues={defaultValues as LegacyTextFormData}
          onSubmit={handleFormSubmit}
          loading={loading}
        />
      )
    }

    // 新格式：根据类型显示对应表单
    switch (selectedType) {
      case 'profile':
        return (
          <ProfileForm
            defaultValues={defaultValues as ProfileFormData}
            onSubmit={handleFormSubmit}
            loading={loading}
          />
        )
      case 'work_experience':
        return (
          <WorkExperienceForm
            defaultValues={defaultValues as WorkExperienceFormData}
            onSubmit={handleFormSubmit}
            loading={loading}
          />
        )
      case 'education':
        return (
          <EducationForm
            defaultValues={defaultValues as EducationFormData}
            onSubmit={handleFormSubmit}
            loading={loading}
          />
        )
      case 'tech_stack':
        return (
          <TechStackForm
            defaultValues={defaultValues as TechStackFormData}
            onSubmit={handleFormSubmit}
            loading={loading}
          />
        )
      case 'skills':
        return (
          <SkillsForm
            defaultValues={defaultValues as SkillsFormData}
            onSubmit={handleFormSubmit}
            loading={loading}
          />
        )
      default:
        return null
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{section ? '编辑简历内容' : '添加简历内容'}</DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {/* Section Type Selector */}
          {!section && (
            <div className="space-y-3">
              <Label>选择简历板块类型</Label>
              <div className="grid grid-cols-2 gap-3">
                {sectionTypes.map((type) => {
                  const Icon = type.icon
                  return (
                    <button
                      key={type.value}
                      type="button"
                      onClick={() => setSelectedType(type.value as SectionType)}
                      className={`p-4 border-2 rounded-lg text-left transition-all hover:border-stone-400 ${
                        selectedType === type.value
                          ? 'border-stone-900 bg-stone-50'
                          : 'border-stone-200'
                      }`}
                    >
                      <div className="flex items-start gap-3">
                        <Icon size={20} className="mt-0.5 text-stone-600" />
                        <div>
                          <div className="font-medium text-stone-900">{type.label}</div>
                          <div className="text-xs text-stone-500 mt-1">{type.description}</div>
                        </div>
                      </div>
                    </button>
                  )
                })}
              </div>
            </div>
          )}

          {/* Dynamic Form */}
          <div ref={formRef}>{renderForm()}</div>

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={loading}
            >
              取消
            </Button>
            <Button
              type="button"
              onClick={() => {
                // Trigger form submission from the child form
                const form = formRef.current?.querySelector('form')
                if (form) {
                  form.requestSubmit()
                }
              }}
              disabled={loading}
            >
              {loading ? '保存中...' : section ? '更新' : '创建'}
            </Button>
          </DialogFooter>
        </div>
      </DialogContent>
    </Dialog>
  )
}
