"use client";

import { useState } from "react";
import { ArrowUpRight, Calendar, CreditCard, DollarSign, Download, ExternalLink, MoreVertical, PieChart, TrendingUp } from "lucide-react";

interface ConsultantDashboardProps {
    data: any; // Type strictly later
}

export function ConsultantDashboard({ data }: ConsultantDashboardProps) {
    // Mock metrics for MVP
    const metrics = {
        taxToPay: 42500,
        nextPaymentDate: "2024-04-25",
        taxLoad: 5.8, // %
        safeLimit: 6.0,
        paidThisYear: 120000,
    };

    return (
        <div className="space-y-8 animate-in fade-in duration-500">
            {/* Header / Status Banner */}
            <div className="bg-gradient-to-r from-slate-900 to-slate-800 dark:from-slate-800 dark:to-slate-900 rounded-3xl p-8 text-white relative overflow-hidden">
                <div className="absolute top-0 right-0 w-64 h-64 bg-white/5 rounded-full blur-3xl -mr-16 -mt-16 pointer-events-none"></div>

                <div className="relative z-10 flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
                    <div>
                        <div className="flex items-center gap-2 mb-2">
                            <span className="bg-emerald-500/20 text-emerald-300 px-3 py-1 rounded-full text-xs font-medium border border-emerald-500/30">
                                Всё под контролем
                            </span>
                            <span className="text-slate-400 text-sm">УСН Доходы (6%)</span>
                        </div>
                        <h1 className="text-3xl font-bold mb-1">{data.name}</h1>
                        <p className="text-slate-400 text-sm">ИНН {data.inn || "Не указан"}</p>
                    </div>

                    <div className="flex items-center gap-4">
                        <div className="text-right">
                            <p className="text-slate-400 text-sm mb-1">Ближайший налог</p>
                            <p className="text-2xl font-bold">{metrics.taxToPay.toLocaleString()} ₽</p>
                            <p className="text-slate-400 text-xs text-red-300">до {metrics.nextPaymentDate}</p>
                        </div>
                        <button className="bg-white text-slate-900 px-6 py-3 rounded-xl font-semibold hover:bg-slate-100 transition-colors flex items-center gap-2 shadow-lg">
                            <CreditCard className="w-5 h-5" />
                            Оплатить
                        </button>
                    </div>
                </div>
            </div>

            {/* Main Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

                {/* Left Column: Stats & Charts */}
                <div className="lg:col-span-2 space-y-6">
                    {/* Quick Stats */}
                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                        <div className="p-5 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800">
                            <div className="flex items-center gap-2 text-slate-500 dark:text-slate-400 mb-2">
                                <DollarSign className="w-4 h-4" />
                                <span className="text-xs font-medium uppercase">Выручка (год)</span>
                            </div>
                            <p className="text-2xl font-bold text-slate-900 dark:text-white">2.4M ₽</p>
                        </div>
                        <div className="p-5 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800">
                            <div className="flex items-center gap-2 text-slate-500 dark:text-slate-400 mb-2">
                                <PieChart className="w-4 h-4" />
                                <span className="text-xs font-medium uppercase">Налог. нагрузка</span>
                            </div>
                            <div className="flex items-baseline gap-2">
                                <p className="text-2xl font-bold text-slate-900 dark:text-white">{metrics.taxLoad}%</p>
                                <span className="text-xs text-emerald-500">Норма ({metrics.safeLimit}%)</span>
                            </div>
                        </div>
                        <div className="p-5 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800">
                            <div className="flex items-center gap-2 text-slate-500 dark:text-slate-400 mb-2">
                                <Calendar className="w-4 h-4" />
                                <span className="text-xs font-medium uppercase">Оплачено налогов</span>
                            </div>
                            <p className="text-2xl font-bold text-slate-900 dark:text-white">{metrics.paidThisYear.toLocaleString()} ₽</p>
                        </div>
                    </div>

                    {/* Transactions / Operations */}
                    <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 p-6">
                        <div className="flex items-center justify-between mb-6">
                            <h2 className="text-lg font-bold text-slate-900 dark:text-white">Последние операции</h2>
                            <button className="text-blue-600 text-sm font-medium hover:underline">Все операции</button>
                        </div>

                        <div className="space-y-4">
                            {[1, 2, 3].map((i) => (
                                <div key={i} className="flex items-center justify-between p-4 hover:bg-slate-50 dark:hover:bg-slate-800/50 rounded-xl transition-colors cursor-pointer group">
                                    <div className="flex items-center gap-4">
                                        <div className="w-10 h-10 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-slate-500">
                                            {i === 1 ? <ArrowUpRight className="w-5 h-5" /> : <TrendingUp className="w-5 h-5" />}
                                        </div>
                                        <div>
                                            <p className="font-medium text-slate-900 dark:text-white">Поступление от ООО "Клиент"</p>
                                            <p className="text-xs text-slate-500">14 фев, 15:30 • Основная деятельность</p>
                                        </div>
                                    </div>
                                    <div className="text-right">
                                        <p className="font-bold text-emerald-600">+150 000 ₽</p>
                                        <p className="text-xs text-slate-400 z-10 opacity-0 group-hover:opacity-100 transition-opacity">Налог: 9 000 ₽</p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>

                {/* Right Column: Suggestions & Calendar */}
                <div className="space-y-6">
                    {/* AI Suggestions */}
                    <div className="bg-indigo-50 dark:bg-indigo-900/10 rounded-3xl p-6 border border-indigo-100 dark:border-indigo-900/30">
                        <div className="flex items-center gap-2 mb-4">
                            <div className="p-2 bg-indigo-100 dark:bg-indigo-900/50 rounded-lg text-indigo-600 dark:text-indigo-400">
                                <TrendingUp className="w-5 h-5" />
                            </div>
                            <h2 className="font-bold text-slate-900 dark:text-white">Совет</h2>
                        </div>
                        <p className="text-sm text-slate-700 dark:text-slate-300 mb-4 leading-relaxed">
                            Вы можете уменьшить налог УСН на сумму уже уплаченных страховых взносов. Не забудьте подать уведомление до 25 апреля.
                        </p>
                        <button className="w-full py-2.5 bg-indigo-600 text-white rounded-xl text-sm font-medium hover:bg-indigo-700 transition-colors">
                            Подготовить уведомление
                        </button>
                    </div>

                    {/* Upcoming Payments List */}
                    <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 p-6">
                        <h2 className="text-lg font-bold text-slate-900 dark:text-white mb-4">Календарь</h2>
                        <div className="relative pl-4 border-l-2 border-slate-100 dark:border-slate-800 space-y-6">
                            {[
                                { date: "25 апр", title: "Аванс УСН за Q1", amount: "42 500 ₽", status: "pending" },
                                { date: "28 апр", title: "Страховые взносы", amount: "12 000 ₽", status: "future" },
                            ].map((event, idx) => (
                                <div key={idx} className="relative">
                                    <div className={`absolute -left-[21px] top-1.5 w-3 h-3 rounded-full border-2 border-white dark:border-slate-900 ${event.status === 'pending' ? 'bg-amber-500' : 'bg-slate-300'}`}></div>
                                    <p className="text-xs font-semibold text-slate-500 mb-1">{event.date}</p>
                                    <p className="font-medium text-slate-900 dark:text-white">{event.title}</p>
                                    <p className="text-sm text-slate-500">{event.amount}</p>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>

            </div>
        </div>
    );
}
