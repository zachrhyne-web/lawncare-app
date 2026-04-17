import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { AuthProvider, useAuth } from './context/AuthContext'
import { AppProvider, useApp } from './context/AppContext'
import Navbar from './components/Navbar'
import PoweredByFooter from './components/PoweredByFooter'
import Dashboard from './pages/Dashboard'
import Customers from './pages/Customers'
import NewCustomer from './pages/NewCustomer'
import CustomerDetail from './pages/CustomerDetail'
import Invoices from './pages/Invoices'
import Expenses from './pages/Expenses'
import NewInvoice from './pages/NewInvoice'
import InvoiceDetail from './pages/InvoiceDetail'
import Settings from './pages/Settings'
import Account from './pages/Account'
import SetupWizard from './pages/SetupWizard'
import Login from './pages/Login'
import Signup from './pages/Signup'
import NotConfigured from './pages/NotConfigured'

function LoadingScreen({ label = 'Loading…' }) {
  return (
    <div className="min-h-screen flex items-center justify-center bg-linen">
      <p className="text-sm text-gray-400">{label}</p>
    </div>
  )
}

function AuthedApp() {
  const { loading, error, settings } = useApp()

  if (loading) return <LoadingScreen label="Loading your portal…" />
  if (error)   return <LoadingScreen label={`Error: ${error}`} />

  if (settings.isSetupComplete === false) return (<><SetupWizard /><PoweredByFooter /></>)

  return (
    <div className="min-h-screen bg-linen">
      <Navbar />
      <main>
        <Routes>
          <Route path="/"              element={<Dashboard />} />
          <Route path="/customers"     element={<Customers />} />
          <Route path="/customers/new" element={<NewCustomer />} />
          <Route path="/customers/:id" element={<CustomerDetail />} />
          <Route path="/invoices"      element={<Invoices />} />
          <Route path="/invoices/new"  element={<NewInvoice />} />
          <Route path="/invoices/:id"  element={<InvoiceDetail />} />
          <Route path="/expenses"      element={<Expenses />} />
          <Route path="/settings"      element={<Settings />} />
          <Route path="/account"       element={<Account />} />
          <Route path="*"              element={<Navigate to="/" replace />} />
        </Routes>
      </main>
      <PoweredByFooter />
    </div>
  )
}

function AppShell() {
  const { isConfigured, session, loading } = useAuth()

  if (!isConfigured) return (<><NotConfigured /><PoweredByFooter /></>)
  if (loading) return <LoadingScreen />

  if (!session) {
    return (
      <>
        <Routes>
          <Route path="/signup" element={<Signup />} />
          <Route path="/login"  element={<Login />} />
          <Route path="*"       element={<Login />} />
        </Routes>
        <PoweredByFooter />
      </>
    )
  }

  return (
    <AppProvider>
      <AuthedApp />
    </AppProvider>
  )
}

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <AppShell />
      </AuthProvider>
    </BrowserRouter>
  )
}
