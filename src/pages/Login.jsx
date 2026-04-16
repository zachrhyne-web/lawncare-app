import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { Leaf, LogIn } from 'lucide-react'

export default function Login() {
  const { signIn } = useAuth()
  const navigate = useNavigate()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [busy, setBusy] = useState(false)

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError(''); setBusy(true)
    try {
      await signIn(email, password)
      navigate('/')
    } catch (err) {
      setError(err.message || 'Could not sign in')
    } finally { setBusy(false) }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-linen px-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <div className="w-14 h-14 rounded-2xl bg-forest flex items-center justify-center mx-auto mb-4">
            <Leaf className="w-7 h-7 text-lime" />
          </div>
          <h1 className="font-display text-3xl tracking-widest text-forest">LAWNCARE PRO</h1>
          <p className="text-sm text-gray-500 mt-1">Sign in to your business portal</p>
        </div>

        <form onSubmit={handleSubmit} className="card space-y-4">
          <div>
            <label className="label">Email</label>
            <input className="input" type="email" value={email} required
              onChange={e => setEmail(e.target.value)} autoFocus />
          </div>
          <div>
            <label className="label">Password</label>
            <input className="input" type="password" value={password} required
              onChange={e => setPassword(e.target.value)} />
          </div>
          {error && <p className="text-sm text-red-600">{error}</p>}
          <button type="submit" disabled={busy} className="btn-primary w-full justify-center">
            <LogIn className="w-4 h-4" /> {busy ? 'Signing in…' : 'Sign In'}
          </button>
          <p className="text-sm text-center text-gray-500">
            New here? <Link to="/signup" className="text-forest font-semibold hover:underline">Create an account</Link>
          </p>
        </form>
      </div>
    </div>
  )
}
