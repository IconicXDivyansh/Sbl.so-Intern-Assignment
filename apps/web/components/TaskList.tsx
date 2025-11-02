"use client"
import React from 'react'
import { useQuery } from '@tanstack/react-query'
import { API_ENDPOINTS } from '@/lib/config'
import TaskCard from './TaskCard'
import { Loader2, AlertCircle, Inbox } from 'lucide-react'

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

async function fetchTasks(): Promise<Task[]> {
  const res = await fetch(API_ENDPOINTS.tasks)
  if (!res.ok) throw new Error('Failed to fetch tasks')
  const data = await res.json()
  return data.data || []
}

export default function TaskList() {
  const { data: tasks, isLoading, isError, error, refetch } = useQuery({
    queryKey: ['tasks'],
    queryFn: fetchTasks,
    refetchInterval: (query) => {
      // Auto-refresh every 3 seconds if there are pending/processing tasks
      const hasPendingTasks = query.state.data?.some(
        (task: Task) => task.status === 'pending' || task.status === 'processing'
      )
      return hasPendingTasks ? 3000 : false
    },
  })

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="w-8 h-8 text-zinc-400 animate-spin" />
        <span className="ml-3 text-zinc-400">Loading your tasks...</span>
      </div>
    )
  }

  if (isError) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="text-center">
          <AlertCircle className="w-12 h-12 text-red-500 mx-auto mb-3" />
          <p className="text-red-400 mb-2">Failed to load tasks</p>
          <p className="text-sm text-zinc-500 mb-4">{(error as Error).message}</p>
          <button
            onClick={() => refetch()}
            className="px-4 py-2 bg-zinc-800 hover:bg-zinc-700 rounded-lg text-sm transition-colors"
          >
            Try Again
          </button>
        </div>
      </div>
    )
  }

  if (!tasks || tasks.length === 0) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="text-center">
          <Inbox className="w-12 h-12 text-zinc-600 mx-auto mb-3" />
          <p className="text-zinc-400 mb-1">No tasks yet</p>
          <p className="text-sm text-zinc-500">Submit a question to get started!</p>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      {tasks.map((task) => (
        <TaskCard key={task.id} task={task} />
      ))}
    </div>
  )
}
