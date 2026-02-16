"use client";

import { Bell, FileText, Plus, Sun, TrendingUp, Wallet } from "lucide-react";

interface BusinessHeaderProps {
    userName: string;
    projectName: string;
    metrics: {
        balance: number;
        taxToPay: number;
        risksCount: number;
    };
}

export function BusinessHeader({ userName, projectName, metrics }: BusinessHeaderProps) {
    const today = new Date().toLocaleDateString("ru-RU", {
        weekday: "long",
        day: "numeric",
        month: "long",
    });

    // Capitalize first letter of the day
    const formattedDate = today.charAt(0).toUpperCase() + today.slice(1);

    return (
        <div className="mb-8 animate-in slide-in-from-top-4 duration-500">
            {/* Top Bar: Greeting & Actions */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8">
                <div>
                    <div className="flex items-center gap-2 text-slate-500 dark:text-slate-400 text-sm font-medium mb-1">
                        <Sun className="w-4 h-4 text-orange-400" />
                        {formattedDate}
                    </div>
                    <h1 className="text-3xl font-bold text-slate-900 dark:text-white tracking-tight">
                        Доброе утро, {userName}! <span className="wave inline-block origin-[70%_70%] animate-wave">👋</span>
                    </h1>
                    <p className="text-slate-500 dark:text-slate-400 mt-1">
                        Ваш бизнес <span className="font-semibold text-slate-700 dark:text-slate-300">"{projectName}"</span> работает стабильно.
                    </p>
                </div>

                <div className="flex gap-3">
                    <button className="p-2.5 rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors relative group shadow-sm hover:shadow">
                        <Bell className="w-5 h-5" />
                        <span className="absolute top-2.5 right-2.5 w-2 h-2 bg-red-500 rounded-full ring-2 ring-white dark:ring-slate-800"></span>
                    </button>
                    <button className="px-5 py-2.5 bg-slate-900 dark:bg-white hover:bg-slate-800 dark:hover:bg-slate-200 text-white dark:text-slate-900 rounded-xl font-medium shadow-lg hover:shadow-xl transition-all flex items-center gap-2 text-sm active:scale-95">
                        <Plus className="w-4 h-4" />
                        Новая сделка
                    </button>
                </div>
            </div>

            {/* Quick Metrics Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="p-6 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm hover:shadow-md transition-shadow relative overflow-hidden group">
                    <div className="absolute right-0 top-0 w-24 h-24 bg-blue-500/5 rounded-bl-[100px] pointer-events-none group-hover:bg-blue-500/10 transition-colors"></div>
                    <div className="flex items-start justify-between mb-4 relative z-10">
                        <div className="p-2 bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400 rounded-lg">
                            <Wallet className="w-5 h-5" />
                        </div>
                        <span className="text-xs font-semibold text-green-600 bg-green-50 dark:bg-green-900/20 dark:text-green-400 px-2 py-1 rounded-full flex items-center gap-1">
                            <TrendingUp className="w-3 h-3" />
                            +12%
                        </span>
                    </div>
                    <div className="relative z-10">
                        <span className="text-slate-500 dark:text-slate-400 text-sm font-medium">Свободные средства</span>
                        <h3 className="text-2xl font-bold text-slate-900 dark:text-white mt-1">
                            {metrics.balance.toLocaleString("ru-RU")} ₽
                        </h3>
                    </div>
                </div>

                <div className="p-6 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm hover:shadow-md transition-shadow relative overflow-hidden group">
                    <div className="absolute right-0 top-0 w-24 h-24 bg-amber-500/5 rounded-bl-[100px] pointer-events-none group-hover:bg-amber-500/10 transition-colors"></div>
                    <div className="flex items-start justify-between mb-4 relative z-10">
                        <div className="p-2 bg-amber-50 dark:bg-amber-900/20 text-amber-600 dark:text-amber-400 rounded-lg">
                            <FileText className="w-5 h-5" />
                        </div>
                        <span className="text-xs font-medium text-slate-500 dark:text-slate-400">
                            до 25 апр
                        </span>
                    </div>
                    <div className="relative z-10">
                        <span className="text-slate-500 dark:text-slate-400 text-sm font-medium">К уплате (Налоги)</span>
                        <h3 className="text-2xl font-bold text-slate-900 dark:text-white mt-1">
                            {metrics.taxToPay.toLocaleString("ru-RU")} ₽
                        </h3>
                    </div>
                </div>

                <div className="p-6 bg-gradient-to-br from-slate-900 to-slate-800 text-white rounded-2xl shadow-lg relative overflow-hidden group cursor-pointer transition-all hover:scale-[1.02]">
                    <div className="absolute inset-0 bg-white/5 opacity-0 group-hover:opacity-100 transition-opacity"></div>
                    <div className="relative z-10 h-full flex flex-col justify-between">
                        <div className="flex items-center justify-between">
                            <span className="text-slate-300 text-sm font-medium">Ассистент</span>
                            <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse shadow-[0_0_10px_rgba(74,222,128,0.5)]"></div>
                        </div>
                        <div className="mt-4">
                            <p className="font-medium text-lg leading-snug">
                                "Саркис, у вас 2 новых контрагента требуют проверки."
                            </p>
                            <button className="mt-4 text-sm font-semibold text-blue-300 hover:text-blue-200 transition-colors flex items-center gap-1 group-hover:gap-2">
                                Проверить сейчас <span>→</span>
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
