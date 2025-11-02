"use client"
import React, { useState } from 'react'
import { useMutation } from '@tanstack/react-query'
import { useRouter } from 'next/navigation'
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
  const router = useRouter()
  const [url, setUrl] = useState('')
  const [question, setQuestion] = useState('')

  const mutation = useMutation({ mutationFn: createTask, onSuccess: () => {
    // On success, you might redirect to /home or refresh
    router.push('/home')
  }})

  function onSubmit(e: React.FormEvent) {
    e.preventDefault()
    mutation.mutate({ url, question })
  }

  return (
    <div className='my-30 mx-auto'>

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
