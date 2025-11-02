"use client"
import { use } from 'react'
import { useQuery } from '@tanstack/react-query'
import { useAuth } from '@clerk/nextjs'
import { useRouter } from 'next/navigation'
import { API_ENDPOINTS } from '@/lib/config'
import { 
  ArrowLeft, 
  Clock, 
  CheckCircle2, 
  XCircle, 
  Loader2, 
  ExternalLink,
  Copy,
  Check,
  Trash2,
  RefreshCw,
  Globe,
  MessageSquare,
  FileText,
  Calendar,
  Cpu,
  Hash
} from 'lucide-react'
import ReactMarkdown from 'react-markdown'
import { useState } from 'react'
import { useMutation, useQueryClient } from '@tanstack/react-query'

type Task = {
  id: string
  url: string
  question: string
  status: 'pending' | 'processing' | 'completed' | 'failed'
  answer: string | null
  error: string | null
  scrapedContent?: {
    title?: string
    content?: string
    url?: string
    timestamp?: string
    aiModel?: string
    tokensUsed?: number
  } | null
  createdAt: string
  updatedAt: string
}

async function deleteTask(taskId: string, token: string) {
  const res = await fetch(`${API_ENDPOINTS.tasks}/${taskId}`, {
    method: 'DELETE',
    headers: { Authorization: `Bearer ${token}` },
  })
  if (!res.ok) throw new Error('Failed to delete task')
  return res.json()
}

async function retryTask(taskId: string, token: string) {
  const res = await fetch(`${API_ENDPOINTS.tasks}/${taskId}/retry`, {
    method: 'POST',
    headers: { Authorization: `Bearer ${token}` },
  })
  if (!res.ok) throw new Error('Failed to retry task')
  return res.json()
}

