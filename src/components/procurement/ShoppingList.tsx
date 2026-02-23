"use client";

import { motion } from "framer-motion";
import { Trash2, Minus, Plus, ShoppingCart, Download, Package } from "lucide-react";
import { ShoppingListItem, BusinessChecklist, formatPrice, calculateBudgetByCategory, getMarketplaceInfo, VARIANT_CONFIG } from "@/lib/procurement";

interface ShoppingListProps {
    items: ShoppingListItem[];
    checklist: BusinessChecklist | null;
    onUpdateQuantity: (itemId: string, delta: number) => void;
    onRemove: (itemId: string) => void;
    onExport: () => void;
}

export function ShoppingList({ items, checklist, onUpdateQuantity, onRemove, onExport }: ShoppingListProps) {
    const totalBudget = items.reduce((sum, item) => sum + item.product.price * item.quantity, 0);
    const budgetByCategory = calculateBudgetByCategory(items, checklist);

    if (items.length === 0) {
        return (
            <div className="flex flex-col items-center justify-center py-20 text-center">
                <div className="w-20 h-20 rounded-2xl bg-slate-100 dark:bg-slate-800 flex items-center justify-center mb-6">
                    <ShoppingCart className="w-10 h-10 text-slate-300 dark:text-slate-600" />
                </div>
                <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-2">Список пуст</h3>
                <p className="text-sm text-slate-500 dark:text-slate-400 max-w-sm">
                    Перейдите в «Чек-лист», выберите товары и добавьте их в список закупок
                </p>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            {/* Budget Overview */}
            <div className="bg-gradient-to-br from-amber-500 to-orange-600 rounded-2xl p-6 text-white shadow-lg shadow-amber-500/20">
                <div className="flex items-center justify-between mb-4">
                    <h3 className="font-semibold text-lg flex items-center gap-2">
                        <Package className="w-5 h-5" />
                        Общий бюджет
                    </h3>
                    <span className="text-3xl font-extrabold">{formatPrice(totalBudget)}</span>
                </div>

                {/* Breakdown by Category */}
                {budgetByCategory.length > 0 && (
                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 mt-3">
                        {budgetByCategory.map((cat) => (
                            <div key={cat.category} className="bg-white/15 rounded-lg p-2.5 backdrop-blur-sm">
                                <p className="text-[11px] text-white/70 truncate">{cat.category}</p>
                                <p className="text-sm font-bold">{formatPrice(cat.total)}</p>
                                <p className="text-[10px] text-white/60">{cat.items} поз.</p>
                            </div>
                        ))}
                    </div>
                )}
            </div>

            {/* Items Table */}
            <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 overflow-hidden">
                <div className="px-5 py-4 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between">
                    <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                        Выбранные товары ({items.length})
                    </h3>
                    <button
                        onClick={onExport}
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold text-amber-600 dark:text-amber-400 bg-amber-50 dark:bg-amber-900/20 hover:bg-amber-100 dark:hover:bg-amber-900/30 transition-colors"
                    >
                        <Download className="w-3.5 h-3.5" />
                        Экспорт
                    </button>
                </div>

                <div className="divide-y divide-slate-100 dark:divide-slate-800">
                    {items.map((item, index) => {
                        const variant = VARIANT_CONFIG[item.product.variant];
                        const marketplace = getMarketplaceInfo(item.product.marketplace);
                        const itemTotal = item.product.price * item.quantity;

                        return (
                            <motion.div
                                key={item.id}
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: index * 0.05 }}
                                className="flex items-center gap-4 px-5 py-4 hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors"
                            >
                                {/* Product Info */}
                                <div className="flex-1 min-w-0">
                                    <div className="flex items-center gap-2 mb-1">
                                        <span className="text-sm font-medium text-slate-900 dark:text-white truncate">
                                            {item.product.name}
                                        </span>
                                        <span className={`px-1.5 py-0.5 rounded text-[10px] font-bold ${variant.color} ${variant.bgColor} shrink-0`}>
                                            {variant.label}
                                        </span>
                                    </div>
                                    <div className="flex items-center gap-2 text-xs text-slate-400">
                                        <span>{marketplace.icon} {marketplace.name}</span>
                                        <span>•</span>
                                        <span>{formatPrice(item.product.price)} / шт</span>
                                    </div>
                                </div>

                                {/* Quantity Controls */}
                                <div className="flex items-center gap-1 shrink-0">
                                    <button
                                        onClick={() => onUpdateQuantity(item.id, -1)}
                                        disabled={item.quantity <= 1}
                                        className="w-7 h-7 rounded-lg border border-slate-200 dark:border-slate-700 flex items-center justify-center text-slate-500 hover:text-slate-900 dark:hover:text-white hover:border-slate-300 dark:hover:border-slate-600 transition-colors disabled:opacity-30"
                                    >
                                        <Minus className="w-3 h-3" />
                                    </button>
                                    <span className="w-8 text-center text-sm font-semibold text-slate-900 dark:text-white">
                                        {item.quantity}
                                    </span>
                                    <button
                                        onClick={() => onUpdateQuantity(item.id, 1)}
                                        className="w-7 h-7 rounded-lg border border-slate-200 dark:border-slate-700 flex items-center justify-center text-slate-500 hover:text-slate-900 dark:hover:text-white hover:border-slate-300 dark:hover:border-slate-600 transition-colors"
                                    >
                                        <Plus className="w-3 h-3" />
                                    </button>
                                </div>

                                {/* Total */}
                                <span className="text-sm font-bold text-slate-900 dark:text-white w-28 text-right shrink-0">
                                    {formatPrice(itemTotal)}
                                </span>

                                {/* Remove */}
                                <button
                                    onClick={() => onRemove(item.id)}
                                    className="p-2 rounded-lg text-slate-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors shrink-0"
                                >
                                    <Trash2 className="w-4 h-4" />
                                </button>
                            </motion.div>
                        );
                    })}
                </div>

                {/* Total Footer */}
                <div className="px-5 py-4 bg-slate-50 dark:bg-slate-800/50 border-t border-slate-200 dark:border-slate-800 flex items-center justify-between">
                    <span className="text-sm font-bold text-slate-900 dark:text-white">Итого:</span>
                    <span className="text-xl font-extrabold text-amber-600 dark:text-amber-400">{formatPrice(totalBudget)}</span>
                </div>
            </div>
        </div>
    );
}
