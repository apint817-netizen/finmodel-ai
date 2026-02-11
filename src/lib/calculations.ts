/**
 * Расчёт ROI (Return on Investment)
 */
export function calculateROI(investment: number, profit: number): number {
    if (investment === 0) return 0;
    return ((profit - investment) / investment) * 100;
}

/**
 * Расчёт точки безубыточности (в месяцах)
 */
export function calculateBreakevenMonths(
    totalInvestment: number,
    monthlyProfit: number
): number {
    if (monthlyProfit <= 0) return Infinity;
    return totalInvestment / monthlyProfit;
}

/**
 * Расчёт общей суммы инвестиций
 */
export function calculateTotalInvestment(
    investments: Array<{ amount: number }>
): number {
    return investments.reduce((sum, item) => sum + item.amount, 0);
}

/**
 * Расчёт месячной выручки
 */
export function calculateMonthlyRevenue(
    revenues: Array<{ monthlyAmount: number }>
): number {
    return revenues.reduce((sum, item) => sum + item.monthlyAmount, 0);
}

/**
 * Расчёт месячных расходов
 */
export function calculateMonthlyExpenses(
    expenses: Array<{ monthlyAmount: number }>
): number {
    return expenses.reduce((sum, item) => sum + item.monthlyAmount, 0);
}

/**
 * Расчёт месячной прибыли
 */
export function calculateMonthlyProfit(
    monthlyRevenue: number,
    monthlyExpenses: number
): number {
    return monthlyRevenue - monthlyExpenses;
}

/**
 * Расчёт годовой прибыли
 */
export function calculateYearlyProfit(monthlyProfit: number): number {
    return monthlyProfit * 12;
}

/**
 * Форматирование числа в валюту (рубли)
 */
export function formatCurrency(amount: number): string {
    return new Intl.NumberFormat('ru-RU', {
        style: 'currency',
        currency: 'RUB',
        minimumFractionDigits: 0,
        maximumFractionDigits: 0,
    }).format(amount);
}

/**
 * Форматирование процентов
 */
export function formatPercent(value: number): string {
    return `${value.toFixed(1)}%`;
}
