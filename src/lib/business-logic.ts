export type TaxSystem = 'usn_6' | 'usn_15' | 'patent';

export interface Transaction {
    id: string;
    date: string;
    amount: number;
    type: 'income' | 'expense';
    category: string;
    description: string;
}

export function calculateTax(transactions: Transaction[], system: TaxSystem) {
    const income = transactions
        .filter(t => t.type === 'income')
        .reduce((sum, t) => sum + t.amount, 0);

    const expense = transactions
        .filter(t => t.type === 'expense')
        .reduce((sum, t) => sum + t.amount, 0);

    let tax = 0;

    if (system === 'usn_6') {
        // 6% of income, but can be reduced by insurance contributions (simplified for MVP: just 6%)
        tax = income * 0.06;
    } else if (system === 'usn_15') {
        // 15% of (income - expense), minimum 1% of income
        const profit = Math.max(0, income - expense);
        const standardTax = profit * 0.15;
        const minTax = income * 0.01;
        tax = Math.max(standardTax, minTax);
    } else if (system === 'patent') {
        // Fixed amount, simplified for MVP
        tax = 0;
    }

    return {
        income,
        expense,
        tax: Math.round(tax),
        profit: income - expense - Math.round(tax)
    };
}
