import { BrowserRouter, Routes, Route } from 'react-router-dom'
import { AppProvider, useApp } from './context/AppContext'
import Navbar from './components/Navbar'
import Dashboard from './pages/Dashboard'
import Customers from './pages/Customers'
import NewCustomer from './pages/NewCustomer'
import CustomerDetail from './pages/CustomerDetail'
import Invoices from './pages/Invoices'
import NewInvoice from './pages/NewInvoice'
import InvoiceDetail from './pages/InvoiceDetail'
import Settings from './pages/Settings'
import SetupWizard from './pages/SetupWizard'

function AppShell() {
  const { settings } = useApp()

  // Show the setup wizard for brand-new installs (isSetupComplete is exactly false)
  if (settings.isSetupComplete === false) {
    return <SetupWizard />
  }

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
          <Route path="/settings"      element={<Settings />} />
        </Routes>
      </main>
    </div>
  )
}

export default function App() {
  return (
    <BrowserRouter>
      <AppProvider>
        <AppShell />
      </AppProvider>
    </BrowserRouter>
  )
}
