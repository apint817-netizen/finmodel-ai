"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronDown, CheckCircle2, Circle, AlertTriangle, Info, ShoppingCart, Package } from "lucide-react";
import { BusinessChecklist, ChecklistItem, ProductRecommendation, PRIORITY_CONFIG, formatPrice } from "@/lib/procurement";
import { ProductCard } from "./ProductCard";

interface ChecklistTabProps {
    checklist: BusinessChecklist;
    onToggleItem: (itemId: string) => void;
    onAddToShoppingList: (checklistItemId: string, product: ProductRecommendation) => void;
    shoppingListIds: Set<string>;
}

export function ChecklistTab({ checklist, onToggleItem, onAddToShoppingList, shoppingListIds }: ChecklistTabProps) {
    const [expandedCategories, setExpandedCategories] = useState<Set<string>>(new Set(checklist.categories.slice(0, 2)));
    const [expandedItems, setExpandedItems] = useState<Set<string>>(new Set());

    const toggleCategory = (cat: string) => {
        setExpandedCategories((prev) => {
            const next = new Set(prev);
            if (next.has(cat)) next.delete(cat);
            else next.add(cat);
            return next;
        });
    };

    const toggleItem = (itemId: string) => {
        setExpandedItems((prev) => {
            const next = new Set(prev);
            if (next.has(itemId)) next.delete(itemId);
            else next.add(itemId);
            return next;
        });
    };

    const itemsByCategory = checklist.categories.reduce((acc, cat) => {
        acc[cat] = checklist.items.filter((item) => item.category === cat);
        return acc;
    }, {} as Record<string, ChecklistItem[]>);

    const totalItems = checklist.items.length;
    const checkedItems = checklist.items.filter((i) => i.checked).length;
    const progressPercent = totalItems > 0 ? Math.round((checkedItems / totalItems) * 100) : 0;

    return (
        <div className="space-y-6">
            {/* Progress Bar */}
            <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-5">
                <div className="flex items-center justify-between mb-3">
                    <h3 className="text-sm font-semibold text-slate-900 dark:text-white flex items-center gap-2">
                        <Package className="w-4 h-4 text-amber-500" />
                        Прогресс закупок
                    </h3>
                    <span className="text-sm font-bold text-amber-600 dark:text-amber-400">
                        {checkedItems}/{totalItems}
                    </span>
                </div>
                <div className="w-full h-2.5 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                    <motion.div
                        className="h-full bg-gradient-to-r from-amber-500 to-orange-500 rounded-full"
                        initial={{ width: 0 }}
                        animate={{ width: `${progressPercent}%` }}
                        transition={{ duration: 0.5, ease: "easeOut" }}
                    />
                </div>
            </div>

            {/* Warnings */}
            {checklist.warnings.length > 0 && (
                <div className="bg-amber-50 dark:bg-amber-900/10 border border-amber-200 dark:border-amber-900/30 rounded-xl p-4 space-y-2">
                    {checklist.warnings.map((w, i) => (
                        <div key={i} className="flex items-start gap-2 text-sm text-amber-800 dark:text-amber-300">
                            <AlertTriangle className="w-4 h-4 mt-0.5 shrink-0" />
                            <span>{w}</span>
                        </div>
                    ))}
                </div>
            )}

            {/* Tips */}
            {checklist.tips.length > 0 && (
                <div className="bg-blue-50 dark:bg-blue-900/10 border border-blue-200 dark:border-blue-900/30 rounded-xl p-4 space-y-2">
                    {checklist.tips.map((t, i) => (
                        <div key={i} className="flex items-start gap-2 text-sm text-blue-800 dark:text-blue-300">
                            <Info className="w-4 h-4 mt-0.5 shrink-0" />
                            <span>{t}</span>
                        </div>
                    ))}
                </div>
            )}

            {/* Categories */}
            {checklist.categories.map((cat) => {
                const items = itemsByCategory[cat] || [];
                const isExpanded = expandedCategories.has(cat);
                const catChecked = items.filter((i) => i.checked).length;
                const categoryEmojis: Record<string, string> = {
                    "Компьютерная техника": "💻",
                    "Мебель": "🪑",
                    "Периферия": "🖱️",
                    "Расходники": "📦",
                    "Ремонт": "🔧",
                    "Освещение": "💡",
                    "Сети и коммуникации": "🌐",
                    "Вентиляция": "🌬️",
                    "Безопасность": "🔒",
                    "Техника": "⚡",
                    "Оборудование": "🏭",
                    "Декор": "🎨",
                };
                const emoji = Object.entries(categoryEmojis).find(([key]) =>
                    cat.toLowerCase().includes(key.toLowerCase())
                )?.[1] || "📋";

                return (
                    <div key={cat} className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 overflow-hidden">
                        {/* Category Header */}
                        <button
                            onClick={() => toggleCategory(cat)}
                            className="w-full flex items-center justify-between p-5 hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors"
                        >
                            <div className="flex items-center gap-3">
                                <span className="text-xl">{emoji}</span>
                                <div className="text-left">
                                    <h3 className="text-base font-bold text-slate-900 dark:text-white">{cat}</h3>
                                    <p className="text-xs text-slate-400">{catChecked}/{items.length} позиций</p>
                                </div>
                            </div>
                            <ChevronDown className={`w-5 h-5 text-slate-400 transition-transform duration-300 ${isExpanded ? "rotate-180" : ""}`} />
                        </button>

                        {/* Items */}
                        <AnimatePresence>
                            {isExpanded && (
                                <motion.div
                                    initial={{ height: 0, opacity: 0 }}
                                    animate={{ height: "auto", opacity: 1 }}
                                    exit={{ height: 0, opacity: 0 }}
                                    transition={{ duration: 0.3 }}
                                    className="overflow-hidden"
                                >
                                    <div className="border-t border-slate-100 dark:border-slate-800">
                                        {items.map((item) => {
                                            const isItemExpanded = expandedItems.has(item.id);
                                            const priority = PRIORITY_CONFIG[item.priority];

                                            return (
                                                <div key={item.id} className="border-b last:border-b-0 border-slate-100 dark:border-slate-800">
                                                    <div className="flex items-center gap-3 p-4">
                                                        {/* Checkbox */}
                                                        <button
                                                            onClick={() => onToggleItem(item.id)}
                                                            className="shrink-0"
                                                        >
                                                            {item.checked ? (
                                                                <CheckCircle2 className="w-5 h-5 text-emerald-500" />
                                                            ) : (
                                                                <Circle className="w-5 h-5 text-slate-300 dark:text-slate-600 hover:text-amber-500 transition-colors" />
                                                            )}
                                                        </button>

                                                        {/* Item Info */}
                                                        <div className="flex-1 min-w-0">
                                                            <div className="flex items-center gap-2 mb-0.5">
                                                                <span className={`text-sm font-medium ${item.checked ? "line-through text-slate-400" : "text-slate-900 dark:text-white"}`}>
                                                                    {item.name}
                                                                </span>
                                                                <span className={`px-1.5 py-0.5 rounded text-[10px] font-bold ${priority.color} ${priority.bgColor}`}>
                                                                    {priority.label}
                                                                </span>
                                                            </div>
                                                            <p className="text-xs text-slate-400 truncate">{item.description}</p>
                                                        </div>

                                                        {/* Quantity & Expand */}
                                                        <span className="text-sm text-slate-500 dark:text-slate-400 font-medium shrink-0">
                                                            ×{item.quantity}
                                                        </span>

                                                        <button
                                                            onClick={() => toggleItem(item.id)}
                                                            className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-medium text-amber-600 dark:text-amber-400 bg-amber-50 dark:bg-amber-900/20 hover:bg-amber-100 dark:hover:bg-amber-900/30 transition-colors shrink-0"
                                                        >
                                                            <ShoppingCart className="w-3.5 h-3.5" />
                                                            Товары
                                                            <ChevronDown className={`w-3 h-3 transition-transform ${isItemExpanded ? "rotate-180" : ""}`} />
                                                        </button>
                                                    </div>

                                                    {/* Products Grid */}
                                                    <AnimatePresence>
                                                        {isItemExpanded && item.products.length > 0 && (
                                                            <motion.div
                                                                initial={{ height: 0, opacity: 0 }}
                                                                animate={{ height: "auto", opacity: 1 }}
                                                                exit={{ height: 0, opacity: 0 }}
                                                                transition={{ duration: 0.25 }}
                                                                className="overflow-hidden"
                                                            >
                                                                <div className="px-4 pb-4 pt-1">
                                                                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                                                                        {item.products.map((prod) => (
                                                                            <ProductCard
                                                                                key={prod.id}
                                                                                product={prod}
                                                                                onAdd={(p) => onAddToShoppingList(item.id, p)}
                                                                                isAdded={shoppingListIds.has(prod.id)}
                                                                            />
                                                                        ))}
                                                                    </div>
                                                                </div>
                                                            </motion.div>
                                                        )}
                                                    </AnimatePresence>
                                                </div>
                                            );
                                        })}
                                    </div>
                                </motion.div>
                            )}
                        </AnimatePresence>
                    </div>
                );
            })}
        </div>
    );
}
