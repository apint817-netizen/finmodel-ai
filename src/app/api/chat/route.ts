import { NextRequest, NextResponse } from 'next/server';
import { aiClient } from '@/lib/ai-client';

const client = aiClient;

export async function POST(req: NextRequest) {
    try {
        const { messages, modelData, model } = await req.json();

        // Prepare system prompt with financial context
        const systemPrompt = modelData
            ? `Вы - опытный финансовый консультант, помогающий пользователю с анализом бизнес-модели.

Текущая финансовая модель:
- Общие инвестиции: ${modelData.totalInvestment.toLocaleString('ru-RU')} ₽
- Месячная выручка: ${modelData.monthlyRevenue.toLocaleString('ru-RU')} ₽
- Месячные расходы: ${modelData.monthlyExpenses.toLocaleString('ru-RU')} ₽
- Месячная прибыль: ${modelData.monthlyProfit.toLocaleString('ru-RU')} ₽
- ROI (годовой): ${modelData.roi.toFixed(1)}%
- Точка безубыточности: ${modelData.breakevenMonths === Infinity ? 'не достижима' : `${Math.ceil(modelData.breakevenMonths)} месяцев`}

Инвестиции:
${modelData.investments.map((inv: any) => `- ${inv.category}: ${inv.amount.toLocaleString('ru-RU')} ₽`).join('\n')}

Доходы:
${modelData.revenues.map((rev: any) => `- ${rev.name}: ${rev.monthlyAmount.toLocaleString('ru-RU')} ₽/мес`).join('\n')}

Расходы:
${modelData.expenses.map((exp: any) => `- ${exp.name}: ${exp.monthlyAmount.toLocaleString('ru-RU')} ₽/мес`).join('\n')}

Отвечайте на русском языке. Давайте конкретные, практичные советы. Будьте дружелюбны и профессиональны.`
            : 'Вы - опытный финансовый консультант. Отвечайте на русском языке, давайте конкретные советы.';

        const completion = await client.chat.completions.create({
            model: model || 'gpt-4o-mini',
            messages: [
                { role: 'system', content: systemPrompt },
                ...messages,
            ],
            temperature: 0.7,
            max_tokens: 2000,
        });

        const assistantMessage = completion.choices[0]?.message?.content || 'Извините, не удалось получить ответ.';

        return NextResponse.json({
            message: assistantMessage,
            usage: completion.usage,
        });
    } catch (error: any) {
        console.error('AI Chat Error:', error);

        return NextResponse.json(
            {
                error: 'Ошибка при обращении к ИИ',
                details: error.message,
                hint: 'Убедитесь, что Antigravity Manager запущен на http://127.0.0.1:8045',
            },
            { status: 500 }
        );
    }
}
