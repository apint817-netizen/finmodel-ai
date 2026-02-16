"use client";

import { useState } from "react";
import { Transaction } from "@prisma/client";
import { addTransaction } from "@/actions/business";
import { useRouter } from "next/navigation";
import { FormattedNumberInput } from "../FormattedNumberInput"; // Assuming it exists based on list_dir
import { format } from "date-fns";
import { Loader2, Plus, Calendar as CalendarIcon } from "lucide-react";

interface TransactionListProps {
    projectId: string;
    transactions: Transaction[];
}

export function TransactionList({ projectId, transactions }: TransactionListProps) {
    const router = useRouter();
    const [isAdding, setIsAdding] = useState(false);
    const [loading, setLoading] = useState(false);
    const [type, setType] = useState<"income" | "expense">("expense");

    async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
        event.preventDefault();
        setLoading(true);
        const formData = new FormData(event.currentTarget);
        formData.append("projectId", projectId);
        formData.append("type", type);
        formData.append("status", "paid"); // Defaulting to paid for now

        try {
            await addTransaction(formData);
            setIsAdding(false);
            router.refresh();
        } catch (error) {
            console.error("Failed to add transaction", error);
        } finally {
            setLoading(false);
        }
    }

    return (
        <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-800 overflow-hidden transition-all hover:shadow-md">
            <div className="p-6 border-b border-slate-100 dark:border-slate-800 flex justify-between items-center bg-white dark:bg-slate-900 sticky top-0 z-10">
                <h3 className="text-xl font-bold text-slate-900 dark:text-white flex items-center gap-3">
                    <div className="p-2 bg-slate-100 dark:bg-slate-800 rounded-lg">
                        <CalendarIcon className="w-5 h-5 text-slate-600 dark:text-slate-400" />
                    </div>
                    Операции
                </h3>
                <button
                    onClick={() => setIsAdding(!isAdding)}
                    className={`flex items-center gap-2 px-5 py-2.5 rounded-xl transition-all font-medium text-sm border ${isAdding
                        ? "bg-slate-100 text-slate-700 border-slate-200 dark:bg-slate-800 dark:text-slate-300 dark:border-slate-700"
                        : "bg-blue-600 hover:bg-blue-700 text-white border-transparent hover:shadow-lg hover:shadow-blue-500/20 active:scale-95"
                        }`}
                >
                    {isAdding ? "Закрыть" : (
                        <>
                            <Plus className="w-4 h-4" />
                            Добавить операцию
                        </>
                    )}
                </button>
            </div>

            {isAdding && (
                <div className="p-6 bg-slate-50/50 dark:bg-slate-950/50 border-b border-slate-200 dark:border-slate-800 animate-in slide-in-from-top-4 duration-300">
                    <form onSubmit={handleSubmit} className="grid gap-6 grid-cols-1 md:grid-cols-2 lg:grid-cols-4 items-end">
                        <div className="space-y-2">
                            <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300">Тип операции</label>
                            <div className="flex p-1 bg-slate-200 dark:bg-slate-800 rounded-xl relative">
                                <div className={`absolute top-1 bottom-1 w-[calc(50%-4px)] bg-white dark:bg-slate-700 rounded-lg shadow-sm transition-all duration-200 ease-out ${type === 'expense' ? 'translate-x-[calc(100%+4px)]' : 'translate-x-1'}`}></div>
                                <button
                                    type="button"
                                    onClick={() => setType("income")}
                                    className={`relative flex-1 py-2 text-sm font-medium rounded-lg transition-colors z-10 ${type === "income" ? "text-slate-900 dark:text-white" : "text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-300"}`}
                                >
                                    Доход
                                </button>
                                <button
                                    type="button"
                                    onClick={() => setType("expense")}
                                    className={`relative flex-1 py-2 text-sm font-medium rounded-lg transition-colors z-10 ${type === "expense" ? "text-slate-900 dark:text-white" : "text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-300"}`}
                                >
                                    Расход
                                </button>
                            </div>
                        </div>

                        <div className="space-y-2">
                            <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300">Сумма</label>
                            <div className="relative">
                                <input
                                    name="amount"
                                    type="number"
                                    step="0.01"
                                    required
                                    className="w-full pl-4 pr-10 py-2.5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all text-slate-900 dark:text-white font-medium"
                                    placeholder="0.00"
                                />
                                <span className="absolute right-4 top-2.5 text-slate-400 font-medium">₽</span>
                            </div>
                        </div>

                        <div className="space-y-2">
                            <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300">Дата</label>
                            <input
                                name="date"
                                type="date"
                                required
                                defaultValue={new Date().toISOString().split('T')[0]}
                                className="w-full px-4 py-2.5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all text-slate-900 dark:text-white"
                            />
                        </div>

                        <div className="space-y-2">
                            <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300">Категория</label>
                            <input
                                name="category"
                                type="text"
                                required
                                className="w-full px-4 py-2.5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all text-slate-900 dark:text-white"
                                placeholder="Например, Аренда"
                            />
                        </div>

                        <div className="md:col-span-2 lg:col-span-4 flex justify-end pt-2">
                            <button
                                type="submit"
                                disabled={loading}
                                className="px-8 py-2.5 bg-slate-900 dark:bg-white hover:bg-slate-800 dark:hover:bg-slate-200 text-white dark:text-slate-900 rounded-xl transition-all font-medium text-sm flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed shadow-lg hover:shadow-xl active:scale-95"
                            >
                                {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : "Сохранить операцию"}
                            </button>
                        </div>
                    </form>
                </div>
            )}

            <div className="overflow-x-auto">
                <table className="w-full text-left text-sm text-slate-600 dark:text-slate-400">
                    <thead className="bg-slate-50/50 dark:bg-slate-900/50 text-xs uppercase font-semibold text-slate-500 dark:text-slate-400 border-b border-slate-100 dark:border-slate-800">
                        <tr>
                            <th className="px-6 py-4">Дата</th>
                            <th className="px-6 py-4">Категория</th>
                            <th className="px-6 py-4">Описание</th>
                            <th className="px-6 py-4 text-right">Сумма</th>
                            <th className="px-6 py-4 text-center">Статус</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                        {transactions.length === 0 ? (
                            <tr>
                                <td colSpan={5} className="px-6 py-12 text-center text-slate-500 dark:text-slate-400">
                                    <div className="flex flex-col items-center gap-3">
                                        <div className="p-3 bg-slate-100 dark:bg-slate-800 rounded-full">
                                            <CalendarIcon className="w-6 h-6 text-slate-400" />
                                        </div>
                                        <p>История операций пуста</p>
                                    </div>
                                </td>
                            </tr>
                        ) : (
                            transactions.map((t) => (
                                <tr key={t.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors group">
                                    <td className="px-6 py-4 whitespace-nowrap font-medium text-slate-900 dark:text-white">
                                        {format(new Date(t.date), "dd.MM.yyyy")}
                                    </td>
                                    <td className="px-6 py-4">
                                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-lg text-xs font-medium bg-slate-100 text-slate-800 dark:bg-slate-800 dark:text-slate-300">
                                            {t.category}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4 truncate max-w-[200px] text-slate-500">
                                        {t.description || "—"}
                                    </td>
                                    <td className={`px-6 py-4 text-right font-bold tabular-nums ${t.type === 'income' ? 'text-emerald-600 dark:text-emerald-400' : 'text-slate-900 dark:text-white'}`}>
                                        {t.type === 'income' ? '+' : '-'}&nbsp;{t.amount.toLocaleString("ru-RU")} ₽
                                    </td>
                                    <td className="px-6 py-4 text-center">
                                        <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium ${t.status === 'paid'
                                            ? 'bg-emerald-50 text-emerald-700 dark:bg-emerald-900/20 dark:text-emerald-400 ring-1 ring-inset ring-emerald-600/20'
                                            : 'bg-amber-50 text-amber-700 dark:bg-amber-900/20 dark:text-amber-400 ring-1 ring-inset ring-amber-600/20'
                                            }`}>
                                            <span className={`w-1.5 h-1.5 rounded-full ${t.status === 'paid' ? 'bg-emerald-500' : 'bg-amber-500'}`}></span>
                                            {t.status === 'paid' ? 'Оплачено' : 'План'}
                                        </span>
                                    </td>
                                </tr>
                            ))
                        )}
                    </tbody>
                </table>
            </div>
        </div>
    );
}
