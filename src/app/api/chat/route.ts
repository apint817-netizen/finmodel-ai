import { NextRequest, NextResponse } from 'next/server';
import { aiClient } from '@/lib/ai-client';

const client = aiClient;

export async function POST(req: NextRequest) {
    // Declare variables outside try/catch for scope visibility
    const isGoogle = !!process.env.GOOGLE_API_KEY;
    let targetModel = 'gpt-4o-mini';

    try {
        const { messages, modelData, model } = await req.json();
        if (model) targetModel = model;

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

        let assistantMessage = '';
        let usage = undefined;

        if (isGoogle) {
            // NATIVE Google Gemini API implementation
            // This bypasses the OpenAI compatibility layer which was causing 404s

            if (model && model.startsWith('gemini-')) {
                // If specific model requested but failed, fallback logic could be here.
                // For now, let's force a known working alias if the user asks for flash
                targetModel = model === 'gemini-1.5-flash' ? 'gemini-1.5-flash-latest' : model;
            } else {
                targetModel = 'gemini-1.5-flash-latest';
            }

            // Convert OpenAI messages to Gemini format
            const geminiContents = messages.map((msg: any) => ({
                role: msg.role === 'assistant' ? 'model' : 'user',
                parts: [{ text: msg.content }]
            }));

            // Add system prompt if present (Gemini 1.5 supports system_instruction, but for simplicity we can prepend or use proper field)
            // Ideally system prompt should be separate, but prepending to first user message or using system_instruction is common.
            // Let's use the proper 'system_instruction' field for Gemini 1.5

            const googleResponse = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/${targetModel}:generateContent?key=${process.env.GOOGLE_API_KEY}`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    contents: geminiContents,
                    system_instruction: {
                        parts: [{ text: systemPrompt }]
                    },
                    generationConfig: {
                        temperature: 0.7,
                        maxOutputTokens: 2000,
                    }
                })
            });

            if (!googleResponse.ok) {
                const errorText = await googleResponse.text();
                throw new Error(`Google API (Native) Error: ${googleResponse.status} ${googleResponse.statusText} - ${errorText}`);
            }

            const data = await googleResponse.json();
            // Extract text from Gemini response
            assistantMessage = data.candidates?.[0]?.content?.parts?.[0]?.text || 'Извините, не удалось получить ответ.';

            // Map usage roughly if available, or just ignore
            usage = {
                prompt_tokens: data.usageMetadata?.promptTokenCount || 0,
                completion_tokens: data.usageMetadata?.candidatesTokenCount || 0,
                total_tokens: data.usageMetadata?.totalTokenCount || 0
            };

        } else {
            // Fallback to OpenAI SDK for local/other providers
            const completion = await client.chat.completions.create({
                model: targetModel,
                messages: [
                    { role: 'system', content: systemPrompt },
                    ...messages,
                ],
                temperature: 0.7,
                max_tokens: 2000,
            });

            assistantMessage = completion.choices[0]?.message?.content || 'Извините, не удалось получить ответ.';
            usage = completion.usage;
        }

        return NextResponse.json({
            message: assistantMessage,
            usage: usage,
        });
    } catch (error: any) {
        console.error('AI Chat Error:', error);

        // Debug info to help user identify configuration issues
        const isGoogle = !!process.env.GOOGLE_API_KEY;
        const keyStatus = isGoogle
            ? `Google Key present (${process.env.GOOGLE_API_KEY?.substring(0, 8)}...)`
            : 'No Google Key found';

        return NextResponse.json(
            {
                error: 'Ошибка при обращении к ИИ',
                details: error.message,
                debug: {
                    provider: isGoogle ? 'Google (Native)' : 'Antigravity (Local)',
                    keyStatus,
                    model: targetModel,
                    baseURL: isGoogle ? 'https://generativelanguage.googleapis.com/v1beta/models/...' : aiClient.baseURL,
                },
                hint: isGoogle
                    ? 'Проверьте API ключ и лимиты Google AI Studio'
                    : 'Убедитесь, что Antigravity Manager запущен на http://127.0.0.1:8045',
            },
            { status: 500 }
        );
    }
}
