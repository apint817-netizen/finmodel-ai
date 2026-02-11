'use client';

import { use } from 'react';
import { useRouter } from 'next/navigation';
import { useProjectStore } from '@/lib/store';
import {
    BarChart3,
    ArrowLeft,
    TrendingUp,
    DollarSign,
    CreditCard,
    MessageSquare,
    Loader2
} from 'lucide-react';
import Link from 'next/link';
import { useState, useEffect, useMemo } from 'react';
import { ThemeToggle } from '@/components/ThemeToggle';
import {
    calculateTotalInvestment,
    calculateMonthlyRevenue,
    calculateMonthlyExpenses,
    calculateMonthlyProfit,
    calculateBreakevenMonths,
    calculateROI,
    calculateYearlyProfit,
    formatCurrency,
    formatPercent,
} from '@/lib/calculations';

import { ForecastCharts } from '@/components/ForecastCharts';
import { AIChat } from '@/components/AIChat';
import { InvestmentForm } from '@/components/InvestmentForm';
import { RevenueForm } from '@/components/RevenueForm';
import { ExpenseForm } from '@/components/ExpenseForm';
import { ExportButton } from '@/components/ExportButton';
import { ScenarioSelector, Scenario } from '@/components/ScenarioSelector';
import { ContextHint } from '@/components/ContextHint';

type Tab = 'investments' | 'revenues' | 'expenses' | 'forecast';

