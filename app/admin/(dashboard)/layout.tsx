'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { Toaster } from 'sonner'
import {
  LayoutDashboard,
  CreditCard,
  Banknote,
  Gift,
  Users,
  Menu,
} from 'lucide-react'
import { useState } from 'react'

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const pathname = usePathname()
  const [open, setOpen] = useState(false)

  const navItems = [
    { name: 'Dashboard', href: '/admin', icon: LayoutDashboard },
    { name: 'Trades', href: '/admin/trades', icon: CreditCard },
    { name: 'Withdrawals', href: '/admin/withdrawals', icon: Banknote },
    { name: 'Gift Cards', href: '/admin/giftcards', icon: Gift },
    { name: 'Users', href: '/admin/users', icon: Users },
  ]

  return (
    <div className='flex h-screen bg-gray-50 text-gray-900'>
      {/* MOBILE TOP BAR */}
      <div className='md:hidden fixed top-0 left-0 right-0 h-14 bg-white border-b flex items-center justify-between px-4 z-50'>
        <h1 className='font-bold text-blue-600'>CardNova Admin</h1>

        <button
          onClick={() => setOpen(!open)}
          className='p-2 rounded-md hover:bg-gray-100'
        >
          <Menu size={20} />
        </button>
      </div>

      {/* SIDEBAR */}
      <aside
        className={`
          fixed md:static z-40 top-0 left-0 h-full w-64 bg-white border-r p-4
          transform transition-transform duration-200
          ${open ? 'translate-x-0' : '-translate-x-full md:translate-x-0'}
        `}
      >
        <h1 className='text-xl font-bold text-blue-600 mb-6'>CardNova Admin</h1>

        <nav className='space-y-2'>
          {navItems.map((item) => {
            const active = pathname === item.href

            return (
              <Link
                key={item.href}
                href={item.href}
                onClick={() => setOpen(false)}
                className={`flex items-center gap-3 p-2 rounded-lg transition text-sm ${
                  active
                    ? 'bg-blue-50 text-blue-600 font-medium'
                    : 'hover:bg-gray-100 text-gray-600'
                }`}
              >
                <item.icon size={18} />
                {item.name}
              </Link>
            )
          })}
        </nav>
      </aside>

      {/* BACKDROP (MOBILE) */}
      {open && (
        <div
          onClick={() => setOpen(false)}
          className='fixed inset-0 bg-black/30 md:hidden z-30'
        />
      )}

      {/* MAIN CONTENT */}
      <main className='flex-1 md:ml-64 p-6 pt-20 md:pt-6 overflow-y-auto'>
        {children}
      </main>

      {/* NOTIFICATIONS */}
      <Toaster richColors theme='light' position='top-right' />
    </div>
  )
}
