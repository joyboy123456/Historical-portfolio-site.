import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import * as z from 'zod'
import { X } from 'lucide-react'
import { callEdgeFunction, type Project } from '../lib/supabase'
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
import { Checkbox } from './ui/checkbox'
import { ImageUpload } from './ImageUpload'
import { useState, useEffect } from 'react'

const projectSchema = z.object({
  title: z.string().min(1, '请输入作品标题').max(255, '标题不能超过255个字符'),
  description: z.string().min(1, '请输入作品描述'),
  image_url: z.string().url('请输入有效的图片URL').or(z.literal('')),
  category: z.string().optional(),
  featured: z.boolean().default(false),
  display_order: z.number().int().min(0).default(0),
})

type ProjectFormData = z.infer<typeof projectSchema>

interface ProjectFormProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  project?: Project
  onSuccess: () => void
}

export function ProjectForm({ open, onOpenChange, project, onSuccess }: ProjectFormProps) {
  const [tags, setTags] = useState<string[]>(project?.tags || [])
  const [tagInput, setTagInput] = useState('')
  const [loading, setLoading] = useState(false)

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
    setValue,
    watch,
  } = useForm<ProjectFormData>({
    resolver: zodResolver(projectSchema),
    defaultValues: project
      ? {
          title: project.title,
          description: project.description,
          image_url: project.image_url,
          category: project.category,
          featured: project.featured,
          display_order: project.display_order,
        }
      : {
          title: '',
          description: '',
          image_url: '',
          category: '',
          featured: false,
          display_order: 0,
        },
  })

  const featured = watch('featured')
  const imageUrl = watch('image_url')

  // 更新 preview 当 project 变化时
  useEffect(() => {
    if (project) {
      setTags(project.tags || [])
      setValue('image_url', project.image_url)
    } else {
      setTags([])
      setValue('image_url', '')
    }
  }, [project, setValue])

  const handleAddTag = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && tagInput.trim()) {
      e.preventDefault()
      if (!tags.includes(tagInput.trim())) {
        setTags([...tags, tagInput.trim()])
      }
      setTagInput('')
    }
  }

  const handleRemoveTag = (tagToRemove: string) => {
    setTags(tags.filter((tag) => tag !== tagToRemove))
  }

  const onSubmit = async (data: ProjectFormData) => {
    try {
      setLoading(true)

      const projectData = {
        ...data,
        tags,
      }

      if (project) {
        // 更新
        await callEdgeFunction(`projects-api/${project.id}`, {
          method: 'PUT',
          body: projectData,
        })
      } else {
        // 创建
        await callEdgeFunction('projects-api', {
          method: 'POST',
          body: projectData,
        })
      }

      reset()
      setTags([])
      onSuccess()
      onOpenChange(false)
    } catch (error) {
      console.error('保存作品失败:', error)
      alert('保存作品失败')
    } finally {
      setLoading(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{project ? '编辑作品' : '添加作品'}</DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          {/* 标题 */}
          <div className="space-y-2">
            <Label htmlFor="title">作品标题 *</Label>
            <Input
              id="title"
              {...register('title')}
              placeholder="请输入作品标题"
            />
            {errors.title && (
              <p className="text-sm text-red-500">{errors.title.message}</p>
            )}
          </div>

          {/* 描述 */}
          <div className="space-y-2">
            <Label htmlFor="description">作品描述 *</Label>
            <Textarea
              id="description"
              {...register('description')}
              placeholder="请输入作品描述"
              rows={4}
            />
            {errors.description && (
              <p className="text-sm text-red-500">{errors.description.message}</p>
            )}
          </div>

          {/* 图片上传 */}
          <div className="space-y-2">
            <Label>作品图片</Label>
            <ImageUpload
              value={imageUrl}
              onChange={(url) => setValue('image_url', url)}
            />
            {errors.image_url && (
              <p className="text-sm text-red-500">{errors.image_url.message}</p>
            )}
            <p className="text-xs text-stone-500">或者直接输入图片 URL</p>
            <Input
              {...register('image_url')}
              placeholder="https://example.com/image.jpg"
              className="mt-2"
            />
          </div>

          {/* 分类 */}
          <div className="space-y-2">
            <Label htmlFor="category">分类</Label>
            <Input
              id="category"
              {...register('category')}
              placeholder="例如：UI设计、品牌设计"
            />
          </div>

          {/* 标签 */}
          <div className="space-y-2">
            <Label htmlFor="tags">标签</Label>
            <div className="flex flex-wrap gap-2 p-3 border border-stone-200 rounded-md min-h-[42px] bg-white">
              {tags.map((tag) => (
                <span
                  key={tag}
                  className="inline-flex items-center gap-1 px-2 py-1 text-sm bg-stone-100 text-stone-700 rounded"
                >
                  {tag}
                  <button
                    type="button"
                    onClick={() => handleRemoveTag(tag)}
                    className="hover:text-stone-900"
                  >
                    <X size={14} />
                  </button>
                </span>
              ))}
              <input
                type="text"
                value={tagInput}
                onChange={(e) => setTagInput(e.target.value)}
                onKeyDown={handleAddTag}
                placeholder={tags.length === 0 ? '输入标签并按回车' : ''}
                className="flex-1 min-w-[120px] outline-none text-sm"
              />
            </div>
            <p className="text-xs text-stone-500">按回车键添加标签</p>
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

          {/* 精选 */}
          <div className="flex items-center space-x-2">
            <Checkbox
              id="featured"
              checked={featured}
              onCheckedChange={(checked) => setValue('featured', checked === true)}
            />
            <Label htmlFor="featured" className="cursor-pointer">
              标记为精选作品
            </Label>
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
              {loading ? '保存中...' : project ? '更新' : '创建'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
