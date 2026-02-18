"use client";

import { useMemo } from "react";
import {
    BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
    PieChart, Pie, Cell, Legend
} from "recharts";
import { Transaction } from "@/lib/business-logic";
import { formatCurrency } from "@/lib/calculations";
import { TrendingUp, TrendingDown, BarChart2 } from "lucide-react";

interface AnalyticsTabProps {
    transactions: Transaction[];
}

const COLORS = ["#3b82f6", "#f59e0b", "#10b981", "#ef4444", "#8b5cf6", "#06b6d4", "#f97316"];

const MONTH_NAMES = ["Янв", "Фев", "Мар", "Апр", "Май", "Июн", "Июл", "Авг", "Сен", "Окт", "Ноя", "Дек"];

function formatK(value: number) {
    if (value >= 1_000_000) return `${(value / 1_000_000).toFixed(1)}M`;
    if (value >= 1_000) return `${(value / 1_000).toFixed(0)}K`;
    return value.toString();
}

const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
        return (
            <div className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl p-3 shadow-xl text-sm">
                <p className="font-bold text-slate-700 dark:text-slate-200 mb-2">{label}</p>
                {payload.map((entry: any, i: number) => (
                    <div key={i} className="flex items-center gap-2">
                        <div className="w-2 h-2 rounded-full" style={{ background: entry.color }} />
                        <span className="text-slate-500">{entry.name}:</span>
                        <span className="font-semibold text-slate-800 dark:text-slate-100">{formatCurrency(entry.value)}</span>
                    </div>
                ))}
            </div>
        );
    }
    return null;
};

