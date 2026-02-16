import { useState } from "react";
import { Plus, ArrowDownLeft, ArrowUpRight, Search, Trash2, Filter, Upload } from "lucide-react";
import { Transaction } from "@/lib/business-logic";
import { formatCurrency } from "@/lib/calculations";
import { BankUpload } from "./BankUpload";

interface TransactionManagerProps {
    transactions: Transaction[];
    onAdd: (t: Omit<Transaction, "id">) => void;
    onDelete: (id: string) => void;
    onReset?: () => void;
}

export function TransactionManager({ transactions, onAdd, onDelete, onReset }: TransactionManagerProps) {
    const [isAdding, setIsAdding] = useState(false);
    const [isUploading, setIsUploading] = useState(false);

    const [newTransaction, setNewTransaction] = useState({
        amount: "",
        type: "income" as "income" | "expense",
        category: "Продажи",
        date: new Date().toISOString().split('T')[0],
        description: ""
    });
    const [filter, setFilter] = useState("all");

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        onAdd({
            amount: parseFloat(newTransaction.amount),
            type: newTransaction.type,
            category: newTransaction.category,
            date: newTransaction.date,
            description: newTransaction.description
        });
        setNewTransaction({ ...newTransaction, amount: "", description: "" });
        setIsAdding(false);
    };

    const filteredTransactions = transactions.filter(t => {
        if (filter === "all") return true;
        return t.type === filter;
    });

    return (
        <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 flex flex-col h-full">
            <div className="p-6 border-b border-slate-200 dark:border-slate-800 flex justify-between items-center">
                <h2 className="text-lg font-bold text-slate-900 dark:text-white">Операции</h2>
                <div className="flex gap-2">
                    <button
                        onClick={() => setFilter(filter === "all" ? "income" : filter === "income" ? "expense" : "all")}
                        className={`p-2 rounded-lg transition-colors ${filter !== 'all' ? 'bg-blue-100 text-blue-600 dark:bg-blue-900/30 dark:text-blue-400' : 'text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800'}`}
                        title="Фильтр"
                    >
                        <Filter className="w-5 h-5" />
                    </button>
                    <button
                        onClick={() => setIsUploading(!isUploading)}
                        className={`p-2 rounded-lg transition-colors ${isUploading ? 'bg-blue-100 text-blue-600 dark:bg-blue-900/30' : 'text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800'}`}
                        title="Загрузить из банка"
                    >
                        <Upload className="w-5 h-5" />
                    </button>
                    <button
                        onClick={() => setIsAdding(!isAdding)}
                        className="p-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors shadow-lg shadow-blue-500/30"
                    >
                        <Plus className={`w-5 h-5 transition-transform ${isAdding ? 'rotate-45' : ''}`} />
                    </button>
                </div>
            </div>

            {/* Upload Zone */}
            {isUploading && (
                <div className="p-6 bg-slate-50 dark:bg-slate-900/50 border-b border-slate-200 dark:border-slate-800 animate-in slide-in-from-top-2">
                    <BankUpload
                        onUpload={(txs) => {
                            txs.forEach(t => onAdd(t));
                            setIsUploading(false);
                        }}
                    />
                    <div className="mt-4 flex justify-end">
                        <button
                            onClick={() => setIsUploading(false)}
                            className="text-sm text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white"
                        >
                            Закрыть
                        </button>
                    </div>
                </div>
            )}

            {/* Add Form */}
            {isAdding && (
                <div className="p-6 bg-slate-50 dark:bg-slate-900/50 border-b border-slate-200 dark:border-slate-800 animate-in slide-in-from-top-2">
                    <form onSubmit={handleSubmit} className="space-y-4">
                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label className="text-xs text-slate-500 mb-1 block">Тип</label>
                                <select
                                    value={newTransaction.type}
                                    onChange={(e) => setNewTransaction({ ...newTransaction, type: e.target.value as any })}
                                    className="w-full bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500"
                                >
                                    <option value="income">Доход</option>
                                    <option value="expense">Расход</option>
                                </select>
                            </div>
                            <div>
                                <label className="text-xs text-slate-500 mb-1 block">Сумма</label>
                                <input
                                    type="number"
                                    placeholder="0.00"
                                    value={newTransaction.amount}
                                    onChange={(e) => setNewTransaction({ ...newTransaction, amount: e.target.value })}
                                    className="w-full bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500"
                                    required
                                />
                            </div>
                        </div>
                        <div>
                            <label className="text-xs text-slate-500 mb-1 block">Описание</label>
                            <input
                                type="text"
                                placeholder="Например: оплата за услуги"
                                value={newTransaction.description}
                                onChange={(e) => setNewTransaction({ ...newTransaction, description: e.target.value })}
                                className="w-full bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500"
                            />
                        </div>
                        <div className="flex justify-end gap-2 pt-2">
                            <button
                                type="button"
                                onClick={() => setIsAdding(false)}
                                className="px-4 py-2 text-sm font-medium text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white transition-colors"
                            >
                                Отмена
                            </button>
                            <button
                                type="submit"
                                className="px-4 py-2 text-sm font-medium bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition-colors shadow-lg shadow-blue-500/20"
                            >
                                Добавить
                            </button>
                        </div>
                    </form>
                </div>
            )}

            {/* List */}
            <div className="flex-1 overflow-y-auto p-4 space-y-2 custom-scrollbar max-h-[400px]">
                {filteredTransactions.length === 0 ? (
                    <div className="flex flex-col items-center justify-center py-12 text-center">
                        <div className="w-12 h-12 bg-slate-100 dark:bg-slate-800 rounded-full flex items-center justify-center mb-3">
                            <Search className="w-6 h-6 text-slate-400" />
                        </div>
                        <p className="text-sm text-slate-500 dark:text-slate-400">Нет операций</p>
                    </div>
                ) : (
                    filteredTransactions.map((t) => (
                        <div key={t.id} className="flex items-center justify-between p-4 hover:bg-slate-50 dark:hover:bg-slate-800/50 rounded-2xl group transition-all duration-200 border border-transparent hover:border-slate-200 dark:hover:border-slate-800">
                            <div className="flex items-center gap-4 min-w-0">
                                <div className={`w-10 h-10 shrink-0 rounded-full flex items-center justify-center ${t.type === 'income'
                                    ? 'bg-emerald-100 text-emerald-600 dark:bg-emerald-900/30 dark:text-emerald-400'
                                    : 'bg-rose-100 text-rose-600 dark:bg-rose-900/30 dark:text-rose-400'
                                    }`}>
                                    {t.type === 'income' ? <ArrowDownLeft className="w-5 h-5" /> : <ArrowUpRight className="w-5 h-5" />}
                                </div>
                                <div className="min-w-0 flex-1">
                                    <p className="text-sm font-semibold text-slate-900 dark:text-white truncate">{t.description || t.category}</p>
                                    <p className="text-xs text-slate-500 dark:text-slate-400 flex items-center gap-1">
                                        <span>{new Date(t.date).toLocaleDateString()}</span>
                                        <span>•</span>
                                        <span className="capitalize">{t.category}</span>
                                    </p>
                                </div>
                            </div>
                            <div className="flex items-center gap-4 pl-4 shrink-0">
                                <span className={`text-sm font-bold whitespace-nowrap ${t.type === 'income' ? 'text-emerald-600 dark:text-emerald-400' : 'text-slate-900 dark:text-white'
                                    }`}>
                                    {t.type === 'income' ? '+' : '-'}{formatCurrency(t.amount)}
                                </span>
                                <button
                                    onClick={() => onDelete(t.id)}
                                    className="p-1 text-slate-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-all opacity-0 group-hover:opacity-100 focus:opacity-100"
                                    title="Удалить"
                                >
                                    <Trash2 className="w-4 h-4" />
                                </button>
                            </div>
                        </div>
                    ))
                )}
            </div>
        </div>
    );
}
