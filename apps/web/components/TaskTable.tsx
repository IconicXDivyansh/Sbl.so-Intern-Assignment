"use client"
import React from 'react'
import { useRouter } from 'next/navigation'
import { Clock, CheckCircle2, XCircle, Loader2, ExternalLink, Trash2, RefreshCw } from 'lucide-react'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { useAuth } from '@clerk/nextjs'
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

interface TaskTableProps {
  tasks: Task[]
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

const TaskTable = React.memo(function TaskTable({ tasks }: TaskTableProps) {
  const router = useRouter()
  const { getToken } = useAuth()
  const queryClient = useQueryClient()

  const deleteMutation = useMutation({
    mutationFn: async (taskId: string) => {
      const token = await getToken()
      if (!token) throw new Error('No auth token')
      return deleteTask(taskId, token)
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tasks'] })
    }
  })

  const retryMutation = useMutation({
    mutationFn: async (taskId: string) => {
      const token = await getToken()
      if (!token) throw new Error('No auth token')
      return retryTask(taskId, token)
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tasks'] })
    }
  })

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

  const handleRowClick = (taskId: string, e: React.MouseEvent) => {
    // Don't navigate if clicking on action buttons
    if ((e.target as HTMLElement).closest('button')) {
      return
    }
    router.push(`/tasks/${taskId}`)
  }

  const handleDelete = (taskId: string, e: React.MouseEvent) => {
    e.stopPropagation()
    if (confirm('Are you sure you want to delete this task?')) {
      deleteMutation.mutate(taskId)
    }
  }

  const handleRetry = (taskId: string, e: React.MouseEvent) => {
    e.stopPropagation()
    retryMutation.mutate(taskId)
  }

  return (
    <div className="bg-[#131313] border border-zinc-800 rounded-xl overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full" style={{ willChange: 'contents' }}>
          <thead className="bg-zinc-900/50 border-b border-zinc-800">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-zinc-400 uppercase tracking-wider">
                Status
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-zinc-400 uppercase tracking-wider">
                URL
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-zinc-400 uppercase tracking-wider">
                Question
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-zinc-400 uppercase tracking-wider">
                Created
              </th>
              <th className="px-6 py-3 text-right text-xs font-medium text-zinc-400 uppercase tracking-wider">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="bg-[#131313]">
            {tasks.map((task) => {
              const config = statusConfig[task.status]
              const StatusIcon = config.icon
              const shouldAnimate = 'animate' in config && config.animate

              return (
                <tr
                  key={task.id}
                  onClick={(e) => handleRowClick(task.id, e)}
                  className="border-t border-zinc-800 hover:bg-zinc-900/30 cursor-pointer transition-colors"
                >
                  {/* Status */}
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className={`inline-flex items-center gap-2 px-3 py-1 rounded-full ${config.bg}`}>
                      <StatusIcon 
                        className={`w-4 h-4 ${config.color} ${shouldAnimate ? 'animate-spin' : ''}`} 
                      />
                      <span className={`text-xs font-medium ${config.color}`}>
                        {config.label}
                      </span>
                    </div>
                  </td>

                  {/* URL */}
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-2 max-w-xs">
                      <span className="text-sm text-blue-400 truncate">{task.url}</span>
                      <a
                        href={task.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        onClick={(e) => e.stopPropagation()}
                        className="shrink-0 text-zinc-500 hover:text-zinc-300"
                      >
                        <ExternalLink className="w-3 h-3" />
                      </a>
                    </div>
                  </td>

                  {/* Question */}
                  <td className="px-6 py-4">
                    <div className="text-sm text-white max-w-md truncate">
                      {task.question}
                    </div>
                  </td>

                  {/* Created Date */}
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-zinc-400">
                      {new Date(task.createdAt).toLocaleDateString()}
                    </div>
                    <div className="text-xs text-zinc-600">
                      {new Date(task.createdAt).toLocaleTimeString()}
                    </div>
                  </td>

                  {/* Actions */}
                  <td className="px-6 py-4 whitespace-nowrap text-right">
                    <div className="flex items-center justify-end gap-2">
                      {task.status === 'failed' && (
                        <button
                          onClick={(e) => handleRetry(task.id, e)}
                          disabled={retryMutation.isPending}
                          className="p-2 text-blue-400 hover:bg-blue-500/10 rounded-lg transition-colors disabled:opacity-50"
                          title="Retry"
                        >
                          <RefreshCw className={`w-4 h-4 ${retryMutation.isPending ? 'animate-spin' : ''}`} />
                        </button>
                      )}
                      <button
                        onClick={(e) => handleDelete(task.id, e)}
                        disabled={deleteMutation.isPending}
                        className="p-2 text-red-400 hover:bg-red-500/10 rounded-lg transition-colors disabled:opacity-50"
                        title="Delete"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>
    </div>
  )
})

export default TaskTable
