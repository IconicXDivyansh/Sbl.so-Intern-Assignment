"use client"
import React from 'react'
import { Clock, CheckCircle2, XCircle, Loader2, ExternalLink } from 'lucide-react'

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

export default function TaskCard({ task }: TaskCardProps) {
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
          <div className="mt-4 p-4 bg-zinc-900/50 rounded-lg border border-zinc-800">
            <h3 className="text-sm text-zinc-400 mb-2 flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-green-500" />
              Answer:
            </h3>
            <p className="text-zinc-200 whitespace-pre-wrap leading-relaxed">{task.answer}</p>
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

      {/* Timestamp */}
      <div className="mt-4 pt-4 border-t border-zinc-800 text-xs text-zinc-500">
        Created {new Date(task.createdAt).toLocaleString()}
      </div>
    </div>
  )
}
