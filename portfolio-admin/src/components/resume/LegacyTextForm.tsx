import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import * as z from 'zod'
import { Label } from '../ui/label'
import { Input } from '../ui/input'
import { Textarea } from '../ui/textarea'

const legacyTextSchema = z.object({
  title: z.string().min(1, '请输入标题'),
  content: z.string().min(1, '请输入内容'),
})

export type LegacyTextFormData = z.infer<typeof legacyTextSchema>

interface LegacyTextFormProps {
  defaultValues?: Partial<LegacyTextFormData>
  onSubmit: (data: LegacyTextFormData) => void
  loading?: boolean
}

export function LegacyTextForm({ defaultValues, onSubmit, loading }: LegacyTextFormProps) {
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LegacyTextFormData>({
    resolver: zodResolver(legacyTextSchema),
    defaultValues: {
      title: '',
      content: '',
      ...defaultValues,
    },
  })

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="title">标题 *</Label>
        <Input
          id="title"
          {...register('title')}
          placeholder="例如：关于我、联系方式"
        />
        {errors.title && (
          <p className="text-sm text-red-500">{errors.title.message}</p>
        )}
      </div>

      <div className="space-y-2">
        <Label htmlFor="content">内容 *</Label>
        <Textarea
          id="content"
          {...register('content')}
          placeholder="输入文本内容..."
          rows={8}
        />
        {errors.content && (
          <p className="text-sm text-red-500">{errors.content.message}</p>
        )}
      </div>
    </form>
  )
}
