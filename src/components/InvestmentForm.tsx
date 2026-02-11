'use client';

import { useState } from 'react';
import { Plus, Trash2, Check, X, Edit2 } from 'lucide-react';
import { FormattedNumberInput } from './FormattedNumberInput';

interface InvestmentItem {
    id: string;
    category: string;
    amount: number;
    description?: string;
}

interface InvestmentFormProps {
    investments: InvestmentItem[];
    onAdd: (item: Omit<InvestmentItem, 'id'>) => void;
    onUpdate: (id: string, updates: Partial<InvestmentItem>) => void;
    onDelete: (id: string) => void;
}

export function InvestmentForm({ investments, onAdd, onUpdate, onDelete }: InvestmentFormProps) {
    const [editingId, setEditingId] = useState<string | null>(null);
    const [showAddForm, setShowAddForm] = useState(false);
    const [newItem, setNewItem] = useState({ category: '', amount: 0, description: '' });

    const handleAdd = () => {
        if (newItem.category && newItem.amount > 0) {
            onAdd(newItem);
            setNewItem({ category: '', amount: 0, description: '' });
            setShowAddForm(false);
        }
    };

    const formatCurrency = (value: number) => {
        return new Intl.NumberFormat('ru-RU').format(value);
    };

    const quickCategories = [
        { name: 'Оборудование', icon: '🖥️' },
        { name: 'Мебель', icon: '🪑' },
        { name: 'Ремонт', icon: '🔨' },
        { name: 'Техника', icon: '⚙️' },
        { name: 'Инвентарь', icon: '📦' },
        { name: 'Другое', icon: '📋' },
    ];

    return (
        <div>
            <div className="flex items-center justify-between mb-6">
                <div>
                    <h2 className="text-lg font-semibold text-slate-900 dark:text-white">Начальные инвестиции</h2>
                    <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
                        Укажите все первоначальные затраты на запуск бизнеса
                    </p>
                </div>
                <button
                    onClick={() => setShowAddForm(!showAddForm)}
                    className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors text-sm font-medium"
                >
                    <Plus className="w-4 h-4" />
                    Добавить
                </button>
            </div>

            {/* Add Form */}
            {showAddForm && (
                <div className="mb-6 p-4 bg-blue-50 dark:bg-slate-900/50 border border-blue-200 dark:border-blue-900/50 rounded-xl">
                    <h3 className="text-sm font-medium text-blue-900 dark:text-blue-200 mb-3">Новая инвестиция</h3>

                    {/* Quick Categories */}
                    <div className="mb-3">
                        <p className="text-xs text-blue-700 dark:text-blue-300/70 mb-2">Быстрый выбор:</p>
                        <div className="flex flex-wrap gap-2">
                            {quickCategories.map((cat) => (
                                <button
                                    key={cat.name}
                                    onClick={() => setNewItem({ ...newItem, category: cat.name })}
                                    className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${newItem.category === cat.name
                                        ? 'bg-blue-600 text-white'
                                        : 'bg-white dark:bg-slate-800 text-blue-700 dark:text-blue-300 hover:bg-blue-100 dark:hover:bg-slate-700'
                                        }`}
                                >
                                    {cat.icon} {cat.name}
                                </button>
                            ))}
                        </div>
                    </div>

                    <div className="mb-3">
                        <label className="block text-xs font-medium text-blue-900 dark:text-blue-200 mb-1">
                            Название <span className="text-red-500">*</span>
                        </label>
                        <input
                            type="text"
                            value={newItem.category}
                            onChange={(e) => setNewItem({ ...newItem, category: e.target.value })}
                            className="w-full px-3 py-2 bg-white dark:bg-slate-950 border border-blue-200 dark:border-slate-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm text-slate-900 dark:text-white placeholder-slate-400"
                            placeholder="Например: Компьютеры"
                        />
                    </div>

                    <div className="mb-3">
                        <FormattedNumberInput
                            label="Сумма"
                            value={newItem.amount}
                            onChange={(value) => setNewItem({ ...newItem, amount: value })}
                            placeholder="0"
                            showSlider={true}
                            showQuickButtons={true}
                        />
                    </div>

                    <div className="mb-3">
                        <label className="block text-xs font-medium text-blue-900 dark:text-blue-200 mb-1">
                            Описание (опционально)
                        </label>
                        <input
                            type="text"
                            value={newItem.description}
                            onChange={(e) => setNewItem({ ...newItem, description: e.target.value })}
                            className="w-full px-3 py-2 bg-white dark:bg-slate-950 border border-blue-200 dark:border-slate-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm text-slate-900 dark:text-white placeholder-slate-400"
                            placeholder="Дополнительная информация"
                        />
                    </div>

                    <div className="flex gap-2">
                        <button
                            onClick={handleAdd}
                            disabled={!newItem.category || newItem.amount <= 0}
                            className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors text-sm font-medium disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            <Check className="w-4 h-4" />
                            Добавить
                        </button>
                        <button
                            onClick={() => {
                                setShowAddForm(false);
                                setNewItem({ category: '', amount: 0, description: '' });
                            }}
                            className="flex items-center gap-2 px-4 py-2 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors text-sm font-medium"
                        >
                            <X className="w-4 h-4" />
                            Отмена
                        </button>
                    </div>
                </div>
            )}

            {/* Investment List */}
            <div className="space-y-3">
                {investments.map((item) => (
                    <div
                        key={item.id}
                        className="group p-4 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl hover:border-blue-300 dark:hover:border-blue-700 hover:shadow-sm transition-all"
                    >
                        {editingId === item.id ? (
                            <div className="space-y-3">
                                <div>
                                    <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">Название</label>
                                    <input
                                        type="text"
                                        value={item.category}
                                        onChange={(e) => onUpdate(item.id, { category: e.target.value })}
                                        className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm text-slate-900 dark:text-white"
                                    />
                                </div>
                                <div>
                                    <FormattedNumberInput
                                        label="Сумма"
                                        value={item.amount}
                                        onChange={(value) => onUpdate(item.id, { amount: value })}
                                        showSlider={true}
                                        showQuickButtons={false}
                                    />
                                </div>
                                <div className="flex gap-2">
                                    <button
                                        onClick={() => setEditingId(null)}
                                        className="flex items-center gap-1 px-3 py-1.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-xs font-medium"
                                    >
                                        <Check className="w-3 h-3" />
                                        Готово
                                    </button>
                                </div>
                            </div>
                        ) : (
                            <div className="flex items-center justify-between">
                                <div className="flex-1">
                                    <div className="flex items-center gap-3">
                                        <h3 className="font-medium text-slate-900 dark:text-white">{item.category}</h3>
                                        <span className="text-lg font-bold text-blue-600 dark:text-blue-400">
                                            {formatCurrency(item.amount)} ₽
                                        </span>
                                    </div>
                                    {item.description && (
                                        <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">{item.description}</p>
                                    )}
                                </div>
                                <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                    <button
                                        onClick={() => setEditingId(item.id)}
                                        className="p-2 text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900/30 rounded-lg transition-colors"
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

                {investments.length === 0 && !showAddForm && (
                    <div className="text-center py-12 bg-slate-50 rounded-xl border-2 border-dashed border-slate-200">
                        <div className="text-4xl mb-3">💰</div>
                        <p className="text-slate-600 font-medium mb-1">Нет инвестиций</p>
                        <p className="text-sm text-slate-500">
                            Нажмите "Добавить" чтобы начать
                        </p>
                    </div>
                )}
            </div>

            {/* Total */}
            {investments.length > 0 && (
                <div className="mt-6 p-4 bg-gradient-to-r from-blue-50 to-purple-50 dark:from-blue-950/30 dark:to-purple-950/30 rounded-xl border border-blue-200 dark:border-blue-900">
                    <div className="flex items-center justify-between">
                        <span className="text-sm font-medium text-slate-700 dark:text-slate-300">Общая сумма инвестиций:</span>
                        <span className="text-2xl font-bold text-blue-600 dark:text-blue-400">
                            {formatCurrency(investments.reduce((sum, item) => sum + item.amount, 0))} ₽
                        </span>
                    </div>
                </div>
            )}
        </div>
    );
}
