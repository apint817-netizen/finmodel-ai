export type TaxSystem = 'usn_6' | 'usn_15' | 'patent' | 'osno';

export interface Transaction {
    id: string;
    date: string;
    amount: number;
    type: 'income' | 'expense';
    category: string;
    description: string;
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
