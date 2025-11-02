"use client"
import React, { useState } from 'react'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { API_ENDPOINTS } from '@/lib/config'

type FormData = {
  url: string
  question: string
}

async function createTask(data: FormData) {
  const res = await fetch(API_ENDPOINTS.tasks, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  })
  if (!res.ok) throw new Error('Failed to create task')
  return res.json()
}

export default function QuestionForm() {
  const queryClient = useQueryClient()
  const [url, setUrl] = useState('')
  const [question, setQuestion] = useState('')
  const [showSuccess, setShowSuccess] = useState(false)

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
    mutation.mutate({ url, question })
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

      <form onSubmit={onSubmit} className="max-w-xl mx-auto bg-[#131313] drop-shadow-xl drop-shadow-zinc-800 border border-zinc-800 rounded-xl p-6 space-y-4">
      <div>
        <label className="text-sm text-zinc-300">Website URL</label>
        <input className="w-full mt-2 p-3 rounded-lg bg-zinc-900/50 border border-zinc-700 text-white" value={url} onChange={(e) => setUrl(e.target.value)} placeholder="https://example.com" />
      </div>
      <div>
        <label className="text-sm text-zinc-300">Question</label>
        <textarea className="w-full mt-2 p-3 rounded-lg bg-zinc-900/50 border border-zinc-700 text-white" value={question} onChange={(e) => setQuestion(e.target.value)} placeholder="What is this site about?" />
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
