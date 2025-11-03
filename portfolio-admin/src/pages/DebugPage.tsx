import { useState } from 'react'
import { supabase } from '../lib/supabase'
import { Button } from '../components/ui/button'
import { Card } from '../components/ui/card'

export function DebugPage() {
  const [output, setOutput] = useState<string>('点击按钮开始测试...')
  const [loading, setLoading] = useState(false)

  async function testAPI() {
    setLoading(true)
    setOutput('正在测试 API...\n\n')

    try {
      // 测试 1: 检查 Supabase 客户端
      setOutput(prev => prev + '✓ Supabase 客户端已创建\n')
      setOutput(prev => prev + `  URL: ${supabase.supabaseUrl}\n\n`)

      // 测试 2: 调用 Edge Function
      setOutput(prev => prev + '正在调用 projects-api...\n')
      const response = await supabase.functions.invoke('projects-api')

      setOutput(prev => prev + '\n📦 完整响应对象:\n')
      setOutput(prev => prev + JSON.stringify(response, null, 2) + '\n\n')

      setOutput(prev => prev + '📊 响应分析:\n')
      setOutput(prev => prev + `  - response.data 存在: ${!!response.data}\n`)
      setOutput(prev => prev + `  - response.data 类型: ${typeof response.data}\n`)
      setOutput(prev => prev + `  - response.data?.data 存在: ${!!response.data?.data}\n`)
      setOutput(prev => prev + `  - response.error 存在: ${!!response.error}\n\n`)

      if (response.error) {
        setOutput(prev => prev + `❌ 错误: ${JSON.stringify(response.error, null, 2)}\n`)
      } else if (response.data?.data) {
        const projects = response.data.data
        setOutput(prev => prev + `✓ 成功获取 ${projects.length} 个作品\n\n`)
        setOutput(prev => prev + '前 3 个作品:\n')
        projects.slice(0, 3).forEach((p: any, i: number) => {
          setOutput(prev => prev + `  ${i + 1}. ${p.title}\n`)
        })
      } else {
        setOutput(prev => prev + '⚠️ 未找到 response.data.data\n')
        setOutput(prev => prev + `实际的 response.data:\n${JSON.stringify(response.data, null, 2)}\n`)
      }

    } catch (error: any) {
      setOutput(prev => prev + `\n❌ 捕获到错误:\n${error.message}\n${error.stack}\n`)
    } finally {
      setLoading(false)
    }
  }

  async function testDirectFetch() {
    setLoading(true)
    setOutput('正在使用 fetch() 直接测试...\n\n')

    try {
      const response = await fetch(
        'https://jcxlgmmudtbizyinqyrq.supabase.co/functions/v1/projects-api',
        {
          headers: {
            'Authorization': 'Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImpjeGxnbW11ZHRiaXp5aW5xeXJxIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjE2MTc3MzksImV4cCI6MjA3NzE5MzczOX0.SYmaIOEVhS5P-wJmlUoP_mhOlrhVQo7OaEZYbDGKuVg',
            'Content-Type': 'application/json'
          }
        }
      )

      setOutput(prev => prev + `状态码: ${response.status}\n`)
      const data = await response.json()

      setOutput(prev => prev + '\n📦 响应数据:\n')
      setOutput(prev => prev + JSON.stringify(data, null, 2) + '\n\n')

      if (data.data) {
        setOutput(prev => prev + `✓ 获取到 ${data.data.length} 个作品\n`)
      }

    } catch (error: any) {
      setOutput(prev => prev + `\n❌ 错误: ${error.message}\n`)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div>
      <div className="mb-8">
        <h2 className="text-3xl font-serif text-stone-900 mb-2">API 调试工具</h2>
        <p className="text-sm text-stone-500">用于诊断 Supabase API 连接问题</p>
      </div>

      <div className="flex gap-4 mb-6">
        <Button onClick={testAPI} disabled={loading}>
          测试 functions.invoke()
        </Button>
        <Button onClick={testDirectFetch} disabled={loading} variant="outline">
          测试直接 fetch()
        </Button>
      </div>

      <Card className="p-6">
        <pre className="whitespace-pre-wrap font-mono text-xs text-stone-700 bg-stone-50 p-4 rounded">
          {output}
        </pre>
      </Card>
    </div>
  )
}
