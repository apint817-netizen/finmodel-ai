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
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden">
            <div className="p-6 border-b border-gray-200 dark:border-gray-700 flex justify-between items-center">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                    Операции
                </h3>
                <button
                    onClick={() => setIsAdding(!isAdding)}
                    className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors text-sm font-medium"
                >
                    <Plus className="w-4 h-4" />
                    Добавить
                </button>
            </div>

            {isAdding && (
                <form onSubmit={handleSubmit} className="p-6 bg-gray-50 dark:bg-gray-900 border-b border-gray-200 dark:border-gray-700 grid gap-4 grid-cols-1 md:grid-cols-2 lg:grid-cols-4 items-end animate-in slide-in-from-top-2">
                    <div>
                        <label className="block text-sm font-medium mb-1 text-gray-700 dark:text-gray-300">Тип</label>
                        <div className="flex rounded-md shadow-sm" role="group">
                            <button
                                type="button"
                                onClick={() => setType("income")}
                                className={`px-4 py-2 text-sm font-medium rounded-l-lg border ${type === "income"
                                        ? "bg-green-100 text-green-700 border-green-200 dark:bg-green-900/30 dark:text-green-400 dark:border-green-800"
                                        : "bg-white text-gray-700 border-gray-300 hover:bg-gray-50 dark:bg-gray-800 dark:text-gray-300 dark:border-gray-600"
                                    }`}
                            >
                                Доход
                            </button>
                            <button
                                type="button"
                                onClick={() => setType("expense")}
                                className={`px-4 py-2 text-sm font-medium rounded-r-lg border-t border-b border-r ${type === "expense"
                                        ? "bg-red-100 text-red-700 border-red-200 dark:bg-red-900/30 dark:text-red-400 dark:border-red-800"
                                        : "bg-white text-gray-700 border-gray-300 hover:bg-gray-50 dark:bg-gray-800 dark:text-gray-300 dark:border-gray-600"
                                    }`}
                            >
                                Расход
                            </button>
                        </div>
                    </div>

                    <div>
                        <label className="block text-sm font-medium mb-1 text-gray-700 dark:text-gray-300">Сумма</label>
                        <input
                            name="amount"
                            type="number"
                            step="0.01"
                            required
                            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
                            placeholder="0.00"
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium mb-1 text-gray-700 dark:text-gray-300">Дата</label>
                        <input
                            name="date"
                            type="date"
                            required
                            defaultValue={new Date().toISOString().split('T')[0]}
                            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium mb-1 text-gray-700 dark:text-gray-300">Категория</label>
                        <input
                            name="category"
                            type="text"
                            required
                            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
                            placeholder="Например, Офис"
                        />
                    </div>

                    <div className="md:col-span-2 lg:col-span-4 flex justify-end gap-2 mt-4">
                        <button
                            type="button"
                            onClick={() => setIsAdding(false)}
                            className="px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
                        >
                            Отмена
                        </button>
                        <button
                            type="submit"
                            disabled={loading}
                            className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors text-sm font-medium disabled:opacity-50 flex items-center gap-2"
                        >
                            {loading && <Loader2 className="w-4 h-4 animate-spin" />}
                            Сохранить
                        </button>
                    </div>
                </form>
            )}

            <div className="overflow-x-auto">
                <table className="w-full text-left text-sm text-gray-500 dark:text-gray-400">
                    <thead className="bg-gray-50 dark:bg-gray-900/50 text-xs uppercase text-gray-700 dark:text-gray-300">
                        <tr>
                            <th className="px-6 py-3 font-medium">Дата</th>
                            <th className="px-6 py-3 font-medium">Категория</th>
                            <th className="px-6 py-3 font-medium">Описание</th>
                            <th className="px-6 py-3 font-medium text-right">Сумма</th>
                            <th className="px-6 py-3 font-medium text-center">Статус</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                        {transactions.length === 0 ? (
                            <tr>
                                <td colSpan={5} className="px-6 py-8 text-center text-gray-500 dark:text-gray-400">
                                    Нет операций. Добавьте первую!
                                </td>
                            </tr>
                        ) : (
                            transactions.map((t) => (
                                <tr key={t.id} className="hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors">
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        {format(new Date(t.date), "dd.MM.yyyy")}
                                    </td>
                                    <td className="px-6 py-4">{t.category}</td>
                                    <td className="px-6 py-4 truncate max-w-[200px]">{t.description || "-"}</td>
                                    <td className={`px-6 py-4 text-right font-medium ${t.type === 'income' ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'}`}>
                                        {t.type === 'income' ? '+' : '-'}{t.amount.toLocaleString("ru-RU")} ₽
                                    </td>
                                    <td className="px-6 py-4 text-center">
                                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${t.status === 'paid'
                                                ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400'
                                                : 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400'
                                            }`}>
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
