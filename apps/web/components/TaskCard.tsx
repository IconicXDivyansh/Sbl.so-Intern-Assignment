"use client"
import React, { useState } from 'react'
import { Clock, CheckCircle2, XCircle, Loader2, ExternalLink, Copy, Trash2, RefreshCw, Check } from 'lucide-react'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { useAuth } from '@clerk/nextjs'
import ReactMarkdown from 'react-markdown'
import { API_ENDPOINTS } from '@/lib/config'

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

interface TaskCardProps {
  task: Task
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

export default function TaskCard({ task }: TaskCardProps) {
  const { getToken } = useAuth()
  const queryClient = useQueryClient()
  const [copied, setCopied] = useState(false)

  const deleteMutation = useMutation({
    mutationFn: async () => {
      const token = await getToken()
      if (!token) throw new Error('No auth token')
      return deleteTask(task.id, token)
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tasks'] })
    }
  })

  const retryMutation = useMutation({
    mutationFn: async () => {
      const token = await getToken()
      if (!token) throw new Error('No auth token')
      return retryTask(task.id, token)
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tasks'] })
    }
  })

  const handleCopy = async () => {
    if (task.answer) {
      await navigator.clipboard.writeText(task.answer)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
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

  const config = statusConfig[task.status]
  const StatusIcon = config.icon
  const shouldAnimate = 'animate' in config && config.animate

  return (
    <div className="bg-[#131313] border border-zinc-800 rounded-xl p-6 hover:border-zinc-700 transition-colors">
      {/* Header with Status */}
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-center gap-3">
          <a 
            href={task.url} 
            target="_blank" 
            rel="noopener noreferrer"
            className="text-blue-400 hover:text-blue-300 font-medium flex items-center gap-2 group"
          >
            <span className="truncate max-w-md">{task.url}</span>
            <ExternalLink className="w-4 h-4 opacity-0 group-hover:opacity-100 transition-opacity" />
          </a>
        </div>
        <div className={`flex items-center gap-2 px-3 py-1.5 rounded-full ${config.bg}`}>
          <StatusIcon 
            className={`w-4 h-4 ${config.color} ${shouldAnimate ? 'animate-spin' : ''}`} 
          />
          <span className={`text-sm font-medium ${config.color}`}>
            {config.label}
          </span>
        </div>
      </div>

      {/* Question */}
      <div className="mb-4">
        <h3 className="text-sm text-zinc-400 mb-2">Question:</h3>
        <p className="text-white">{task.question}</p>
      </div>

      {/* Answer or Error */}
      {task.status === 'completed' && task.answer && (
        <>
          <div className="mt-4 p-4 bg-zinc-900/50 rounded-lg border border-zinc-800 relative">
            <div className="flex items-center justify-between mb-2">
              <h3 className="text-sm text-zinc-400 flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-green-500" />
                Answer:
              </h3>
              <button
                onClick={handleCopy}
                className="flex items-center gap-1 px-2 py-1 text-xs text-zinc-400 hover:text-zinc-200 hover:bg-zinc-800 rounded transition-colors"
                title="Copy answer"
              >
                {copied ? (
                  <>
                    <Check className="w-3 h-3 text-green-500" />
                    <span className="text-green-500">Copied!</span>
                  </>
                ) : (
                  <>
                    <Copy className="w-3 h-3" />
                    <span>Copy</span>
                  </>
                )}
              </button>
            </div>
            <div className="text-zinc-200 leading-relaxed prose prose-invert prose-sm max-w-none">
              <ReactMarkdown>{task.answer}</ReactMarkdown>
            </div>
          </div>
          
          {/* Metadata */}
          {task.scrapedContent && (
            <div className="mt-3 flex flex-wrap items-center gap-3 text-xs text-zinc-500">
              {task.scrapedContent.title && (
                <span className="flex items-center gap-1">
                  <span className="text-zinc-600">Source:</span>
                  <span className="text-zinc-400">{task.scrapedContent.title}</span>
                </span>
              )}
              {task.scrapedContent.aiModel && (
                <span className="flex items-center gap-1">
                  <span className="text-zinc-600">•</span>
                  <span className="text-zinc-600">Model:</span>
                  <span className="text-zinc-400">{task.scrapedContent.aiModel}</span>
                </span>
              )}
              {task.scrapedContent.tokensUsed && (
                <span className="flex items-center gap-1">
                  <span className="text-zinc-600">•</span>
                  <span className="text-zinc-600">Tokens:</span>
                  <span className="text-zinc-400">{task.scrapedContent.tokensUsed.toLocaleString()}</span>
                </span>
              )}
              {task.scrapedContent.content && (
                <span className="flex items-center gap-1">
                  <span className="text-zinc-600">•</span>
                  <span className="text-zinc-600">Scraped:</span>
                  <span className="text-zinc-400">{task.scrapedContent.content.length.toLocaleString()} chars</span>
                </span>
              )}
            </div>
          )}
        </>
      )}

      {task.status === 'failed' && task.error && (
        <div className="mt-4 p-4 bg-red-500/10 rounded-lg border border-red-500/20">
          <h3 className="text-sm text-red-400 mb-2 flex items-center gap-2">
            <XCircle className="w-4 h-4" />
            Error:
          </h3>
          <p className="text-red-300 text-sm">{task.error}</p>
        </div>
      )}

      {(task.status === 'pending' || task.status === 'processing') && (
        <div className="mt-4 p-4 bg-zinc-900/50 rounded-lg border border-zinc-800">
          <p className="text-zinc-400 text-sm flex items-center gap-2">
            <Loader2 className="w-4 h-4 animate-spin" />
            {task.status === 'pending' ? 'Waiting to be processed...' : 'Scraping website and generating answer...'}
          </p>
        </div>
      )}

      {/* Timestamp and Actions */}
      <div className="mt-4 pt-4 border-t border-zinc-800 flex items-center justify-between">
        <span className="text-xs text-zinc-500">
          Created {new Date(task.createdAt).toLocaleString()}
        </span>
        <div className="flex items-center gap-2">
          {task.status === 'failed' && (
            <button
              onClick={() => retryMutation.mutate()}
              disabled={retryMutation.isPending}
              className="flex items-center gap-1 px-3 py-1.5 text-xs bg-blue-500/10 hover:bg-blue-500/20 text-blue-400 rounded transition-colors disabled:opacity-50"
            >
              <RefreshCw className={`w-3 h-3 ${retryMutation.isPending ? 'animate-spin' : ''}`} />
              {retryMutation.isPending ? 'Retrying...' : 'Retry'}
            </button>
          )}
          <button
            onClick={() => deleteMutation.mutate()}
            disabled={deleteMutation.isPending}
            className="flex items-center gap-1 px-3 py-1.5 text-xs bg-red-500/10 hover:bg-red-500/20 text-red-400 rounded transition-colors disabled:opacity-50"
          >
            <Trash2 className="w-3 h-3" />
            {deleteMutation.isPending ? 'Deleting...' : 'Delete'}
          </button>
        </div>
      </div>
    </div>
  )
}
