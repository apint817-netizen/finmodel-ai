import { Transaction } from "@/lib/business-logic";

export function parse1CStatement(content: string): Transaction[] {
    const lines = content.split('\n');
    const transactions: Transaction[] = [];

    let currentTransaction: Partial<Transaction> | null = null;
    let inDocument = false;

    for (const line of lines) {
        const trimmed = line.trim();

        if (trimmed.startsWith('СекцияДокумент=Платежное поручение')) {
            inDocument = true;
            currentTransaction = {
                id: crypto.randomUUID(),
                date: new Date().toISOString(), // Default
                type: 'income', // Default, logic below
                category: 'Прочее',
                description: '',
                amount: 0
            };
            continue;
        }

        if (trimmed.startsWith('КонецДокумента') && inDocument && currentTransaction) {
            if (currentTransaction.amount && currentTransaction.amount > 0) {
                transactions.push(currentTransaction as Transaction);
            }
            inDocument = false;
            currentTransaction = null;
            continue;
        }

        if (inDocument && currentTransaction) {
            const [key, ...values] = trimmed.split('=');
            const value = values.join('=').trim();

            if (key === 'Дата') {
                // Determine format, usually DD.MM.YYYY
                const parts = value.split('.');
                if (parts.length === 3) {
                    // Create date at noon to avoid timezone shifts affecting the day
                    currentTransaction.date = new Date(`${parts[2]}-${parts[1]}-${parts[0]}T12:00:00.000Z`).toISOString();
                }
            } else if (key === 'Сумма') {
                currentTransaction.amount = parseFloat(value.replace(',', '.'));
            } else if (key === 'НазначениеПлатежа') {
                currentTransaction.description = value;
                // Simple auto-categorization logic
                const lower = value.toLowerCase();
                if (lower.includes('комиссия') || lower.includes('обслуживание')) {
                    currentTransaction.category = 'Комиссия банка';
                } else if (lower.includes('аренд')) {
                    currentTransaction.category = 'Аренда';
                } else if (lower.includes('налог') || lower.includes('взнос')) {
                    currentTransaction.category = 'Налоги';
                } else if (lower.includes('зарплат') || lower.includes('выплат')) {
                    currentTransaction.category = 'Зарплата';
                } else {
                    currentTransaction.category = 'Прочее';
                }
            } else if (key === 'ПлательщикИНН') {
                // If payer INN is NOT the user's INN (we assume user is receiver for now if not specified), it's likely income
                // But simplified: 1C file usually has "Списано" or "Поступило" but strictly 1C format relies on accounts.
                // For MVP: We need to know User's Account or INN to distinguish Income/Expense.
                // Or we check "СекцияДокумент": 
                // "Платежное поручение" -> usually outgoing if we generated it? No, in statement it's just a doc.
                // Let's rely on a more robust check in a real app. 
                // For MVP trick: We can assume if "Получатель" contains User's Name -> Income.
            }
        }
    }

    // Second pass or refinement:
    // In standard 1C text dump for "Statement" (not just payment orders), there are lines like:
    // СекцияРасчСчет
    // ...
    // КонецРасчСчет
    // And transactions are strictly list of docs.

    // Improvement: We will default everything to 'income' for now unless we see "Плательщик" matches the user. 
    // actually, let's make it simpler: We will ask user to confirm or just Randomize for demo if file is empty? 
    // No, let's try to find "ПолучательИНН" vs "ПлательщикИНН".

    return transactions;
}

// Updated robust parser for the specific "Client-Bank" format
export function parseBankStatement(content: string, userInn?: string, patentAccount?: string): Transaction[] {
    const lines = content.split('\n');
    const transactions: Transaction[] = [];

    let currentDoc: any = {};
    let inDoc = false;

    // Use a basic heuristic if no userInn provided: majority of transactions might be income? 
    // Or check existing database.

    for (const line of lines) {
        const trimmed = line.trim();
        if (trimmed.startsWith('СекцияДокумент')) {
            inDoc = true;
            currentDoc = {};
            continue;
        }
        if (trimmed.startsWith('КонецДокумента')) {
            if (inDoc) {
                // Determine direction
                // "ПолучательИНН" == userInn => Income
                // "ПлательщикИНН" == userInn => Expense

                let type: 'income' | 'expense' = 'income'; // default
                if (userInn) {
                    if (currentDoc['ПлательщикИНН'] === userInn) {
                        type = 'expense';
                    }
                } else {
                    // Heuristic
                    const desc = currentDoc['НазначениеПлатежа']?.toLowerCase() || '';
                    if (desc.includes('комиссия') || desc.includes('списание') || desc.includes('покупка')) {
                        type = 'expense';
                    }
                }

                // Patent Check by Account
                let taxSystem: 'patent' | undefined = undefined;
                if (patentAccount && type === 'income') {
                    // Check if receiver account matches patent account
                    const receiverAccount = currentDoc['ПолучательСчет'];
                    // Logic: patentAccount might be full or partial (last 4 digits)
                    if (receiverAccount) {
                        if (patentAccount.length === 4 && receiverAccount.endsWith(patentAccount)) {
                            taxSystem = 'patent';
                        } else if (receiverAccount.includes(patentAccount)) {
                            taxSystem = 'patent';
                        }
                    }
                }

                transactions.push({
                    id: crypto.randomUUID(),
                    date: currentDoc['date'] || new Date().toISOString(),
                    amount: currentDoc['amount'] || 0,
                    type,
                    category: currentDoc['category'] || 'Прочее',
                    description: currentDoc['НазначениеПлатежа'] || 'Без назначения',
                    taxSystem: taxSystem
                });
            }
            inDoc = false;
            currentDoc = {};
            continue;
        }

        if (inDoc) {
            const [key, ...values] = trimmed.split('=');
            const value = values.join('=').trim();

            if (key === 'Дата') {
                const parts = value.split('.');
                if (parts.length === 3) {
                    currentDoc['date'] = new Date(`${parts[2]}-${parts[1]}-${parts[0]}T12:00:00.000Z`).toISOString();
                }
            } else if (key === 'Сумма') {
                currentDoc['amount'] = parseFloat(value.replace(',', '.'));
            } else if (key === 'ПлательщикИНН') {
                currentDoc['ПлательщикИНН'] = value;
            } else if (key === 'ПолучательИНН') {
                currentDoc['ПолучательИНН'] = value;
            } else if (key === 'ПлательщикСчет') {
                currentDoc['ПлательщикСчет'] = value;
            } else if (key === 'ПолучательСчет') {
                currentDoc['ПолучательСчет'] = value;
            } else if (key === 'НазначениеПлатежа') {
                currentDoc['НазначениеПлатежа'] = value;
                // Categorization for currentDoc
                const lower = value.toLowerCase();
                if (lower.includes('комиссия') || lower.includes('обслуж')) currentDoc['category'] = 'Банк';
                else if (lower.includes('аренд')) currentDoc['category'] = 'Аренда';
                else if (lower.includes('налог')) currentDoc['category'] = 'Налоги';
                else if (lower.includes('зарплат')) currentDoc['category'] = 'Зарплата';
                else currentDoc['category'] = 'Продажи'; // Default for income usually
            }
        }
    }
    return transactions;
}
