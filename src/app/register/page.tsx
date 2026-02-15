'use client'

import { useActionState } from 'react'
import { registerUser } from '@/app/actions/auth'
import Link from 'next/link'
import { Loader2, UserPlus } from 'lucide-react'

const initialState = {
    message: '',
    errors: {},
}

export default function RegisterPage() {
    const [state, formAction, isPending] = useActionState(registerUser, initialState)

    return (
        <div className="min-h-screen bg-slate-50 dark:bg-slate-950 flex items-center justify-center p-4">
            <div className="w-full max-w-md bg-white dark:bg-slate-900 rounded-2xl shadow-xl overflow-hidden border border-slate-200 dark:border-slate-800">
                <div className="p-8">
                    <div className="text-center mb-8">
                        <h1 className="text-2xl font-bold text-slate-900 dark:text-white mb-2">
                            Регистрация
                        </h1>
                        <p className="text-slate-500 dark:text-slate-400">
                            Создайте аккаунт для сохранения проектов
                        </p>
                    </div>

                    <form action={formAction} className="space-y-4">
                        <div>
                            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                                Имя
                            </label>
                            <input
                                name="name"
                                type="text"
                                required
                                className="w-full px-4 py-2 rounded-lg bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all text-slate-900 dark:text-white"
                                placeholder="Иван Иванов"
                            />
                            {state.errors?.name && (
                                <p className="text-red-500 text-xs mt-1">{state.errors.name[0]}</p>
                            )}
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                                Email
                            </label>
                            <input
                                name="email"
                                type="email"
                                required
                                className="w-full px-4 py-2 rounded-lg bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all text-slate-900 dark:text-white"
                                placeholder="name@example.com"
                            />
                            {state.errors?.email && (
                                <p className="text-red-500 text-xs mt-1">{state.errors.email[0]}</p>
                            )}
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                                Пароль
                            </label>
                            <input
                                name="password"
                                type="password"
                                required
                                className="w-full px-4 py-2 rounded-lg bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all text-slate-900 dark:text-white"
                                placeholder="••••••••"
                            />
                            {state.errors?.password && (
                                <p className="text-red-500 text-xs mt-1">{state.errors.password[0]}</p>
                            )}
                        </div>

                        {state.message && (
                            <div className="p-3 rounded-lg bg-red-50 dark:bg-red-900/30 text-red-600 dark:text-red-400 text-sm">
                                {state.message}
                            </div>
                        )}

                        <button
                            type="submit"
                            disabled={isPending}
                            className="w-full py-2.5 px-4 bg-emerald-600 hover:bg-emerald-700 text-white font-medium rounded-lg transition-colors flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            {isPending ? (
                                <Loader2 className="w-4 h-4 animate-spin" />
                            ) : (
                                <>
                                    <UserPlus className="w-4 h-4" />
                                    Создать аккаунт
                                </>
                            )}
                        </button>
                    </form>

                    <div className="mt-6 text-center text-sm">
                        <span className="text-slate-500 dark:text-slate-400">Уже есть аккаунт? </span>
                        <Link href="/login" className="text-blue-600 hover:text-blue-500 font-medium">
                            Войти
                        </Link>
                    </div>
                </div>
            </div>
        </div>
    )
}
