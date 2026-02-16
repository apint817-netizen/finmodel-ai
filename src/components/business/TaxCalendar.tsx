"use client";

import { AlertCircle, CheckCircle2, Clock } from "lucide-react";

interface TaxCalendarProps {
    taxLiability: {
        taxAmount: number;
        taxableIncome: number;
        details: string;
    };
}

export function TaxCalendar({ taxLiability }: TaxCalendarProps) {
    // Mock data for upcoming deadlines
    // In a real app, this would come from the database/tax-engine
    const deadlines = [
        { date: "2024-04-25", name: "Авансовый платеж за 1 кв.", status: "upcoming" },
        { date: "2024-07-25", name: "Авансовый платеж за 2 кв.", status: "future" },
        { date: "2024-10-25", name: "Авансовый платеж за 3 кв.", status: "future" },
    ];

    return (
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 h-full">
            <div className="p-6 border-b border-gray-200 dark:border-gray-700">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white flex items-center gap-2">
                    Налоговый Календарь
                </h3>
            </div>

            <div className="p-6">
                <div className="mb-6 p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-100 dark:border-blue-800">
                    <div className="text-sm text-blue-800 dark:text-blue-300 font-medium mb-1">
                        Текущее обязательство (расчетное)
                    </div>
                    <div className="text-2xl font-bold text-blue-900 dark:text-blue-100">
                        {taxLiability.taxAmount.toLocaleString("ru-RU")} ₽
                    </div>
                    <div className="text-xs text-blue-600 dark:text-blue-400 mt-1">
                        {taxLiability.details}
                    </div>
                </div>

                <div className="space-y-4">
                    {deadlines.map((deadline, index) => (
                        <div key={index} className="flex items-start gap-3">
                            <div className="flex-shrink-0 mt-0.5">
                                {deadline.status === 'paid' ? (
                                    <CheckCircle2 className="w-5 h-5 text-green-500" />
                                ) : deadline.status === 'upcoming' ? (
                                    <AlertCircle className="w-5 h-5 text-amber-500" />
                                ) : (
                                    <Clock className="w-5 h-5 text-gray-400" />
                                )}
                            </div>
                            <div>
                                <div className="text-sm font-medium text-gray-900 dark:text-white">
                                    {new Date(deadline.date).toLocaleDateString("ru-RU", { day: 'numeric', month: 'long' })}
                                </div>
                                <div className="text-xs text-gray-500 dark:text-gray-400">
                                    {deadline.name}
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
}
