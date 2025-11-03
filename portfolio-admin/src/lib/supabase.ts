import { createClient } from '@supabase/supabase-js'

// 官方 Supabase 配置
const supabaseUrl = "https://jcxlgmmudtbizyinqyrq.supabase.co"
const supabaseAnonKey = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImpjeGxnbW11ZHRiaXp5aW5xeXJxIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjE2MTc3MzksImV4cCI6MjA3NzE5MzczOX0.SYmaIOEVhS5P-wJmlUoP_mhOlrhVQo7OaEZYbDGKuVg"

export const supabase = createClient(supabaseUrl, supabaseAnonKey)

// 直接 API 调用辅助函数 - 绕过 functions.invoke() 的问题
export async function callEdgeFunction(functionName: string, options: {
  method?: string
  body?: any
} = {}) {
  const { method = 'GET', body } = options

  const headers: Record<string, string> = {
    'Authorization': `Bearer ${supabaseAnonKey}`,
    'Content-Type': 'application/json'
  }

  const fetchOptions: RequestInit = {
    method,
    headers
  }

  if (body && method !== 'GET') {
    fetchOptions.body = JSON.stringify(body)
  }

  const response = await fetch(
    `${supabaseUrl}/functions/v1/${functionName}`,
    fetchOptions
  )

  if (!response.ok) {
    throw new Error(`Edge Function error: ${response.status} ${response.statusText}`)
  }

  return response.json()
}

export interface Project {
  id: string
  title: string
  description: string
  image_url: string
  tags: string[]
  category: string
  featured: boolean
  display_order: number
  created_at: string
  updated_at: string
}

export interface ResumeSection {
  id: string
  section_type: string
  title: string
  content: string
  metadata: any
  display_order: number
  created_at: string
  updated_at: string
}
