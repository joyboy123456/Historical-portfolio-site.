import { useState, useRef } from 'react'
import { Upload, X, Image as ImageIcon } from 'lucide-react'
import { supabase } from '../lib/supabase'
import { Button } from './ui/button'
import { cn } from '../lib/utils'

interface ImageUploadProps {
  value?: string
  onChange: (url: string) => void
  className?: string
}

export function ImageUpload({ value, onChange, className }: ImageUploadProps) {
  const [uploading, setUploading] = useState(false)
  const [preview, setPreview] = useState<string | undefined>(value)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    // 验证文件类型
    const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp']
    if (!allowedTypes.includes(file.type)) {
      alert('只支持 JPG、PNG 和 WebP 格式的图片')
      return
    }

    // 验证文件大小（10MB）
    const maxSize = 10 * 1024 * 1024
    if (file.size > maxSize) {
      alert('图片大小不能超过 10MB')
      return
    }

    try {
      setUploading(true)

      // 读取文件为 base64
      const reader = new FileReader()
      reader.onload = async (event) => {
        const base64Data = event.target?.result as string

        // 调用上传 API
        const response = await supabase.functions.invoke('image-upload', {
          method: 'POST',
          body: {
            imageData: base64Data,
            fileName: file.name,
          },
        })

        if (response.error) {
          throw new Error(response.error.message || '上传失败')
        }

        const imageUrl = response.data?.data?.url
        if (imageUrl) {
          setPreview(imageUrl)
          onChange(imageUrl)
        }
      }

      reader.onerror = () => {
        throw new Error('读取文件失败')
      }

      reader.readAsDataURL(file)
    } catch (error) {
      console.error('上传图片失败:', error)
      alert(`上传图片失败: ${error instanceof Error ? error.message : '未知错误'}`)
    } finally {
      setUploading(false)
    }
  }

  const handleRemove = () => {
    setPreview(undefined)
    onChange('')
    if (fileInputRef.current) {
      fileInputRef.current.value = ''
    }
  }

  return (
    <div className={cn('space-y-2', className)}>
      <input
        ref={fileInputRef}
        type="file"
        accept="image/jpeg,image/jpg,image/png,image/webp"
        onChange={handleFileSelect}
        className="hidden"
      />

      {preview ? (
        <div className="relative group">
          <div className="aspect-video w-full overflow-hidden rounded-lg border border-stone-200 bg-stone-50">
            <img
              src={preview}
              alt="Preview"
              className="w-full h-full object-cover"
              onError={(e) => {
                e.currentTarget.src = 'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" width="400" height="300"%3E%3Crect fill="%23f5f5f4" width="400" height="300"/%3E%3Ctext x="50%25" y="50%25" dominant-baseline="middle" text-anchor="middle" fill="%23a8a29e" font-family="Arial" font-size="14"%3E图片加载失败%3C/text%3E%3C/svg%3E'
              }}
            />
          </div>
          <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity rounded-lg flex items-center justify-center gap-2">
            <Button
              type="button"
              size="sm"
              variant="secondary"
              onClick={() => fileInputRef.current?.click()}
              disabled={uploading}
            >
              <Upload size={16} className="mr-1" />
              重新上传
            </Button>
            <Button
              type="button"
              size="sm"
              variant="destructive"
              onClick={handleRemove}
              disabled={uploading}
            >
              <X size={16} className="mr-1" />
              移除
            </Button>
          </div>
        </div>
      ) : (
        <button
          type="button"
          onClick={() => fileInputRef.current?.click()}
          disabled={uploading}
          className="w-full aspect-video border-2 border-dashed border-stone-300 rounded-lg hover:border-stone-400 transition-colors flex flex-col items-center justify-center gap-2 text-stone-500 hover:text-stone-700 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {uploading ? (
            <>
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-stone-900" />
              <span className="text-sm">上传中...</span>
            </>
          ) : (
            <>
              <ImageIcon size={32} />
              <span className="text-sm font-medium">点击上传图片</span>
              <span className="text-xs text-stone-400">
                支持 JPG、PNG、WebP，最大 10MB
              </span>
            </>
          )}
        </button>
      )}
    </div>
  )
}
