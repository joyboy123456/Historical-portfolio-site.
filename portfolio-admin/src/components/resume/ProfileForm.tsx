import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import * as z from 'zod'
import { Label } from '../ui/label'
import { Input } from '../ui/input'
import { Textarea } from '../ui/textarea'
import { ImageUpload } from '../ImageUpload'
import { useState } from 'react'

const profileSchema = z.object({
  name: z.string().min(1, '请输入姓名'),
  title: z.string().min(1, '请输入职位/头衔'),
  avatar_url: z.string().url('请输入有效的图片URL').optional().or(z.literal('')),
  bio: z.string().min(1, '请输入个人简介'),
  location: z.string().optional(),
  email: z.string().email('请输入有效的邮箱').optional().or(z.literal('')),
  phone: z.string().optional(),
})

export type ProfileFormData = z.infer<typeof profileSchema>

interface ProfileFormProps {
  defaultValues?: Partial<ProfileFormData>
  onSubmit: (data: ProfileFormData) => void
  loading?: boolean
}

export function ProfileForm({ defaultValues, onSubmit, loading }: ProfileFormProps) {
  const [avatarUrl, setAvatarUrl] = useState(defaultValues?.avatar_url || '')

  const {
    register,
    handleSubmit,
    formState: { errors },
    setValue,
  } = useForm<ProfileFormData>({
    resolver: zodResolver(profileSchema),
    defaultValues: {
      name: '',
      title: '',
      avatar_url: '',
      bio: '',
      location: '',
      email: '',
      phone: '',
      ...defaultValues,
    },
  })

  const handleAvatarUpload = (url: string) => {
    setAvatarUrl(url)
    setValue('avatar_url', url)
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      {/* 头像上传 */}
      <div className="space-y-2">
        <Label>头像</Label>
        <ImageUpload
          value={avatarUrl}
          onChange={handleAvatarUpload}
        />
        <Input
          type="hidden"
          {...register('avatar_url')}
        />
        {errors.avatar_url && (
          <p className="text-sm text-red-500">{errors.avatar_url.message}</p>
        )}
      </div>

      {/* 基本信息 */}
      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="name">姓名 *</Label>
          <Input
            id="name"
            {...register('name')}
            placeholder="张三"
          />
          {errors.name && (
            <p className="text-sm text-red-500">{errors.name.message}</p>
          )}
        </div>

        <div className="space-y-2">
          <Label htmlFor="title">职位/头衔 *</Label>
          <Input
            id="title"
            {...register('title')}
            placeholder="高级UI/UX设计师"
          />
          {errors.title && (
            <p className="text-sm text-red-500">{errors.title.message}</p>
          )}
        </div>
      </div>

      {/* 个人简介 */}
      <div className="space-y-2">
        <Label htmlFor="bio">个人简介 *</Label>
        <Textarea
          id="bio"
          {...register('bio')}
          placeholder="简要介绍你的背景、专长和职业目标..."
          rows={4}
        />
        {errors.bio && (
          <p className="text-sm text-red-500">{errors.bio.message}</p>
        )}
      </div>

      {/* 联系信息 */}
      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="location">所在地</Label>
          <Input
            id="location"
            {...register('location')}
            placeholder="北京, 中国"
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="email">邮箱</Label>
          <Input
            id="email"
            type="email"
            {...register('email')}
            placeholder="your@email.com"
          />
          {errors.email && (
            <p className="text-sm text-red-500">{errors.email.message}</p>
          )}
        </div>

        <div className="space-y-2">
          <Label htmlFor="phone">电话</Label>
          <Input
            id="phone"
            {...register('phone')}
            placeholder="+86 138 0000 0000"
          />
        </div>
      </div>
    </form>
  )
}
