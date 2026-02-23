"use client";

import { useState, useCallback, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ClipboardList, ShoppingCart, MessageSquare, Sparkles, RotateCcw } from "lucide-react";
import {
    BusinessChecklist,
    ShoppingListItem,
    ProductRecommendation,
    generateItemId,
} from "@/lib/procurement";
import { ChecklistTab } from "./ChecklistTab";
import { ShoppingList } from "./ShoppingList";
import { ProcurementChat } from "./ProcurementChat";

type TabId = "checklist" | "shopping" | "chat";

const TABS: { id: TabId; label: string; icon: React.ElementType }[] = [
    { id: "checklist", label: "Чек-лист", icon: ClipboardList },
    { id: "shopping", label: "Закупки", icon: ShoppingCart },
    { id: "chat", label: "AI-Чат", icon: MessageSquare },
];

interface ProcurementDashboardProps {
    initialChecklist: BusinessChecklist;
    onReset: () => void;
}

export function ProcurementDashboard({ initialChecklist, onReset }: ProcurementDashboardProps) {
    const [activeTab, setActiveTab] = useState<TabId>("checklist");
    const [checklist, setChecklist] = useState<BusinessChecklist>(initialChecklist);
    const [shoppingList, setShoppingList] = useState<ShoppingListItem[]>([]);

    // Track added product IDs for "already added" indicator
    const shoppingListIds = useMemo(
        () => new Set(shoppingList.map((s) => s.product.id)),
        [shoppingList]
    );

    const shoppingListTotal = useMemo(
        () => shoppingList.reduce((sum, item) => sum + item.product.price * item.quantity, 0),
        [shoppingList]
    );

    // Checklist handlers
    const handleToggleItem = useCallback((itemId: string) => {
        setChecklist((prev) => ({
            ...prev,
            items: prev.items.map((item) =>
                item.id === itemId ? { ...item, checked: !item.checked } : item
            ),
        }));
    }, []);

    // Shopping list handlers
    const handleAddToShoppingList = useCallback((checklistItemId: string, product: ProductRecommendation) => {
        if (shoppingListIds.has(product.id)) return;

        const clItem = checklist.items.find((i) => i.id === checklistItemId);
        const qty = clItem?.quantity || 1;

        setShoppingList((prev) => [
            ...prev,
            {
                id: generateItemId(),
                checklistItemId,
                product,
                quantity: qty,
            },
        ]);
    }, [shoppingListIds, checklist.items]);

    const handleUpdateQuantity = useCallback((itemId: string, delta: number) => {
        setShoppingList((prev) =>
            prev.map((item) =>
                item.id === itemId
                    ? { ...item, quantity: Math.max(1, item.quantity + delta) }
                    : item
            )
        );
    }, []);

    const handleRemoveFromShoppingList = useCallback((itemId: string) => {
        setShoppingList((prev) => prev.filter((item) => item.id !== itemId));
    }, []);

    const handleExport = useCallback(() => {
        // Build CSV content
        const headers = ["Товар", "Вариант", "Цена за шт.", "Кол-во", "Сумма", "Маркетплейс", "Ссылка"];
        const rows = shoppingList.map((item) => [
            item.product.name,
            item.product.variant === "budget" ? "Бюджет" : item.product.variant === "optimal" ? "Оптимальный" : "Премиум",
            item.product.price,
            item.quantity,
            item.product.price * item.quantity,
            item.product.marketplace,
            item.product.searchUrl,
        ]);

        const csv = [headers.join(";"), ...rows.map((r) => r.join(";"))].join("\n");
        const blob = new Blob(["\uFEFF" + csv], { type: "text/csv;charset=utf-8;" });
        const url = URL.createObjectURL(blob);
        const link = document.createElement("a");
        link.href = url;
        link.download = `закупки_${checklist.businessType.replace(/\s+/g, "_")}.csv`;
        link.click();
        URL.revokeObjectURL(url);
    }, [shoppingList, checklist.businessType]);

    const businessContext = {
        businessType: checklist.businessType,
        city: checklist.city,
        budget: checklist.budget,
    };

    return (
        <div className="space-y-6">
            {/* Header Summary */}
            <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-5">
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-amber-500 to-orange-600 flex items-center justify-center shadow-lg shadow-amber-500/20">
                            <Sparkles className="w-5 h-5 text-white" />
                        </div>
                        <div>
                            <h2 className="text-lg font-bold text-slate-900 dark:text-white">{checklist.businessType}</h2>
                            <p className="text-xs text-slate-400">
                                {checklist.city} • {checklist.items.length} позиций • Бюджет закупок: {shoppingListTotal.toLocaleString("ru-RU")} ₽
                            </p>
                        </div>
                    </div>
                    <button
                        onClick={onReset}
                        className="inline-flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs font-medium text-slate-500 hover:text-slate-700 dark:hover:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                    >
                        <RotateCcw className="w-3.5 h-3.5" />
                        Новый проект
                    </button>
                </div>
            </div>

            {/* Tabs */}
            <div className="flex gap-1 bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 p-1.5">
                {TABS.map((tab) => {
                    const Icon = tab.icon;
                    const isActive = activeTab === tab.id;
                    const badge = tab.id === "shopping" && shoppingList.length > 0 ? shoppingList.length : null;

                    return (
                        <button
                            key={tab.id}
                            onClick={() => setActiveTab(tab.id)}
                            className={`
                                flex-1 flex items-center justify-center gap-2 py-2.5 px-4 rounded-lg text-sm font-medium transition-all duration-200 relative
                                ${isActive
                                    ? "bg-gradient-to-r from-amber-500 to-orange-600 text-white shadow-md shadow-amber-500/20"
                                    : "text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-50 dark:hover:bg-slate-800"
                                }
                            `}
                        >
                            <Icon className="w-4 h-4" />
                            {tab.label}
                            {badge && (
                                <span className={`
                                    ml-1 px-1.5 py-0.5 rounded-full text-[10px] font-bold
                                    ${isActive
                                        ? "bg-white/25 text-white"
                                        : "bg-amber-100 dark:bg-amber-900/30 text-amber-600 dark:text-amber-400"
                                    }
                                `}>
                                    {badge}
                                </span>
                            )}
                        </button>
                    );
                })}
            </div>

            {/* Tab Content */}
            <AnimatePresence mode="wait">
                <motion.div
                    key={activeTab}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    transition={{ duration: 0.2 }}
                >
                    {activeTab === "checklist" && (
                        <ChecklistTab
                            checklist={checklist}
                            onToggleItem={handleToggleItem}
                            onAddToShoppingList={handleAddToShoppingList}
                            shoppingListIds={shoppingListIds}
                        />
                    )}

                    {activeTab === "shopping" && (
                        <ShoppingList
                            items={shoppingList}
                            checklist={checklist}
                            onUpdateQuantity={handleUpdateQuantity}
                            onRemove={handleRemoveFromShoppingList}
                            onExport={handleExport}
                        />
                    )}

                    {activeTab === "chat" && (
                        <ProcurementChat businessContext={businessContext} />
                    )}
                </motion.div>
            </AnimatePresence>
        </div>
    );
}
