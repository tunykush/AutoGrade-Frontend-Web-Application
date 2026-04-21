'use client'

import Link from 'next/link'
import { useEffect, useState, useRef } from 'react'

export default function EdgenTopBar() {
  const [username, setUsername] = useState('A')
  const [menuOpen, setMenuOpen] = useState(false)
  const menuRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    // Read username from the auth_username cookie 
    const match = document.cookie.match(/auth_username=([^;]+)/)
    if (match) {
      setUsername(decodeURIComponent(match[1]).charAt(0).toUpperCase())
    }

    function handleClick(e: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setMenuOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClick)
    return () => document.removeEventListener('mousedown', handleClick)
  }, [])

  async function handleSignOut() {
    await fetch('/api/signout', { method: 'POST' })
    window.location.href = '/signin'
  }

  return (
    <header className="bg-[#1a1f2e] px-6 py-3 flex items-center justify-between">
      <Link href="/papers" className="flex items-center gap-2">
        <div className="w-8 h-8 bg-white rounded-lg flex items-center justify-center">
          <svg viewBox="0 0 24 24" className="w-5 h-5 text-[#1a1f2e]" fill="currentColor">
            <path d="M12 3L1 9l11 6 9-4.91V17h2V9L12 3zM5 13.18v4L12 21l7-3.82v-4L12 17l-7-3.82z"/>
          </svg>
        </div>
        <span className="text-white font-semibold text-base">Edgen AI</span>
      </Link>

      <div className="flex items-center gap-4">
        <Link href="/papers" className="text-gray-300 text-sm hover:text-white transition">
          My Papers
        </Link>

        <div className="relative" ref={menuRef}>
          <button
            onClick={() => setMenuOpen(prev => !prev)}
            className="w-8 h-8 rounded-full bg-[#5B21B6] flex items-center justify-center text-white text-sm font-bold hover:bg-[#4C1D95] transition cursor-pointer"
          >
            {username}
          </button>

          {menuOpen && (
            <div className="absolute right-0 mt-2 w-48 bg-white rounded-xl shadow-lg border border-gray-100 py-1 z-50">
              <Link
                href="/dashboard"
                className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-50"
                onClick={() => setMenuOpen(false)}
              >
                ⚙️ Account Settings
              </Link>
              <hr className="my-1 border-gray-100" />
              <button
                onClick={handleSignOut}
                className="w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-red-50"
              >
                ↪ Sign out
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  )
}