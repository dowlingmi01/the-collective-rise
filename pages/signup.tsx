import { useState } from 'react'
import { supabase } from '../lib/supabase'
import { useRouter } from 'next/router'

export default function SignUp() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [errorMsg, setErrorMsg] = useState('')
  const [loading, setLoading] = useState(false)

  const router = useRouter()

  const handleSignUp = async () => {
    setLoading(true)
    setErrorMsg('')

    const { data, error } = await supabase.auth.signUp({
      email,
      password,
    })

    if (error) {
      setErrorMsg(error.message)
    } else {
      // User is now authenticated
      router.push('/dashboard')
    }

    setLoading(false)
  }

  return (
    <div className="p-8 max-w-md mx-auto">
      <h1 className="text-2xl font-bold mb-4">Sign Up</h1>

      {errorMsg && <div className="text-red-500 mb-4">{errorMsg}</div>}

      <input
        className="input mb-3"
        type="email"
        placeholder="Email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
      />
      <input
        className="input mb-4"
        type="password"
        placeholder="Password"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
      />

      <button
        className="btn w-full"
        onClick={handleSignUp}
        disabled={loading}
      >
        {loading ? 'Creating account...' : 'Create Account'}
      </button>
    </div>
  )
}
