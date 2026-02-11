'use client';

import {
    LineChart,
    Line,
    BarChart,
    Bar,
    PieChart,
    Pie,
    Cell,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    Legend,
    ResponsiveContainer,
} from 'recharts';
import { formatCurrency } from '@/lib/calculations';

interface ForecastChartsProps {
    monthlyRevenue: number;
    monthlyExpenses: number;
    monthlyProfit: number;
    totalInvestment: number;
}

export function ForecastCharts({
    monthlyRevenue,
    monthlyExpenses,
    monthlyProfit,
    totalInvestment,
}: ForecastChartsProps) {
    // Generate 12-month forecast data
    const forecastData = Array.from({ length: 12 }, (_, i) => {
        const month = i + 1;
        const cumulativeProfit = monthlyProfit * month;
        const balance = cumulativeProfit - totalInvestment;

        return {
            month: `Мес ${month}`,
            revenue: monthlyRevenue,
            expenses: monthlyExpenses,
            profit: monthlyProfit,
            balance: balance,
            cumulativeProfit: cumulativeProfit,
        };
    });

    // Breakdown data for pie chart
    const breakdownData = [
        { name: 'Доходы', value: monthlyRevenue, color: '#10b981' },
        { name: 'Расходы', value: monthlyExpenses, color: '#ef4444' },
    ];

    return (
        <div className="space-y-8">
            {/* Revenue vs Expenses */}
            <div className="bg-white p-6 rounded-xl border border-slate-200">
                <h3 className="text-lg font-semibold text-slate-900 mb-4">
                    Доходы и расходы (12 месяцев)
                </h3>
                <ResponsiveContainer width="100%" height={300}>
                    <BarChart data={forecastData}>
                        <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                        <XAxis dataKey="month" stroke="#64748b" />
                        <YAxis stroke="#64748b" />
                        <Tooltip
                            contentStyle={{
                                backgroundColor: '#fff',
                                border: '1px solid #e2e8f0',
                                borderRadius: '8px',
                            }}
                            formatter={(value: number) => formatCurrency(value)}
                        />
                        <Legend />
                        <Bar dataKey="revenue" fill="#10b981" name="Доходы" radius={[8, 8, 0, 0]} />
                        <Bar dataKey="expenses" fill="#ef4444" name="Расходы" radius={[8, 8, 0, 0]} />
                    </BarChart>
                </ResponsiveContainer>
            </div>

            {/* Cumulative Profit */}
            <div className="bg-white p-6 rounded-xl border border-slate-200">
                <h3 className="text-lg font-semibold text-slate-900 mb-4">
                    Накопленная прибыль и баланс
                </h3>
                <ResponsiveContainer width="100%" height={300}>
                    <LineChart data={forecastData}>
                        <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                        <XAxis dataKey="month" stroke="#64748b" />
                        <YAxis stroke="#64748b" />
                        <Tooltip
                            contentStyle={{
                                backgroundColor: '#fff',
                                border: '1px solid #e2e8f0',
                                borderRadius: '8px',
                            }}
                            formatter={(value: number) => formatCurrency(value)}
                        />
                        <Legend />
                        <Line
                            type="monotone"
                            dataKey="cumulativeProfit"
                            stroke="#3b82f6"
                            strokeWidth={3}
                            name="Накопленная прибыль"
                            dot={{ fill: '#3b82f6', r: 4 }}
                        />
                        <Line
                            type="monotone"
                            dataKey="balance"
                            stroke="#8b5cf6"
                            strokeWidth={3}
                            name="Баланс (с учётом инвестиций)"
                            dot={{ fill: '#8b5cf6', r: 4 }}
                        />
                    </LineChart>
                </ResponsiveContainer>
            </div>

            {/* Breakdown Pie Chart */}
            <div className="bg-white p-6 rounded-xl border border-slate-200">
                <h3 className="text-lg font-semibold text-slate-900 mb-4">
                    Структура месячных финансов
                </h3>
                <div className="flex items-center justify-center">
                    <ResponsiveContainer width="100%" height={300}>
                        <PieChart>
                            <Pie
                                data={breakdownData}
                                cx="50%"
                                cy="50%"
                                labelLine={false}
                                label={({ name, percent }) =>
                                    `${name}: ${((percent || 0) * 100).toFixed(0)}%`
                                }
                                outerRadius={100}
                                fill="#8884d8"
                                dataKey="value"
                            >
                                {breakdownData.map((entry, index) => (
                                    <Cell key={`cell-${index}`} fill={entry.color} />
                                ))}
                            </Pie>
                            <Tooltip formatter={(value) => formatCurrency(value as number)} />
                        </PieChart>
                    </ResponsiveContainer>
                </div>
            </div>
        </div>
    );
}
