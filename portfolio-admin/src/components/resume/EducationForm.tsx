import { useForm, useFieldArray } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import * as z from 'zod'
import { Label } from '../ui/label'
import { Input } from '../ui/input'
import { Textarea } from '../ui/textarea'
import { Button } from '../ui/button'
import { Plus, Trash2 } from 'lucide-react'

const educationItemSchema = z.object({
  school: z.string().min(1, '请输入学校名称'),
  degree: z.string().min(1, '请输入学位'),
  major: z.string().min(1, '请输入专业'),
  start_date: z.string().min(1, '请输入开始日期'),
  end_date: z.string().optional(),
  current: z.boolean().default(false),
  gpa: z.string().optional(),
  description: z.string().optional(),
})

const educationSchema = z.object({
  education: z.array(educationItemSchema).min(1, '至少添加一条教育经历'),
})

export type EducationFormData = z.infer<typeof educationSchema>

interface EducationFormProps {
  defaultValues?: Partial<EducationFormData>
  onSubmit: (data: EducationFormData) => void
  loading?: boolean
}

export function EducationForm({ defaultValues, onSubmit, loading }: EducationFormProps) {
  const {
    register,
    control,
    handleSubmit,
    formState: { errors },
    watch,
  } = useForm<EducationFormData>({
    resolver: zodResolver(educationSchema),
    defaultValues: defaultValues || {
      education: [
        {
          school: '',
          degree: '',
          major: '',
          start_date: '',
          end_date: '',
          current: false,
          gpa: '',
          description: '',
        },
      ],
    },
  })

  const { fields, append, remove } = useFieldArray({
    control,
    name: 'education',
  })

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      {fields.map((field, index) => {
        const isCurrent = watch(`education.${index}.current`)
        
        return (
          <div key={field.id} className="p-6 border border-stone-200 rounded-lg space-y-4 bg-stone-50">
            <div className="flex items-center justify-between mb-4">
              <h4 className="font-medium text-stone-900">教育经历 #{index + 1}</h4>
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
              <div className="space-y-2 col-span-2">
                <Label htmlFor={`education.${index}.school`}>学校名称 *</Label>
                <Input
                  {...register(`education.${index}.school`)}
                  placeholder="清华大学"
                />
                {errors.education?.[index]?.school && (
                  <p className="text-sm text-red-500">{errors.education[index]?.school?.message}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor={`education.${index}.degree`}>学位 *</Label>
                <Input
                  {...register(`education.${index}.degree`)}
                  placeholder="本科 / 硕士 / 博士"
                />
                {errors.education?.[index]?.degree && (
                  <p className="text-sm text-red-500">{errors.education[index]?.degree?.message}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor={`education.${index}.major`}>专业 *</Label>
                <Input
                  {...register(`education.${index}.major`)}
                  placeholder="计算机科学与技术"
                />
                {errors.education?.[index]?.major && (
                  <p className="text-sm text-red-500">{errors.education[index]?.major?.message}</p>
                )}
              </div>
            </div>

            <div className="grid grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label htmlFor={`education.${index}.start_date`}>开始日期 *</Label>
                <Input
                  type="month"
                  {...register(`education.${index}.start_date`)}
                />
                {errors.education?.[index]?.start_date && (
                  <p className="text-sm text-red-500">{errors.education[index]?.start_date?.message}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor={`education.${index}.end_date`}>结束日期</Label>
                <Input
                  type="month"
                  {...register(`education.${index}.end_date`)}
                  disabled={isCurrent}
                />
                <div className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    id={`education.${index}.current`}
                    {...register(`education.${index}.current`)}
                    className="rounded"
                  />
                  <Label htmlFor={`education.${index}.current`} className="text-sm font-normal cursor-pointer">
                    在读
                  </Label>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor={`education.${index}.gpa`}>GPA / 成绩</Label>
                <Input
                  {...register(`education.${index}.gpa`)}
                  placeholder="3.8 / 4.0"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor={`education.${index}.description`}>补充说明</Label>
              <Textarea
                {...register(`education.${index}.description`)}
                placeholder="获得的荣誉、参与的项目等..."
                rows={3}
              />
            </div>
          </div>
        )
      })}

      <Button
        type="button"
        variant="outline"
        onClick={() =>
          append({
            school: '',
            degree: '',
            major: '',
            start_date: '',
            end_date: '',
            current: false,
            gpa: '',
            description: '',
          })
        }
        className="w-full gap-2"
      >
        <Plus size={16} />
        添加教育经历
      </Button>

      {errors.education && typeof errors.education.message === 'string' && (
        <p className="text-sm text-red-500">{errors.education.message}</p>
      )}
    </form>
  )
}
