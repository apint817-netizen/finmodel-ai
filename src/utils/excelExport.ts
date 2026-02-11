import * as XLSX from 'xlsx-js-style';
import { saveAs } from 'file-saver';

interface Project {
    id: string;
    name: string;
    investments: Array<{ id: string; category: string; amount: number; description?: string }>;
    revenues: Array<{ id: string; name: string; monthlyAmount: number; type: string }>;
    expenses: Array<{ id: string; name: string; monthlyAmount: number; type: string }>;
}

interface Message {
    role: 'user' | 'assistant';
    content: string;
}

// Helper to create styled cell
function createCell(value: any, style: any = {}) {
    return {
        v: value,
        t: typeof value === 'number' ? 'n' : 's',
        s: style
    };
}

// Helper to strip markdown formatting
function stripMarkdown(text: string): string {
    return text
        // Remove headers
        .replace(/^#{1,6}\s+/gm, '')
        // Remove bold/italic
        .replace(/\*\*\*(.+?)\*\*\*/g, '$1')
        .replace(/\*\*(.+?)\*\*/g, '$1')
        .replace(/\*(.+?)\*/g, '$1')
        .replace(/__(.+?)__/g, '$1')
        .replace(/_(.+?)_/g, '$1')
        // Remove strikethrough
        .replace(/~~(.+?)~~/g, '$1')
        // Remove links but keep text
        .replace(/\[(.+?)\]\(.+?\)/g, '$1')
        // Remove inline code
        .replace(/`(.+?)`/g, '$1')
        // Remove list markers
        .replace(/^\s*[-*+]\s+/gm, '• ')
        .replace(/^\s*\d+\.\s+/gm, '')
        // Remove blockquotes
        .replace(/^\s*>\s+/gm, '')
        // Clean up extra whitespace
        .trim();
}

export function exportToExcel(project: Project, aiMessages: Message[] = []) {
    const workbook = XLSX.utils.book_new();

    // Calculate metrics
    const totalInvestment = project.investments.reduce((sum, inv) => sum + inv.amount, 0);
    const monthlyRevenue = project.revenues.reduce((sum, rev) => sum + rev.monthlyAmount, 0);
    const monthlyExpenses = project.expenses.reduce((sum, exp) => sum + exp.monthlyAmount, 0);
    const monthlyProfit = monthlyRevenue - monthlyExpenses;
    const roi = totalInvestment > 0 ? (monthlyProfit * 12 / totalInvestment) * 100 : 0;
    const breakevenMonths = monthlyProfit > 0 ? Math.ceil(totalInvestment / monthlyProfit) : 0;

    // Define styles
    const titleStyle = {
        font: { bold: true, sz: 16, color: { rgb: "FFFFFF" } },
        fill: { fgColor: { rgb: "4472C4" } },
        alignment: { horizontal: "center", vertical: "center" },
        border: {
            top: { style: "thin", color: { rgb: "000000" } },
            bottom: { style: "thin", color: { rgb: "000000" } },
            left: { style: "thin", color: { rgb: "000000" } },
            right: { style: "thin", color: { rgb: "000000" } }
        }
    };

    const headerStyle = {
        font: { bold: true, sz: 12, color: { rgb: "FFFFFF" } },
        fill: { fgColor: { rgb: "5B9BD5" } },
        alignment: { horizontal: "center", vertical: "center" },
        border: {
            top: { style: "thin", color: { rgb: "000000" } },
            bottom: { style: "thin", color: { rgb: "000000" } },
            left: { style: "thin", color: { rgb: "000000" } },
            right: { style: "thin", color: { rgb: "000000" } }
        }
    };

    const labelStyle = {
        font: { bold: true, sz: 11 },
        fill: { fgColor: { rgb: "E7E6E6" } },
        alignment: { horizontal: "left", vertical: "center" },
        border: {
            top: { style: "thin", color: { rgb: "CCCCCC" } },
            bottom: { style: "thin", color: { rgb: "CCCCCC" } },
            left: { style: "thin", color: { rgb: "CCCCCC" } },
            right: { style: "thin", color: { rgb: "CCCCCC" } }
        }
    };

    const valueStyle = {
        font: { sz: 11 },
        alignment: { horizontal: "right", vertical: "center" },
        numFmt: "#,##0",
        border: {
            top: { style: "thin", color: { rgb: "CCCCCC" } },
            bottom: { style: "thin", color: { rgb: "CCCCCC" } },
            left: { style: "thin", color: { rgb: "CCCCCC" } },
            right: { style: "thin", color: { rgb: "CCCCCC" } }
        }
    };

    const textStyle = {
        font: { sz: 11 },
        alignment: { horizontal: "left", vertical: "top", wrapText: true },
        border: {
            top: { style: "thin", color: { rgb: "CCCCCC" } },
            bottom: { style: "thin", color: { rgb: "CCCCCC" } },
            left: { style: "thin", color: { rgb: "CCCCCC" } },
            right: { style: "thin", color: { rgb: "CCCCCC" } }
        }
    };

    const totalStyle = {
        font: { bold: true, sz: 12, color: { rgb: "FFFFFF" } },
        fill: { fgColor: { rgb: "70AD47" } },
        alignment: { horizontal: "right", vertical: "center" },
        numFmt: "#,##0",
        border: {
            top: { style: "medium", color: { rgb: "000000" } },
            bottom: { style: "medium", color: { rgb: "000000" } },
            left: { style: "medium", color: { rgb: "000000" } },
            right: { style: "medium", color: { rgb: "000000" } }
        }
    };

    // Sheet 1: Summary
    const summaryData = [
        [createCell('ФИНАНСОВАЯ МОДЕЛЬ', titleStyle), createCell('', titleStyle)],
        [createCell('Название проекта:', labelStyle), createCell(project.name, valueStyle)],
        [createCell('Дата создания:', labelStyle), createCell(new Date().toLocaleDateString('ru-RU'), valueStyle)],
        [createCell('', {}), createCell('', {})],
        [createCell('КЛЮЧЕВЫЕ ПОКАЗАТЕЛИ', titleStyle), createCell('', titleStyle)],
        [createCell('Общие инвестиции:', labelStyle), createCell(totalInvestment, valueStyle)],
        [createCell('Месячный доход:', labelStyle), createCell(monthlyRevenue, valueStyle)],
        [createCell('Месячные расходы:', labelStyle), createCell(monthlyExpenses, valueStyle)],
        [createCell('Месячная прибыль:', labelStyle), createCell(monthlyProfit, valueStyle)],
        [createCell('Годовая прибыль:', labelStyle), createCell(monthlyProfit * 12, valueStyle)],
        [createCell('ROI (%):', labelStyle), createCell(parseFloat(roi.toFixed(2)), valueStyle)],
        [createCell('Точка безубыточности (мес):', labelStyle), createCell(breakevenMonths, valueStyle)],
    ];
    const summarySheet = XLSX.utils.aoa_to_sheet(summaryData);
    summarySheet['!cols'] = [{ wch: 35 }, { wch: 20 }];
    XLSX.utils.book_append_sheet(workbook, summarySheet, 'Сводка');

    // Sheet 2: Investments
    const investmentsData = [
        [createCell('НАЧАЛЬНЫЕ ИНВЕСТИЦИИ', titleStyle), createCell('', titleStyle), createCell('', titleStyle)],
        [createCell('Категория', headerStyle), createCell('Сумма (₽)', headerStyle), createCell('Описание', headerStyle)],
        ...project.investments.map(inv => [
            createCell(inv.category, labelStyle),
            createCell(inv.amount, valueStyle),
            createCell(inv.description || '', textStyle)
        ]),
        [createCell('', {}), createCell('', {}), createCell('', {})],
        [createCell('ИТОГО:', totalStyle), createCell(totalInvestment, totalStyle), createCell('', totalStyle)],
    ];
    const investmentsSheet = XLSX.utils.aoa_to_sheet(investmentsData);
    investmentsSheet['!cols'] = [{ wch: 25 }, { wch: 15 }, { wch: 40 }];
    XLSX.utils.book_append_sheet(workbook, investmentsSheet, 'Инвестиции');

    // Sheet 3: Revenues
    const revenuesData = [
        [createCell('ИСТОЧНИКИ ДОХОДА', titleStyle), createCell('', titleStyle), createCell('', titleStyle)],
        [createCell('Название', headerStyle), createCell('Сумма/мес (₽)', headerStyle), createCell('Тип', headerStyle)],
        ...project.revenues.map(rev => [
            createCell(rev.name, labelStyle),
            createCell(rev.monthlyAmount, valueStyle),
            createCell(rev.type === 'recurring' ? 'Регулярный' : 'Разовый', textStyle)
        ]),
        [createCell('', {}), createCell('', {}), createCell('', {})],
        [createCell('ИТОГО:', totalStyle), createCell(monthlyRevenue, totalStyle), createCell('', totalStyle)],
    ];
    const revenuesSheet = XLSX.utils.aoa_to_sheet(revenuesData);
    revenuesSheet['!cols'] = [{ wch: 25 }, { wch: 15 }, { wch: 15 }];
    XLSX.utils.book_append_sheet(workbook, revenuesSheet, 'Доходы');

    // Sheet 4: Expenses
    const expensesData = [
        [createCell('ЕЖЕМЕСЯЧНЫЕ РАСХОДЫ', titleStyle), createCell('', titleStyle), createCell('', titleStyle)],
        [createCell('Название', headerStyle), createCell('Сумма/мес (₽)', headerStyle), createCell('Тип', headerStyle)],
        ...project.expenses.map(exp => [
            createCell(exp.name, labelStyle),
            createCell(exp.monthlyAmount, valueStyle),
            createCell(exp.type === 'fixed' ? 'Фиксированный' : 'Переменный', textStyle)
        ]),
        [createCell('', {}), createCell('', {}), createCell('', {})],
        [createCell('ИТОГО:', totalStyle), createCell(monthlyExpenses, totalStyle), createCell('', totalStyle)],
    ];
    const expensesSheet = XLSX.utils.aoa_to_sheet(expensesData);
    expensesSheet['!cols'] = [{ wch: 25 }, { wch: 15 }, { wch: 15 }];
    XLSX.utils.book_append_sheet(workbook, expensesSheet, 'Расходы');

    // Sheet 5: Forecast (12 months)
    const forecastData: any[][] = [
        [createCell('ПРОГНОЗ НА 12 МЕСЯЦЕВ', titleStyle), createCell('', titleStyle), createCell('', titleStyle), createCell('', titleStyle), createCell('', titleStyle)],
        [
            createCell('Месяц', headerStyle),
            createCell('Доход (₽)', headerStyle),
            createCell('Расходы (₽)', headerStyle),
            createCell('Прибыль (₽)', headerStyle),
            createCell('Накопленная прибыль (₽)', headerStyle)
        ],
    ];

    let cumulativeProfit = -totalInvestment;
    for (let month = 1; month <= 12; month++) {
        cumulativeProfit += monthlyProfit;
        const profitColor = cumulativeProfit >= 0 ? "C6EFCE" : "FFC7CE";
        forecastData.push([
            createCell(`Месяц ${month}`, labelStyle),
            createCell(monthlyRevenue, valueStyle),
            createCell(monthlyExpenses, valueStyle),
            createCell(monthlyProfit, valueStyle),
            createCell(cumulativeProfit, {
                ...valueStyle,
                fill: { fgColor: { rgb: profitColor } }
            })
        ]);
    }

    const forecastSheet = XLSX.utils.aoa_to_sheet(forecastData);
    forecastSheet['!cols'] = [{ wch: 12 }, { wch: 15 }, { wch: 15 }, { wch: 15 }, { wch: 22 }];
    XLSX.utils.book_append_sheet(workbook, forecastSheet, 'Прогноз');

    // Sheet 6: AI Analysis (if available) - Strip markdown formatting
    if (aiMessages.length > 1) {
        const aiData: any[][] = [
            [createCell('АНАЛИЗ ИИ', titleStyle)],
            [createCell('', {})],
        ];

        aiMessages.forEach((msg, idx) => {
            if (msg.role === 'assistant' && idx > 0) {
                // Strip markdown formatting for clean Excel display
                const cleanContent = stripMarkdown(msg.content);
                aiData.push([createCell(cleanContent, textStyle)]);
                aiData.push([createCell('', {})]);
            }
        });

        const aiSheet = XLSX.utils.aoa_to_sheet(aiData);
        aiSheet['!cols'] = [{ wch: 120 }];
        XLSX.utils.book_append_sheet(workbook, aiSheet, 'Анализ ИИ');
    }

    // Generate Excel file
    const excelBuffer = XLSX.write(workbook, { bookType: 'xlsx', type: 'array' });
    const blob = new Blob([excelBuffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });

    // Download file
    const fileName = `${project.name.replace(/[^a-zA-Zа-яА-Я0-9]/g, '_')}_${new Date().toISOString().split('T')[0]}.xlsx`;
    saveAs(blob, fileName);

    return blob;
}

export async function uploadToGoogleSheets(project: Project, aiMessages: Message[] = []) {
    // Export the file first
    exportToExcel(project, aiMessages);

    // Wait a bit then open Google Sheets with instructions
    setTimeout(() => {
        const message = encodeURIComponent('Файл скачан! Теперь в Google Sheets: File → Import → Upload → выберите скачанный файл');
        alert('Файл скачан!\n\nТеперь в Google Sheets:\n1. File → Import\n2. Upload\n3. Выберите скачанный файл');
        window.open('https://docs.google.com/spreadsheets/u/0/', '_blank');
    }, 1000);
}
