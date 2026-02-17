import { useState, useMemo } from "react";
import { Plus, Upload, Trash2, Filter, Search, Download, CheckSquare, Square, MoreHorizontal, FileText, Settings, Key, Tag } from "lucide-react";
import { Transaction, TaxSystem } from "@/lib/business-logic";
import { formatCurrency } from "@/lib/calculations";
import { BankUpload } from "./BankUpload";
import { motion, AnimatePresence } from "framer-motion";

interface TransactionManagerProps {
    transactions: Transaction[];
    accountTags?: Record<string, string>;
    onUpdateTags?: (account: string, name: string) => void;
    onAdd: (t: Omit<Transaction, "id">) => void;
    onAddMultiple?: (txs: Omit<Transaction, "id">[]) => void;
    onDelete: (id: string) => void;
    onUpdate?: (id: string, updates: Partial<Transaction>) => void;
    onReset?: () => void;
}

export function TransactionManager({ transactions, accountTags = {}, onUpdateTags, onAdd, onAddMultiple, onDelete, onUpdate, onReset }: TransactionManagerProps) {
    const [isAdding, setIsAdding] = useState(false);
    const [isUploading, setIsUploading] = useState(false);
    const [filterCategory, setFilterCategory] = useState<string>("all");
    const [filterAccount, setFilterAccount] = useState<string>("all");

    // Selection State
    const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());

    // New Transaction State
    const [newTransaction, setNewTransaction] = useState({
        amount: "",
        type: "income",
        category: "Продажи",
        description: "",
        date: new Date().toISOString().split('T')[0]
    });

    const categories = ["Продажи", "Аренда", "Зарплата", "Налоги", "Маркетинг", "Закупка", "Прочее"];

    // Derive unique accounts from transactions
    const accounts = useMemo(() => {
        const accs = new Set<string>();
        transactions.forEach(t => {
            if (t.accountNumber) accs.add(t.accountNumber);
        });
        return Array.from(accs);
    }, [transactions]);

    // Pagination & Sorting State
    const [currentPage, setCurrentPage] = useState(1);
    const itemsPerPage = 20;
    const [sortBy, setSortBy] = useState<'date' | 'amount'>('date');
    const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');

    const filteredTransactions = useMemo(() => {
        let result = transactions.filter(t => {
            if (filterCategory !== "all" && t.category !== filterCategory) return false;
            // Filter by Account Tag or Number
            if (filterAccount !== "all") {
                const tagName = t.accountNumber ? accountTags[t.accountNumber] : null;
                if (filterAccount === 'Untagged' && !tagName) return true;
                if (t.accountNumber === filterAccount) return true;
                if (tagName === filterAccount) return true;
                return false;
            }
            return true;
        });

        // Sorting
        result.sort((a, b) => {
            if (sortBy === 'date') {
                const dateA = new Date(a.date).getTime();
                const dateB = new Date(b.date).getTime();
                return sortOrder === 'asc' ? dateA - dateB : dateB - dateA;
            } else {
                return sortOrder === 'asc' ? a.amount - b.amount : b.amount - a.amount;
            }
        });

        return result;
    }, [transactions, filterCategory, filterAccount, accountTags, sortBy, sortOrder]);

    // Pagination Logic
    const totalPages = Math.ceil(filteredTransactions.length / itemsPerPage);
    const paginatedTransactions = filteredTransactions.slice(
        (currentPage - 1) * itemsPerPage,
        currentPage * itemsPerPage
    );

    const handlePageChange = (newPage: number) => {
        if (newPage >= 1 && newPage <= totalPages) {
            setCurrentPage(newPage);
        }
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        onAdd({
            date: new Date(newTransaction.date).toISOString(),
            amount: parseFloat(newTransaction.amount),
            type: newTransaction.type as "income" | "expense",
            category: newTransaction.category,
            description: newTransaction.description
        });
        setIsAdding(false);
        setNewTransaction({ ...newTransaction, amount: "", description: "" });
    };

    // Selection Handlers
    const toggleSelectAll = () => {
        if (selectedIds.size === filteredTransactions.length) {
            setSelectedIds(new Set());
        } else {
            setSelectedIds(new Set(filteredTransactions.map(t => t.id)));
        }
    };

    const toggleSelect = (id: string) => {
        const newSet = new Set(selectedIds);
        if (newSet.has(id)) {
            newSet.delete(id);
        } else {
            newSet.add(id);
        }
        setSelectedIds(newSet);
    };

    const handleBulkDelete = () => {
        if (confirm(`Удалить ${selectedIds.size} операций?`)) {
            // We need to support bulk delete in parent or loop. 
            // Since props only have single delete, we loop.
            selectedIds.forEach(id => onDelete(id));
            setSelectedIds(new Set());
        }
    };

    return (
        <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden flex flex-col h-[600px]"> {/* Fixed height for scrolling */}

            {/* Header & Toolbar */}
            <div className="p-4 border-b border-slate-100 dark:border-slate-800 flex flex-wrap gap-4 items-center justify-between bg-slate-50/50 dark:bg-slate-900/50 sticky top-0 z-20">
                <div className="flex items-center gap-3">
                    <h3 className="font-bold text-slate-900 dark:text-white flex items-center gap-2">
                        Операции <span className="text-slate-400 text-sm font-normal">{filteredTransactions.length}</span>
                    </h3>

                    {/* Filters & Sort */}
                    <div className="flex items-center gap-2">
                        <select
                            className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs rounded-lg px-2 py-1.5 focus:outline-none focus:ring-2 focus:ring-blue-500"
                            value={filterCategory}
                            onChange={(e) => setFilterCategory(e.target.value)}
                        >
                            <option value="all">Все категории</option>
                            {categories.map(c => <option key={c} value={c}>{c}</option>)}
                        </select>

                        <div className="flex items-center bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg overflow-hidden">
                            <button
                                onClick={() => setSortBy('date')}
                                className={`px-2 py-1.5 text-xs ${sortBy === 'date' ? 'bg-slate-100 dark:bg-slate-700 font-medium' : 'text-slate-500 hover:bg-slate-50'}`}
                            >
                                Дата
                            </button>
                            <div className="w-[1px] h-4 bg-slate-200 dark:bg-slate-700"></div>
                            <button
                                onClick={() => setSortBy('amount')}
                                className={`px-2 py-1.5 text-xs ${sortBy === 'amount' ? 'bg-slate-100 dark:bg-slate-700 font-medium' : 'text-slate-500 hover:bg-slate-50'}`}
                            >
                                Сумма
                            </button>
                            <button
                                onClick={() => setSortOrder(prev => prev === 'asc' ? 'desc' : 'asc')}
                                className="px-2 py-1.5 text-xs text-slate-500 hover:bg-slate-50 border-l border-slate-200 dark:border-slate-700"
                            >
                                {sortOrder === 'asc' ? '↑' : '↓'}
                            </button>
                        </div>
                    </div>
                </div>

                {/* ... (Actions same as before) ... */}
                <div className="flex items-center gap-2">
                    {selectedIds.size > 0 ? (
                        <div className="flex items-center gap-2 animate-in fade-in slide-in-from-right-2">
                            <span className="text-xs text-slate-500 font-medium">{selectedIds.size} выбрано</span>
                            <button
                                onClick={handleBulkDelete}
                                className="p-2 text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors"
                                title="Удалить выбранные"
                            >
                                <Trash2 className="w-4 h-4" />
                            </button>
                        </div>
                    ) : (
                        <>
                            <button
                                onClick={() => setIsUploading(!isUploading)}
                                className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${isUploading ? 'bg-blue-100 text-blue-700' : 'bg-white border border-slate-200 hover:bg-slate-50 text-slate-700'}`}
                            >
                                <Upload className="w-3.5 h-3.5" />
                                Загрузить
                            </button>
                            <button
                                onClick={() => setIsAdding(!isAdding)}
                                className="flex items-center gap-2 px-3 py-1.5 bg-blue-600 text-white rounded-lg text-xs font-semibold hover:bg-blue-700 transition-shadow shadow-sm"
                            >
                                <Plus className="w-3.5 h-3.5" />
                                Добавить
                            </button>
                        </>
                    )}
                </div>
            </div>

            {/* Account Tagging Section */}
            {accounts.length > 0 && onUpdateTags && (
                <div className="px-4 py-3 bg-blue-50/50 dark:bg-blue-900/10 border-b border-blue-100 dark:border-blue-900/20 flex flex-wrap gap-4 items-center flex-shrink-0">
                    {/* ... same content ... */}
                    <span className="text-xs text-blue-700 dark:text-blue-300 font-medium flex items-center gap-1">
                        <Tag className="w-3 h-3" />
                        Счета:
                    </span>
                    <div className="flex flex-wrap gap-2">
                        {accounts.map(acc => {
                            const tag = accountTags[acc];
                            return (
                                <div key={acc} className="flex items-center gap-2 bg-white dark:bg-slate-800 px-2 py-1 rounded-md border border-slate-200 dark:border-slate-700 shadow-sm">
                                    <span className="text-xs text-slate-500 font-mono">...{acc.slice(-4)}</span>
                                    {tag ? (
                                        <span
                                            className="text-xs font-bold text-slate-800 dark:text-slate-200 cursor-pointer hover:underline decoration-dashed"
                                            onClick={() => {
                                                const newName = prompt("Изменить название для счета (e.g. Ресторан, WB):", tag);
                                                if (newName) onUpdateTags(acc, newName);
                                            }}
                                        >
                                            {tag}
                                        </span>
                                    ) : (
                                        <button
                                            onClick={() => {
                                                const name = prompt("Введите название для этого счета (например: WB, Магазин):");
                                                if (name) onUpdateTags(acc, name);
                                            }}
                                            className="text-[10px] uppercase font-bold text-blue-600 hover:text-blue-700 bg-blue-50 px-1.5 py-0.5 rounded"
                                        >
                                            + Назвать
                                        </button>
                                    )}
                                </div>
                            )
                        })}
                    </div>
                </div>
            )}

            {/* Upload Area */}
            <AnimatePresence>
                {isUploading && (
                    <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: "auto", opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        className="overflow-hidden border-b border-slate-100 dark:border-slate-800 flex-shrink-0"
                    >
                        <div className="p-6 bg-slate-50 dark:bg-slate-900/50">
                            <BankUpload
                                onUpload={(txs) => {
                                    if (onAddMultiple) {
                                        onAddMultiple(txs);
                                    } else {
                                        txs.forEach(t => onAdd(t));
                                    }
                                    setIsUploading(false);
                                }}
                            />
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Manual Add Form */}
            <AnimatePresence>
                {isAdding && (
                    <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: "auto", opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        className="overflow-hidden border-b border-slate-100 dark:border-slate-800 bg-slate-50/80 dark:bg-slate-900/80 backdrop-blur-sm flex-shrink-0"
                    >
                        <form onSubmit={handleSubmit} className="p-4 grid grid-cols-2 md:grid-cols-6 gap-3 items-end">
                            <div className="col-span-1">
                                <label className="text-[10px] uppercase font-bold text-slate-500 mb-1 block">Дата</label>
                                <input
                                    type="date"
                                    required
                                    className="w-full h-9 px-2 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-sm"
                                    value={newTransaction.date}
                                    onChange={e => setNewTransaction({ ...newTransaction, date: e.target.value })}
                                />
                            </div>
                            <div className="col-span-1">
                                <label className="text-[10px] uppercase font-bold text-slate-500 mb-1 block">Тип</label>
                                <select
                                    className="w-full h-9 px-2 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-sm"
                                    value={newTransaction.type}
                                    onChange={e => setNewTransaction({ ...newTransaction, type: e.target.value })}
                                >
                                    <option value="income">Доход</option>
                                    <option value="expense">Расход</option>
                                </select>
                            </div>
                            <div className="col-span-2">
                                <label className="text-[10px] uppercase font-bold text-slate-500 mb-1 block">Описание</label>
                                <input
                                    type="text"
                                    placeholder="Например: Оплата аренды"
                                    className="w-full h-9 px-2 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-sm"
                                    value={newTransaction.description}
                                    onChange={e => setNewTransaction({ ...newTransaction, description: e.target.value })}
                                />
                            </div>
                            <div className="col-span-1">
                                <label className="text-[10px] uppercase font-bold text-slate-500 mb-1 block">Сумма</label>
                                <input
                                    type="number"
                                    required
                                    placeholder="0.00"
                                    className="w-full h-9 px-2 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-sm"
                                    value={newTransaction.amount}
                                    onChange={e => setNewTransaction({ ...newTransaction, amount: e.target.value })}
                                />
                            </div>
                            <button type="submit" className="h-9 bg-blue-600 hover:bg-blue-700 text-white rounded-lg flex items-center justify-center">
                                <Plus className="w-5 h-5" />
                            </button>
                        </form>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* List / Table */}
            <div className="flex-1 overflow-y-auto min-h-0 relative">
                {paginatedTransactions.length === 0 ? (
                    <div className="h-full flex flex-col items-center justify-center text-slate-400 p-8">
                        <FileText className="w-12 h-12 mb-2 opacity-50" />
                        <p className="text-sm">Нет операций</p>
                    </div>
                ) : (
                    <table className="w-full text-left border-collapse">
                        <thead className="bg-slate-50 dark:bg-slate-900/50 sticky top-0 z-10 text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider backdrop-blur-sm shadow-sm">
                            <tr>
                                <th className="px-4 py-3 w-[40px] text-center">
                                    <input
                                        type="checkbox"
                                        className="rounded border-slate-300 text-blue-600 focus:ring-blue-500 cursor-pointer"
                                        checked={selectedIds.size > 0 && selectedIds.size === filteredTransactions.length}
                                        onChange={toggleSelectAll}
                                        ref={input => {
                                            if (input) {
                                                input.indeterminate = selectedIds.size > 0 && selectedIds.size < filteredTransactions.length;
                                            }
                                        }}
                                    />
                                </th>
                                <th className="px-4 py-3">Дата / Описание</th>
                                <th className="px-4 py-3">Категория / Счет</th>
                                <th className="px-4 py-3 text-right">Сумма</th>
                                <th className="px-4 py-3 w-[40px]"></th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                            {paginatedTransactions.map(t => {
                                const isSelected = selectedIds.has(t.id);
                                return (
                                    <tr
                                        key={t.id}
                                        className={`group transition-colors ${isSelected ? 'bg-blue-50/50 dark:bg-blue-900/10' : 'hover:bg-slate-50 dark:hover:bg-slate-900/40'}`}
                                    >
                                        <td className="px-4 py-3 text-center">
                                            <input
                                                type="checkbox"
                                                className="rounded border-slate-300 text-blue-600 focus:ring-blue-500 cursor-pointer"
                                                checked={isSelected}
                                                onChange={() => toggleSelect(t.id)}
                                            />
                                        </td>
                                        <td className="px-4 py-3">
                                            <div className="font-medium text-slate-900 dark:text-white text-sm line-clamp-1">
                                                {t.description || "Без описания"}
                                            </div>
                                            <div className="text-xs text-slate-500 flex items-center gap-1.5 mt-0.5">
                                                <span>{new Date(t.date).toLocaleDateString()}</span>
                                                {t.taxSystem === 'patent' && (
                                                    <span className="bg-purple-100 dark:bg-purple-900/30 text-purple-600 px-1.5 rounded text-[10px] font-bold uppercase">
                                                        Патент
                                                    </span>
                                                )}
                                            </div>
                                        </td>
                                        <td className="px-4 py-3">
                                            <div className="text-sm text-slate-700 dark:text-slate-300 capitalize">{t.category}</div>
                                            {t.accountNumber && (
                                                <div className="text-[10px] text-slate-400 font-mono mt-0.5" title={t.accountNumber}>
                                                    {accountTags[t.accountNumber] || `...${t.accountNumber.slice(-4)}`}
                                                </div>
                                            )}
                                        </td>
                                        <td className="px-4 py-3 text-right">
                                            <span className={`text-sm font-bold whitespace-nowrap ${t.type === 'income' ? 'text-emerald-600 dark:text-emerald-400' : 'text-slate-900 dark:text-white'}`}>
                                                {t.type === 'income' ? '+' : '-'}{formatCurrency(t.amount)}
                                            </span>
                                        </td>
                                        <td className="px-4 py-3 text-center">
                                            <div className="flex items-center justify-end gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                                {onUpdate && t.type === 'income' && (
                                                    <button
                                                        onClick={(e) => { e.stopPropagation(); onUpdate(t.id, { taxSystem: t.taxSystem === 'patent' ? undefined : 'patent' }); }}
                                                        className={`p-1.5 rounded-lg transition-all ${t.taxSystem === 'patent' ? 'text-purple-600 bg-purple-50' : 'text-slate-400 hover:text-purple-600 hover:bg-purple-50'}`}
                                                        title="Переключить Патент/УСН"
                                                    >
                                                        <Settings className="w-3.5 h-3.5" />
                                                    </button>
                                                )}
                                                <button
                                                    onClick={(e) => { e.stopPropagation(); onDelete(t.id); }}
                                                    className="p-1.5 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg"
                                                >
                                                    <Trash2 className="w-3.5 h-3.5" />
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                );
                            })}
                        </tbody>
                    </table>
                )}
            </div>

            {/* Pagination Controls */}
            {totalPages > 1 && (
                <div className="p-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between text-xs bg-slate-50/50 dark:bg-slate-900/50 flex-shrink-0">
                    <span className="text-slate-500">
                        Показано {(currentPage - 1) * itemsPerPage + 1}-{Math.min(currentPage * itemsPerPage, filteredTransactions.length)} из {filteredTransactions.length}
                    </span>
                    <div className="flex items-center gap-1">
                        <button
                            onClick={() => handlePageChange(currentPage - 1)}
                            disabled={currentPage === 1}
                            className="px-2 py-1 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded hover:bg-slate-50 disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            Назад
                        </button>
                        {/* Simple numeric pages */}
                        {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                            // Logic to show ranges around current page could go here
                            // For simplicity: just first 5 or logic to shift.
                            // Let's keep it simple: just Prev/Next and Page X of Y
                            return null;
                        })}
                        <span className="mx-2 font-medium text-slate-700 dark:text-slate-300">
                            Стр. {currentPage} из {totalPages}
                        </span>
                        <button
                            onClick={() => handlePageChange(currentPage + 1)}
                            disabled={currentPage === totalPages}
                            className="px-2 py-1 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded hover:bg-slate-50 disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            Вперед
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
}
