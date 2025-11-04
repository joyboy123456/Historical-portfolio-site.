import { useForm, useFieldArray } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import * as z from 'zod'
import { Label } from '../ui/label'
import { Input } from '../ui/input'
import { Textarea } from '../ui/textarea'
import { Button } from '../ui/button'
import { Plus, Trash2 } from 'lucide-react'

const workExperienceItemSchema = z.object({
  company: z.string().min(1, '请输入公司名称'),
  position: z.string().min(1, '请输入职位'),
  start_date: z.string().min(1, '请输入开始日期'),
  end_date: z.string().optional(),
  current: z.boolean().default(false),
  description: z.string().min(1, '请输入工作描述'),
  achievements: z.array(z.string()).optional(),
})

const workExperienceSchema = z.object({
  experiences: z.array(workExperienceItemSchema).min(1, '至少添加一条工作经历'),
})

export type WorkExperienceFormData = z.infer<typeof workExperienceSchema>

interface WorkExperienceFormProps {
  defaultValues?: Partial<WorkExperienceFormData>
  onSubmit: (data: WorkExperienceFormData) => void
  loading?: boolean
}

export function WorkExperienceForm({ defaultValues, onSubmit, loading }: WorkExperienceFormProps) {
  const {
    register,
    control,
    handleSubmit,
    formState: { errors },
    watch,
  } = useForm<WorkExperienceFormData>({
    resolver: zodResolver(workExperienceSchema),
    defaultValues: defaultValues || {
      experiences: [
        {
          company: '',
          position: '',
          start_date: '',
          end_date: '',
          current: false,
          description: '',
          achievements: [],
        },
      ],
    },
  })

  const { fields, append, remove } = useFieldArray({
    control,
    name: 'experiences',
  })

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      {fields.map((field, index) => {
        const isCurrent = watch(`experiences.${index}.current`)
        
        return (
          <div key={field.id} className="p-6 border border-stone-200 rounded-lg space-y-4 bg-stone-50">
            <div className="flex items-center justify-between mb-4">
              <h4 className="font-medium text-stone-900">工作经历 #{index + 1}</h4>
              {fields.length > 1 && (
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={() => remove(index)}
                  className="text-red-600 hover:text-red-700 hover:bg-red-50"
                >
                  <Trash2 size={16} />
                </Button>
              )}
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor={`experiences.${index}.company`}>公司名称 *</Label>
                <Input
                  {...register(`experiences.${index}.company`)}
                  placeholder="ABC科技有限公司"
                />
                {errors.experiences?.[index]?.company && (
                  <p className="text-sm text-red-500">{errors.experiences[index]?.company?.message}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor={`experiences.${index}.position`}>职位 *</Label>
                <Input
                  {...register(`experiences.${index}.position`)}
                  placeholder="高级UI设计师"
                />
                {errors.experiences?.[index]?.position && (
                  <p className="text-sm text-red-500">{errors.experiences[index]?.position?.message}</p>
                )}
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor={`experiences.${index}.start_date`}>开始日期 *</Label>
                <Input
                  type="month"
                  {...register(`experiences.${index}.start_date`)}
                />
                {errors.experiences?.[index]?.start_date && (
                  <p className="text-sm text-red-500">{errors.experiences[index]?.start_date?.message}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor={`experiences.${index}.end_date`}>结束日期</Label>
                <Input
                  type="month"
                  {...register(`experiences.${index}.end_date`)}
                  disabled={isCurrent}
                />
                <div className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    id={`experiences.${index}.current`}
                    {...register(`experiences.${index}.current`)}
                    className="rounded"
                  />
                  <Label htmlFor={`experiences.${index}.current`} className="text-sm font-normal cursor-pointer">
                    目前在职
                  </Label>
                </div>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor={`experiences.${index}.description`}>工作描述 *</Label>
              <Textarea
                {...register(`experiences.${index}.description`)}
                placeholder="描述你的主要职责和工作内容..."
                rows={4}
              />
              {errors.experiences?.[index]?.description && (
                <p className="text-sm text-red-500">{errors.experiences[index]?.description?.message}</p>
              )}
            </div>
          </div>
        )
      })}

      <Button
        type="button"
        variant="outline"
        onClick={() =>
          append({
            company: '',
            position: '',
            start_date: '',
            end_date: '',
            current: false,
            description: '',
            achievements: [],
          })
        }
        className="w-full gap-2"
      >
        <Plus size={16} />
        添加工作经历
      </Button>

      {errors.experiences && typeof errors.experiences.message === 'string' && (
        <p className="text-sm text-red-500">{errors.experiences.message}</p>
      )}
    </form>
  )
}
