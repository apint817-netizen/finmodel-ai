'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { ArrowLeft, Check, TrendingUp, DollarSign, Calendar } from 'lucide-react';
import { BUSINESS_TEMPLATES, BusinessTemplate } from '@/lib/templates';
import { useProjectStore } from '@/lib/store';
import { ThemeToggle } from '@/components/ThemeToggle';

export default function TemplatesPage() {
    const router = useRouter();
    const [selectedTemplate, setSelectedTemplate] = useState<BusinessTemplate | null>(null);
    const { createProject, updateProject } = useProjectStore();

    const createProjectFromTemplate = (template: BusinessTemplate | null) => {
        // Create project using store
        const newProject = createProject(
            template ? `${template.name} - Новый проект` : 'Новый проект',
            template?.id || 'empty'
        );

        // If template selected, populate with template data
        if (template) {
            updateProject(newProject.id, {
                investments: template.investments.map(inv => ({ ...inv, id: crypto.randomUUID() })),
                revenues: template.revenues.map(rev => ({ ...rev, id: crypto.randomUUID() })),
                expenses: template.expenses.map(exp => ({ ...exp, id: crypto.randomUUID() })),
            });
        }

        // Navigate to editor
        router.push(`/editor/${newProject.id}`);
    };

    const calculateMetrics = (template: BusinessTemplate) => {
        const totalInvestment = template.investments.reduce((sum, inv) => sum + inv.amount, 0);
        const monthlyRevenue = template.revenues.reduce((sum, rev) => sum + rev.monthlyAmount, 0);
        const monthlyExpenses = template.expenses.reduce((sum, exp) => sum + exp.monthlyAmount, 0);
        const monthlyProfit = monthlyRevenue - monthlyExpenses;
        const breakevenMonths = monthlyProfit > 0 ? Math.ceil(totalInvestment / monthlyProfit) : 0;

        return { totalInvestment, monthlyRevenue, monthlyExpenses, monthlyProfit, breakevenMonths };
    };

    const formatCurrency = (value: number) => {
        return new Intl.NumberFormat('ru-RU').format(value);
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-purple-50 dark:from-slate-950 dark:via-slate-900 dark:to-slate-950">
            <div className="max-w-7xl mx-auto px-6 py-12">
                {/* Header */}
                <div className="mb-12">
                    <div className="flex items-center justify-between mb-6">
                        <button
                            onClick={() => router.push('/dashboard')}
                            className="flex items-center gap-2 text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200 transition-colors"
                        >
                            <ArrowLeft className="w-4 h-4" />
                            Назад к проектам
                        </button>
                        <ThemeToggle />
                    </div>
                    <h1 className="text-4xl font-bold text-slate-900 dark:text-white mb-3">
                        Выберите шаблон бизнеса
                    </h1>
                    <p className="text-lg text-slate-600 dark:text-slate-400">
                        Начните с готовой финансовой модели или создайте свою с нуля
                    </p>
                </div>

                {/* Templates Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
                    {BUSINESS_TEMPLATES.map((template) => {
                        const metrics = calculateMetrics(template);
                        const isSelected = selectedTemplate?.id === template.id;

                        return (
                            <div
                                key={template.id}
                                onClick={() => setSelectedTemplate(template)}
                                className={`group relative p-6 bg-white dark:bg-slate-900 rounded-2xl border-2 cursor-pointer transition-all hover:shadow-xl ${isSelected
                                    ? 'border-blue-500 shadow-lg scale-105'
                                    : 'border-slate-200 dark:border-slate-800 hover:border-blue-300 dark:hover:border-blue-700'
                                    }`}
                            >
                                {isSelected && (
                                    <div className="absolute -top-3 -right-3 w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center shadow-lg">
                                        <Check className="w-5 h-5 text-white" />
                                    </div>
                                )}

                                <div className="flex items-start gap-4 mb-4">
                                    <div className="text-5xl">{template.icon}</div>
                                    <div className="flex-1">
                                        <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-1">
                                            {template.name}
                                        </h3>
                                        <p className="text-sm text-slate-500 dark:text-slate-400">{template.category}</p>
                                    </div>
                                </div>

                                <p className="text-sm text-slate-600 dark:text-slate-400 mb-4">{template.description}</p>

                                <div className="space-y-2 text-sm">
                                    <div className="flex items-center justify-between">
                                        <span className="text-slate-600 dark:text-slate-400">Инвестиции:</span>
                                        <span className="font-semibold text-slate-900 dark:text-white">
                                            {formatCurrency(metrics.totalInvestment)} ₽
                                        </span>
                                    </div>
                                    <div className="flex items-center justify-between">
                                        <span className="text-slate-600 dark:text-slate-400">Прибыль/мес:</span>
                                        <span className="font-semibold text-green-600 dark:text-green-400">
                                            {formatCurrency(metrics.monthlyProfit)} ₽
                                        </span>
                                    </div>
                                    <div className="flex items-center justify-between">
                                        <span className="text-slate-600 dark:text-slate-400">Окупаемость:</span>
                                        <span className="font-semibold text-blue-600 dark:text-blue-400">
                                            {metrics.breakevenMonths} мес
                                        </span>
                                    </div>
                                </div>
                            </div>
                        );
                    })}

                    {/* Empty Template */}
                    <div
                        onClick={() => setSelectedTemplate(null)}
                        className={`group relative p-6 bg-white dark:bg-slate-900 rounded-2xl border-2 cursor-pointer transition-all hover:shadow-xl ${selectedTemplate === null
                            ? 'border-purple-500 shadow-lg scale-105'
                            : 'border-slate-200 dark:border-slate-800 hover:border-purple-300 dark:hover:border-purple-700'
                            }`}
                    >
                        {selectedTemplate === null && (
                            <div className="absolute -top-3 -right-3 w-8 h-8 bg-purple-600 rounded-full flex items-center justify-center shadow-lg">
                                <Check className="w-5 h-5 text-white" />
                            </div>
                        )}

                        <div className="flex items-start gap-4 mb-4">
                            <div className="text-5xl">📋</div>
                            <div className="flex-1">
                                <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-1">
                                    Начать с нуля
                                </h3>
                                <p className="text-sm text-slate-500 dark:text-slate-400">Пустой проект</p>
                            </div>
                        </div>

                        <p className="text-sm text-slate-600 dark:text-slate-400 mb-4">
                            Создайте собственную финансовую модель без использования шаблона
                        </p>

                        <div className="space-y-2 text-sm text-slate-500 dark:text-slate-400">
                            <div className="flex items-center gap-2">
                                <TrendingUp className="w-4 h-4" />
                                <span>Полная свобода</span>
                            </div>
                            <div className="flex items-center gap-2">
                                <DollarSign className="w-4 h-4" />
                                <span>Любая отрасль</span>
                            </div>
                            <div className="flex items-center gap-2">
                                <Calendar className="w-4 h-4" />
                                <span>Свои данные</span>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Preview Panel */}
                {selectedTemplate && (
                    <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-8 mb-8">
                        <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-6">
                            Предпросмотр: {selectedTemplate.name}
                        </h2>

                        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                            {/* Investments */}
                            <div>
                                <h3 className="text-sm font-semibold text-slate-700 dark:text-slate-300 mb-3 uppercase">
                                    Инвестиции ({selectedTemplate.investments.length})
                                </h3>
                                <div className="space-y-2">
                                    {selectedTemplate.investments.map((inv, idx) => (
                                        <div key={idx} className="text-sm">
                                            <div className="font-medium text-slate-900 dark:text-white">{inv.category}</div>
                                            <div className="text-slate-600 dark:text-slate-400">{formatCurrency(inv.amount)} ₽</div>
                                        </div>
                                    ))}
                                </div>
                            </div>

                            {/* Revenues */}
                            <div>
                                <h3 className="text-sm font-semibold text-slate-700 dark:text-slate-300 mb-3 uppercase">
                                    Доходы ({selectedTemplate.revenues.length})
                                </h3>
                                <div className="space-y-2">
                                    {selectedTemplate.revenues.map((rev, idx) => (
                                        <div key={idx} className="text-sm">
                                            <div className="font-medium text-slate-900 dark:text-white">{rev.name}</div>
                                            <div className="text-slate-600 dark:text-slate-400">{formatCurrency(rev.monthlyAmount)} ₽/мес</div>
                                        </div>
                                    ))}
                                </div>
                            </div>

                            {/* Expenses */}
                            <div>
                                <h3 className="text-sm font-semibold text-slate-700 dark:text-slate-300 mb-3 uppercase">
                                    Расходы ({selectedTemplate.expenses.length})
                                </h3>
                                <div className="space-y-2">
                                    {selectedTemplate.expenses.map((exp, idx) => (
                                        <div key={idx} className="text-sm">
                                            <div className="font-medium text-slate-900 dark:text-white">{exp.name}</div>
                                            <div className="text-slate-600 dark:text-slate-400">{formatCurrency(exp.monthlyAmount)} ₽/мес</div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>
                    </div>
                )}

                {/* Action Button */}
                <div className="flex justify-center">
                    <button
                        onClick={() => createProjectFromTemplate(selectedTemplate)}
                        className="px-8 py-4 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-xl font-semibold text-lg hover:from-blue-700 hover:to-purple-700 transition-all shadow-lg hover:shadow-xl"
                    >
                        {selectedTemplate ? `Создать проект: ${selectedTemplate.name}` : 'Создать пустой проект'}
                    </button>
                </div>
            </div>
        </div>
    );
}