export default function TaskDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const resolvedParams = use(params)
  const taskId = resolvedParams.id
  const router = useRouter()
  const { getToken } = useAuth()
  const queryClient = useQueryClient()
  const [copied, setCopied] = useState(false)

  const { data: task, isLoading, isError, error } = useQuery<Task>({
    queryKey: ['task', taskId],
    queryFn: async () => {
      const token = await getToken()
      const res = await fetch(API_ENDPOINTS.tasks, {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      })
      if (!res.ok) throw new Error('Failed to fetch task')
      const data = await res.json()
      const tasks = data.data || []
      const foundTask = tasks.find((t: Task) => t.id === taskId)
      if (!foundTask) throw new Error('Task not found')
      return foundTask
    },
    refetchInterval: (query) => {
      const taskStatus = query.state.data?.status
      return taskStatus === 'pending' || taskStatus === 'processing' ? 3000 : false
    },
  })

  const deleteMutation = useMutation({
    mutationFn: async () => {
      const token = await getToken()
      if (!token) throw new Error('No auth token')
      return deleteTask(taskId, token)
    },
    onSuccess: () => {
      router.push('/home')
    }
  })

  const retryMutation = useMutation({
    mutationFn: async () => {
      const token = await getToken()
      if (!token) throw new Error('No auth token')
      return retryTask(taskId, token)
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['task', taskId] })
    }
  })

  const handleCopy = async () => {
    if (task?.answer) {
      await navigator.clipboard.writeText(task.answer)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    }
  }

  const handleDelete = () => {
    if (confirm('Are you sure you want to delete this task?')) {
      deleteMutation.mutate()
    }
  }

  const statusConfig = {
    pending: {
      icon: Clock,
      color: 'text-yellow-500',
      bg: 'bg-yellow-500/10',
      label: 'Pending'
    },
    processing: {
      icon: Loader2,
      color: 'text-blue-500',
      bg: 'bg-blue-500/10',
      label: 'Processing',
      animate: true
    },
    completed: {
      icon: CheckCircle2,
      color: 'text-green-500',
      bg: 'bg-green-500/10',
      label: 'Completed'
    },
    failed: {
      icon: XCircle,
      color: 'text-red-500',
      bg: 'bg-red-500/10',
      label: 'Failed'
    }
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="w-8 h-8 text-zinc-400 animate-spin" />
        <span className="ml-3 text-zinc-400">Loading task details...</span>
      </div>
    )
  }

  if (isError || !task) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <XCircle className="w-12 h-12 text-red-500 mx-auto mb-3" />
          <p className="text-red-400 mb-2">Failed to load task</p>
          <p className="text-sm text-zinc-500 mb-4">{(error as Error)?.message || 'Task not found'}</p>
          <button
            onClick={() => router.push('/home')}
            className="px-4 py-2 bg-zinc-800 hover:bg-zinc-700 rounded-lg text-sm transition-colors"
          >
            Back to Home
          </button>
        </div>
      </div>
    )
  }

  const config = statusConfig[task.status]
  const StatusIcon = config.icon
  const shouldAnimate = 'animate' in config && config.animate

  return (
    <div className="mx-auto max-w-5xl px-6 py-10">
      {/* Header */}
      <div className="mb-6">
        <button
          onClick={() => router.push('/home')}
          className="flex items-center gap-2 text-zinc-400 hover:text-white transition-colors mb-4"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Tasks
        </button>
        
        <div className="flex items-start justify-between gap-4">
          <div className="flex-1">
            <h1 className="text-3xl font-bold mb-2">Task Details</h1>
            <p className="text-zinc-400">View complete information about this task</p>
          </div>
          
          <div className={`flex items-center gap-2 px-4 py-2 rounded-full ${config.bg}`}>
            <StatusIcon 
              className={`w-5 h-5 ${config.color} ${shouldAnimate ? 'animate-spin' : ''}`} 
            />
            <span className={`text-sm font-medium ${config.color}`}>
              {config.label}
            </span>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="space-y-6">
        {/* URL Section */}
        <div className="bg-[#131313] border border-zinc-800 rounded-xl p-6">
          <div className="flex items-center gap-2 mb-3">
            <Globe className="w-5 h-5 text-zinc-400" />
            <h2 className="text-lg font-semibold">Source URL</h2>
          </div>
          <a
            href={task.url}
            target="_blank"
            rel="noopener noreferrer"
            className="text-blue-400 hover:text-blue-300 flex items-center gap-2 group"
          >
            <span className="break-all">{task.url}</span>
            <ExternalLink className="w-4 h-4 opacity-0 group-hover:opacity-100 transition-opacity shrink-0" />
          </a>
          {task.scrapedContent?.title && (
            <p className="text-zinc-400 mt-2 text-sm">
              <span className="text-zinc-600">Page Title:</span> {task.scrapedContent.title}
            </p>
          )}
        </div>

        {/* Question Section */}
        <div className="bg-[#131313] border border-zinc-800 rounded-xl p-6">
          <div className="flex items-center gap-2 mb-3">
            <MessageSquare className="w-5 h-5 text-zinc-400" />
            <h2 className="text-lg font-semibold">Question</h2>
          </div>
          <p className="text-white text-lg leading-relaxed">{task.question}</p>
        </div>

        {/* Answer Section */}
        {task.status === 'completed' && task.answer && (
          <div className="bg-[#131313] border border-zinc-800 rounded-xl p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <FileText className="w-5 h-5 text-zinc-400" />
                <h2 className="text-lg font-semibold">Answer</h2>
              </div>
              <button
                onClick={handleCopy}
                className="flex items-center gap-2 px-3 py-1.5 text-sm text-zinc-400 hover:text-zinc-200 hover:bg-zinc-800 rounded-lg transition-colors"
              >
                {copied ? (
                  <>
                    <Check className="w-4 h-4 text-green-500" />
                    <span className="text-green-500">Copied!</span>
                  </>
                ) : (
                  <>
                    <Copy className="w-4 h-4" />
                    <span>Copy Answer</span>
                  </>
                )}
              </button>
            </div>
            <div className="prose prose-invert prose-lg max-w-none">
              <ReactMarkdown>{task.answer}</ReactMarkdown>
            </div>
          </div>
        )}

        {/* Error Section */}
        {task.status === 'failed' && task.error && (
          <div className="bg-red-500/10 border border-red-500/20 rounded-xl p-6">
            <div className="flex items-center gap-2 mb-3">
              <XCircle className="w-5 h-5 text-red-400" />
              <h2 className="text-lg font-semibold text-red-400">Error</h2>
            </div>
            <p className="text-red-300">{task.error}</p>
          </div>
        )}

        {/* Processing State */}
        {(task.status === 'pending' || task.status === 'processing') && (
          <div className="bg-[#131313] border border-zinc-800 rounded-xl p-6">
            <div className="flex items-center gap-3">
              <Loader2 className="w-5 h-5 text-blue-500 animate-spin" />
              <p className="text-zinc-400">
                {task.status === 'pending' 
                  ? 'Task is queued and waiting to be processed...' 
                  : 'Scraping website and generating answer...'}
              </p>
            </div>
          </div>
        )}

        {/* Metadata Section */}
        <div className="bg-[#131313] border border-zinc-800 rounded-xl p-6">
          <h2 className="text-lg font-semibold mb-4">Metadata</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="flex items-start gap-3">
              <Calendar className="w-5 h-5 text-zinc-400 mt-0.5" />
              <div>
                <p className="text-sm text-zinc-500">Created</p>
                <p className="text-white">{new Date(task.createdAt).toLocaleString()}</p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <Calendar className="w-5 h-5 text-zinc-400 mt-0.5" />
              <div>
                <p className="text-sm text-zinc-500">Last Updated</p>
                <p className="text-white">{new Date(task.updatedAt).toLocaleString()}</p>
              </div>
            </div>
            {task.scrapedContent?.aiModel && (
              <div className="flex items-start gap-3">
                <Cpu className="w-5 h-5 text-zinc-400 mt-0.5" />
                <div>
                  <p className="text-sm text-zinc-500">AI Model</p>
                  <p className="text-white">{task.scrapedContent.aiModel}</p>
                </div>
              </div>
            )}
            {task.scrapedContent?.tokensUsed && (
              <div className="flex items-start gap-3">
                <Hash className="w-5 h-5 text-zinc-400 mt-0.5" />
                <div>
                  <p className="text-sm text-zinc-500">Tokens Used</p>
                  <p className="text-white">{task.scrapedContent.tokensUsed.toLocaleString()}</p>
                </div>
              </div>
            )}
            {task.scrapedContent?.content && (
              <div className="flex items-start gap-3">
                <FileText className="w-5 h-5 text-zinc-400 mt-0.5" />
                <div>
                  <p className="text-sm text-zinc-500">Content Length</p>
                  <p className="text-white">{task.scrapedContent.content.length.toLocaleString()} characters</p>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Actions Section */}
        <div className="flex items-center justify-end gap-3">
          {task.status === 'failed' && (
            <button
              onClick={() => retryMutation.mutate()}
              disabled={retryMutation.isPending}
              className="flex items-center gap-2 px-4 py-2 bg-blue-500/10 hover:bg-blue-500/20 text-blue-400 rounded-lg transition-colors disabled:opacity-50"
            >
              <RefreshCw className={`w-4 h-4 ${retryMutation.isPending ? 'animate-spin' : ''}`} />
              {retryMutation.isPending ? 'Retrying...' : 'Retry Task'}
            </button>
          )}
          <button
            onClick={handleDelete}
            disabled={deleteMutation.isPending}
            className="flex items-center gap-2 px-4 py-2 bg-red-500/10 hover:bg-red-500/20 text-red-400 rounded-lg transition-colors disabled:opacity-50"
          >
            <Trash2 className="w-4 h-4" />
            {deleteMutation.isPending ? 'Deleting...' : 'Delete Task'}
          </button>
        </div>
      </div>
    </div>
  )
}
