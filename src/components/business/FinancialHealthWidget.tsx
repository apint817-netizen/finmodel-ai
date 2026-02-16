"use client";

import { TrendingUp, TrendingDown, Activity } from "lucide-react";

interface FinancialHealthProps {
    netProfit: number;
    totalIncome: number;
    totalExpense: number;
}

export function FinancialHealthWidget({ netProfit, totalIncome, totalExpense }: FinancialHealthProps) {
    const margin = totalIncome > 0 ? (netProfit / totalIncome) * 100 : 0;

    let healthStatus = "neutral";
    let healthColor = "text-gray-500";
    let healthMessage = "Недостаточно данных";

    if (totalIncome > 0) {
        if (margin > 20) {
            healthStatus = "good";
            healthColor = "text-green-500";
            healthMessage = "Отличная рентабельность!";
        } else if (margin > 0) {
            healthStatus = "ok";
            healthColor = "text-yellow-500";
            healthMessage = "Бизнес прибыльный, но есть куда расти.";
        } else {
            healthStatus = "bad";
            healthColor = "text-red-500";
            healthMessage = "Внимание: убыток в текущем периоде.";
        }
    }

    return (
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 h-full">
            <div className="p-6 border-b border-gray-200 dark:border-gray-700 flex items-center gap-2">
                <Activity className={`w-5 h-5 ${healthColor}`} />
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                    Финансовое Здоровье
                </h3>
            </div>

            <div className="p-6">
                <div className="mb-6">
                    <div className="text-3xl font-bold text-gray-900 dark:text-white mb-1">
                        {netProfit > 0 ? '+' : ''}{netProfit.toLocaleString("ru-RU")} ₽
                    </div>
                    <div className="text-sm text-gray-500 dark:text-gray-400">
                        Чистая прибыль за год
                    </div>
                </div>

                <div className="grid grid-cols-2 gap-4 mb-6">
                    <div className="p-3 bg-green-50 dark:bg-green-900/20 rounded-lg">
                        <div className="flex items-center gap-2 text-green-700 dark:text-green-400 mb-1">
                            <TrendingUp className="w-4 h-4" />
                            <span className="text-xs font-medium uppercase">Доходы</span>
                        </div>
                        <div className="text-lg font-bold text-green-900 dark:text-green-100">
                            {totalIncome.toLocaleString("ru-RU")} ₽
                        </div>
                    </div>

                    <div className="p-3 bg-red-50 dark:bg-red-900/20 rounded-lg">
                        <div className="flex items-center gap-2 text-red-700 dark:text-red-400 mb-1">
                            <TrendingDown className="w-4 h-4" />
                            <span className="text-xs font-medium uppercase">Расходы</span>
                        </div>
                        <div className="text-lg font-bold text-red-900 dark:text-red-100">
                            {totalExpense.toLocaleString("ru-RU")} ₽
                        </div>
                    </div>
                </div>

                <div className="p-4 bg-gray-50 dark:bg-gray-700/50 rounded-lg border border-gray-100 dark:border-gray-600">
                    <div className="text-sm font-medium text-gray-900 dark:text-white mb-1">
                        Совет:
                    </div>
                    <p className="text-sm text-gray-600 dark:text-gray-300">
                        {healthMessage}
                        {margin < 10 && margin > 0 && " Попробуйте сократить постоянные расходы для увеличения маржинальности."}
                        {margin < 0 && " Рекомендуется пересмотреть ценообразование или оптимизировать затраты."}
                    </p>
                </div>
            </div>
        </div>
    );
}
