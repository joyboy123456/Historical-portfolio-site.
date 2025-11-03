import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import * as z from 'zod'
import { supabase, type ResumeSection } from '../lib/supabase'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from './ui/dialog'
import { Button } from './ui/button'
import { Input } from './ui/input'
import { Textarea } from './ui/textarea'
import { Label } from './ui/label'
import { useState } from 'react'

const resumeSchema = z.object({
  section_type: z.string().min(1, '请输入区域类型'),
  title: z.string().min(1, '请输入标题').max(255, '标题不能超过255个字符'),
  content: z.string().min(1, '请输入内容'),
  display_order: z.number().int().min(0).default(0),
})

type ResumeFormData = z.infer<typeof resumeSchema>

interface ResumeFormProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  section?: ResumeSection
  onSuccess: () => void
}

export function ResumeForm({ open, onOpenChange, section, onSuccess }: ResumeFormProps) {
  const [loading, setLoading] = useState(false)

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm<ResumeFormData>({
    resolver: zodResolver(resumeSchema),
    defaultValues: section
      ? {
          section_type: section.section_type,
          title: section.title,
          content: section.content,
          display_order: section.display_order,
        }
      : {
          section_type: '',
          title: '',
          content: '',
          display_order: 0,
        },
  })

  const onSubmit = async (data: ResumeFormData) => {
    try {
      setLoading(true)

      const resumeData = {
        ...data,
        metadata: {},
      }

      if (section) {
        // 更新
        const response = await supabase.functions.invoke(`resume-api/${section.id}`, {
          method: 'PUT',
          body: resumeData,
        })

        if (response.error) throw response.error
      } else {
        // 创建
        const response = await supabase.functions.invoke('resume-api', {
          method: 'POST',
          body: resumeData,
        })

        if (response.error) throw response.error
      }

      reset()
      onSuccess()
      onOpenChange(false)
    } catch (error) {
      console.error('保存简历失败:', error)
      alert('保存简历失败')
    } finally {
      setLoading(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{section ? '编辑简历内容' : '添加简历内容'}</DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          {/* 区域类型 */}
          <div className="space-y-2">
            <Label htmlFor="section_type">区域类型 *</Label>
            <Input
              id="section_type"
              {...register('section_type')}
              placeholder="例如：hero, about, skills, contact"
            />
            {errors.section_type && (
              <p className="text-sm text-red-500">{errors.section_type.message}</p>
            )}
            <p className="text-xs text-stone-500">
              常用类型：hero（顶部介绍）、about（关于我）、skills（技能）、contact（联系方式）
            </p>
          </div>

          {/* 标题 */}
          <div className="space-y-2">
            <Label htmlFor="title">标题 *</Label>
            <Input
              id="title"
              {...register('title')}
              placeholder="请输入标题"
            />
            {errors.title && (
              <p className="text-sm text-red-500">{errors.title.message}</p>
            )}
          </div>

          {/* 内容 */}
          <div className="space-y-2">
            <Label htmlFor="content">内容 *</Label>
            <Textarea
              id="content"
              {...register('content')}
              placeholder="请输入内容"
              rows={8}
            />
            {errors.content && (
              <p className="text-sm text-red-500">{errors.content.message}</p>
            )}
          </div>

          {/* 显示顺序 */}
          <div className="space-y-2">
            <Label htmlFor="display_order">显示顺序</Label>
            <Input
              id="display_order"
              type="number"
              {...register('display_order', { valueAsNumber: true })}
              placeholder="0"
            />
            {errors.display_order && (
              <p className="text-sm text-red-500">{errors.display_order.message}</p>
            )}
          </div>

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={loading}
            >
              取消
            </Button>
            <Button type="submit" disabled={loading}>
              {loading ? '保存中...' : section ? '更新' : '创建'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
