"use client";

import { useState, useEffect, useMemo } from "react";
import {
    ArrowUpRight, Calendar, PieChart, Wallet, Upload, Settings,
    LayoutDashboard, List, BarChart2, Bot, Download
} from "lucide-react";
import { TransactionManager } from "./TransactionManager";
import { BankUpload } from "./BankUpload";
import { PaymentModal } from "./PaymentModal";
import { AnalyticsTab } from "./AnalyticsTab";
import { AIAdvisorTab } from "./AIAdvisorTab";
import { Transaction, calculateTax, calculateNetTax, TaxSystem, TAX_DEADLINES_2026, INSURANCE_DEADLINES_2026, FIXED_CONTRIBUTIONS_2026 } from "@/lib/business-logic";
import { formatCurrency } from "@/lib/calculations";
import { motion, AnimatePresence } from "framer-motion";

interface ConsultantDashboardProps {
    data: any; // Business Profile
}

type TabId = "overview" | "transactions" | "analytics" | "ai";

const TABS: { id: TabId; label: string; icon: React.ElementType }[] = [
    { id: "overview", label: "Обзор", icon: LayoutDashboard },
    { id: "transactions", label: "Операции", icon: List },
    { id: "analytics", label: "Аналитика", icon: BarChart2 },
    { id: "ai", label: "AI-Советник", icon: Bot },
];

