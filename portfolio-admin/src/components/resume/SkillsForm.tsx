import { useForm, useFieldArray } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import * as z from 'zod'
import { Label } from '../ui/label'
import { Input } from '../ui/input'
import { Textarea } from '../ui/textarea'
import { Button } from '../ui/button'
import { Plus, Trash2 } from 'lucide-react'

const skillItemSchema = z.object({
  name: z.string().min(1, '请输入技能名称'),
  description: z.string().optional(),
})

const skillsSchema = z.object({
  skills: z.array(skillItemSchema).min(1, '至少添加一项技能'),
})

export type SkillsFormData = z.infer<typeof skillsSchema>

interface SkillsFormProps {
  defaultValues?: Partial<SkillsFormData>
  onSubmit: (data: SkillsFormData) => void
  loading?: boolean
}

export function SkillsForm({ defaultValues, onSubmit, loading }: SkillsFormProps) {
  const {
    register,
    control,
    handleSubmit,
    formState: { errors },
  } = useForm<SkillsFormData>({
    resolver: zodResolver(skillsSchema),
    defaultValues: defaultValues || {
      skills: [{ name: '', description: '' }],
    },
  })

  const { fields, append, remove } = useFieldArray({
    control,
    name: 'skills',
  })

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      {fields.map((field, index) => (
        <div key={field.id} className="p-4 border border-stone-200 rounded-lg space-y-3 bg-stone-50">
          <div className="flex items-start gap-3">
            <div className="flex-1 space-y-2">
              <Label htmlFor={`skills.${index}.name`}>技能名称 *</Label>
              <Input
                {...register(`skills.${index}.name`)}
                placeholder="例如：用户研究、原型设计、视觉设计"
              />
              {errors.skills?.[index]?.name && (
                <p className="text-sm text-red-500">{errors.skills[index]?.name?.message}</p>
              )}
            </div>
            {fields.length > 1 && (
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={() => remove(index)}
                className="text-red-600 hover:text-red-700 hover:bg-red-50 mt-7"
              >
                <Trash2 size={16} />
              </Button>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor={`skills.${index}.description`}>技能描述</Label>
            <Textarea
              {...register(`skills.${index}.description`)}
              placeholder="简要描述这项技能的具体内容或你的掌握程度..."
              rows={2}
            />
          </div>
        </div>
      ))}

      <Button
        type="button"
        variant="outline"
        onClick={() => append({ name: '', description: '' })}
        className="w-full gap-2"
      >
        <Plus size={16} />
        添加技能
      </Button>

      {errors.skills && typeof errors.skills.message === 'string' && (
        <p className="text-sm text-red-500">{errors.skills.message}</p>
      )}
    </form>
  )
}
