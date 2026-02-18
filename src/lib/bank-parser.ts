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

// Robust parser for the 1C Client-Bank Exchange format
export function parseBankStatement(content: string, userInn?: string, patentAccount?: string): Transaction[] {
    const lines = content.split('\n');
    const transactions: Transaction[] = [];

    // Step 1: Extract the user's own account number from the file header.
    // In 1C Client-Bank Exchange format, the account section looks like:
    //   СекцияРасчСчет
    //   РасчСчет=40802810...
    //   ...
    //   КонецРасчСчет
    let userAccount: string | undefined = undefined;
    let inAccountSection = false;
    for (const line of lines) {
        const trimmed = line.trim();
        if (trimmed.startsWith('СекцияРасчСчет')) {
            inAccountSection = true;
            continue;
        }
        if (trimmed.startsWith('КонецРасчСчет')) {
            inAccountSection = false;
            continue;
        }
        if (inAccountSection) {
            const [key, ...vals] = trimmed.split('=');
            if (key === 'РасчСчет' && vals.length > 0) {
                userAccount = vals.join('=').trim();
                break; // Found it, stop scanning
            }
        }
    }

    // Step 2: Parse each document
    let currentDoc: any = {};
    let inDoc = false;

    for (const line of lines) {
        const trimmed = line.trim();

        if (trimmed.startsWith('СекцияДокумент')) {
            inDoc = true;
            currentDoc = {};
            continue;
        }

        if (trimmed.startsWith('КонецДокумента')) {
            if (inDoc && (currentDoc['amount'] || 0) > 0) {
                // Determine direction:
                // Priority 1: Compare account numbers from the file header
                let type: 'income' | 'expense' = 'income'; // safe default

                if (userAccount) {
                    const payerAccount = currentDoc['ПлательщикСчет'] || '';
                    const receiverAccount = currentDoc['ПолучательСчет'] || '';
                    if (payerAccount === userAccount) {
                        type = 'expense'; // Money went OUT from user's account
                    } else if (receiverAccount === userAccount) {
                        type = 'income'; // Money came IN to user's account
                    } else {
                        // Account not matched exactly — try partial (last 11 digits)
                        const shortUser = userAccount.slice(-11);
                        if (payerAccount.endsWith(shortUser)) {
                            type = 'expense';
                        } else if (receiverAccount.endsWith(shortUser)) {
                            type = 'income';
                        }
                    }
                } else if (userInn) {
                    // Priority 2: INN comparison
                    if (currentDoc['ПлательщикИНН'] === userInn) {
                        type = 'expense';
                    } else if (currentDoc['ПолучательИНН'] === userInn) {
                        type = 'income';
                    }
                } else {
                    // Priority 3: keyword heuristics in description
                    const desc = (currentDoc['НазначениеПлатежа'] || '').toLowerCase();
                    if (
                        desc.includes('комиссия') ||
                        desc.includes('списание') ||
                        desc.includes('покупка') ||
                        desc.includes('перевод') ||
                        desc.includes('выдача') ||
                        desc.includes('перечисление')
                    ) {
                        if (!desc.includes('поступление') && !desc.includes('зачисление')) {
                            type = 'expense';
                        }
                    }
                }

                // Patent check
                let taxSystem: 'patent' | undefined = undefined;
                if (patentAccount && type === 'income') {
                    const receiverAccount = currentDoc['ПолучательСчет'] || '';
                    if (receiverAccount && patentAccount.length >= 4 && receiverAccount.endsWith(patentAccount)) {
                        taxSystem = 'patent';
                    }
                }

                // Categorization
                const lower = (currentDoc['НазначениеПлатежа'] || '').toLowerCase();
                let category = 'Прочее';
                if (type === 'income') {
                    category = 'Продажи';
                } else {
                    if (lower.includes('комиссия') || lower.includes('банк') || lower.includes('обслуж')) category = 'Банк';
                    else if (lower.includes('аренд')) category = 'Аренда';
                    else if (lower.includes('налог') || lower.includes('взнос') || lower.includes('патент')) category = 'Налоги';
                    else if (lower.includes('зарплат') || lower.includes('выплат') || lower.includes('преми')) category = 'Зарплата';
                    else if (lower.includes('реклам') || lower.includes('маркетинг') || lower.includes('яндекс') || lower.includes('vk')) category = 'Маркетинг';
                    else if (lower.includes('закуп') || lower.includes('товар') || lower.includes('материал')) category = 'Закупка';
                    else category = 'Прочее';
                }

                transactions.push({
                    id: crypto.randomUUID(),
                    date: currentDoc['date'] || new Date().toISOString(),
                    amount: currentDoc['amount'],
                    type,
                    category,
                    description: currentDoc['НазначениеПлатежа'] || 'Без назначения',
                    taxSystem,
                    accountNumber: type === 'income' ? currentDoc['ПолучательСчет'] : currentDoc['ПлательщикСчет']
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
            }
        }
    }

    return transactions;
}