export function AnalyticsTab({ transactions }: AnalyticsTabProps) {
    // Monthly income/expense for last 6 months
    const monthlyData = useMemo(() => {
        const now = new Date();
        const months: { month: string; income: number; expense: number; profit: number }[] = [];

        for (let i = 5; i >= 0; i--) {
            const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
            const year = d.getFullYear();
            const month = d.getMonth();
            const label = `${MONTH_NAMES[month]} ${year !== now.getFullYear() ? year : ""}`.trim();

            const monthTxs = transactions.filter(t => {
                const td = new Date(t.date);
                return td.getFullYear() === year && td.getMonth() === month;
            });

            const income = monthTxs.filter(t => t.type === "income").reduce((s, t) => s + t.amount, 0);
            const expense = monthTxs.filter(t => t.type === "expense").reduce((s, t) => s + t.amount, 0);
            months.push({ month: label, income, expense, profit: income - expense });
        }
        return months;
    }, [transactions]);

    // Expense by category (pie)
    const expenseByCategory = useMemo(() => {
        const map: Record<string, number> = {};
        transactions.filter(t => t.type === "expense").forEach(t => {
            map[t.category] = (map[t.category] || 0) + t.amount;
        });
        const sorted = Object.entries(map).sort((a, b) => b[1] - a[1]);
        const top5 = sorted.slice(0, 5);
        const other = sorted.slice(5).reduce((s, [, v]) => s + v, 0);
        if (other > 0) top5.push(["Прочее", other]);
        return top5.map(([name, value]) => ({ name, value }));
    }, [transactions]);

    // Quarterly comparison
    const quarterlyData = useMemo(() => {
        const quarters: { name: string; income: number; expense: number }[] = [
            { name: "Q1", income: 0, expense: 0 },
            { name: "Q2", income: 0, expense: 0 },
            { name: "Q3", income: 0, expense: 0 },
            { name: "Q4", income: 0, expense: 0 },
        ];
        const year = new Date().getFullYear();
        transactions.forEach(t => {
            const d = new Date(t.date);
            if (d.getFullYear() !== year) return;
            const q = Math.floor(d.getMonth() / 3);
            if (t.type === "income") quarters[q].income += t.amount;
            else quarters[q].expense += t.amount;
        });
        return quarters;
    }, [transactions]);

    // Summary stats
    const totalIncome = transactions.filter(t => t.type === "income").reduce((s, t) => s + t.amount, 0);
    const totalExpense = transactions.filter(t => t.type === "expense").reduce((s, t) => s + t.amount, 0);
    const avgMonthlyIncome = monthlyData.reduce((s, m) => s + m.income, 0) / (monthlyData.filter(m => m.income > 0).length || 1);
    const bestMonth = [...monthlyData].sort((a, b) => b.income - a.income)[0];

    if (transactions.length === 0) {
        return (
            <div className="flex flex-col items-center justify-center py-24 text-slate-400">
                <BarChart2 className="w-16 h-16 mb-4 opacity-30" />
                <p className="text-lg font-medium">Нет данных для аналитики</p>
                <p className="text-sm mt-1">Загрузите выписку или добавьте операции</p>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            {/* Summary Cards */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {[
                    { label: "Всего доходов", value: formatCurrency(totalIncome), icon: TrendingUp, color: "text-emerald-600", bg: "bg-emerald-50 dark:bg-emerald-900/20" },
                    { label: "Всего расходов", value: formatCurrency(totalExpense), icon: TrendingDown, color: "text-red-500", bg: "bg-red-50 dark:bg-red-900/20" },
                    { label: "Ср. доход/мес", value: formatCurrency(avgMonthlyIncome), icon: BarChart2, color: "text-blue-600", bg: "bg-blue-50 dark:bg-blue-900/20" },
                    { label: "Лучший месяц", value: bestMonth?.month || "—", icon: TrendingUp, color: "text-violet-600", bg: "bg-violet-50 dark:bg-violet-900/20" },
                ].map((card, i) => (
                    <div key={i} className="bg-white dark:bg-slate-900 rounded-2xl p-4 border border-slate-200 dark:border-slate-800 shadow-sm">
                        <div className={`inline-flex p-2 rounded-xl ${card.bg} mb-3`}>
                            <card.icon className={`w-4 h-4 ${card.color}`} />
                        </div>
                        <p className="text-xs text-slate-500 font-medium uppercase tracking-wide">{card.label}</p>
                        <p className="text-lg font-bold text-slate-900 dark:text-white mt-0.5">{card.value}</p>
                    </div>
                ))}
            </div>

            {/* Monthly Bar Chart */}
            <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-6 shadow-sm">
                <h3 className="font-bold text-slate-900 dark:text-white mb-6">Доходы и расходы по месяцам</h3>
                <ResponsiveContainer width="100%" height={260}>
                    <BarChart data={monthlyData} barGap={4} barCategoryGap="30%">
                        <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" vertical={false} />
                        <XAxis dataKey="month" tick={{ fontSize: 12, fill: "#94a3b8" }} axisLine={false} tickLine={false} />
                        <YAxis tickFormatter={formatK} tick={{ fontSize: 12, fill: "#94a3b8" }} axisLine={false} tickLine={false} />
                        <Tooltip content={<CustomTooltip />} />
                        <Bar dataKey="income" name="Доходы" fill="#10b981" radius={[6, 6, 0, 0]} />
                        <Bar dataKey="expense" name="Расходы" fill="#f87171" radius={[6, 6, 0, 0]} />
                    </BarChart>
                </ResponsiveContainer>
            </div>

            {/* Bottom Row: Pie + Quarterly */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Expense Pie */}
                <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-6 shadow-sm">
                    <h3 className="font-bold text-slate-900 dark:text-white mb-4">Расходы по категориям</h3>
                    {expenseByCategory.length > 0 ? (
                        <div className="flex items-center gap-4">
                            <ResponsiveContainer width={160} height={160}>
                                <PieChart>
                                    <Pie
                                        data={expenseByCategory}
                                        cx="50%"
                                        cy="50%"
                                        innerRadius={45}
                                        outerRadius={75}
                                        paddingAngle={3}
                                        dataKey="value"
                                    >
                                        {expenseByCategory.map((_, i) => (
                                            <Cell key={i} fill={COLORS[i % COLORS.length]} />
                                        ))}
                                    </Pie>
                                    <Tooltip formatter={(v: any) => formatCurrency(v as number)} />
                                </PieChart>
                            </ResponsiveContainer>
                            <div className="flex-1 space-y-2">
                                {expenseByCategory.map((item, i) => (
                                    <div key={i} className="flex items-center justify-between gap-2">
                                        <div className="flex items-center gap-2 min-w-0">
                                            <div className="w-2.5 h-2.5 rounded-full flex-shrink-0" style={{ background: COLORS[i % COLORS.length] }} />
                                            <span className="text-xs text-slate-600 dark:text-slate-400 truncate">{item.name}</span>
                                        </div>
                                        <span className="text-xs font-bold text-slate-800 dark:text-slate-200 whitespace-nowrap">{formatCurrency(item.value)}</span>
                                    </div>
                                ))}
                            </div>
                        </div>
                    ) : (
                        <p className="text-slate-400 text-sm text-center py-8">Нет расходов</p>
                    )}
                </div>

                {/* Quarterly Bar */}
                <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-6 shadow-sm">
                    <h3 className="font-bold text-slate-900 dark:text-white mb-4">Сравнение кварталов {new Date().getFullYear()}</h3>
                    <ResponsiveContainer width="100%" height={160}>
                        <BarChart data={quarterlyData} barGap={4} barCategoryGap="35%">
                            <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" vertical={false} />
                            <XAxis dataKey="name" tick={{ fontSize: 12, fill: "#94a3b8" }} axisLine={false} tickLine={false} />
                            <YAxis tickFormatter={formatK} tick={{ fontSize: 12, fill: "#94a3b8" }} axisLine={false} tickLine={false} />
                            <Tooltip content={<CustomTooltip />} />
                            <Bar dataKey="income" name="Доходы" fill="#3b82f6" radius={[4, 4, 0, 0]} />
                            <Bar dataKey="expense" name="Расходы" fill="#f59e0b" radius={[4, 4, 0, 0]} />
                        </BarChart>
                    </ResponsiveContainer>
                </div>
            </div>
        </div>
    );
}
