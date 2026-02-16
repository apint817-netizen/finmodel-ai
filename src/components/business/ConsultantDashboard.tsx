"use client";

import { useState, useEffect } from "react";
import { ArrowUpRight, Calendar, CreditCard, DollarSign, Download, ExternalLink, MoreVertical, PieChart, TrendingUp, AlertTriangle, Wallet } from "lucide-react";
import { TransactionManager } from "./TransactionManager";
import { Transaction, calculateTax, TaxSystem } from "@/lib/business-logic";
import { formatCurrency } from "@/lib/calculations";

interface ConsultantDashboardProps {
    data: any; // Business Profile
}

export function ConsultantDashboard({ data }: ConsultantDashboardProps) {
    // Local State for Transactions (persistence via localStorage in real app would be better wrapper)
    const [transactions, setTransactions] = useState<Transaction[]>([]);
    const [metrics, setMetrics] = useState({
        income: 0,
        expense: 0,
        taxToPay: 0,
        profit: 0,
        taxLoad: 0
    });

    useEffect(() => {
        // Load transactions
        const saved = localStorage.getItem(`finmodel_transactions_${data.name}`);
        if (saved) {
            setTransactions(JSON.parse(saved));
        } else {
            // Seed some data for MVP
            const initial: Transaction[] = [
                { id: "1", date: new Date().toISOString(), amount: 150000, type: "income", category: "Продажи", description: "Поступление от клиента А" },
                { id: "2", date: new Date(Date.now() - 86400000 * 2).toISOString(), amount: 35000, type: "expense", category: "Аренда", description: "Аренда офиса" },
            ];
            setTransactions(initial);
        }
    }, [data.name]);

    useEffect(() => {
        // Recalculate metrics when transactions change
        if (transactions.length > 0) {
            localStorage.setItem(`finmodel_transactions_${data.name}`, JSON.stringify(transactions));
        }

        const result = calculateTax(transactions, data.taxSystem as TaxSystem);
        setMetrics({
            income: result.income,
            expense: result.expense,
            taxToPay: result.tax,
            profit: result.profit,
            taxLoad: result.income > 0 ? parseFloat(((result.tax / result.income) * 100).toFixed(1)) : 0
        });

    }, [transactions, data.taxSystem, data.name]);

    const handleAddTransaction = (t: Omit<Transaction, "id">) => {
        const newT = { ...t, id: crypto.randomUUID() };
        setTransactions(prev => [newT, ...prev].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()));
    };

    const handleAddMultipleTransactions = (txs: Omit<Transaction, "id">[]) => {
        const newTxs = txs.map(t => ({ ...t, id: crypto.randomUUID() }));
        // Merge and sort
        setTransactions(prev => [...newTxs, ...prev].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()));
    };

    const handleDeleteTransaction = (id: string) => {
        setTransactions(prev => prev.filter(t => t.id !== id));
    };

    const handleUpdateTransaction = (id: string, updates: Partial<Transaction>) => {
        setTransactions(prev => prev.map(t => t.id === id ? { ...t, ...updates } : t));
    };

    // Calendar & Notifications Logic (Dynamic for 2026)
    const currentDate = new Date();
    const currentYear = currentDate.getFullYear();
    const currentMonth = currentDate.getMonth(); // 0-11

    // Determine next tax payment
    let nextPaymentDate = "";
    let status: 'pending' | 'future' = 'pending';

    // Tax schedule for USN 2026
    if (currentMonth < 3 || (currentMonth === 3 && currentDate.getDate() <= 28)) { // Before Apr 28
        nextPaymentDate = `28 апреля ${currentYear}`;
    } else if (currentMonth < 6 || (currentMonth === 6 && currentDate.getDate() <= 28)) { // Before Jul 28
        nextPaymentDate = `28 июля ${currentYear}`;
    } else if (currentMonth < 9 || (currentMonth === 9 && currentDate.getDate() <= 28)) { // Before Oct 28
        nextPaymentDate = `28 октября ${currentYear}`;
    } else {
        nextPaymentDate = `28 апреля ${currentYear + 1}`;
    }

    const taxSystem = data.taxSystem;
    // Tax Calculation Logic
    const stats = calculateTax(transactions, taxSystem);

    // Calculate breakdown by system for display
    const patentIncome = transactions
        .filter(t => t.taxSystem === 'patent' && t.type === 'income')
        .reduce((sum, t) => sum + t.amount, 0);

    const usnIncome = stats.income - patentIncome;

    const safeLimit = 6.0;

    return (
        <div className="space-y-6 animate-in fade-in duration-500 pb-20">
            {/* Status Banner */}
            <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 border border-slate-200 dark:border-slate-800 shadow-sm relative overflow-hidden">
                <div className="absolute top-0 right-0 w-64 h-64 bg-blue-500/5 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2"></div>

                <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
                    <div>
                        <div className="flex items-center gap-2 mb-2">
                            <span className="bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 px-2.5 py-1 rounded-full text-xs font-semibold uppercase tracking-wide">
                                {taxSystem === 'usn_6' ? 'УСН 6%' : taxSystem === 'usn_15' ? 'УСН 15%' : 'ОСНО'}
                            </span>
                            {patentIncome > 0 && (
                                <span className="bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-300 px-2.5 py-1 rounded-full text-xs font-semibold uppercase tracking-wide">
                                    + Патент
                                </span>
                            )}
                            <span className="text-slate-400 text-sm">•</span>
                            <span className="text-slate-500 dark:text-slate-400 text-sm font-medium">Следующая уплата: {nextPaymentDate}</span>
                        </div>
                        <h2 className="text-3xl font-bold text-slate-900 dark:text-white mb-1">
                            {formatCurrency(stats.tax)}
                        </h2>
                        <p className="text-slate-500 dark:text-slate-400 text-sm">
                            Примерный налог к уплате (без учета взносов)
                        </p>
                    </div>

                    <div className="flex gap-3">
                        <button className="flex-1 md:flex-none bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-xl font-semibold transition-all shadow-lg shadow-blue-500/20 active:scale-95 flex items-center justify-center gap-2">
                            <ArrowUpRight className="w-5 h-5" />
                            Оплатить
                        </button>
                    </div>
                </div>
            </div>

            {/* Quick Stats */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-200 dark:border-slate-800">
                    <div className="flex items-center gap-2 mb-4">
                        <div className="w-8 h-8 rounded-lg bg-emerald-100 dark:bg-emerald-900/20 flex items-center justify-center text-emerald-600">
                            <Wallet className="w-4 h-4" />
                        </div>
                        <span className="text-slate-500 font-medium">Доход (Всего)</span>
                    </div>
                    <p className="text-2xl font-bold text-slate-900 dark:text-white mb-1">{formatCurrency(stats.income)}</p>
                    <div className="text-xs text-slate-400 flex flex-col gap-0.5">
                        <span>УСН: {formatCurrency(usnIncome)}</span>
                        <span>Патент: {formatCurrency(patentIncome)}</span>
                    </div>
                </div>

            </div>

            {/* Main Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 h-[800px] lg:h-auto">

                {/* Left Column: Stats & Transactions */}
                <div className="lg:col-span-2 space-y-6 flex flex-col">
                    {/* Quick Stats Cards */}
                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                        <div className="p-5 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm hover:shadow-md transition-shadow">
                            <div className="flex items-center gap-2 text-slate-500 dark:text-slate-400 mb-2">
                                <div className="p-1.5 bg-blue-100 dark:bg-blue-900/30 text-blue-600 rounded-lg">
                                    <DollarSign className="w-4 h-4" />
                                </div>
                                <span className="text-xs font-bold uppercase tracking-wider">Доход</span>
                            </div>
                            <p className="text-xl md:text-2xl font-bold text-slate-900 dark:text-white truncate">
                                {formatCurrency(metrics.income)}
                            </p>
                        </div>
                        <div className="p-5 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm hover:shadow-md transition-shadow">
                            <div className="flex items-center gap-2 text-slate-500 dark:text-slate-400 mb-2">
                                <div className="p-1.5 bg-purple-100 dark:bg-purple-900/30 text-purple-600 rounded-lg">
                                    <PieChart className="w-4 h-4" />
                                </div>
                                <span className="text-xs font-bold uppercase tracking-wider">Нагрузка</span>
                            </div>
                            <div className="flex items-baseline gap-2">
                                <p className="text-xl md:text-2xl font-bold text-slate-900 dark:text-white">{metrics.taxLoad}%</p>
                                <span className="text-xs font-medium text-emerald-600 bg-emerald-50 dark:bg-emerald-900/20 px-2 py-0.5 rounded-full">
                                    Норма {safeLimit}%
                                </span>
                            </div>
                        </div>
                        <div className="p-5 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm hover:shadow-md transition-shadow">
                            <div className="flex items-center gap-2 text-slate-500 dark:text-slate-400 mb-2">
                                <div className="p-1.5 bg-orange-100 dark:bg-orange-900/30 text-orange-600 rounded-lg">
                                    <ArrowUpRight className="w-4 h-4" />
                                </div>
                                <span className="text-xs font-bold uppercase tracking-wider">Прибыль</span>
                            </div>
                            <p className={`text-xl md:text-2xl font-bold truncate ${metrics.profit >= 0 ? 'text-slate-900 dark:text-white' : 'text-red-500'}`}>
                                {formatCurrency(metrics.profit)}
                            </p>
                        </div>
                    </div>

                    {/* Transaction Manager Component */}
                    <div className="flex-1 min-h-[400px]">
                        <TransactionManager
                            transactions={transactions}
                            onAdd={handleAddTransaction}
                            onAddMultiple={handleAddMultipleTransactions}
                            onDelete={handleDeleteTransaction}
                            onUpdate={handleUpdateTransaction}
                        />
                    </div>
                </div>

                {/* Right Column: Suggestions & Calendar */}
                <div className="space-y-6">
                    {/* AI Suggestions */}
                    <div className="bg-indigo-50 dark:bg-indigo-900/10 rounded-3xl p-6 border border-indigo-100 dark:border-indigo-900/30 relative overflow-hidden group">
                        <div className="absolute top-0 right-0 w-32 h-32 bg-indigo-500/10 rounded-full blur-2xl -mr-10 -mt-10 group-hover:bg-indigo-500/20 transition-colors"></div>

                        <div className="flex items-center gap-2 mb-4 relative z-10">
                            <div className="p-2 bg-indigo-100 dark:bg-indigo-900/50 rounded-xl text-indigo-600 dark:text-indigo-400 shadow-sm">
                                <TrendingUp className="w-5 h-5" />
                            </div>
                            <h2 className="font-bold text-slate-900 dark:text-white">Совет AI</h2>
                        </div>

                        {metrics.taxLoad > safeLimit ? (
                            <p className="text-sm text-slate-700 dark:text-slate-300 mb-4 leading-relaxed relative z-10">
                                Ваша налоговая нагрузка <strong>{metrics.taxLoad}%</strong>, что выше нормы. Проверьте, учли ли вы все расходы или страховые взносы для уменьшения базы.
                            </p>
                        ) : (
                            <p className="text-sm text-slate-700 dark:text-slate-300 mb-4 leading-relaxed relative z-10">
                                Вы можете уменьшить налог УСН на сумму уже уплаченных страховых взносов. Не забудьте подать уведомление до 25 апреля.
                            </p>
                        )}

                        <button className="w-full py-3 bg-indigo-600 text-white rounded-xl text-sm font-semibold hover:bg-indigo-700 transition-all shadow-md hover:shadow-lg relative z-10 hover:-translate-y-0.5">
                            Анализировать расходы
                        </button>
                    </div>

                    {/* Upcoming Payments List */}
                    <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 p-6 shadow-sm">
                        <div className="flex items-center gap-2 mb-6">
                            <Calendar className="w-5 h-5 text-slate-400" />
                            <h2 className="text-lg font-bold text-slate-900 dark:text-white">Календарь оплат</h2>
                        </div>
                        <div className="relative pl-4 border-l-2 border-slate-100 dark:border-slate-800 space-y-6">
                            {[
                                { date: "25 апр", title: "Аванс УСН за Q1", amount: formatCurrency(metrics.taxToPay), status: "pending" },
                                { date: "28 апр", title: "Страховые взносы", amount: "12 500 ₽", status: "future" },
                            ].map((event, idx) => (
                                <div key={idx} className="relative group">
                                    <div className={`absolute -left-[21px] top-1.5 w-3 h-3 rounded-full border-2 border-white dark:border-slate-900 transition-colors ${event.status === 'pending' ? 'bg-amber-500 group-hover:bg-amber-400' : 'bg-slate-300'}`}></div>
                                    <div className="flex justify-between items-start">
                                        <div>
                                            <p className="text-xs font-bold text-slate-500 uppercase tracking-wide mb-0.5">{event.date}</p>
                                            <p className="font-medium text-slate-900 dark:text-white">{event.title}</p>
                                        </div>
                                        <p className="text-sm font-bold text-slate-900 dark:text-white">{event.amount}</p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>

            </div>
        </div>
    );
}
