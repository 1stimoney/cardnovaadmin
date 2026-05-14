'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabase'

export default function LoginPage() {
  const router = useRouter()

  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)

  const login = async () => {
    setLoading(true)

    const { error, data } = await supabase.auth.signInWithPassword({
      email,
      password,
    })

    if (error) {
      alert(error.message)
      setLoading(false)
      return
    }

    const userId = data.user.id

    const { data: profile } = await supabase
      .from('users')
      .select('role')
      .eq('id', userId)
      .single()

    if (profile?.role !== 'admin') {
      alert('Access denied')
      await supabase.auth.signOut()
      setLoading(false)
      return
    }

    router.push('/admin')
  }

  return (
    <div className='min-h-screen flex items-center justify-center bg-black'>
      <div className='bg-zinc-900 p-8 rounded-2xl w-full max-w-md'>
        <h1 className='text-white text-3xl font-bold mb-6'>Admin Login</h1>

        <input
          placeholder='Email'
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className='w-full p-4 rounded-xl bg-zinc-800 text-white mb-4'
        />

        <input
          placeholder='Password'
          type='password'
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className='w-full p-4 rounded-xl bg-zinc-800 text-white mb-6'
        />

        <button
          onClick={login}
          disabled={loading}
          className='w-full bg-purple-600 hover:bg-purple-700 text-white p-4 rounded-xl'
        >
          {loading ? 'Loading...' : 'Login'}
        </button>
      </div>
    </div>
  )
}
