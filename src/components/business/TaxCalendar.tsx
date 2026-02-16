"use client";

import { AlertCircle, CheckCircle2, Clock } from "lucide-react";
import { PaymentButton } from "./PaymentButton";

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
        <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-800 h-full flex flex-col transition-all hover:shadow-md">
            <div className="p-6 border-b border-slate-100 dark:border-slate-800">
                <h3 className="text-xl font-bold text-slate-900 dark:text-white flex items-center gap-3">
                    <div className="p-2 bg-purple-100 dark:bg-purple-900/30 rounded-lg">
                        <Clock className="w-5 h-5 text-purple-600 dark:text-purple-400" />
                    </div>
                    Налоговый Календарь
                </h3>
            </div>

            <div className="p-6 flex-1 flex flex-col">
                <div className="mb-8 p-5 bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 rounded-2xl border border-blue-100 dark:border-blue-800 relative overflow-hidden">
                    <div className="relative z-10">
                        <div className="text-sm font-medium text-blue-800 dark:text-blue-300 mb-2">
                            Текущее обязательство
                        </div>
                        <div className="text-3xl font-bold text-slate-900 dark:text-white mb-1">
                            {taxLiability.taxAmount.toLocaleString("ru-RU")} ₽
                        </div>
                        <div className="text-xs text-blue-600 dark:text-blue-400 font-medium bg-white/50 dark:bg-black/20 inline-block px-2 py-1 rounded-md backdrop-blur-sm">
                            {taxLiability.details}
                        </div>

                        {taxLiability.taxAmount > 0 && (
                            <div className="mt-5 pt-4 border-t border-blue-200 dark:border-blue-800/50">
                                <PaymentButton
                                    amount={taxLiability.taxAmount}
                                    description={`Налог по системе ${taxLiability.details}`}
                                />
                            </div>
                        )}
                    </div>
                </div>

                <div className="space-y-1 flex-1">
                    <h4 className="text-xs font-semibold text-slate-400 dark:text-slate-500 uppercase tracking-wider mb-3">Ближайшие события</h4>
                    {deadlines.map((deadline, index) => (
                        <div key={index} className="flex items-center gap-4 p-3 hover:bg-slate-50 dark:hover:bg-slate-800/50 rounded-xl transition-colors group">
                            <div className="flex-shrink-0">
                                {deadline.status === 'paid' ? (
                                    <div className="w-10 h-10 rounded-full bg-green-100 dark:bg-green-900/30 flex items-center justify-center text-green-600 dark:text-green-400">
                                        <CheckCircle2 className="w-5 h-5" />
                                    </div>
                                ) : deadline.status === 'upcoming' ? (
                                    <div className="w-10 h-10 rounded-full bg-amber-100 dark:bg-amber-900/30 flex items-center justify-center text-amber-600 dark:text-amber-400 group-hover:scale-110 transition-transform">
                                        <AlertCircle className="w-5 h-5" />
                                    </div>
                                ) : (
                                    <div className="w-10 h-10 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-slate-400 group-hover:scale-110 transition-transform">
                                        <Clock className="w-5 h-5" />
                                    </div>
                                )}
                            </div>
                            <div className="flex-1 min-w-0">
                                <div className="text-sm font-semibold text-slate-900 dark:text-white group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
                                    {new Date(deadline.date).toLocaleDateString("ru-RU", { day: 'numeric', month: 'long' })}
                                </div>
                                <div className="text-xs text-slate-500 dark:text-slate-400 truncate">
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
