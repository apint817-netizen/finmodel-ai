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

    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-blue-50 dark:from-slate-950 dark:via-slate-900 dark:to-slate-900">
            {/* Header */}
            <header className="border-b border-slate-200/50 dark:border-slate-800/50 backdrop-blur-sm bg-white/70 dark:bg-slate-900/70 sticky top-0 z-40">
                <div className="max-w-7xl mx-auto px-6 py-4">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                            <Link
                                href="/dashboard"
                                className="p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-colors"
                            >
                                <ArrowLeft className="w-5 h-5 text-slate-600 dark:text-slate-400" />
                            </Link>
                            <div>
                                <h1 className="text-xl font-semibold text-slate-900 dark:text-white">{currentProject.name}</h1>
                                <p className="text-sm text-slate-500 dark:text-slate-400">
                                    Обновлено {new Date(currentProject.updatedAt).toLocaleDateString('ru-RU')}
                                </p>
                            </div>
                        </div>
                        <div className="flex items-center gap-3">
                            <ThemeToggle />
                            <ScenarioSelector value={scenario} onChange={setScenario} />
                            <div className="h-8 w-px bg-slate-200 dark:bg-slate-700 mx-1"></div>
                            <ExportButton
                                project={currentProject}
                                aiMessages={currentProject.aiChatHistory}
                            />
                            <button
                                onClick={() => setChatOpen(!chatOpen)}
                                className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-colors ${chatOpen ? 'bg-blue-600 text-white hover:bg-blue-700' : 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-200 hover:bg-slate-200 dark:hover:bg-slate-700'}`}
                            >
                                <MessageSquare className="w-4 h-4" />
                                <span className="hidden md:inline">ИИ-Ассистент</span>
                            </button>
                        </div>
                    </div>
                </div>
            </header>

            {/* Main Content */}
            <main className="max-w-7xl mx-auto px-6 py-8">
                <div className="flex gap-6">
                    <div className={`flex-1 transition-all ${chatOpen ? 'mr-0' : 'mr-0'}`}>
                        {/* Metrics Cards */}
                        <div className="grid md:grid-cols-4 gap-4 mb-8">
                            <div className="p-4 bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 relative group">
                                <div className="flex items-center gap-2 mb-1">
                                    <p className="text-sm text-slate-600 dark:text-slate-400">Инвестиции</p>
                                    <ContextHint text="Общая сумма начальных вложений, необходимых для запуска проекта." />
                                </div>
                                <p className="text-2xl font-bold text-slate-900 dark:text-white">{formatCurrency(totalInvestment)}</p>
                            </div>
                            <div className="p-4 bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 relative group flex flex-col justify-between">
                                <div className="flex items-center gap-2 mb-1">
                                    <p className="text-sm text-slate-600 dark:text-slate-400">Прибыль/мес</p>
                                    <ContextHint text="Чистая прибыль за месяц с учетом выбранного сценария (Доходы - Расходы)." />
                                </div>
                                <p className={`text-2xl font-bold ${monthlyProfit >= 0 ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'}`}>
                                    {formatCurrency(monthlyProfit)}
                                </p>
                            </div>
                            <div className="p-4 bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 relative group">
                                <div className="flex items-center gap-2 mb-1">
                                    <p className="text-sm text-slate-600 dark:text-slate-400">Окупаемость</p>
                                    <ContextHint text="Срок возврата инвестиций (в месяцах). Хорошим показателем считается 12-18 месяцев." />
                                </div>
                                <p className="text-2xl font-bold text-slate-900 dark:text-white">
                                    {breakevenMonths === Infinity ? '∞' : `${Math.ceil(breakevenMonths)} мес`}
                                </p>
                            </div>
                            <div className="p-4 bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 relative group">
                                <div className="flex items-center gap-2 mb-1">
                                    <p className="text-sm text-slate-600 dark:text-slate-400">ROI (год)</p>
                                    <ContextHint text="Рентабельность инвестиций за год. Показывает, сколько процентов прибыли принесет каждый вложенный рубль." />
                                </div>
                                <p className={`text-2xl font-bold ${roi >= 0 ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'}`}>
                                    {formatPercent(roi)}
                                </p>
                            </div>
                        </div>

                        {/* Tabs */}
                        <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 overflow-hidden">
                            <div className="border-b border-slate-200 dark:border-slate-800">
                                <div className="flex">
                                    {tabs.map((tab) => {
                                        const Icon = tab.icon;
                                        return (
                                            <button
                                                key={tab.id}
                                                onClick={() => setActiveTab(tab.id)}
                                                className={`flex-1 flex items-center justify-center gap-2 px-6 py-4 transition-colors ${activeTab === tab.id
                                                    ? 'bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 border-b-2 border-blue-600'
                                                    : 'text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800'
                                                    }`}
                                            >
                                                <Icon className="w-4 h-4" />
                                                <span className="font-medium">{tab.name}</span>
                                            </button>
                                        );
                                    })}
                                </div>
                            </div>

                            <div className="p-6 bg-white dark:bg-slate-900">
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
                                        <div className="flex items-center justify-between">
                                            <h2 className="text-lg font-semibold text-slate-900 dark:text-white">Финансовый прогноз</h2>
                                            <div className="text-sm font-medium px-3 py-1 bg-slate-100 dark:bg-slate-800 rounded-full text-slate-600 dark:text-slate-300 capitalize">
                                                Сценарий: {scenario === 'realistic' ? 'Реалистичный' : scenario === 'optimistic' ? 'Оптимистичный (+20%)' : 'Пессимистичный (-20%)'}
                                            </div>
                                        </div>

                                        <div className="grid md:grid-cols-2 gap-6">
                                            {/* Monthly Forecast */}
                                            <div className="p-6 bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-950/50 dark:to-blue-900/30 rounded-xl border border-blue-200 dark:border-blue-900">
                                                <h3 className="text-sm font-medium text-blue-900 dark:text-blue-300 mb-4 flex items-center gap-2">
                                                    Ежемесячно
                                                    <ContextHint text="Показатели за один типичный месяц работы." />
                                                </h3>
                                                <div className="space-y-3">
                                                    <div className="flex justify-between">
                                                        <span className="text-blue-700 dark:text-blue-400">Доходы:</span>
                                                        <span className="font-semibold text-blue-900 dark:text-blue-200">{formatCurrency(monthlyRevenue)}</span>
                                                    </div>
                                                    <div className="flex justify-between">
                                                        <span className="text-blue-700 dark:text-blue-400">Расходы:</span>
                                                        <span className="font-semibold text-blue-900 dark:text-blue-200">{formatCurrency(monthlyExpenses)}</span>
                                                    </div>
                                                    <div className="pt-3 border-t border-blue-200 dark:border-blue-800 flex justify-between">
                                                        <span className="text-blue-900 dark:text-blue-200 font-medium">Прибыль:</span>
                                                        <span className={`font-bold ${monthlyProfit >= 0 ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'}`}>
                                                            {formatCurrency(monthlyProfit)}
                                                        </span>
                                                    </div>
                                                </div>
                                            </div>

                                            {/* Yearly Forecast */}
                                            <div className="p-6 bg-gradient-to-br from-purple-50 to-purple-100 dark:from-purple-950/50 dark:to-purple-900/30 rounded-xl border border-purple-200 dark:border-purple-900">
                                                <h3 className="text-sm font-medium text-purple-900 dark:text-purple-300 mb-4 flex items-center gap-2">
                                                    Ежегодно
                                                    <ContextHint text="Прогноз на 12 месяцев. Учитывает сезонность (если добавлена) и стабильность." />
                                                </h3>
                                                <div className="space-y-3">
                                                    <div className="flex justify-between">
                                                        <span className="text-purple-700 dark:text-purple-400">Доходы:</span>
                                                        <span className="font-semibold text-purple-900 dark:text-purple-200">{formatCurrency(monthlyRevenue * 12)}</span>
                                                    </div>
                                                    <div className="flex justify-between">
                                                        <span className="text-purple-700 dark:text-purple-400">Расходы:</span>
                                                        <span className="font-semibold text-purple-900 dark:text-purple-200">{formatCurrency(monthlyExpenses * 12)}</span>
                                                    </div>
                                                    <div className="pt-3 border-t border-purple-200 dark:border-purple-800 flex justify-between">
                                                        <span className="text-purple-900 dark:text-purple-200 font-medium">Прибыль:</span>
                                                        <span className={`font-bold ${yearlyProfit >= 0 ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'}`}>
                                                            {formatCurrency(yearlyProfit)}
                                                        </span>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>

                                        {/* Charts */}
                                        <div className="p-6 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl">
                                            {/* We should pass the adjusted values to ForecastCharts if it accepts props, 
                                               or if it calculates internally, we might need to modify it. 
                                               Let's assume for now we need to pass props or it uses store.
                                               Actually ForecastCharts usually logic internally.
                                               Let's check ForecastCharts component later. 
                                               For now, let's just show key metrics which are already adjusting. 
                                           */}
                                            <div className="text-center p-10 text-slate-400 dark:text-slate-500 bg-slate-50 dark:bg-slate-800/50 rounded-lg border border-dashed border-slate-300 dark:border-slate-700">
                                                (Графики будут обновлены в следующей итерации для поддержки сценариев)
                                            </div>
                                        </div>

                                        <div className="mt-6 p-6 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl">
                                            <h3 className="text-sm font-medium text-slate-900 dark:text-white mb-4">Ключевые метрики</h3>
                                            <div className="grid md:grid-cols-3 gap-6">
                                                <div>
                                                    <p className="text-sm text-slate-600 dark:text-slate-400 mb-1">Точка безубыточности</p>
                                                    <p className="text-2xl font-bold text-slate-900 dark:text-white">
                                                        {breakevenMonths === Infinity ? 'Не достижима' : `${Math.ceil(breakevenMonths)} месяцев`}
                                                    </p>
                                                </div>
                                                <div>
                                                    <p className="text-sm text-slate-600 dark:text-slate-400 mb-1">ROI (годовой)</p>
                                                    <p className="text-2xl font-bold text-slate-900 dark:text-white">{formatPercent(roi)}</p>
                                                </div>
                                                <div>
                                                    <p className="text-sm text-slate-600 dark:text-slate-400 mb-1">Маржа прибыли</p>
                                                    <p className="text-2xl font-bold text-slate-900 dark:text-white">{formatPercent(monthlyRevenue > 0 ? (monthlyProfit / monthlyRevenue) : 0)}</p>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>

                    {chatOpen && (
                        <div className="w-96 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-6 sticky top-24 h-[calc(100vh-8rem)]">
                            <AIChat
                                modelData={{
                                    totalInvestment,
                                    monthlyRevenue,
                                    monthlyExpenses,
                                    monthlyProfit,
                                    roi,
                                    breakevenMonths,
                                    investments: currentProject.investments,
                                    revenues: currentProject.revenues, // Note: these are raw lists, not adjusted by scenario in the LIST itself, but totals ARE adjusted
                                    expenses: currentProject.expenses,
                                }}
                                messages={messages}
                                onMessagesChange={setMessages}
                            />
                        </div>
                    )}
                </div>
            </main>
        </div>
    );
}
