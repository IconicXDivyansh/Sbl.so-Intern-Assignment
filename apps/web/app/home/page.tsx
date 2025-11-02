import { auth, currentUser } from '@clerk/nextjs/server'
import { redirect } from 'next/navigation'
import QuestionForm from '../../components/QuestionForm'
import { FormIcon1 } from '../../components/Icons/FormIcon1'
import { FormIcon2 } from '../../components/Icons/FormIcon2'
import { Globe } from '../../components/Icons/Globe'
import { Dots } from '../../components/Icons/Dots'

export default async function HomePage() {
  const { userId } = await auth()
  
  // Redirect to landing page if not authenticated
  if (!userId) {
    redirect('/')
  }

  const user = await currentUser()

  return (
    <div className='mx-auto max-w-7xl  px-6 py-10'>
      <h1 className='text-3xl font-bold'>Welcome, {user?.firstName}!</h1>
      <div className='mt-4 flex gap-6 items-center text-lg'>This is your personalized dashboard.
        <div className='bg-zinc-800 px-4 py-1 rounded-2xl inline'>
       <span className='text-md tracking-wider font-bold shimmer'>Ask away!</span>
       </div>
      </div>


      {/* Input Form */}
      <div className='my-20 relative'>
          <div className='absolute right-70 -top-10 -z-10'>
          <FormIcon1 />
          </div>
        <QuestionForm />
          <div className='absolute -bottom-9 left-72 -z-10'>
            <FormIcon2 />
          </div>
      </div>
      {/* Tasks List */}

      {/* Empty State */}
      <div className='my-8'>
        <h2 className='text-2xl font-bold'>Your Recent Activity</h2>
        <p className='mt-2 text-zinc-400'>You haven't asked any questions yet. Start by submitting a URL and your question!</p>
      </div>
    </div>
  )
}
