import { Transaction } from "@prisma/client";

export type TaxSystem = "usn_6" | "usn_15" | "osv";

interface TaxResult {
    taxAmount: number;
    taxableIncome: number;
    deductions: number;
    details: string;
}

export function calculateTaxLiability(
    transactions: Transaction[],
    taxSystem: TaxSystem,
    periodStart: Date,
    periodEnd: Date
): TaxResult {
    // Filter transactions for the period
    const periodTransactions = transactions.filter(
        (t) => t.date >= periodStart && t.date <= periodEnd
    );

    const income = periodTransactions
        .filter((t) => t.type === "income" && t.status === "paid")
        .reduce((sum, t) => sum + t.amount, 0);

    const expenses = periodTransactions
        .filter((t) => t.type === "expense" && t.status === "paid")
        .reduce((sum, t) => sum + t.amount, 0);

    let taxAmount = 0;
    let taxableIncome = 0;
    let deductions = 0;
    let details = "";

    switch (taxSystem) {
        case "usn_6":
            // USN 6%: Tax = Income * 6%
            // (Simplified, ignoring insurance contributions deduction for now)
            taxableIncome = income;
            taxAmount = income * 0.06;
            details = `УСН 6%: Доходы (${income.toLocaleString("ru-RU")} ₽) * 6%`;
            break;

        case "usn_15":
            // USN 15%: Tax = (Income - Expenses) * 15%
            // Minimum tax 1% of income if loss or low profit
            taxableIncome = Math.max(0, income - expenses);
            const calculatedTax = taxableIncome * 0.15;
            const minTax = income * 0.01;

            if (calculatedTax < minTax) {
                taxAmount = minTax;
                details = `УСН 15% (Минимальный налог): Доходы (${income.toLocaleString("ru-RU")} ₽) * 1%`;
            } else {
                taxAmount = calculatedTax;
                details = `УСН 15%: (Доходы (${income.toLocaleString("ru-RU")} ₽) - Расходы (${expenses.toLocaleString(
                    "ru-RU"
                )} ₽)) * 15%`;
            }
            break;

        default:
            taxAmount = 0;
            details = "Неизвестная система налогообложения";
    }

    return {
        taxAmount,
        taxableIncome,
        deductions,
        details,
    };
}

export function getQuarterDates(year: number, quarter: 1 | 2 | 3 | 4) {
    const startMonth = (quarter - 1) * 3;
    const start = new Date(year, startMonth, 1);
    const end = new Date(year, startMonth + 3, 0); // Last day of the quarter
    return { start, end };
}
