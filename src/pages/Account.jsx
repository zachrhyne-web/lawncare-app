import { useState } from 'react'
import { Link } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { supabase } from '../lib/supabase'
import { ArrowLeft, Mail, Key, LogOut, CheckCircle } from 'lucide-react'

export default function Account() {
  const { user, signOut } = useAuth()
  const [email, setEmail] = useState(user?.email || '')
  const [password, setPassword] = useState('')
  const [confirm, setConfirm] = useState('')

  const [emailBusy, setEmailBusy] = useState(false)
  const [emailMsg, setEmailMsg] = useState(null)
  const [emailErr, setEmailErr] = useState(null)

  const [pwBusy, setPwBusy] = useState(false)
  const [pwMsg, setPwMsg] = useState(null)
  const [pwErr, setPwErr] = useState(null)

  const [resetBusy, setResetBusy] = useState(false)
  const [resetMsg, setResetMsg] = useState(null)

  const handleEmailChange = async (e) => {
    e.preventDefault()
    setEmailErr(null); setEmailMsg(null); setEmailBusy(true)
    try {
      const { error } = await supabase.auth.updateUser({ email })
      if (error) throw error
      setEmailMsg('Confirmation sent. Click the link in both your old and new inbox to complete the change.')
    } catch (err) {
      setEmailErr(err.message || 'Could not update email')
    } finally { setEmailBusy(false) }
  }

  const handlePasswordChange = async (e) => {
    e.preventDefault()
    setPwErr(null); setPwMsg(null)
    if (password.length < 6) { setPwErr('Password must be at least 6 characters'); return }
    if (password !== confirm) { setPwErr('Passwords do not match'); return }
    setPwBusy(true)
    try {
      const { error } = await supabase.auth.updateUser({ password })
      if (error) throw error
      setPwMsg('Password updated.')
      setPassword(''); setConfirm('')
    } catch (err) {
      setPwErr(err.message || 'Could not update password')
    } finally { setPwBusy(false) }
  }

  const handleSendReset = async () => {
    setResetMsg(null); setResetBusy(true)
    try {
      const { error } = await supabase.auth.resetPasswordForEmail(user.email)
      if (error) throw error
      setResetMsg(`Password reset link sent to ${user.email}.`)
    } catch (err) {
      setResetMsg(`Could not send reset email: ${err.message || err}`)
    } finally { setResetBusy(false) }
  }

  return (
    <div className="page-container max-w-2xl">
      <Link to="/settings" className="btn-ghost mb-4 inline-flex text-gray-500">
        <ArrowLeft className="w-4 h-4" /> Back to Settings
      </Link>

      <h1 className="section-header mb-1">Account</h1>
      <p className="text-gray-500 text-sm mb-8">Manage your login email and password.</p>

      <div className="space-y-6">
        {/* Change email */}
        <form onSubmit={handleEmailChange} className="card">
          <div className="flex items-center gap-3 mb-4 pb-3 border-b border-cream-dark">
            <div className="w-8 h-8 rounded-lg bg-forest/10 flex items-center justify-center">
              <Mail className="w-4 h-4 text-forest" />
            </div>
            <h2 className="text-lg font-display tracking-wide text-forest">Email Address</h2>
          </div>
          <div className="space-y-3">
            <div>
              <label className="label">Login Email</label>
              <input className="input" type="email" value={email} required
                onChange={e => setEmail(e.target.value)} />
              <p className="text-xs text-gray-400 mt-1">
                You'll receive a confirmation link at both your current and new email addresses.
              </p>
            </div>
            {emailErr && <p className="text-sm text-red-600">{emailErr}</p>}
            {emailMsg && (
              <p className="text-sm text-green-700 flex items-start gap-2">
                <CheckCircle className="w-4 h-4 flex-shrink-0 mt-0.5" /> {emailMsg}
              </p>
            )}
            <div className="flex justify-end">
              <button type="submit" disabled={emailBusy || email === user?.email} className="btn-primary">
                {emailBusy ? 'Saving…' : 'Update Email'}
              </button>
            </div>
          </div>
        </form>

        {/* Change password */}
        <form onSubmit={handlePasswordChange} className="card">
          <div className="flex items-center gap-3 mb-4 pb-3 border-b border-cream-dark">
            <div className="w-8 h-8 rounded-lg bg-forest/10 flex items-center justify-center">
              <Key className="w-4 h-4 text-forest" />
            </div>
            <h2 className="text-lg font-display tracking-wide text-forest">Password</h2>
          </div>
          <div className="space-y-3">
            <div>
              <label className="label">New Password</label>
              <input className="input" type="password" value={password} minLength={6}
                onChange={e => setPassword(e.target.value)} placeholder="At least 6 characters" />
            </div>
            <div>
              <label className="label">Confirm New Password</label>
              <input className="input" type="password" value={confirm}
                onChange={e => setConfirm(e.target.value)} />
            </div>
            {pwErr && <p className="text-sm text-red-600">{pwErr}</p>}
            {pwMsg && (
              <p className="text-sm text-green-700 flex items-start gap-2">
                <CheckCircle className="w-4 h-4 flex-shrink-0 mt-0.5" /> {pwMsg}
              </p>
            )}
            <div className="flex items-center justify-between pt-2">
              <button type="button" onClick={handleSendReset} disabled={resetBusy}
                className="text-xs text-forest font-semibold hover:underline">
                {resetBusy ? 'Sending…' : 'Email me a reset link instead'}
              </button>
              <button type="submit" disabled={pwBusy || !password} className="btn-primary">
                {pwBusy ? 'Saving…' : 'Update Password'}
              </button>
            </div>
            {resetMsg && <p className="text-xs text-gray-500">{resetMsg}</p>}
          </div>
        </form>

        {/* Sign out */}
        <div className="card">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-semibold text-gray-900">Sign out</p>
              <p className="text-xs text-gray-400">You'll need to sign in again to access your portal.</p>
            </div>
            <button onClick={signOut} className="btn-outline">
              <LogOut className="w-4 h-4" /> Sign Out
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
