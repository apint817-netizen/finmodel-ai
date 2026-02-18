"use client";

import { useState, useEffect } from "react";
import { ArrowUpRight, Calendar, PieChart, Wallet, Upload, Settings } from "lucide-react";
import { TransactionManager } from "./TransactionManager";
import { BankUpload } from "./BankUpload";
import { PaymentModal } from "./PaymentModal";
import { AIAnalysisPanel } from "./AIAnalysisPanel";
import { Transaction, calculateTax, TaxSystem } from "@/lib/business-logic";
import { formatCurrency } from "@/lib/calculations";
import { motion, AnimatePresence } from "framer-motion";

interface ConsultantDashboardProps {
    data: any; // Business Profile
}

export function ConsultantDashboard({ data }: ConsultantDashboardProps) {
    const [transactions, setTransactions] = useState<Transaction[]>([]);
    const [accountTags, setAccountTags] = useState<Record<string, string>>({}); // Mapping Account -> Name

    // Profile State (Local copy for editing)
    const [profile, setProfile] = useState<any>(data);
    const [isEditingProfile, setIsEditingProfile] = useState(false);

    // Metrics State
    const [metrics, setMetrics] = useState({
        income: 0,
        expense: 0,
        taxToPay: 0,
        profit: 0,
        taxLoad: 0
    });
    const [isUploadModalOpen, setIsUploadModalOpen] = useState(false);
    const [isPaymentModalOpen, setIsPaymentModalOpen] = useState(false);

    // Determine Main Tax System (USN or OSNO) from the array or string
    const mainTaxSystem: TaxSystem = (() => {
        const systems = Array.isArray(profile.taxSystems) ? profile.taxSystems : [profile.taxSystem];
        if (systems.includes('usn_6')) return 'usn_6';
        if (systems.includes('usn_15')) return 'usn_15';
        if (systems.includes('osno')) return 'osno';
        return 'usn_6'; // Fallback
    })();

    const hasPatent = Array.isArray(profile.taxSystems)
        ? profile.taxSystems.includes('patent')
        : profile.taxSystem === 'patent';

    useEffect(() => {
        // Load transactions
        const saved = localStorage.getItem(`finmodel_transactions_${profile.name}`);
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

        // Load account tags
        const savedTags = localStorage.getItem(`finmodel_tags_${profile.name}`);
        if (savedTags) {
            try {
                setAccountTags(JSON.parse(savedTags));
            } catch (e) { console.error(e); }
        }
    }, [profile.name]);

    useEffect(() => {
        // Recalculate metrics when transactions change
        if (transactions.length > 0) {
            localStorage.setItem(`finmodel_transactions_${profile.name}`, JSON.stringify(transactions));
        }
        localStorage.setItem(`finmodel_tags_${profile.name}`, JSON.stringify(accountTags));

        // Use the Determined Main System
        const result = calculateTax(transactions, mainTaxSystem);

        setMetrics({
            income: result.income,
            expense: result.expense,
            taxToPay: result.tax,
            profit: result.profit,
            taxLoad: result.income > 0 ? parseFloat(((result.tax / result.income) * 100).toFixed(1)) : 0
        });

    }, [transactions, mainTaxSystem, profile.name]);

    // Save profile updates to localStorage (and update state)
    const handleSaveProfile = (newProfile: any) => {
        // Updated Logic: Check if patent account changed or is set, and update existing income transactions
        let updatedTransactions = [...transactions];
        if (newProfile.patentAccount && newProfile.patentAccount.length >= 4) {
            updatedTransactions = updatedTransactions.map(t => {
                // If it's income AND matches account AND not already patent
                if (t.type === 'income' && t.accountNumber) {
                    if (t.accountNumber.endsWith(newProfile.patentAccount) || t.accountNumber.includes(newProfile.patentAccount)) {
                        return { ...t, taxSystem: 'patent' };
                    }
                }
                return t;
            });
            setTransactions(updatedTransactions);
        }

        // In real app, call API
        localStorage.setItem("finmodel_business_profile", JSON.stringify(newProfile));
        setProfile(newProfile);
        setIsEditingProfile(false);
    };

    const handleAddTransaction = (t: Omit<Transaction, "id">) => {
        const newT = { ...t, id: crypto.randomUUID() };
        setTransactions(prev => [newT, ...prev].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()));
    };

    const handleAddMultipleTransactions = (txs: Omit<Transaction, "id">[]) => {
        const newTxs = txs.map(t => ({ ...t, id: crypto.randomUUID() }));
        setTransactions(prev => [...newTxs, ...prev].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()));
        setIsUploadModalOpen(false);
    };

    const handleDeleteTransaction = (id: string) => {
        setTransactions(prev => prev.filter(t => t.id !== id));
    };

    const handleUpdateTransaction = (id: string, updates: Partial<Transaction>) => {
        setTransactions(prev => prev.map(t => t.id === id ? { ...t, ...updates } : t));
    };

    const handleUpdateTags = (account: string, name: string) => {
        setAccountTags(prev => ({ ...prev, [account]: name }));
    };

    // Calendar logic
    const currentDate = new Date();
    const currentYear = currentDate.getFullYear();
    const nextPaymentDate = "28 апреля " + currentYear; // Simplified for demo

    // Breakdown
    const patentIncome = transactions
        .filter(t => t.taxSystem === 'patent' && t.type === 'income')
        .reduce((sum, t) => sum + t.amount, 0);
    const usnIncome = metrics.income - patentIncome;
    const safeLimit = 6.0;

    return (
        <div className="space-y-8 animate-in fade-in duration-500 pb-20 max-w-[1600px] mx-auto relative">

            {/* Payment Modal */}
            <PaymentModal
                isOpen={isPaymentModalOpen}
                onClose={() => setIsPaymentModalOpen(false)}
                taxAmount={metrics.taxToPay}
                inn={profile.inn}
                businessName={profile.name}
                taxSystem={mainTaxSystem === 'usn_6' ? 'УСН 6%' : mainTaxSystem === 'usn_15' ? 'УСН 15%' : 'ОСНО'}
            />

            {/* Edit Profile Modal */}
            <AnimatePresence>
                {isEditingProfile && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4"
                    >
                        <motion.div
                            initial={{ scale: 0.95, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            exit={{ scale: 0.95, opacity: 0 }}
                            className="bg-white dark:bg-slate-900 rounded-2xl w-full max-w-lg shadow-2xl overflow-hidden"
                        >
                            <div className="p-6 border-b border-slate-100 dark:border-slate-800 flex justify-between items-center">
                                <h3 className="text-xl font-bold text-slate-900 dark:text-white">Настройки профиля</h3>
                                <button onClick={() => setIsEditingProfile(false)} className="text-slate-400 hover:text-slate-600">×</button>
                            </div>
                            <div className="p-6 space-y-4">
                                <div>
                                    <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Название</label>
                                    <input
                                        type="text"
                                        className="w-full px-3 py-2 border border-slate-200 dark:border-slate-700 rounded-lg bg-slate-50 dark:bg-slate-800"
                                        value={profile.name}
                                        onChange={e => setProfile({ ...profile, name: e.target.value })}
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">ИНН</label>
                                    <input
                                        type="text"
                                        className="w-full px-3 py-2 border border-slate-200 dark:border-slate-700 rounded-lg bg-slate-50 dark:bg-slate-800"
                                        value={profile.inn || ''}
                                        onChange={e => setProfile({ ...profile, inn: e.target.value })}
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">Налоговые режимы</label>
                                    <div className="space-y-2">
                                        <label className="flex items-center gap-2">
                                            <input
                                                type="checkbox"
                                                checked={profile.taxSystems?.includes('patent') || false}
                                                onChange={e => {
                                                    const current = profile.taxSystems || [];
                                                    if (e.target.checked) setProfile({ ...profile, taxSystems: [...current, 'patent'] });
                                                    else setProfile({ ...profile, taxSystems: current.filter((s: string) => s !== 'patent') });
                                                }}
                                            />
                                            <span className="text-sm">Патент (ПСН)</span>
                                        </label>
                                        <select
                                            className="w-full px-3 py-2 border border-slate-200 dark:border-slate-700 rounded-lg bg-slate-50 dark:bg-slate-800 text-sm"
                                            value={mainTaxSystem}
                                            onChange={(e) => {
                                                const newMain = e.target.value;
                                                const current = profile.taxSystems || [];
                                                // Remove existing main systems
                                                const others = current.filter((s: string) => s === 'patent');
                                                setProfile({ ...profile, taxSystems: [...others, newMain] });
                                            }}
                                        >
                                            <option value="usn_6">УСН Доходы (6%)</option>
                                            <option value="usn_15">УСН Доходы-Расходы (15%)</option>
                                            <option value="osno">ОСНО</option>
                                        </select>
                                    </div>
                                </div>
                                {profile.taxSystems?.includes('patent') && (
                                    <div>
                                        <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Счет для Патента (4 цифры или номер)</label>
                                        <input
                                            type="text"
                                            className="w-full px-3 py-2 border border-slate-200 dark:border-slate-700 rounded-lg bg-slate-50 dark:bg-slate-800"
                                            value={profile.patentAccount || ''}
                                            onChange={e => setProfile({ ...profile, patentAccount: e.target.value })}
                                            placeholder="40802..."
                                        />
                                    </div>
                                )}
                            </div>
                            <div className="p-6 border-t border-slate-100 dark:border-slate-800 flex justify-end gap-3">
                                <button onClick={() => setIsEditingProfile(false)} className="px-4 py-2 text-slate-500 hover:text-slate-700">Отмена</button>
                                <button onClick={() => handleSaveProfile(profile)} className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700">Сохранить</button>
                            </div>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* 1. New Header / Status Section */}
            <div className="bg-white dark:bg-slate-900 rounded-3xl p-8 border border-slate-200 dark:border-slate-800 shadow-sm relative overflow-hidden">
                <div className="absolute -right-20 -top-20 w-96 h-96 bg-blue-500/5 rounded-full blur-3xl"></div>

                <div className="relative z-10 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
                    {/* Tax Status */}
                    <div className="lg:col-span-2">
                        <div className="flex flex-wrap items-center justify-between gap-3 mb-4">
                            <div className="flex flex-wrap items-center gap-3">
                                <span className="bg-blue-600 text-white px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider shadow-md shadow-blue-500/20">
                                    {mainTaxSystem === 'usn_6' ? 'УСН Доходы' : mainTaxSystem === 'usn_15' ? 'УСН Д-Р' : 'ОСНО'}
                                </span>
                                {hasPatent && (
                                    <span className="bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-300 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider border border-purple-200 dark:border-purple-800">
                                        + Патент
                                    </span>
                                )}
                            </div>
                            <button
                                onClick={() => setIsEditingProfile(true)}
                                className="text-slate-400 hover:text-white transition-colors p-2 hover:bg-white/10 rounded-full"
                                title="Настройки профиля"
                            >
                                <Settings className="w-5 h-5" />
                            </button>
                        </div>
                        <div className="flex items-baseline gap-4 mb-2">
                            <h2 className="text-4xl md:text-5xl font-bold text-slate-900 dark:text-white tracking-tight">
                                {formatCurrency(metrics.taxToPay)}
                            </h2>
                            <span className="text-slate-500 font-medium">к уплате</span>
                        </div>
                        <p className="text-slate-400 text-sm max-w-md">
                            Расчетный налог за текущий период. Не забудьте уменьшить его на сумму страховых взносов перед оплатой.
                        </p>

                        <div className="mt-6 flex flex-wrap gap-3">
                            <button
                                onClick={() => setIsPaymentModalOpen(true)}
                                className="bg-blue-600 hover:bg-blue-700 text-white px-5 py-2.5 rounded-xl font-semibold transition-all shadow-lg shadow-blue-500/20 flex items-center gap-2 active:scale-95"
                            >
                                <ArrowUpRight className="w-4 h-4" />
                                Оплатить ЕНС
                            </button>
                            <button
                                onClick={() => setIsUploadModalOpen(!isUploadModalOpen)}
                                className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 px-5 py-2.5 rounded-xl font-semibold transition-all flex items-center gap-2"
                            >
                                <Upload className="w-4 h-4" />
                                {isUploadModalOpen ? 'Скрыть загрузку' : 'Загрузить выписку'}
                            </button>
                        </div>
                    </div>

                    {/* Key Metrics Cards */}
                    <div className="bg-slate-50 dark:bg-slate-800/50 rounded-2xl p-5 border border-slate-100 dark:border-slate-700 flex flex-col justify-between">
                        <div className="flex items-start justify-between mb-4">
                            <div>
                                <p className="text-slate-500 text-xs font-bold uppercase tracking-wider mb-1">Оборот</p>
                                <p className="text-2xl font-bold text-slate-900 dark:text-white">{formatCurrency(metrics.income)}</p>
                            </div>
                            <div className="p-2 bg-emerald-100 dark:bg-emerald-900/20 text-emerald-600 rounded-lg">
                                <Wallet className="w-5 h-5" />
                            </div>
                        </div>
                        <div className="space-y-1.5">
                            <div className="flex justify-between text-xs">
                                <span className="text-slate-500">УСН</span>
                                <span className="font-medium dark:text-slate-300">{formatCurrency(usnIncome)}</span>
                            </div>
                            <div className="flex justify-between text-xs">
                                <span className="text-slate-500">Патент</span>
                                <span className="font-medium dark:text-slate-300">{formatCurrency(patentIncome)}</span>
                            </div>
                            <div className="w-full bg-slate-200 dark:bg-slate-700 h-1 rounded-full mt-2 overflow-hidden">
                                <div
                                    className="bg-blue-500 h-full"
                                    style={{ width: `${(usnIncome / metrics.income) * 100}%` }}
                                ></div>
                            </div>
                        </div>
                    </div>

                    <div className="bg-slate-50 dark:bg-slate-800/50 rounded-2xl p-5 border border-slate-100 dark:border-slate-700 flex flex-col justify-between">
                        <div className="flex items-start justify-between mb-4">
                            <div>
                                <p className="text-slate-500 text-xs font-bold uppercase tracking-wider mb-1">Прибыль</p>
                                <p className={`text-2xl font-bold ${metrics.profit > 0 ? 'text-slate-900 dark:text-white' : 'text-red-500'}`}>
                                    {formatCurrency(metrics.profit)}
                                </p>
                            </div>
                            <div className="p-2 bg-orange-100 dark:bg-orange-900/20 text-orange-600 rounded-lg">
                                <PieChart className="w-5 h-5" />
                            </div>
                        </div>
                        <div>
                            <p className="text-slate-500 text-xs font-bold uppercase tracking-wider mb-1">Нагрузка</p>
                            <div className="flex items-center gap-2">
                                <span className={`text-xl font-bold ${metrics.taxLoad > safeLimit ? 'text-amber-500' : 'text-slate-700 dark:text-slate-300'}`}>
                                    {metrics.taxLoad}%
                                </span>
                                <span className="text-xs text-slate-400">/ {safeLimit}% норма</span>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Upload Area (Collapsible) */}
                <AnimatePresence>
                    {isUploadModalOpen && (
                        <motion.div
                            initial={{ height: 0, opacity: 0 }}
                            animate={{ height: "auto", opacity: 1 }}
                            exit={{ height: 0, opacity: 0 }}
                            className="mt-6 border-t border-slate-100 dark:border-slate-800 pt-6"
                        >
                            <BankUpload
                                userInn={profile.inn || data.inn}
                                patentAccount={profile.patentAccount || data.patentAccount}
                                onUpload={handleAddMultipleTransactions}
                            />
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>

            {/* 2. Main Content Grid */}
            <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">

                {/* Left: Transaction Table (Takes 2 columns on large screens) */}
                <div className="xl:col-span-2 min-h-[600px] flex flex-col">
                    <TransactionManager
                        transactions={transactions}
                        accountTags={accountTags}
                        onUpdateTags={handleUpdateTags}
                        onAdd={handleAddTransaction}
                        onAddMultiple={handleAddMultipleTransactions}
                        onDelete={handleDeleteTransaction}
                        onUpdate={handleUpdateTransaction}
                    />
                </div>

                {/* Right: Sidebar (AI & Calendar) */}
                <div className="space-y-6">
                    {/* AI Analysis Panel */}
                    <AIAnalysisPanel
                        transactions={transactions}
                        profile={profile}
                        metrics={metrics}
                    />

                    {/* Tax Calendar */}
                    <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 p-6 shadow-sm">
                        <div className="flex items-center justify-between mb-6">
                            <h3 className="font-bold text-slate-900 dark:text-white flex items-center gap-2">
                                <Calendar className="w-5 h-5 text-slate-400" />
                                Календарь
                            </h3>
                        </div>

                        <div className="space-y-0">
                            {[
                                { date: "25 апр", title: "Аванс УСН (Q1)", sum: formatCurrency(metrics.taxToPay), active: true },
                                { date: "28 апр", title: "Страх. взносы", sum: "12 500 ₽", active: false },
                                { date: "25 июл", title: "Аванс УСН (Q2)", sum: "0 ₽", active: false },
                            ].map((item, i) => (
                                <div key={i} className="flex relative pl-6 pb-6 last:pb-0 border-l border-slate-200 dark:border-slate-800">
                                    <div className={`absolute -left-1.5 top-0 w-3 h-3 rounded-full border-2 border-white dark:border-slate-900 ${item.active ? 'bg-blue-600 ring-4 ring-blue-100 dark:ring-blue-900/30' : 'bg-slate-300'}`}></div>
                                    <div className="flex-1 -mt-1">
                                        <div className="flex justify-between mb-1">
                                            <span className="text-xs font-bold text-slate-500 uppercase tracking-wide">{item.date}</span>
                                        </div>
                                        <div className="flex justify-between items-center">
                                            <span className="font-medium text-slate-900 dark:text-white text-sm">{item.title}</span>
                                            <span className="font-bold text-slate-700 dark:text-slate-300 text-sm">{item.sum}</span>
                                        </div>
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
