// ==========================================
// AI Бизнес-Закупщик — Types & Utilities
// ==========================================

// --------------- Types ---------------

export type PriceVariant = "budget" | "optimal" | "premium";

export interface ProductRecommendation {
    id: string;
    name: string;
    variant: PriceVariant;
    price: number;
    rating: number; // 1-5
    marketplace: "yandex_market" | "ozon" | "wildberries" | "other";
    searchUrl: string;
    imageUrl?: string;
    reason: string; // AI justification
}

export interface ChecklistItem {
    id: string;
    category: string;
    name: string;
    quantity: number;
    description: string;
    priority: "required" | "recommended" | "optional";
    products: ProductRecommendation[];
    checked: boolean;
}

export interface BusinessChecklist {
    businessType: string;
    businessDescription: string;
    city: string;
    budget: number;
    categories: string[];
    items: ChecklistItem[];
    warnings: string[];
    tips: string[];
}

export interface ShoppingListItem {
    id: string;
    checklistItemId: string;
    product: ProductRecommendation;
    quantity: number;
}

export interface ProcurementState {
    businessDescription: string;
    city: string;
    budget: number;
    checklist: BusinessChecklist | null;
    shoppingList: ShoppingListItem[];
    isLoading: boolean;
}

// --------------- Marketplace Helpers ---------------

const MARKETPLACE_CONFIG = {
    yandex_market: {
        name: "Яндекс Маркет",
        icon: "🟡",
        color: "text-yellow-500",
        bgColor: "bg-yellow-50 dark:bg-yellow-900/20",
        searchBase: "https://market.yandex.ru/search?text=",
    },
    ozon: {
        name: "Ozon",
        icon: "🔵",
        color: "text-blue-500",
        bgColor: "bg-blue-50 dark:bg-blue-900/20",
        searchBase: "https://www.ozon.ru/search/?text=",
    },
    wildberries: {
        name: "Wildberries",
        icon: "🟣",
        color: "text-purple-500",
        bgColor: "bg-purple-50 dark:bg-purple-900/20",
        searchBase: "https://www.wildberries.ru/catalog/0/search.aspx?search=",
    },
    other: {
        name: "Другой",
        icon: "⚪",
        color: "text-slate-500",
        bgColor: "bg-slate-50 dark:bg-slate-800",
        searchBase: "https://www.google.com/search?q=купить+",
    },
} as const;

export function getMarketplaceInfo(marketplace: ProductRecommendation["marketplace"]) {
    return MARKETPLACE_CONFIG[marketplace];
}

export function buildSearchUrl(query: string, marketplace: ProductRecommendation["marketplace"]): string {
    const config = MARKETPLACE_CONFIG[marketplace];
    return `${config.searchBase}${encodeURIComponent(query)}`;
}

// --------------- Budget Calculation ---------------

export function calculateShoppingBudget(items: ShoppingListItem[]) {
    const total = items.reduce((sum, item) => sum + item.product.price * item.quantity, 0);

    const byCategory: Record<string, number> = {};
    items.forEach((item) => {
        // We'll use the product name's first word or a manual grouping
        const cat = item.checklistItemId; // Will be mapped later
        byCategory[cat] = (byCategory[cat] || 0) + item.product.price * item.quantity;
    });

    return { total, byCategory, itemCount: items.length };
}

export function calculateBudgetByCategory(
    items: ShoppingListItem[],
    checklist: BusinessChecklist | null
): { category: string; total: number; items: number }[] {
    if (!checklist) return [];

    const catMap = new Map<string, { total: number; items: number }>();

    items.forEach((shopItem) => {
        const clItem = checklist.items.find((ci) => ci.id === shopItem.checklistItemId);
        const cat = clItem?.category || "Прочее";
        const existing = catMap.get(cat) || { total: 0, items: 0 };
        existing.total += shopItem.product.price * shopItem.quantity;
        existing.items += 1;
        catMap.set(cat, existing);
    });

    return Array.from(catMap.entries()).map(([category, data]) => ({
        category,
        ...data,
    }));
}

// --------------- Variant Helpers ---------------

export const VARIANT_CONFIG = {
    budget: {
        label: "Бюджет",
        color: "text-emerald-600 dark:text-emerald-400",
        bgColor: "bg-emerald-50 dark:bg-emerald-900/20",
        borderColor: "border-emerald-200 dark:border-emerald-800",
    },
    optimal: {
        label: "Оптимальный",
        color: "text-blue-600 dark:text-blue-400",
        bgColor: "bg-blue-50 dark:bg-blue-900/20",
        borderColor: "border-blue-200 dark:border-blue-800",
    },
    premium: {
        label: "Премиум",
        color: "text-amber-600 dark:text-amber-400",
        bgColor: "bg-amber-50 dark:bg-amber-900/20",
        borderColor: "border-amber-200 dark:border-amber-800",
    },
} as const;

// --------------- Formatting ---------------

export function formatPrice(price: number): string {
    return price.toLocaleString("ru-RU") + " ₽";
}

export function generateItemId(): string {
    return "item_" + Date.now().toString(36) + "_" + Math.random().toString(36).slice(2, 7);
}

// --------------- Priority Helpers ---------------

export const PRIORITY_CONFIG = {
    required: {
        label: "Обязательно",
        color: "text-red-600 dark:text-red-400",
        bgColor: "bg-red-50 dark:bg-red-900/20",
    },
    recommended: {
        label: "Рекомендуется",
        color: "text-blue-600 dark:text-blue-400",
        bgColor: "bg-blue-50 dark:bg-blue-900/20",
    },
    optional: {
        label: "По желанию",
        color: "text-slate-500 dark:text-slate-400",
        bgColor: "bg-slate-50 dark:bg-slate-800",
    },
} as const;
