'use client'

import { useSession, signOut } from 'next-auth/react'
import Link from 'next/link'
import { LogOut, User as UserIcon, Loader2 } from 'lucide-react'
import { useState } from 'react'

export function UserButton() {
    const { data: session, status } = useSession()
    const [isMenuOpen, setIsMenuOpen] = useState(false)

    if (status === 'loading') {
        return <Loader2 className="w-5 h-5 animate-spin text-slate-400" />
    }

    if (status === 'unauthenticated') {
        return (
            <Link
                href="/login"
                className="text-sm font-medium text-slate-600 dark:text-slate-300 hover:text-blue-600 dark:hover:text-blue-400 transition-colors"
            >
                Войти
            </Link>
        )
    }

    const userInitial = session?.user?.name?.[0]?.toUpperCase() || 'U'

    return (
        <div className="relative">
            <button
                onClick={() => setIsMenuOpen(!isMenuOpen)}
                className="w-9 h-9 bg-slate-100 dark:bg-slate-800 rounded-full flex items-center justify-center border border-slate-200 dark:border-slate-700 hover:border-blue-500 transition-colors"
            >
                {session?.user?.image ? (
                    <img
                        src={session.user.image}
                        alt="Avatar"
                        className="w-full h-full rounded-full object-cover"
                    />
                ) : (
                    <span className="font-semibold text-slate-600 dark:text-slate-300">{userInitial}</span>
                )}
            </button>

            {isMenuOpen && (
                <>
                    <div
                        className="fixed inset-0 z-40"
                        onClick={() => setIsMenuOpen(false)}
                    />
                    <div className="absolute right-0 mt-2 w-48 bg-white dark:bg-slate-900 rounded-xl shadow-xl border border-slate-100 dark:border-slate-800 py-1 z-50 overflow-hidden">
                        <div className="px-4 py-3 border-b border-slate-100 dark:border-slate-800">
                            <p className="text-sm font-medium text-slate-900 dark:text-white truncate">
                                {session?.user?.name || 'Пользователь'}
                            </p>
                            <p className="text-xs text-slate-500 dark:text-slate-400 truncate">
                                {session?.user?.email}
                            </p>
                        </div>

                        <button
                            onClick={() => signOut({ callbackUrl: '/' })}
                            className="w-full px-4 py-2 text-sm text-left text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 flex items-center gap-2 transition-colors"
                        >
                            <LogOut className="w-4 h-4" />
                            Выйти
                        </button>
                    </div>
                </>
            )}
        </div>
    )
}
