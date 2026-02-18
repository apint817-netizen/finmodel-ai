export type TaxSystem = 'usn_6' | 'usn_15' | 'patent' | 'osno';

// Fixed insurance contributions for 2026 (ИП без сотрудников)
export const FIXED_CONTRIBUTIONS_2026 = 53658; // ₽

// Real advance payment deadlines for USN 2026
export const TAX_DEADLINES_2026 = [
    { quarter: 1, deadline: new Date(2026, 3, 28), label: "Аванс УСН Q1", months: [0, 1, 2] },
    { quarter: 2, deadline: new Date(2026, 6, 28), label: "Аванс УСН Q2", months: [3, 4, 5] },
    { quarter: 3, deadline: new Date(2026, 9, 28), label: "Аванс УСН Q3", months: [6, 7, 8] },
    { quarter: 4, deadline: new Date(2027, 2, 31), label: "Годовой УСН", months: [9, 10, 11] },
];

export const INSURANCE_DEADLINES_2026 = [
    { deadline: new Date(2026, 11, 31), label: "Страх. взносы (фикс.)", amount: FIXED_CONTRIBUTIONS_2026 },
    { deadline: new Date(2027, 6, 1), label: "Страх. взносы (1% с дохода >300к)", amount: null },
];

export interface Transaction {
    id: string;
    date: string;
    amount: number;
    type: 'income' | 'expense';
    category: string;
    description: string;
    accountNumber?: string; // User's account involved
    taxSystem?: TaxSystem; // New field check
}

export function calculateTax(transactions: Transaction[], globalSystem: TaxSystem) {
    // Separate transactions by system
    // 1. Patent transactions are ignored for tax calculation (fixed cost paid separately), 
    //    but we might want to track them for "Revenue" stats.

    // Filter for Main System (USN)
    // If a transaction has explicit taxSystem, use it. If not, fallback to globalSystem.

    const usnTransactions = transactions.filter(t => {
        const sys = t.taxSystem || globalSystem;
        return sys === 'usn_6' || sys === 'usn_15'; // Only USN calculated here
    });

    const income = usnTransactions
        .filter(t => t.type === 'income')
        .reduce((sum, t) => sum + t.amount, 0);

    const expense = usnTransactions
        .filter(t => t.type === 'expense')
        .reduce((sum, t) => sum + t.amount, 0);

    let tax = 0;

    // Determine which USN rule to apply. 
    // Complication: User might have mixed USN 6 and USN 15? Unlikely for one entity.
    // Usually it's USN + Patent.
    // So we use the GLOBAL system for the formula, but only apply it to Non-Patent income.

    if (globalSystem === 'usn_6') {
        tax = income * 0.06;
    } else if (globalSystem === 'usn_15') {
        const profit = Math.max(0, income - expense);
        const standardTax = profit * 0.15;
        const minTax = income * 0.01;
        tax = Math.max(standardTax, minTax);
    }

    // Total stats (including Patent)
    const totalIncome = transactions
        .filter(t => t.type === 'income')
        .reduce((sum, t) => sum + t.amount, 0);

    const totalExpense = transactions
        .filter(t => t.type === 'expense')
        .reduce((sum, t) => sum + t.amount, 0);

    return {
        income: totalIncome, // Show real total
        expense: totalExpense,
        taxableIncome: income, // For USN
        tax: Math.round(tax),
        profit: totalIncome - totalExpense - Math.round(tax)
    };
}

/**
 * Calculate net tax after insurance contribution deduction.
 * For ИП without employees on УСН 6%: can reduce tax by 100% of fixed contributions.
 * For ИП with employees on УСН 6%: can reduce tax by 50% of fixed contributions.
 */
export function calculateNetTax(
    grossTax: number,
    income: number,
    taxSystem: TaxSystem,
    hasEmployees: boolean = false
): {
    grossTax: number;
    fixedContributions: number;
    variableContributions: number;
    totalContributions: number;
    deductionLimit: number;
    netTax: number;
} {
    const fixedContributions = FIXED_CONTRIBUTIONS_2026;
    // 1% on income over 300k (capped at 277,571 ₽ in 2026)
    const variableContributions = Math.min(Math.max(0, (income - 300_000) * 0.01), 277_571);
    const totalContributions = fixedContributions + variableContributions;

    let netTax = grossTax;
    if (taxSystem === 'usn_6') {
        const deductionLimit = hasEmployees ? grossTax * 0.5 : grossTax;
        const deduction = Math.min(totalContributions, deductionLimit);
        netTax = Math.max(0, grossTax - deduction);
        return { grossTax, fixedContributions, variableContributions, totalContributions, deductionLimit, netTax };
    }

    // For USN 15%, contributions are included as expenses — no separate deduction here
    return { grossTax, fixedContributions, variableContributions, totalContributions, deductionLimit: 0, netTax };
}

// Keyword-based category suggestion (client-side, no API)
const CATEGORY_KEYWORDS: Record<string, string[]> = {
    "Аренда": ["аренда", "rent", "помещение", "офис", "склад"],
    "Зарплата": ["зарплата", "зп", "оклад", "salary", "выплата сотрудник"],
    "Маркетинг": ["реклама", "яндекс", "google", "таргет", "продвижение", "smm"],
    "Закупка": ["закупка", "товар", "материал", "поставщик", "оптовый"],
    "Налоги": ["налог", "ндс", "усн", "фнс", "страховые", "взнос", "пфр"],
    "Банк": ["комиссия", "обслуживание", "банк", "эквайринг", "rko"],
    "Продажи": ["оплата", "поступление", "выручка", "клиент", "покупатель"],
};

export function suggestCategory(description: string): string {
    const lower = description.toLowerCase();
    for (const [category, keywords] of Object.entries(CATEGORY_KEYWORDS)) {
        if (keywords.some(kw => lower.includes(kw))) return category;
    }
    return "Прочее";
}