export function ConsultantDashboard({ data }: ConsultantDashboardProps) {
    const [activeTab, setActiveTab] = useState<TabId>("overview");
    const [transactions, setTransactions] = useState<Transaction[]>([]);
    const [accountTags, setAccountTags] = useState<Record<string, string>>({});

    // Profile State
    const [profile, setProfile] = useState<any>(data);
    const [isEditingProfile, setIsEditingProfile] = useState(false);

    // Metrics State
    const [metrics, setMetrics] = useState({
        income: 0,
        expense: 0,
        taxToPay: 0,
        netTaxToPay: 0,
        profit: 0,
        taxLoad: 0,
        grossTax: 0,
        contributions: 0,
    });

    const [isUploadModalOpen, setIsUploadModalOpen] = useState(false);
    const [isPaymentModalOpen, setIsPaymentModalOpen] = useState(false);
    const [pendingUpload, setPendingUpload] = useState<Transaction[] | null>(null);

    // Determine Main Tax System
    const mainTaxSystem: TaxSystem = (() => {
        const systems = Array.isArray(profile.taxSystems) ? profile.taxSystems : [profile.taxSystem];
        if (systems.includes('usn_6')) return 'usn_6';
        if (systems.includes('usn_15')) return 'usn_15';
        if (systems.includes('osno')) return 'osno';
        return 'usn_6';
    })();

    const hasPatent = Array.isArray(profile.taxSystems)
        ? profile.taxSystems.includes('patent')
        : profile.taxSystem === 'patent';

    const hasEmployees = profile.hasEmployees === true;

    useEffect(() => {
        const saved = localStorage.getItem(`finmodel_transactions_${profile.name}`);
        if (saved) {
            setTransactions(JSON.parse(saved));
        } else {
            const initial: Transaction[] = [
                { id: "1", date: new Date().toISOString(), amount: 150000, type: "income", category: "Продажи", description: "Поступление от клиента А" },
                { id: "2", date: new Date(Date.now() - 86400000 * 2).toISOString(), amount: 35000, type: "expense", category: "Аренда", description: "Аренда офиса" },
            ];
            setTransactions(initial);
        }
        const savedTags = localStorage.getItem(`finmodel_tags_${profile.name}`);
        if (savedTags) {
            try { setAccountTags(JSON.parse(savedTags)); } catch (e) { console.error(e); }
        }
    }, [profile.name]);

    useEffect(() => {
        if (transactions.length > 0) {
            localStorage.setItem(`finmodel_transactions_${profile.name}`, JSON.stringify(transactions));
        }
        localStorage.setItem(`finmodel_tags_${profile.name}`, JSON.stringify(accountTags));

        const result = calculateTax(transactions, mainTaxSystem);
        const netResult = calculateNetTax(result.tax, result.income, mainTaxSystem, hasEmployees);

        setMetrics({
            income: result.income,
            expense: result.expense,
            taxToPay: netResult.netTax,
            netTaxToPay: netResult.netTax,
            grossTax: result.tax,
            contributions: netResult.totalContributions,
            profit: result.income - result.expense - netResult.netTax,
            taxLoad: result.income > 0 ? parseFloat(((netResult.netTax / result.income) * 100).toFixed(1)) : 0,
        });
    }, [transactions, mainTaxSystem, profile.name, hasEmployees]);

    const handleSaveProfile = (newProfile: any) => {
        let updatedTransactions = [...transactions];
        if (newProfile.patentAccount && newProfile.patentAccount.length >= 4) {
            updatedTransactions = updatedTransactions.map(t => {
                if (t.type === 'income' && t.accountNumber) {
                    if (t.accountNumber.endsWith(newProfile.patentAccount) || t.accountNumber.includes(newProfile.patentAccount)) {
                        return { ...t, taxSystem: 'patent' };
                    }
                }
                return t;
            });
            setTransactions(updatedTransactions);
        }
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
        if (transactions.length > 0) {
            setPendingUpload(newTxs);
        } else {
            setTransactions(newTxs.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()));
            setIsUploadModalOpen(false);
        }
    };

    const confirmReplace = () => {
        if (!pendingUpload) return;
        setTransactions(pendingUpload.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()));
        setPendingUpload(null);
        setIsUploadModalOpen(false);
    };

    const confirmMerge = () => {
        if (!pendingUpload) return;
        setTransactions(prev => {
            const existingKeys = new Set(prev.map(t => `${t.date.slice(0, 10)}_${t.amount}_${(t.description || '').slice(0, 50)}`));
            const uniqueNew = pendingUpload.filter(t => {
                const key = `${t.date.slice(0, 10)}_${t.amount}_${(t.description || '').slice(0, 50)}`;
                return !existingKeys.has(key);
            });
            return [...uniqueNew, ...prev].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
        });
        setPendingUpload(null);
        setIsUploadModalOpen(false);
    };

    const cancelUpload = () => setPendingUpload(null);

    const handleDeleteTransaction = (id: string) => setTransactions(prev => prev.filter(t => t.id !== id));
    const handleUpdateTransaction = (id: string, updates: Partial<Transaction>) =>
        setTransactions(prev => prev.map(t => t.id === id ? { ...t, ...updates } : t));
    const handleUpdateTags = (account: string, name: string) =>
        setAccountTags(prev => ({ ...prev, [account]: name }));

    // Tax calendar — real 2026 dates
    const now = new Date();
    const currentYear = now.getFullYear();
    const currentQuarter = Math.floor(now.getMonth() / 3);

    const calendarItems = useMemo(() => {
        const items: { date: string; title: string; sum: string; active: boolean; overdue: boolean }[] = [];

        TAX_DEADLINES_2026.forEach(d => {
            const isCurrentQ = d.quarter - 1 === currentQuarter;
            const isPast = d.deadline < now;
            const qIncome = transactions
                .filter(t => t.type === 'income' && d.months.includes(new Date(t.date).getMonth()) && new Date(t.date).getFullYear() === currentYear)
                .reduce((s, t) => s + t.amount, 0);
            const qTax = mainTaxSystem === 'usn_6' ? qIncome * 0.06 : 0;
            const netResult = calculateNetTax(qTax, qIncome, mainTaxSystem, hasEmployees);

            items.push({
                date: d.deadline.toLocaleDateString('ru-RU', { day: 'numeric', month: 'short' }),
                title: d.label,
                sum: isCurrentQ ? formatCurrency(netResult.netTax) : "—",
                active: isCurrentQ && !isPast,
                overdue: isPast && isCurrentQ,
            });
        });

        INSURANCE_DEADLINES_2026.forEach(d => {
            items.push({
                date: d.deadline.toLocaleDateString('ru-RU', { day: 'numeric', month: 'short' }),
                title: d.label,
                sum: d.amount ? formatCurrency(d.amount) : "~" + formatCurrency(Math.max(0, metrics.income - 300_000) * 0.01),
                active: false,
                overdue: false,
            });
        });

        return items.sort((a, b) => 0); // already sorted by date
    }, [transactions, mainTaxSystem, hasEmployees, metrics.income, currentQuarter, currentYear]);

    // Patent income breakdown
    const patentIncome = transactions.filter(t => t.taxSystem === 'patent' && t.type === 'income').reduce((s, t) => s + t.amount, 0);
    const usnIncome = metrics.income - patentIncome;
    const safeLimit = 6.0;

    // Export CSV
    const handleExportCSV = () => {
        const header = "Дата,Тип,Категория,Описание,Сумма\n";
        const rows = transactions.map(t =>
            `${new Date(t.date).toLocaleDateString('ru-RU')},${t.type === 'income' ? 'Доход' : 'Расход'},${t.category},"${(t.description || '').replace(/"/g, '""')}",${t.amount}`
        ).join("\n");
        const blob = new Blob(["\uFEFF" + header + rows], { type: "text/csv;charset=utf-8;" });
        const url = URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        a.download = `transactions_${new Date().toISOString().slice(0, 10)}.csv`;
        a.click();
        URL.revokeObjectURL(url);
    };

    return (
        <div className="space-y-6 animate-in fade-in duration-500 pb-20 max-w-[1600px] mx-auto relative">

            {/* Payment Modal */}
            <PaymentModal
                isOpen={isPaymentModalOpen}
                onClose={() => setIsPaymentModalOpen(false)}
                taxAmount={metrics.netTaxToPay}
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
                                <button onClick={() => setIsEditingProfile(false)} className="text-slate-400 hover:text-slate-600 text-2xl leading-none">×</button>
                            </div>
                            <div className="p-6 space-y-4">
                                <div>
                                    <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Название</label>
                                    <input type="text" className="w-full px-3 py-2 border border-slate-200 dark:border-slate-700 rounded-lg bg-slate-50 dark:bg-slate-800"
                                        value={profile.name} onChange={e => setProfile({ ...profile, name: e.target.value })} />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">ИНН</label>
                                    <input type="text" className="w-full px-3 py-2 border border-slate-200 dark:border-slate-700 rounded-lg bg-slate-50 dark:bg-slate-800"
                                        value={profile.inn || ''} onChange={e => setProfile({ ...profile, inn: e.target.value })} />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">Налоговые режимы</label>
                                    <div className="space-y-2">
                                        <label className="flex items-center gap-2">
                                            <input type="checkbox" checked={profile.taxSystems?.includes('patent') || false}
                                                onChange={e => {
                                                    const current = profile.taxSystems || [];
                                                    if (e.target.checked) setProfile({ ...profile, taxSystems: [...current, 'patent'] });
                                                    else setProfile({ ...profile, taxSystems: current.filter((s: string) => s !== 'patent') });
                                                }} />
                                            <span className="text-sm">Патент (ПСН)</span>
                                        </label>
                                        <select className="w-full px-3 py-2 border border-slate-200 dark:border-slate-700 rounded-lg bg-slate-50 dark:bg-slate-800 text-sm"
                                            value={mainTaxSystem}
                                            onChange={(e) => {
                                                const newMain = e.target.value;
                                                const current = profile.taxSystems || [];
                                                const others = current.filter((s: string) => s === 'patent');
                                                setProfile({ ...profile, taxSystems: [...others, newMain] });
                                            }}>
                                            <option value="usn_6">УСН Доходы (6%)</option>
                                            <option value="usn_15">УСН Доходы-Расходы (15%)</option>
                                            <option value="osno">ОСНО</option>
                                        </select>
                                    </div>
                                </div>
                                {profile.taxSystems?.includes('patent') && (
                                    <div>
                                        <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Счет для Патента (4 цифры)</label>
                                        <input type="text" className="w-full px-3 py-2 border border-slate-200 dark:border-slate-700 rounded-lg bg-slate-50 dark:bg-slate-800"
                                            value={profile.patentAccount || ''} onChange={e => setProfile({ ...profile, patentAccount: e.target.value })} placeholder="40802..." />
                                    </div>
                                )}
                                <div>
                                    <label className="flex items-center gap-2 cursor-pointer">
                                        <input type="checkbox" checked={profile.hasEmployees || false}
                                            onChange={e => setProfile({ ...profile, hasEmployees: e.target.checked })}
                                            className="rounded border-slate-300 text-blue-600 focus:ring-blue-500" />
                                        <span className="text-sm text-slate-700 dark:text-slate-300">Есть наёмные сотрудники</span>
                                    </label>
                                    <p className="text-xs text-slate-400 mt-1 ml-6">Влияет на размер вычета страховых взносов из налога</p>
                                </div>
                            </div>
                            <div className="p-6 border-t border-slate-100 dark:border-slate-800 flex justify-end gap-3">
                                <button onClick={() => setIsEditingProfile(false)} className="px-4 py-2 text-slate-500 hover:text-slate-700">Отмена</button>
                                <button onClick={() => handleSaveProfile(profile)} className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700">Сохранить</button>
                            </div>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Header Metrics Bar */}
            <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 border border-slate-200 dark:border-slate-800 shadow-sm relative overflow-hidden">
                <div className="absolute -right-20 -top-20 w-96 h-96 bg-blue-500/5 rounded-full blur-3xl pointer-events-none" />
                <div className="relative z-10 flex flex-wrap items-start justify-between gap-6">
                    {/* Tax Amount */}
                    <div className="flex-1 min-w-[200px]">
                        <div className="flex flex-wrap items-center gap-2 mb-3">
                            <span className="bg-blue-600 text-white px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider shadow-md shadow-blue-500/20">
                                {mainTaxSystem === 'usn_6' ? 'УСН 6%' : mainTaxSystem === 'usn_15' ? 'УСН 15%' : 'ОСНО'}
                            </span>
                            {hasPatent && (
                                <span className="bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-300 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider border border-purple-200 dark:border-purple-800">
                                    + Патент
                                </span>
                            )}
                            <button onClick={() => setIsEditingProfile(true)} className="text-slate-400 hover:text-slate-600 transition-colors p-1.5 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-full" title="Настройки">
                                <Settings className="w-4 h-4" />
                            </button>
                        </div>
                        <div className="flex items-baseline gap-3 mb-1">
                            <h2 className="text-4xl font-bold text-slate-900 dark:text-white tracking-tight">
                                {formatCurrency(metrics.netTaxToPay)}
                            </h2>
                            <span className="text-slate-500 font-medium">к уплате</span>
                        </div>
                        {metrics.grossTax !== metrics.netTaxToPay && (
                            <p className="text-xs text-slate-400 mb-1">
                                Начислено {formatCurrency(metrics.grossTax)} − вычет взносов {formatCurrency(metrics.grossTax - metrics.netTaxToPay)}
                            </p>
                        )}
                        <p className="text-slate-400 text-sm max-w-sm">
                            Страховые взносы {formatCurrency(FIXED_CONTRIBUTIONS_2026)} уже учтены в расчёте.
                        </p>
                        <div className="mt-4 flex flex-wrap gap-3">
                            <button
                                onClick={() => setIsPaymentModalOpen(true)}
                                className="bg-blue-600 hover:bg-blue-700 text-white px-5 py-2.5 rounded-xl font-semibold transition-all shadow-lg shadow-blue-500/20 flex items-center gap-2 active:scale-95"
                            >
                                <ArrowUpRight className="w-4 h-4" />
                                Оплатить ЕНС
                            </button>
                            <button
                                onClick={() => { setIsUploadModalOpen(v => !v); setPendingUpload(null); }}
                                className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 px-5 py-2.5 rounded-xl font-semibold transition-all flex items-center gap-2"
                            >
                                <Upload className="w-4 h-4" />
                                {isUploadModalOpen ? 'Скрыть' : 'Загрузить выписку'}
                            </button>
                            <button
                                onClick={handleExportCSV}
                                className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 px-4 py-2.5 rounded-xl font-semibold transition-all flex items-center gap-2"
                                title="Скачать CSV"
                            >
                                <Download className="w-4 h-4" />
                                CSV
                            </button>
                        </div>
                    </div>

                    {/* Metric Cards */}
                    <div className="flex flex-wrap gap-4">
                        <div className="bg-slate-50 dark:bg-slate-800/50 rounded-2xl p-4 border border-slate-100 dark:border-slate-700 min-w-[140px]">
                            <div className="flex items-center gap-2 mb-2">
                                <div className="p-1.5 bg-emerald-100 dark:bg-emerald-900/20 text-emerald-600 rounded-lg">
                                    <Wallet className="w-4 h-4" />
                                </div>
                                <p className="text-slate-500 text-xs font-bold uppercase tracking-wider">Оборот</p>
                            </div>
                            <p className="text-xl font-bold text-slate-900 dark:text-white">{formatCurrency(metrics.income)}</p>
                            <div className="mt-2 space-y-0.5">
                                <div className="flex justify-between text-xs">
                                    <span className="text-slate-400">УСН</span>
                                    <span className="font-medium dark:text-slate-300">{formatCurrency(usnIncome)}</span>
                                </div>
                                {hasPatent && (
                                    <div className="flex justify-between text-xs">
                                        <span className="text-slate-400">Патент</span>
                                        <span className="font-medium dark:text-slate-300">{formatCurrency(patentIncome)}</span>
                                    </div>
                                )}
                            </div>
                        </div>

                        <div className="bg-slate-50 dark:bg-slate-800/50 rounded-2xl p-4 border border-slate-100 dark:border-slate-700 min-w-[140px]">
                            <div className="flex items-center gap-2 mb-2">
                                <div className="p-1.5 bg-orange-100 dark:bg-orange-900/20 text-orange-600 rounded-lg">
                                    <PieChart className="w-4 h-4" />
                                </div>
                                <p className="text-slate-500 text-xs font-bold uppercase tracking-wider">Прибыль</p>
                            </div>
                            <p className={`text-xl font-bold ${metrics.profit > 0 ? 'text-slate-900 dark:text-white' : 'text-red-500'}`}>
                                {formatCurrency(metrics.profit)}
                            </p>
                            <div className="mt-2">
                                <p className="text-xs text-slate-400 mb-0.5">Нагрузка</p>
                                <span className={`text-base font-bold ${metrics.taxLoad > safeLimit ? 'text-amber-500' : 'text-slate-700 dark:text-slate-300'}`}>
                                    {metrics.taxLoad}%
                                </span>
                                <span className="text-xs text-slate-400 ml-1">/ {safeLimit}% норма</span>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Upload Area */}
                <AnimatePresence>
                    {isUploadModalOpen && (
                        <motion.div
                            initial={{ height: 0, opacity: 0 }}
                            animate={{ height: "auto", opacity: 1 }}
                            exit={{ height: 0, opacity: 0 }}
                            className="mt-6 border-t border-slate-100 dark:border-slate-800 pt-6 overflow-hidden"
                        >
                            {pendingUpload ? (
                                <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}
                                    className="rounded-2xl border border-amber-200 dark:border-amber-800 bg-amber-50 dark:bg-amber-900/20 p-5">
                                    <div className="flex items-start gap-4">
                                        <div className="w-10 h-10 rounded-xl bg-amber-100 dark:bg-amber-900/40 flex items-center justify-center shrink-0 text-amber-600 text-xl">📋</div>
                                        <div className="flex-1 min-w-0">
                                            <p className="font-bold text-slate-900 dark:text-white mb-1">Найдено {pendingUpload.length} операций</p>
                                            <div className="flex flex-wrap gap-3 text-sm text-slate-600 dark:text-slate-400 mb-4">
                                                <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-emerald-500 inline-block" />Доходы: {pendingUpload.filter(t => t.type === 'income').length}</span>
                                                <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-red-400 inline-block" />Расходы: {pendingUpload.filter(t => t.type === 'expense').length}</span>
                                                {transactions.length > 0 && <span className="text-amber-600 dark:text-amber-400 font-medium">⚠ Уже есть {transactions.length} операций</span>}
                                            </div>
                                            <div className="flex flex-wrap gap-3">
                                                <button onClick={confirmReplace} className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-xl text-sm font-semibold transition-all active:scale-95">Заменить все</button>
                                                <button onClick={confirmMerge} className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-sm font-semibold transition-all active:scale-95">Добавить (без дублей)</button>
                                                <button onClick={cancelUpload} className="px-4 py-2 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 rounded-xl text-sm font-semibold hover:bg-slate-50 transition-all">Отмена</button>
                                            </div>
                                        </div>
                                    </div>
                                </motion.div>
                            ) : (
                                <BankUpload
                                    userInn={profile.inn || data.inn}
                                    patentAccount={profile.patentAccount || data.patentAccount}
                                    onUpload={handleAddMultipleTransactions}
                                />
                            )}
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>

            {/* Tab Navigation */}
            <div className="flex gap-1 bg-slate-100 dark:bg-slate-800/60 p-1 rounded-2xl w-fit">
                {TABS.map(tab => (
                    <button
                        key={tab.id}
                        onClick={() => setActiveTab(tab.id)}
                        className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold transition-all ${activeTab === tab.id
                                ? "bg-white dark:bg-slate-900 text-slate-900 dark:text-white shadow-sm"
                                : "text-slate-500 hover:text-slate-700 dark:hover:text-slate-300"
                            }`}
                    >
                        <tab.icon className="w-4 h-4" />
                        {tab.label}
                    </button>
                ))}
            </div>

            {/* Tab Content */}
            <AnimatePresence mode="wait">
                <motion.div
                    key={activeTab}
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -8 }}
                    transition={{ duration: 0.15 }}
                >
                    {/* OVERVIEW TAB */}
                    {activeTab === "overview" && (
                        <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
                            {/* Mini Transaction Preview */}
                            <div className="xl:col-span-2 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden">
                                <div className="p-4 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between">
                                    <h3 className="font-bold text-slate-900 dark:text-white">Последние операции</h3>
                                    <button onClick={() => setActiveTab("transactions")} className="text-xs text-blue-600 hover:text-blue-700 font-medium">
                                        Все операции →
                                    </button>
                                </div>
                                <div className="divide-y divide-slate-100 dark:divide-slate-800">
                                    {transactions.slice(0, 8).map(t => (
                                        <div key={t.id} className="px-4 py-3 flex items-center justify-between hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors">
                                            <div>
                                                <p className="text-sm font-medium text-slate-800 dark:text-slate-200 line-clamp-1">{t.description || "Без описания"}</p>
                                                <p className="text-xs text-slate-400">{new Date(t.date).toLocaleDateString('ru-RU')} · {t.category}</p>
                                            </div>
                                            <span className={`text-sm font-bold whitespace-nowrap ${t.type === 'income' ? 'text-emerald-600' : 'text-slate-700 dark:text-slate-300'}`}>
                                                {t.type === 'income' ? '+' : '-'}{formatCurrency(t.amount)}
                                            </span>
                                        </div>
                                    ))}
                                    {transactions.length === 0 && (
                                        <div className="p-8 text-center text-slate-400 text-sm">Нет операций</div>
                                    )}
                                </div>
                            </div>

                            {/* Tax Calendar */}
                            <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-6 shadow-sm">
                                <div className="flex items-center gap-2 mb-6">
                                    <Calendar className="w-5 h-5 text-slate-400" />
                                    <h3 className="font-bold text-slate-900 dark:text-white">Налоговый календарь</h3>
                                </div>
                                <div className="space-y-0">
                                    {calendarItems.map((item, i) => (
                                        <div key={i} className="flex relative pl-6 pb-5 last:pb-0 border-l border-slate-200 dark:border-slate-800">
                                            <div className={`absolute -left-1.5 top-0 w-3 h-3 rounded-full border-2 border-white dark:border-slate-900 ${item.overdue ? 'bg-red-500 ring-4 ring-red-100 dark:ring-red-900/30' :
                                                    item.active ? 'bg-blue-600 ring-4 ring-blue-100 dark:ring-blue-900/30' :
                                                        'bg-slate-300'
                                                }`} />
                                            <div className="flex-1 -mt-1">
                                                <div className="flex justify-between mb-0.5">
                                                    <span className={`text-xs font-bold uppercase tracking-wide ${item.overdue ? 'text-red-500' : 'text-slate-500'}`}>{item.date}</span>
                                                    {item.overdue && <span className="text-[10px] text-red-500 font-bold">ПРОСРОЧЕНО</span>}
                                                </div>
                                                <div className="flex justify-between items-center">
                                                    <span className="font-medium text-slate-900 dark:text-white text-sm">{item.title}</span>
                                                    <span className="font-bold text-slate-700 dark:text-slate-300 text-sm">{item.sum}</span>
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                                <div className="mt-4 pt-4 border-t border-slate-100 dark:border-slate-800 text-xs text-slate-400">
                                    Фикс. взносы 2026: {formatCurrency(FIXED_CONTRIBUTIONS_2026)} · {hasEmployees ? "С сотрудниками (вычет 50%)" : "ИП без сотрудников (вычет 100%)"}
                                </div>
                            </div>
                        </div>
                    )}

                    {/* TRANSACTIONS TAB */}
                    {activeTab === "transactions" && (
                        <TransactionManager
                            transactions={transactions}
                            accountTags={accountTags}
                            onUpdateTags={handleUpdateTags}
                            onAdd={handleAddTransaction}
                            onAddMultiple={handleAddMultipleTransactions}
                            onDelete={handleDeleteTransaction}
                            onUpdate={handleUpdateTransaction}
                        />
                    )}

                    {/* ANALYTICS TAB */}
                    {activeTab === "analytics" && (
                        <AnalyticsTab transactions={transactions} />
                    )}

                    {/* AI ADVISOR TAB */}
                    {activeTab === "ai" && (
                        <AIAdvisorTab
                            transactions={transactions}
                            profile={profile}
                            metrics={metrics}
                        />
                    )}
                </motion.div>
            </AnimatePresence>
        </div>
    );
}
