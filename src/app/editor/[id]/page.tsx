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
    Plus,
    Trash2,
} from 'lucide-react';
import Link from 'next/link';
import { useState } from 'react';
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

type Tab = 'investments' | 'revenues' | 'expenses' | 'forecast';

export default function EditorPage({ params }: { params: Promise<{ id: string }> }) {
    const { id } = use(params);
    const router = useRouter();
    const { currentProject, setCurrentProject, addInvestment, addRevenue, addExpense, deleteInvestment, deleteRevenue, deleteExpense } = useProjectStore();
    const [activeTab, setActiveTab] = useState<Tab>('investments');
    const [chatOpen, setChatOpen] = useState(true);

    // Load project on mount
    if (!currentProject || currentProject.id !== id) {
        setCurrentProject(id);
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

    // Calculations
    const totalInvestment = calculateTotalInvestment(currentProject.investments);
    const monthlyRevenue = calculateMonthlyRevenue(currentProject.revenues);
    const monthlyExpenses = calculateMonthlyExpenses(currentProject.expenses);
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
        <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-blue-50">
            {/* Header */}
            <header className="border-b border-slate-200/50 backdrop-blur-sm bg-white/70 sticky top-0 z-40">
                <div className="max-w-7xl mx-auto px-6 py-4">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-4">
                            <Link
                                href="/dashboard"
                                className="p-2 hover:bg-slate-100 rounded-lg transition-colors"
                            >
                                <ArrowLeft className="w-5 h-5 text-slate-600" />
                            </Link>
                            <div>
                                <h1 className="text-xl font-semibold text-slate-900">{currentProject.name}</h1>
                                <p className="text-sm text-slate-500">
                                    Обновлено {new Date(currentProject.updatedAt).toLocaleDateString('ru-RU')}
                                </p>
                            </div>
                        </div>
                        <button
                            onClick={() => setChatOpen(!chatOpen)}
                            className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                        >
                            <MessageSquare className="w-4 h-4" />
                            <span className="hidden md:inline">ИИ-Ассистент</span>
                        </button>
                    </div>
                </div>
            </header>

            <div className="max-w-7xl mx-auto px-6 py-8">
                <div className="flex gap-8">
                    {/* Main Content */}
                    <div className={`flex-1 transition-all ${chatOpen ? 'mr-0' : 'mr-0'}`}>
                        {/* Metrics Cards */}
                        <div className="grid md:grid-cols-4 gap-4 mb-8">
                            <div className="p-4 bg-white rounded-xl border border-slate-200">
                                <p className="text-sm text-slate-600 mb-1">Инвестиции</p>
                                <p className="text-2xl font-bold text-slate-900">{formatCurrency(totalInvestment)}</p>
                            </div>
                            <div className="p-4 bg-white rounded-xl border border-slate-200">
                                <p className="text-sm text-slate-600 mb-1">Прибыль/мес</p>
                                <p className={`text-2xl font-bold ${monthlyProfit >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                                    {formatCurrency(monthlyProfit)}
                                </p>
                            </div>
                            <div className="p-4 bg-white rounded-xl border border-slate-200">
                                <p className="text-sm text-slate-600 mb-1">Окупаемость</p>
                                <p className="text-2xl font-bold text-slate-900">
                                    {breakevenMonths === Infinity ? '∞' : `${Math.ceil(breakevenMonths)} мес`}
                                </p>
                            </div>
                            <div className="p-4 bg-white rounded-xl border border-slate-200">
                                <p className="text-sm text-slate-600 mb-1">ROI (год)</p>
                                <p className={`text-2xl font-bold ${roi >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                                    {formatPercent(roi)}
                                </p>
                            </div>
                        </div>

                        {/* Tabs */}
                        <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden">
                            <div className="border-b border-slate-200">
                                <div className="flex">
                                    {tabs.map((tab) => {
                                        const Icon = tab.icon;
                                        return (
                                            <button
                                                key={tab.id}
                                                onClick={() => setActiveTab(tab.id)}
                                                className={`flex-1 flex items-center justify-center gap-2 px-6 py-4 transition-colors ${activeTab === tab.id
                                                    ? 'bg-blue-50 text-blue-600 border-b-2 border-blue-600'
                                                    : 'text-slate-600 hover:bg-slate-50'
                                                    }`}
                                            >
                                                <Icon className="w-4 h-4" />
                                                <span className="font-medium">{tab.name}</span>
                                            </button>
                                        );
                                    })}
                                </div>
                            </div>

                            <div className="p-6">
                                {/* Investments Tab */}
                                {activeTab === 'investments' && (
                                    <div>
                                        <div className="flex items-center justify-between mb-6">
                                            <h2 className="text-lg font-semibold text-slate-900">Начальные инвестиции</h2>
                                            <button
                                                onClick={() =>
                                                    addInvestment({ category: 'Новая статья', amount: 0 })
                                                }
                                                className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm"
                                            >
                                                <Plus className="w-4 h-4" />
                                                Добавить
                                            </button>
                                        </div>

                                        <div className="space-y-3">
                                            {currentProject.investments.map((item) => (
                                                <div
                                                    key={item.id}
                                                    className="flex items-center gap-4 p-4 bg-slate-50 rounded-lg"
                                                >
                                                    <input
                                                        type="text"
                                                        value={item.category}
                                                        onChange={(e) =>
                                                            useProjectStore.getState().updateInvestment(item.id, {
                                                                category: e.target.value,
                                                            })
                                                        }
                                                        className="flex-1 px-3 py-2 bg-white border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                                                        placeholder="Название"
                                                    />
                                                    <input
                                                        type="number"
                                                        value={item.amount}
                                                        onChange={(e) =>
                                                            useProjectStore.getState().updateInvestment(item.id, {
                                                                amount: Number(e.target.value),
                                                            })
                                                        }
                                                        className="w-40 px-3 py-2 bg-white border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                                                        placeholder="Сумма"
                                                    />
                                                    <button
                                                        onClick={() => deleteInvestment(item.id)}
                                                        className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                                                    >
                                                        <Trash2 className="w-4 h-4" />
                                                    </button>
                                                </div>
                                            ))}

                                            {currentProject.investments.length === 0 && (
                                                <div className="text-center py-12 text-slate-500">
                                                    <p>Нет инвестиций. Нажмите "Добавить" чтобы начать.</p>
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                )}

                                {/* Revenues Tab */}
                                {activeTab === 'revenues' && (
                                    <div>
                                        <div className="flex items-center justify-between mb-6">
                                            <h2 className="text-lg font-semibold text-slate-900">Источники дохода</h2>
                                            <button
                                                onClick={() =>
                                                    addRevenue({ name: 'Новый доход', monthlyAmount: 0, type: 'recurring' })
                                                }
                                                className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm"
                                            >
                                                <Plus className="w-4 h-4" />
                                                Добавить
                                            </button>
                                        </div>

                                        <div className="space-y-3">
                                            {currentProject.revenues.map((item) => (
                                                <div
                                                    key={item.id}
                                                    className="flex items-center gap-4 p-4 bg-slate-50 rounded-lg"
                                                >
                                                    <input
                                                        type="text"
                                                        value={item.name}
                                                        onChange={(e) =>
                                                            useProjectStore.getState().updateRevenue(item.id, {
                                                                name: e.target.value,
                                                            })
                                                        }
                                                        className="flex-1 px-3 py-2 bg-white border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                                                        placeholder="Название"
                                                    />
                                                    <input
                                                        type="number"
                                                        value={item.monthlyAmount}
                                                        onChange={(e) =>
                                                            useProjectStore.getState().updateRevenue(item.id, {
                                                                monthlyAmount: Number(e.target.value),
                                                            })
                                                        }
                                                        className="w-40 px-3 py-2 bg-white border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                                                        placeholder="Сумма/мес"
                                                    />
                                                    <button
                                                        onClick={() => deleteRevenue(item.id)}
                                                        className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                                                    >
                                                        <Trash2 className="w-4 h-4" />
                                                    </button>
                                                </div>
                                            ))}

                                            {currentProject.revenues.length === 0 && (
                                                <div className="text-center py-12 text-slate-500">
                                                    <p>Нет доходов. Нажмите "Добавить" чтобы начать.</p>
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                )}

                                {/* Expenses Tab */}
                                {activeTab === 'expenses' && (
                                    <div>
                                        <div className="flex items-center justify-between mb-6">
                                            <h2 className="text-lg font-semibold text-slate-900">Ежемесячные расходы</h2>
                                            <button
                                                onClick={() =>
                                                    addExpense({ name: 'Новый расход', monthlyAmount: 0, type: 'fixed' })
                                                }
                                                className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm"
                                            >
                                                <Plus className="w-4 h-4" />
                                                Добавить
                                            </button>
                                        </div>

                                        <div className="space-y-3">
                                            {currentProject.expenses.map((item) => (
                                                <div
                                                    key={item.id}
                                                    className="flex items-center gap-4 p-4 bg-slate-50 rounded-lg"
                                                >
                                                    <input
                                                        type="text"
                                                        value={item.name}
                                                        onChange={(e) =>
                                                            useProjectStore.getState().updateExpense(item.id, {
                                                                name: e.target.value,
                                                            })
                                                        }
                                                        className="flex-1 px-3 py-2 bg-white border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                                                        placeholder="Название"
                                                    />
                                                    <input
                                                        type="number"
                                                        value={item.monthlyAmount}
                                                        onChange={(e) =>
                                                            useProjectStore.getState().updateExpense(item.id, {
                                                                monthlyAmount: Number(e.target.value),
                                                            })
                                                        }
                                                        className="w-40 px-3 py-2 bg-white border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                                                        placeholder="Сумма/мес"
                                                    />
                                                    <button
                                                        onClick={() => deleteExpense(item.id)}
                                                        className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                                                    >
                                                        <Trash2 className="w-4 h-4" />
                                                    </button>
                                                </div>
                                            ))}

                                            {currentProject.expenses.length === 0 && (
                                                <div className="text-center py-12 text-slate-500">
                                                    <p>Нет расходов. Нажмите "Добавить" чтобы начать.</p>
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                )}

                                {/* Forecast Tab */}
                                {activeTab === 'forecast' && (
                                    <div>
                                        <h2 className="text-lg font-semibold text-slate-900 mb-6">Финансовый прогноз</h2>

                                        <div className="grid md:grid-cols-2 gap-6">
                                            <div className="p-6 bg-gradient-to-br from-blue-50 to-blue-100 rounded-xl">
                                                <h3 className="text-sm font-medium text-blue-900 mb-4">Ежемесячно</h3>
                                                <div className="space-y-3">
                                                    <div className="flex justify-between">
                                                        <span className="text-blue-700">Доходы:</span>
                                                        <span className="font-semibold text-blue-900">{formatCurrency(monthlyRevenue)}</span>
                                                    </div>
                                                    <div className="flex justify-between">
                                                        <span className="text-blue-700">Расходы:</span>
                                                        <span className="font-semibold text-blue-900">{formatCurrency(monthlyExpenses)}</span>
                                                    </div>
                                                    <div className="pt-3 border-t border-blue-200 flex justify-between">
                                                        <span className="text-blue-900 font-medium">Прибыль:</span>
                                                        <span className={`font-bold ${monthlyProfit >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                                                            {formatCurrency(monthlyProfit)}
                                                        </span>
                                                    </div>
                                                </div>
                                            </div>

                                            <div className="p-6 bg-gradient-to-br from-purple-50 to-purple-100 rounded-xl">
                                                <h3 className="text-sm font-medium text-purple-900 mb-4">Ежегодно</h3>
                                                <div className="space-y-3">
                                                    <div className="flex justify-between">
                                                        <span className="text-purple-700">Доходы:</span>
                                                        <span className="font-semibold text-purple-900">{formatCurrency(monthlyRevenue * 12)}</span>
                                                    </div>
                                                    <div className="flex justify-between">
                                                        <span className="text-purple-700">Расходы:</span>
                                                        <span className="font-semibold text-purple-900">{formatCurrency(monthlyExpenses * 12)}</span>
                                                    </div>
                                                    <div className="pt-3 border-t border-purple-200 flex justify-between">
                                                        <span className="text-purple-900 font-medium">Прибыль:</span>
                                                        <span className={`font-bold ${yearlyProfit >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                                                            {formatCurrency(yearlyProfit)}
                                                        </span>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>

                                        <div className="mt-6 p-6 bg-white border border-slate-200 rounded-xl">
                                            <h3 className="text-sm font-medium text-slate-900 mb-4">Ключевые метрики</h3>
                                            <div className="grid md:grid-cols-3 gap-6">
                                                <div>
                                                    <p className="text-sm text-slate-600 mb-1">Точка безубыточности</p>
                                                    <p className="text-2xl font-bold text-slate-900">
                                                        {breakevenMonths === Infinity ? 'Не достижима' : `${Math.ceil(breakevenMonths)} месяцев`}
                                                    </p>
                                                </div>
                                                <div>
                                                    <p className="text-sm text-slate-600 mb-1">ROI (годовой)</p>
                                                    <p className={`text-2xl font-bold ${roi >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                                                        {formatPercent(roi)}
                                                    </p>
                                                </div>
                                                <div>
                                                    <p className="text-sm text-slate-600 mb-1">Маржа прибыли</p>
                                                    <p className={`text-2xl font-bold ${monthlyRevenue > 0 ? 'text-blue-600' : 'text-slate-400'}`}>
                                                        {monthlyRevenue > 0 ? formatPercent((monthlyProfit / monthlyRevenue) * 100) : '0%'}
                                                    </p>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>

                    {/* AI Chat Sidebar */}
                    {chatOpen && (
                        <div className="w-96 bg-white rounded-2xl border border-slate-200 p-6 sticky top-24 h-[calc(100vh-8rem)]">
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
                            />
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
