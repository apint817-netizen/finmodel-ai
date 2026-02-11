'use client';

import { useState } from 'react';
import { Plus, Trash2, Check, X, Edit2 } from 'lucide-react';
import { FormattedNumberInput } from './FormattedNumberInput';

interface RevenueItem {
    id: string;
    name: string;
    monthlyAmount: number;
    type: 'recurring' | 'one-time';
}

interface RevenueFormProps {
    revenues: RevenueItem[];
    onAdd: (item: Omit<RevenueItem, 'id'>) => void;
    onUpdate: (id: string, updates: Partial<RevenueItem>) => void;
    onDelete: (id: string) => void;
}

export function RevenueForm({ revenues, onAdd, onUpdate, onDelete }: RevenueFormProps) {
    const [editingId, setEditingId] = useState<string | null>(null);
    const [showAddForm, setShowAddForm] = useState(false);
    const [newItem, setNewItem] = useState<Omit<RevenueItem, 'id'>>({ name: '', monthlyAmount: 0, type: 'recurring' });

    const handleAdd = () => {
        if (newItem.name && newItem.monthlyAmount > 0) {
            onAdd(newItem);
            setNewItem({ name: '', monthlyAmount: 0, type: 'recurring' });
            setShowAddForm(false);
        }
    };

    const formatCurrency = (value: number) => {
        return new Intl.NumberFormat('ru-RU').format(value);
    };

    const quickRevenues = [
        { name: 'Продажи товаров', icon: '🛒' },
        { name: 'Услуги', icon: '✂️' },
        { name: 'Аренда', icon: '🏠' },
        { name: 'Подписки', icon: '📱' },
        { name: 'Консультации', icon: '💼' },
        { name: 'Другое', icon: '💰' },
    ];

    return (
        <div>
            <div className="flex items-center justify-between mb-6">
                <div>
                    <h2 className="text-lg font-semibold text-slate-900 dark:text-white">Источники дохода</h2>
                    <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
                        Укажите все источники месячного дохода
                    </p>
                </div>
                <button
                    onClick={() => setShowAddForm(!showAddForm)}
                    className="flex items-center gap-2 px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg transition-colors text-sm font-medium"
                >
                    <Plus className="w-4 h-4" />
                    Добавить
                </button>
            </div>

            {/* Add Form */}
            {
                showAddForm && (
                    <div className="mb-6 p-4 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-xl">
                        <h3 className="text-sm font-medium text-green-900 dark:text-green-200 mb-3">Новый источник дохода</h3>

                        {/* Quick Categories */}
                        <div className="mb-3">
                            <p className="text-xs text-green-700 dark:text-green-300/70 mb-2">Быстрый выбор:</p>
                            <div className="flex flex-wrap gap-2">
                                {quickRevenues.map((rev) => (
                                    <button
                                        key={rev.name}
                                        onClick={() => setNewItem({ ...newItem, name: rev.name })}
                                        className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${newItem.name === rev.name
                                            ? 'bg-green-600 text-white'
                                            : 'bg-white dark:bg-slate-800 text-green-700 dark:text-green-300 hover:bg-green-100 dark:hover:bg-slate-700'
                                            }`}
                                    >
                                        {rev.icon} {rev.name}
                                    </button>
                                ))}
                            </div>
                        </div>

                        <div className="mb-3">
                            <label className="block text-xs font-medium text-green-900 dark:text-green-200 mb-1">
                                Название <span className="text-red-500">*</span>
                            </label>
                            <input
                                type="text"
                                value={newItem.name}
                                onChange={(e) => setNewItem({ ...newItem, name: e.target.value })}
                                className="w-full px-3 py-2 bg-white dark:bg-slate-950 border border-green-200 dark:border-slate-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 text-sm text-slate-900 dark:text-white placeholder-slate-400"
                                placeholder="Например: Продажи"
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
                            <label className="block text-xs font-medium text-green-900 dark:text-green-200 mb-2">Тип дохода</label>
                            <div className="flex gap-2">
                                <button
                                    onClick={() => setNewItem({ ...newItem, type: 'recurring' })}
                                    className={`flex-1 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${newItem.type === 'recurring'
                                        ? 'bg-green-600 text-white'
                                        : 'bg-white dark:bg-slate-800 text-green-700 dark:text-green-300 border border-green-200 dark:border-green-800 hover:bg-green-50 dark:hover:bg-green-900/30'
                                        }`}
                                >
                                    🔄 Регулярный
                                </button>
                                <button
                                    onClick={() => setNewItem({ ...newItem, type: 'one-time' })}
                                    className={`flex-1 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${newItem.type === 'one-time'
                                        ? 'bg-green-600 text-white'
                                        : 'bg-white dark:bg-slate-800 text-green-700 dark:text-green-300 border border-green-200 dark:border-green-800 hover:bg-green-50 dark:hover:bg-green-900/30'
                                        }`}
                                >
                                    ⚡ Разовый
                                </button>
                            </div>
                        </div>

                        <div className="flex gap-2">
                            <button
                                onClick={handleAdd}
                                disabled={!newItem.name || newItem.monthlyAmount <= 0}
                                className="flex items-center gap-2 px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg transition-colors text-sm font-medium disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                <Check className="w-4 h-4" />
                                Добавить
                            </button>
                            <button
                                onClick={() => {
                                    setShowAddForm(false);
                                    setNewItem({ name: '', monthlyAmount: 0, type: 'recurring' });
                                }}
                                className="flex items-center gap-2 px-4 py-2 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors text-sm font-medium"
                            >
                                <X className="w-4 h-4" />
                                Отмена
                            </button>
                        </div>
                    </div>
                )
            }

            {/* Revenue List */}
            <div className="space-y-3">
                {revenues.map((item) => (
                    <div
                        key={item.id}
                        className="group p-4 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl hover:border-green-300 dark:hover:border-green-700 hover:shadow-sm transition-all"
                    >
                        {editingId === item.id ? (
                            <div className="space-y-3">
                                <div className="grid grid-cols-2 gap-3">
                                    <input
                                        type="text"
                                        value={item.name}
                                        onChange={(e) => onUpdate(item.id, { name: e.target.value })}
                                        className="px-3 py-2 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 text-sm text-slate-900 dark:text-white"
                                    />
                                    <input
                                        type="number"
                                        value={item.monthlyAmount}
                                        onChange={(e) => onUpdate(item.id, { monthlyAmount: Number(e.target.value) })}
                                        className="px-3 py-2 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 text-sm text-slate-900 dark:text-white"
                                    />
                                </div>
                                <button
                                    onClick={() => setEditingId(null)}
                                    className="flex items-center gap-1 px-3 py-1.5 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors text-xs font-medium"
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
                                        <span className="text-lg font-bold text-green-600 dark:text-green-400">
                                            {formatCurrency(item.monthlyAmount)} ₽/мес
                                        </span>
                                        <span className="px-2 py-0.5 bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 rounded text-xs">
                                            {item.type === 'recurring' ? '🔄 Регулярный' : '⚡ Разовый'}
                                        </span>
                                    </div>
                                </div>
                                <div className="flex items-center gap-2 opacity-100 lg:opacity-0 lg:group-hover:opacity-100 transition-opacity">
                                    <button
                                        onClick={() => setEditingId(item.id)}
                                        className="p-2 text-green-600 hover:bg-green-50 dark:hover:bg-green-900/30 rounded-lg transition-colors"
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

                {revenues.length === 0 && !showAddForm && (
                    <div className="text-center py-12 bg-slate-50 dark:bg-slate-900/50 rounded-xl border-2 border-dashed border-slate-200 dark:border-slate-800">
                        <div className="text-4xl mb-3">📈</div>
                        <p className="text-slate-600 dark:text-slate-400 font-medium mb-1">Нет источников дохода</p>
                        <p className="text-sm text-slate-500 dark:text-slate-500">
                            Нажмите "Добавить" чтобы начать
                        </p>
                    </div>
                )}
            </div>

            {/* Total */}
            {
                revenues.length > 0 && (
                    <div className="mt-6 p-4 bg-gradient-to-r from-green-50 to-emerald-50 dark:from-green-900/20 dark:to-emerald-900/20 rounded-xl border border-green-200 dark:border-green-800">
                        <div className="flex items-center justify-between">
                            <span className="text-sm font-medium text-slate-700 dark:text-slate-300">Общий месячный доход:</span>
                            <span className="text-2xl font-bold text-green-600 dark:text-green-400">
                                {formatCurrency(revenues.reduce((sum, item) => sum + item.monthlyAmount, 0))} ₽/мес
                            </span>
                        </div>
                    </div>
                )
            }
        </div >
    );
}
