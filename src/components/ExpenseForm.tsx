'use client';

import { useState } from 'react';
import { Plus, Trash2, Check, X, Edit2 } from 'lucide-react';
import { FormattedNumberInput } from './FormattedNumberInput';

interface ExpenseItem {
    id: string;
    name: string;
    monthlyAmount: number;
    type: 'fixed' | 'variable';
}

interface ExpenseFormProps {
    expenses: ExpenseItem[];
    onAdd: (item: Omit<ExpenseItem, 'id'>) => void;
    onUpdate: (id: string, updates: Partial<ExpenseItem>) => void;
    onDelete: (id: string) => void;
}

export function ExpenseForm({ expenses, onAdd, onUpdate, onDelete }: ExpenseFormProps) {
    const [editingId, setEditingId] = useState<string | null>(null);
    const [showAddForm, setShowAddForm] = useState(false);
    const [newItem, setNewItem] = useState<Omit<ExpenseItem, 'id'>>({ name: '', monthlyAmount: 0, type: 'fixed' });

    const handleAdd = () => {
        if (newItem.name && newItem.monthlyAmount > 0) {
            onAdd(newItem);
            setNewItem({ name: '', monthlyAmount: 0, type: 'fixed' });
            setShowAddForm(false);
        }
    };

    const formatCurrency = (value: number) => {
        return new Intl.NumberFormat('ru-RU').format(value);
    };

    const quickExpenses = [
        { name: 'Аренда помещения', icon: '🏢' },
        { name: 'Зарплата', icon: '👥' },
        { name: 'Коммунальные услуги', icon: '💡' },
        { name: 'Интернет', icon: '🌐' },
        { name: 'Реклама', icon: '📢' },
        { name: 'Закупка товаров', icon: '📦' },
        { name: 'Налоги', icon: '📋' },
        { name: 'Другое', icon: '💸' },
    ];

    return (
        <div>
            <div className="flex items-center justify-between mb-6">
                <div>
                    <h2 className="text-lg font-semibold text-slate-900 dark:text-white">Ежемесячные расходы</h2>
                    <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
                        Укажите все регулярные месячные расходы
                    </p>
                </div>
                <button
                    onClick={() => setShowAddForm(!showAddForm)}
                    className="flex items-center gap-2 px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg transition-colors text-sm font-medium"
                >
                    <Plus className="w-4 h-4" />
                    Добавить
                </button>
            </div>

            {/* Add Form */}
            {showAddForm && (
                <div className="mb-6 p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-xl">
                    <h3 className="text-sm font-medium text-red-900 dark:text-red-200 mb-3">Новый расход</h3>

                    {/* Quick Categories */}
                    <div className="mb-3">
                        <p className="text-xs text-red-700 dark:text-red-300/70 mb-2">Быстрый выбор:</p>
                        <div className="flex flex-wrap gap-2">
                            {quickExpenses.map((exp) => (
                                <button
                                    key={exp.name}
                                    onClick={() => setNewItem({ ...newItem, name: exp.name })}
                                    className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${newItem.name === exp.name
                                        ? 'bg-red-600 text-white'
                                        : 'bg-white dark:bg-slate-800 text-red-700 dark:text-red-300 hover:bg-red-100 dark:hover:bg-slate-700'
                                        }`}
                                >
                                    {exp.icon} {exp.name}
                                </button>
                            ))}
                        </div>
                    </div>

                    <div className="mb-3">
                        <label className="block text-xs font-medium text-red-900 dark:text-red-200 mb-1">
                            Название <span className="text-red-500">*</span>
                        </label>
                        <input
                            type="text"
                            value={newItem.name}
                            onChange={(e) => setNewItem({ ...newItem, name: e.target.value })}
                            className="w-full px-3 py-2 bg-white dark:bg-slate-950 border border-red-200 dark:border-slate-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500 text-sm text-slate-900 dark:text-white placeholder-slate-400"
                            placeholder="Например: Аренда"
                        />
                    </div>
                    <div className="mb-3">
                        <FormattedNumberInput
                            label="Сумма/мес"
                            value={newItem.monthlyAmount}
                            onChange={(value) => setNewItem({ ...newItem, monthlyAmount: value })}
                            placeholder="0"
                            showSlider={true}
                            showQuickButtons={true}
                        />
                    </div>

                    <div className="mb-3">
                        <label className="block text-xs font-medium text-red-900 dark:text-red-200 mb-2">Тип расхода</label>
                        <div className="flex gap-2">
                            <button
                                onClick={() => setNewItem({ ...newItem, type: 'fixed' })}
                                className={`flex-1 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${newItem.type === 'fixed'
                                    ? 'bg-red-600 text-white'
                                    : 'bg-white dark:bg-slate-800 text-red-700 dark:text-red-300 border border-red-200 dark:border-red-800 hover:bg-red-50 dark:hover:bg-red-900/30'
                                    }`}
                            >
                                📌 Фиксированный
                            </button>
                            <button
                                onClick={() => setNewItem({ ...newItem, type: 'variable' })}
                                className={`flex-1 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${newItem.type === 'variable'
                                    ? 'bg-red-600 text-white'
                                    : 'bg-white dark:bg-slate-800 text-red-700 dark:text-red-300 border border-red-200 dark:border-red-800 hover:bg-red-50 dark:hover:bg-red-900/30'
                                    }`}
                            >
                                📊 Переменный
                            </button>
                        </div>
                    </div>

                    <div className="flex gap-2">
                        <button
                            onClick={handleAdd}
                            disabled={!newItem.name || newItem.monthlyAmount <= 0}
                            className="flex items-center gap-2 px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg transition-colors text-sm font-medium disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            <Check className="w-4 h-4" />
                            Добавить
                        </button>
                        <button
                            onClick={() => {
                                setShowAddForm(false);
                                setNewItem({ name: '', monthlyAmount: 0, type: 'fixed' });
                            }}
                            className="flex items-center gap-2 px-4 py-2 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors text-sm font-medium"
                        >
                            <X className="w-4 h-4" />
                            Отмена
                        </button>
                    </div>
                </div>
            )}

            {/* Expense List */}
            <div className="space-y-3">
                {expenses.map((item) => (
                    <div
                        key={item.id}
                        className="group p-4 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl hover:border-red-300 dark:hover:border-red-700 hover:shadow-sm transition-all"
                    >
                        {editingId === item.id ? (
                            <div className="space-y-3">
                                <div>
                                    <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">Название</label>
                                    <input
                                        type="text"
                                        value={item.name}
                                        onChange={(e) => onUpdate(item.id, { name: e.target.value })}
                                        className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500 text-sm text-slate-900 dark:text-white"
                                    />
                                </div>
                                <div>
                                    <FormattedNumberInput
                                        label="Сумма/мес"
                                        value={item.monthlyAmount}
                                        onChange={(value) => onUpdate(item.id, { monthlyAmount: value })}
                                        showSlider={true}
                                        showQuickButtons={false}
                                    />
                                </div>
                                <button
                                    onClick={() => setEditingId(null)}
                                    className="flex items-center gap-1 px-3 py-1.5 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors text-xs font-medium"
                                >
                                    <Check className="w-3 h-3" />
                                    Готово
                                </button>
                            </div>
                        ) : (
                            <div className="flex items-center justify-between">
                                <div className="flex-1">
                                    <div className="flex items-center gap-3">
                                        <h3 className="font-medium text-slate-900 dark:text-white">{item.name}</h3>
                                        <span className="text-lg font-bold text-red-600 dark:text-red-400">
                                            {formatCurrency(item.monthlyAmount)} ₽/мес
                                        </span>
                                        <span className="px-2 py-0.5 bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 rounded text-xs">
                                            {item.type === 'fixed' ? '📌 Фиксированный' : '📊 Переменный'}
                                        </span>
                                    </div>
                                </div>
                                <div className="flex items-center gap-2 opacity-100 lg:opacity-0 lg:group-hover:opacity-100 transition-opacity">
                                    <button
                                        onClick={() => setEditingId(item.id)}
                                        className="p-2 text-red-600 hover:bg-red-50 dark:hover:bg-red-900/30 rounded-lg transition-colors"
                                        title="Редактировать"
                                    >
                                        <Edit2 className="w-4 h-4" />
                                    </button>
                                    <button
                                        onClick={() => onDelete(item.id)}
                                        className="p-2 text-red-600 hover:bg-red-50 dark:hover:bg-red-900/30 rounded-lg transition-colors"
                                        title="Удалить"
                                    >
                                        <Trash2 className="w-4 h-4" />
                                    </button>
                                </div>
                            </div>
                        )}
                    </div>
                ))}

                {expenses.length === 0 && !showAddForm && (
                    <div className="text-center py-12 bg-slate-50 dark:bg-slate-900/50 rounded-xl border-2 border-dashed border-slate-200 dark:border-slate-800">
                        <div className="text-4xl mb-3">💸</div>
                        <p className="text-slate-600 dark:text-slate-400 font-medium mb-1">Нет расходов</p>
                        <p className="text-sm text-slate-500 dark:text-slate-500">
                            Нажмите "Добавить" чтобы начать
                        </p>
                    </div>
                )}
            </div>

            {/* Total */}
            {expenses.length > 0 && (
                <div className="mt-6 p-4 bg-gradient-to-r from-red-50 to-orange-50 dark:from-red-900/20 dark:to-orange-900/20 rounded-xl border border-red-200 dark:border-red-800">
                    <div className="flex items-center justify-between">
                        <span className="text-sm font-medium text-slate-700 dark:text-slate-300">Общие месячные расходы:</span>
                        <span className="text-2xl font-bold text-red-600 dark:text-red-400">
                            {formatCurrency(expenses.reduce((sum, item) => sum + item.monthlyAmount, 0))} ₽/мес
                        </span>
                    </div>
                </div>
            )}
        </div>
    );
}
