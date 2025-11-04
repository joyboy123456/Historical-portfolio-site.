import { useForm, useFieldArray } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import * as z from 'zod'
import { Label } from '../ui/label'
import { Input } from '../ui/input'
import { Button } from '../ui/button'
import { Plus, Trash2 } from 'lucide-react'

const techStackItemSchema = z.object({
  category: z.string().min(1, '请输入分类'),
  technologies: z.array(z.object({
    name: z.string().min(1, '请输入技术名称'),
    level: z.enum(['beginner', 'intermediate', 'advanced', 'expert']).default('intermediate'),
  })).min(1, '至少添加一项技术'),
})

const techStackSchema = z.object({
  stacks: z.array(techStackItemSchema).min(1, '至少添加一个技术栈分类'),
})

export type TechStackFormData = z.infer<typeof techStackSchema>

interface TechStackFormProps {
  defaultValues?: Partial<TechStackFormData>
  onSubmit: (data: TechStackFormData) => void
  loading?: boolean
}

const levelOptions = [
  { value: 'beginner', label: '入门' },
  { value: 'intermediate', label: '熟练' },
  { value: 'advanced', label: '精通' },
  { value: 'expert', label: '专家' },
]

export function TechStackForm({ defaultValues, onSubmit, loading }: TechStackFormProps) {
  const {
    register,
    control,
    handleSubmit,
    formState: { errors },
  } = useForm<TechStackFormData>({
    resolver: zodResolver(techStackSchema),
    defaultValues: defaultValues || {
      stacks: [
        {
          category: '',
          technologies: [{ name: '', level: 'intermediate' }],
        },
      ],
    },
  })

  const { fields: stackFields, append: appendStack, remove: removeStack } = useFieldArray({
    control,
    name: 'stacks',
  })

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      {stackFields.map((stackField, stackIndex) => (
        <div key={stackField.id} className="p-6 border border-stone-200 rounded-lg space-y-4 bg-stone-50">
          <div className="flex items-center justify-between mb-4">
            <div className="flex-1 space-y-2">
              <Label htmlFor={`stacks.${stackIndex}.category`}>技术分类 *</Label>
              <Input
                {...register(`stacks.${stackIndex}.category`)}
                placeholder="例如：前端开发、设计工具、编程语言"
              />
              {errors.stacks?.[stackIndex]?.category && (
                <p className="text-sm text-red-500">{errors.stacks[stackIndex]?.category?.message}</p>
              )}
            </div>
            {stackFields.length > 1 && (
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={() => removeStack(stackIndex)}
                className="text-red-600 hover:text-red-700 hover:bg-red-50 ml-4"
              >
                <Trash2 size={16} />
              </Button>
            )}
          </div>

          <TechStackTechnologies
            stackIndex={stackIndex}
            control={control}
            register={register}
            errors={errors}
          />
        </div>
      ))}

      <Button
        type="button"
        variant="outline"
        onClick={() =>
          appendStack({
            category: '',
            technologies: [{ name: '', level: 'intermediate' }],
          })
        }
        className="w-full gap-2"
      >
        <Plus size={16} />
        添加技术分类
      </Button>

      {errors.stacks && typeof errors.stacks.message === 'string' && (
        <p className="text-sm text-red-500">{errors.stacks.message}</p>
      )}
    </form>
  )
}

function TechStackTechnologies({ stackIndex, control, register, errors }: any) {
  const { fields, append, remove } = useFieldArray({
    control,
    name: `stacks.${stackIndex}.technologies`,
  })

  return (
    <div className="space-y-3">
      <Label className="text-sm text-stone-600">技术列表</Label>
      {fields.map((field, techIndex) => (
        <div key={field.id} className="flex gap-3 items-start">
          <div className="flex-1 space-y-2">
            <Input
              {...register(`stacks.${stackIndex}.technologies.${techIndex}.name`)}
              placeholder="技术名称"
            />
            {errors.stacks?.[stackIndex]?.technologies?.[techIndex]?.name && (
              <p className="text-sm text-red-500">
                {errors.stacks[stackIndex]?.technologies[techIndex]?.name?.message}
              </p>
            )}
          </div>
          
          <select
            {...register(`stacks.${stackIndex}.technologies.${techIndex}.level`)}
            className="px-3 py-2 border border-stone-200 rounded-md bg-white text-sm"
          >
            {levelOptions.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>

          {fields.length > 1 && (
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={() => remove(techIndex)}
              className="text-red-600 hover:text-red-700 hover:bg-red-50"
            >
              <Trash2 size={16} />
            </Button>
          )}
        </div>
      ))}

      <Button
        type="button"
        variant="outline"
        size="sm"
        onClick={() => append({ name: '', level: 'intermediate' })}
        className="gap-2"
      >
        <Plus size={14} />
        添加技术
      </Button>

      {errors.stacks?.[stackIndex]?.technologies && 
       typeof errors.stacks[stackIndex]?.technologies?.message === 'string' && (
        <p className="text-sm text-red-500">{errors.stacks[stackIndex]?.technologies?.message}</p>
      )}
    </div>
  )
}
