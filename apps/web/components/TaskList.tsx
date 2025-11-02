"use client"
import React, { useState, useMemo } from 'react'
import { useQuery } from '@tanstack/react-query'
import { useAuth } from '@clerk/nextjs'
import { API_ENDPOINTS } from '@/lib/config'
import TaskCard from './TaskCard'
import TaskFilters from './TaskFilters'
import { Loader2, AlertCircle, Inbox, SearchX } from 'lucide-react'

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

export default function TaskList() {
  const { getToken } = useAuth()
  const [searchQuery, setSearchQuery] = useState('')
  const [statusFilter, setStatusFilter] = useState('all')
  const [sortOrder, setSortOrder] = useState<'newest' | 'oldest'>('newest')
  
  const fetchTasks = async (): Promise<Task[]> => {
    const token = await getToken()
    const res = await fetch(API_ENDPOINTS.tasks, {
      headers: {
        'Authorization': `Bearer ${token}`,
      },
    })
    if (!res.ok) throw new Error('Failed to fetch tasks')
    const data = await res.json()
    return data.data || []
  }
  
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

  // Filter and sort tasks
  const filteredTasks = useMemo(() => {
    if (!tasks) return []

    let filtered = [...tasks]

    // Apply search filter
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase()
      filtered = filtered.filter(
        (task) =>
          task.url.toLowerCase().includes(query) ||
          task.question.toLowerCase().includes(query) ||
          task.answer?.toLowerCase().includes(query)
      )
    }

    // Apply status filter
    if (statusFilter !== 'all') {
      filtered = filtered.filter((task) => task.status === statusFilter)
    }

    // Apply sort order
    filtered.sort((a, b) => {
      const dateA = new Date(a.createdAt).getTime()
      const dateB = new Date(b.createdAt).getTime()
      return sortOrder === 'newest' ? dateB - dateA : dateA - dateB
    })

    return filtered
  }, [tasks, searchQuery, statusFilter, sortOrder])

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
    <div>
      {/* Filters */}
      <TaskFilters
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
        statusFilter={statusFilter}
        onStatusFilterChange={setStatusFilter}
        sortOrder={sortOrder}
        onSortOrderChange={setSortOrder}
      />

      {/* Task Count */}
      <div className="mb-4 text-sm text-zinc-500">
        Showing {filteredTasks.length} of {tasks.length} task{tasks.length !== 1 ? 's' : ''}
      </div>

      {/* Tasks or Empty State */}
      {filteredTasks.length === 0 ? (
        <div className="flex items-center justify-center py-12">
          <div className="text-center">
            <SearchX className="w-12 h-12 text-zinc-600 mx-auto mb-3" />
            <p className="text-zinc-400 mb-1">No tasks found</p>
            <p className="text-sm text-zinc-500">Try adjusting your filters or search query</p>
            <button
              onClick={() => {
                setSearchQuery('')
                setStatusFilter('all')
              }}
              className="mt-4 px-4 py-2 bg-zinc-800 hover:bg-zinc-700 rounded-lg text-sm transition-colors"
            >
              Clear Filters
            </button>
          </div>
        </div>
      ) : (
        <div className="space-y-4">
          {filteredTasks.map((task) => (
            <TaskCard key={task.id} task={task} />
          ))}
        </div>
      )}
    </div>
  )
}
