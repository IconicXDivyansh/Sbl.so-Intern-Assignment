"use client"
import React, { useState } from 'react'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { useAuth } from '@clerk/nextjs'
import { API_ENDPOINTS } from '@/lib/config'

type FormData = {
  url: string
  question: string
}

export default function QuestionForm() {
  const { getToken } = useAuth()
  const queryClient = useQueryClient()
  const [url, setUrl] = useState('')  
  const [question, setQuestion] = useState('')
  const [showSuccess, setShowSuccess] = useState(false)

  const createTask = async (data: FormData) => {
    const token = await getToken()
    const res = await fetch(API_ENDPOINTS.tasks, {
      method: 'POST',
      headers: { 
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
      },
      body: JSON.stringify(data),
    })
    if (!res.ok) {
      const errorData = await res.json().catch(() => ({ error: 'Failed to create task' }))
      throw new Error(errorData.error || 'Failed to create task')
    }
    return res.json()
  }

  const mutation = useMutation({ 
    mutationFn: createTask, 
    onSuccess: () => {
      // Clear form and refetch tasks
      setUrl('')
      setQuestion('')
      queryClient.invalidateQueries({ queryKey: ['tasks'] })
      
      // Show success message
      setShowSuccess(true)
      setTimeout(() => setShowSuccess(false), 3000)
    }
  })

  function onSubmit(e: React.FormEvent) {
    e.preventDefault()
    
    // Client-side validation
    const trimmedUrl = url.trim()
    const trimmedQuestion = question.trim()
    
    if (!trimmedUrl || !trimmedQuestion) {
      return
    }
    
    // Validate URL length
    if (trimmedUrl.length > 200) {
      alert('URL is too long (max 200 characters)')
      return
    }
    
    // Validate question length
    if (trimmedQuestion.length > 1000) {
      alert('Question is too long (max 1000 characters)')
      return
    }
    
    // Basic URL format check
    try {
      new URL(trimmedUrl)
    } catch {
      alert('Please enter a valid URL (must start with http:// or https://)')
      return
    }
    
    mutation.mutate({ url: trimmedUrl, question: trimmedQuestion })
  }

  return (
    <div className='my-30 mx-auto relative'>
      {/* Success Toast */}
      {showSuccess && (
        <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-full mb-4 z-50 animate-in slide-in-from-top duration-300">
          <div className="bg-green-500/10 border border-green-500/20 rounded-lg px-4 py-3 flex items-center gap-2">
            <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
            <span className="text-green-400 text-sm font-medium">Task submitted! Processing will begin shortly.</span>
          </div>
        </div>
      )}

      <form onSubmit={onSubmit} className="max-w-xl mx-auto bg-[#131313] drop-shadow-xl drop-shadow-zinc-900 border hover:drop-shadow-2xl hover:drop-shadow-zinc-800 transition-all duration-200 border-zinc-800 rounded-xl p-6 space-y-4">
      <div>
        <div className="flex items-center justify-between mb-2">
          <label className="text-sm text-zinc-300">Website URL</label>
          <span className={`text-xs ${url.length > 200 ? 'text-red-400' : 'text-zinc-500'}`}>
            {url.length}/200
          </span>
        </div>
        <input 
          className="w-full p-3 rounded-lg bg-zinc-900/50 border border-zinc-700 outline-none focus:ring-2 focus:ring-zinc-400/90 text-white" 
          value={url} 
          onChange={(e) => setUrl(e.target.value)} 
          placeholder="https://example.com"
          type="url"
          required
        />
      </div>
      <div>
        <div className="flex items-center justify-between mb-2">
          <label className="text-sm text-zinc-300">Question</label>
          <span className={`text-xs ${question.length > 1000 ? 'text-red-400' : 'text-zinc-500'}`}>
            {question.length}/1000
          </span>
        </div>
        <textarea 
          className="w-full p-3 rounded-lg bg-zinc-900/50 border border-zinc-700 outline-none focus:ring-2 focus:ring-zinc-400/90 text-white min-h-[100px]" 
          value={question} 
          onChange={(e) => setQuestion(e.target.value)} 
          placeholder="What is this site about?"
          required
        />
      </div>
      <div className="flex items-center justify-between">
        <button  type="submit" className="px-6 py-3 text-lg font-google mx-auto rounded-lg  hover:bg-zinc-800/80 active:scale-95 transition-all duration-200 bg-zinc-800" disabled={mutation.isPending}>
          {mutation.isPending ? 'Submitting...' : 'Submit'}
        </button  >
        {mutation.isError && <p className="text-sm text-red-400">Error: {(mutation.error as Error).message}</p>}
      </div>
    </form>
    </div>
  )
}
