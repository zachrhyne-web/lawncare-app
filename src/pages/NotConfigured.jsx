import { AlertTriangle } from 'lucide-react'

export default function NotConfigured() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-linen px-4">
      <div className="max-w-lg card text-center">
        <div className="w-12 h-12 rounded-xl bg-amber-100 flex items-center justify-center mx-auto mb-4">
          <AlertTriangle className="w-6 h-6 text-amber-600" />
        </div>
        <h1 className="font-display text-2xl tracking-wide text-forest mb-2">Setup Required</h1>
        <p className="text-sm text-gray-600 mb-4">
          This app needs to be connected to a Supabase project before it can be used.
        </p>
        <div className="text-left bg-linen rounded-xl p-4 text-xs text-gray-700 space-y-2">
          <p><strong>1.</strong> Create a free project at <a href="https://supabase.com" className="text-forest underline" target="_blank" rel="noreferrer">supabase.com</a></p>
          <p><strong>2.</strong> Run the SQL in <code>supabase/schema.sql</code> in the Supabase SQL Editor</p>
          <p><strong>3.</strong> Copy <code>.env.example</code> to <code>.env.local</code> and add your project URL + anon key</p>
          <p><strong>4.</strong> In Vercel, add the same two env vars under Project Settings → Environment Variables</p>
        </div>
      </div>
    </div>
  )
}