export default function EditorPage({ params }: { params: Promise<{ id: string }> }) {
    const { id } = use(params);
    const router = useRouter();
    const { currentProject, setCurrentProject, addInvestment, addRevenue, addExpense, deleteInvestment, deleteRevenue, deleteExpense, updateProject } = useProjectStore();
    const [activeTab, setActiveTab] = useState<Tab>('investments');
    const [chatOpen, setChatOpen] = useState(true);
    const [scenario, setScenario] = useState<Scenario>('realistic');

    // Sync local messages with store
    const messages = currentProject?.aiChatHistory || [];
    const setMessages = (newMessages: Array<{ role: 'user' | 'assistant'; content: string }> | ((prev: Array<{ role: 'user' | 'assistant'; content: string }>) => Array<{ role: 'user' | 'assistant'; content: string }>)) => {
        if (!currentProject) return;

        const updatedMessages = typeof newMessages === 'function' ? newMessages(messages) : newMessages;
        updateProject(currentProject.id, { aiChatHistory: updatedMessages });
    };

    // Load project on mount or when ID changes
    useEffect(() => {
        if (id && (!currentProject || currentProject.id !== id)) {
            setCurrentProject(id);
        }
    }, [id, currentProject, setCurrentProject]);

    // Scenario Multipliers
    const multipliers = useMemo(() => {
        switch (scenario) {
            case 'optimistic': return { revenue: 1.2, expense: 0.95 };
            case 'pessimistic': return { revenue: 0.8, expense: 1.1 };
            default: return { revenue: 1, expense: 1 };
        }
    }, [scenario]);

    // Show loading state while switching projects or if not found yet
    if (!currentProject || currentProject.id !== id) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-slate-50 dark:bg-slate-900">
                <div className="text-center">
                    <Loader2 className="animate-spin text-blue-600 w-12 h-12 mx-auto mb-4" />
                    <p className="text-slate-600 dark:text-slate-400">Загрузка проекта...</p>
                </div>
            </div>
        );
    }

    if (!currentProject) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <div className="text-center">
                    <p className="text-slate-600 mb-4">Проект не найден</p>
                    <Link href="/dashboard" className="text-blue-600 hover:underline">
                        Вернуться к проектам
                    </Link>
                </div>
            </div>
        );
    }

    // Calculations with Scenarios
    const baseTotalInvestment = calculateTotalInvestment(currentProject.investments);
    const baseMonthlyRevenue = calculateMonthlyRevenue(currentProject.revenues);
    const baseMonthlyExpenses = calculateMonthlyExpenses(currentProject.expenses);

    const monthlyRevenue = baseMonthlyRevenue * multipliers.revenue;
    const monthlyExpenses = baseMonthlyExpenses * multipliers.expense;
    const totalInvestment = baseTotalInvestment; // Usually fixed, but could be adjusted similarly

    const monthlyProfit = calculateMonthlyProfit(monthlyRevenue, monthlyExpenses);
    const yearlyProfit = calculateYearlyProfit(monthlyProfit);
    const breakevenMonths = calculateBreakevenMonths(totalInvestment, monthlyProfit);
    const roi = calculateROI(totalInvestment, yearlyProfit);

    const tabs = [
        { id: 'investments' as Tab, name: 'Инвестиции', icon: DollarSign },
        { id: 'revenues' as Tab, name: 'Доходы', icon: TrendingUp },
        { id: 'expenses' as Tab, name: 'Расходы', icon: CreditCard },
        { id: 'forecast' as Tab, name: 'Прогноз', icon: BarChart3 },
    ];

    // ... (imports)
    import { motion, AnimatePresence } from 'framer-motion';
    import { X } from 'lucide-react';

    // ... (existing code up to return)

    return (
        <div className="min-h-screen bg-slate-50 dark:bg-slate-950 transition-colors duration-300">
            {/* Header */}
            <header className="border-b border-slate-200/50 dark:border-slate-800/50 backdrop-blur-xl bg-white/70 dark:bg-slate-900/70 sticky top-0 z-40 supports-[backdrop-filter]:bg-white/60">
                <div className="max-w-[1920px] mx-auto px-4 sm:px-6 py-3">
                    <div className="flex items-center justify-between gap-4">
                        <div className="flex items-center gap-3 overflow-hidden">
                            <Link
                                href="/dashboard"
                                className="p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl transition-colors shrink-0"
                            >
                                <ArrowLeft className="w-5 h-5 text-slate-600 dark:text-slate-400" />
                            </Link>
                            <div className="min-w-0">
                                <h1 className="text-lg font-semibold text-slate-900 dark:text-white truncate">{currentProject.name}</h1>
                                <p className="text-xs text-slate-500 dark:text-slate-400 truncate">
                                    Обновлено {new Date(currentProject.updatedAt).toLocaleDateString('ru-RU')}
                                </p>
                            </div>
                        </div>
                        <div className="flex items-center gap-2 sm:gap-3 shrink-0">
                            <div className="hidden sm:block">
                                <ThemeToggle />
                            </div>
                            <div className="hidden sm:block">
                                <ScenarioSelector value={scenario} onChange={setScenario} />
                            </div>
                            <div className="h-6 w-px bg-slate-200 dark:bg-slate-700 mx-1 hidden sm:block"></div>
                            <div className="hidden sm:block">
                                <ExportButton
                                    project={currentProject}
                                    aiMessages={currentProject.aiChatHistory}
                                />
                            </div>

                            <button
                                onClick={() => setChatOpen(!chatOpen)}
                                className={`flex items-center gap-2 px-3 py-2 rounded-xl transition-all ${chatOpen
                                    ? 'bg-blue-600 text-white shadow-lg shadow-blue-500/20'
                                    : 'bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-200 border border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-700'}`}
                            >
                                <MessageSquare className="w-4 h-4" />
                                <span className="hidden md:inline">ИИ-Ассистент</span>
                            </button>
                        </div>
                    </div>
                    {/* Mobile Controls Row */}
                    <div className="flex items-center justify-between gap-3 mt-3 sm:hidden overflow-x-auto pb-1">
                        <ThemeToggle />
                        <ScenarioSelector value={scenario} onChange={setScenario} />
                        <ExportButton
                            project={currentProject}
                            aiMessages={currentProject.aiChatHistory}
                        />
                    </div>
                </div>
            </header>

            {/* Main Content */}
            <main className="max-w-[1920px] mx-auto px-4 sm:px-6 py-6 pb-24 lg:pb-6">
                <div className="flex flex-col lg:flex-row gap-6 items-start">
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.5 }}
                        className="flex-1 w-full min-w-0"
                    >
                        {/* Metrics Cards */}
                        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 mb-6">
                            <motion.div whileHover={{ y: -2 }} className="p-4 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm relative group">
                                <div className="flex items-center gap-2 mb-1">
                                    <p className="text-sm text-slate-500 dark:text-slate-400">Инвестиции</p>
                                    <ContextHint text="Общая сумма начальных вложений, необходимых для запуска проекта." />
                                </div>
                                <p className="text-xl sm:text-2xl font-bold text-slate-900 dark:text-white truncate">{formatCurrency(totalInvestment)}</p>
                            </motion.div>
                            <motion.div whileHover={{ y: -2 }} className="p-4 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm relative group">
                                <div className="flex items-center gap-2 mb-1">
                                    <p className="text-sm text-slate-500 dark:text-slate-400">Прибыль/мес</p>
                                    <ContextHint text="Чистая прибыль за месяц с учетом выбранного сценария (Доходы - Расходы)." />
                                </div>
                                <p className={`text-xl sm:text-2xl font-bold truncate ${monthlyProfit >= 0 ? 'text-emerald-600 dark:text-emerald-400' : 'text-red-600 dark:text-red-400'}`}>
                                    {formatCurrency(monthlyProfit)}
                                </p>
                            </motion.div>
                            <motion.div whileHover={{ y: -2 }} className="p-4 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm relative group">
                                <div className="flex items-center gap-2 mb-1">
                                    <p className="text-sm text-slate-500 dark:text-slate-400">Окупаемость</p>
                                    <ContextHint text="Срок возврата инвестиций (в месяцах). Хорошим показателем считается 12-18 месяцев." />
                                </div>
                                <p className="text-xl sm:text-2xl font-bold text-slate-900 dark:text-white truncate">
                                    {breakevenMonths === Infinity ? '∞' : `${Math.ceil(breakevenMonths)} мес`}
                                </p>
                            </motion.div>
                            <motion.div whileHover={{ y: -2 }} className="p-4 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm relative group">
                                <div className="flex items-center gap-2 mb-1">
                                    <p className="text-sm text-slate-500 dark:text-slate-400">ROI (год)</p>
                                    <ContextHint text="Рентабельность инвестиций за год. Показывает, сколько процентов прибыли принесет каждый вложенный рубль." />
                                </div>
                                <p className={`text-xl sm:text-2xl font-bold truncate ${roi >= 0 ? 'text-emerald-600 dark:text-emerald-400' : 'text-red-600 dark:text-red-400'}`}>
                                    {formatPercent(roi)}
                                </p>
                            </motion.div>
                        </div>

                        {/* Tabs Navigation */}
                        <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden mb-6">
                            <div className="border-b border-slate-200 dark:border-slate-800 overflow-x-auto">
                                <div className="flex min-w-max">
                                    {tabs.map((tab) => {
                                        const Icon = tab.icon;
                                        return (
                                            <button
                                                key={tab.id}
                                                onClick={() => setActiveTab(tab.id)}
                                                className={`flex-1 flex items-center justify-center gap-2 px-6 py-4 transition-all relative ${activeTab === tab.id
                                                    ? 'text-blue-600 dark:text-blue-400'
                                                    : 'text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800'
                                                    }`}
                                            >
                                                <Icon className="w-4 h-4" />
                                                <span className="font-medium text-sm">{tab.name}</span>
                                                {activeTab === tab.id && (
                                                    <motion.div
                                                        layoutId="activeTab"
                                                        className="absolute bottom-0 left-0 right-0 h-0.5 bg-blue-600 dark:bg-blue-400"
                                                    />
                                                )}
                                            </button>
                                        );
                                    })}
                                </div>
                            </div>

                            <div className="p-4 sm:p-6 bg-slate-50/50 dark:bg-slate-950/50">
                                <AnimatePresence mode="wait">
                                    <motion.div
                                        key={activeTab}
                                        initial={{ opacity: 0, y: 10 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        exit={{ opacity: 0, y: -10 }}
                                        transition={{ duration: 0.2 }}
                                    >
                                        {/* Investments Tab */}
                                        {activeTab === 'investments' && (
                                            <InvestmentForm
                                                investments={currentProject.investments}
                                                onAdd={addInvestment}
                                                onUpdate={(id, updates) => useProjectStore.getState().updateInvestment(id, updates)}
                                                onDelete={deleteInvestment}
                                            />
                                        )}

                                        {/* Revenues Tab */}
                                        {activeTab === 'revenues' && (
                                            <RevenueForm
                                                revenues={currentProject.revenues}
                                                onAdd={addRevenue}
                                                onUpdate={(id, updates) => useProjectStore.getState().updateRevenue(id, updates)}
                                                onDelete={deleteRevenue}
                                            />
                                        )}

                                        {/* Expenses Tab */}
                                        {activeTab === 'expenses' && (
                                            <ExpenseForm
                                                expenses={currentProject.expenses}
                                                onAdd={addExpense}
                                                onUpdate={(id, updates) => useProjectStore.getState().updateExpense(id, updates)}
                                                onDelete={deleteExpense}
                                            />
                                        )}

                                        {/* Forecast Tab */}
                                        {activeTab === 'forecast' && (
                                            <div className="space-y-6">
                                                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                                                    <h2 className="text-lg font-semibold text-slate-900 dark:text-white">Финансовый прогноз</h2>
                                                    <div className="inline-flex items-center text-xs font-medium px-3 py-1 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-full text-slate-600 dark:text-slate-300 shadow-sm">
                                                        Сценарий: <span className="ml-1 text-blue-600 dark:text-blue-400">{scenario === 'realistic' ? 'Реалистичный' : scenario === 'optimistic' ? 'Оптимистичный (+20%)' : 'Пессимистичный (-20%)'}</span>
                                                    </div>
                                                </div>

                                                <div className="grid md:grid-cols-2 gap-6">
                                                    {/* Monthly Forecast */}
                                                    <div className="p-6 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm">
                                                        <h3 className="text-sm font-medium text-slate-500 dark:text-slate-400 mb-6 flex items-center gap-2">
                                                            <div className="w-2 h-2 rounded-full bg-blue-500"></div>
                                                            Ежемесячно
                                                        </h3>
                                                        <div className="space-y-4">
                                                            <div className="flex justify-between items-center">
                                                                <span className="text-slate-600 dark:text-slate-400">Доходы</span>
                                                                <span className="font-semibold text-slate-900 dark:text-white text-lg">{formatCurrency(monthlyRevenue)}</span>
                                                            </div>
                                                            <div className="flex justify-between items-center">
                                                                <span className="text-slate-600 dark:text-slate-400">Расходы</span>
                                                                <span className="font-semibold text-slate-900 dark:text-white text-lg">{formatCurrency(monthlyExpenses)}</span>
                                                            </div>
                                                            <div className="pt-4 border-t border-slate-100 dark:border-slate-800 flex justify-between items-center">
                                                                <span className="text-slate-900 dark:text-white font-medium">Прибыль</span>
                                                                <span className={`font-bold text-xl ${monthlyProfit >= 0 ? 'text-emerald-600 dark:text-emerald-400' : 'text-red-600 dark:text-red-400'}`}>
                                                                    {formatCurrency(monthlyProfit)}
                                                                </span>
                                                            </div>
                                                        </div>
                                                    </div>

                                                    {/* Yearly Forecast */}
                                                    <div className="p-6 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm">
                                                        <h3 className="text-sm font-medium text-slate-500 dark:text-slate-400 mb-6 flex items-center gap-2">
                                                            <div className="w-2 h-2 rounded-full bg-purple-500"></div>
                                                            Ежегодно
                                                        </h3>
                                                        <div className="space-y-4">
                                                            <div className="flex justify-between items-center">
                                                                <span className="text-slate-600 dark:text-slate-400">Доходы</span>
                                                                <span className="font-semibold text-slate-900 dark:text-white text-lg">{formatCurrency(monthlyRevenue * 12)}</span>
                                                            </div>
                                                            <div className="flex justify-between items-center">
                                                                <span className="text-slate-600 dark:text-slate-400">Расходы</span>
                                                                <span className="font-semibold text-slate-900 dark:text-white text-lg">{formatCurrency(monthlyExpenses * 12)}</span>
                                                            </div>
                                                            <div className="pt-4 border-t border-slate-100 dark:border-slate-800 flex justify-between items-center">
                                                                <span className="text-slate-900 dark:text-white font-medium">Прибыль</span>
                                                                <span className={`font-bold text-xl ${yearlyProfit >= 0 ? 'text-emerald-600 dark:text-emerald-400' : 'text-red-600 dark:text-red-400'}`}>
                                                                    {formatCurrency(yearlyProfit)}
                                                                </span>
                                                            </div>
                                                        </div>
                                                    </div>
                                                </div>

                                                <div className="p-8 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl text-center">
                                                    <div className="inline-flex items-center justify-center w-12 h-12 bg-slate-100 dark:bg-slate-800 rounded-full mb-4">
                                                        <TrendingUp className="w-6 h-6 text-slate-400" />
                                                    </div>
                                                    <h3 className="text-lg font-medium text-slate-900 dark:text-white mb-2">Графики в разработке</h3>
                                                    <p className="text-slate-500 dark:text-slate-400 max-w-sm mx-auto">
                                                        Визуализация данных будет доступна в следующем обновлении для поддержки новых сценариев.
                                                    </p>
                                                </div>
                                            </div>
                                        )}
                                    </motion.div>
                                </AnimatePresence>
                            </div>
                        </div>
                    </motion.div>

                    {/* AI Chat Sidebar / Drawer */}
                    <AnimatePresence>
                        {chatOpen && (
                            <>
                                {/* Mobile Overlay */}
                                <motion.div
                                    initial={{ opacity: 0 }}
                                    animate={{ opacity: 1 }}
                                    exit={{ opacity: 0 }}
                                    onClick={() => setChatOpen(false)}
                                    className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 lg:hidden"
                                />

                                {/* Chat Container */}
                                <motion.div
                                    initial={{ x: '100%', opacity: 0 }}
                                    animate={{ x: 0, opacity: 1 }}
                                    exit={{ x: '100%', opacity: 0 }}
                                    transition={{ type: 'spring', damping: 25, stiffness: 200 }}
                                    className="fixed inset-y-0 right-0 w-full sm:w-96 bg-white dark:bg-slate-900 border-l border-slate-200 dark:border-slate-800 shadow-2xl z-50 lg:static lg:shadow-none lg:h-[calc(100vh-8rem)] lg:sticky lg:top-24 lg:rounded-2xl lg:border lg:z-auto"
                                >
                                    {/* Mobile Close Button */}
                                    <div className="lg:hidden absolute top-4 right-4 z-10">
                                        <button
                                            onClick={() => setChatOpen(false)}
                                            className="p-2 bg-white/10 backdrop-blur-md text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white rounded-full"
                                        >
                                            <X className="w-5 h-5" />
                                        </button>
                                    </div>

                                    <div className="h-full">
                                        <AIChat
                                            modelData={{
                                                totalInvestment,
                                                monthlyRevenue,
                                                monthlyExpenses,
                                                monthlyProfit,
                                                roi,
                                                breakevenMonths,
                                                investments: currentProject.investments,
                                                revenues: currentProject.revenues,
                                                expenses: currentProject.expenses,
                                            }}
                                            messages={messages}
                                            onMessagesChange={setMessages}
                                        />
                                    </div>
                                </motion.div>
                            </>
                        )}
                    </AnimatePresence>
                </div>
            </main>
        </div>
    );
}
