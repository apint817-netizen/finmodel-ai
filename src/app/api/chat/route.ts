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

ВАЖНО: Вы можете управлять данными модели. Если пользователь просит добавить или изменить инвестицию, доход или расход, выведите JSON команду в специальном блоке.
Формат команды:
[ACTION_REQUIRED]
{
  "action": "addInvestment" | "addRevenue" | "addExpense",
  "data": {
    "category": "Название",
    "amount": 1000,
    "name": "Название" (для доходов/расходов),
    "monthlyAmount": 1000 (для доходов/расходов)
  }
}
[/ACTION_REQUIRED]

Примеры:
1. "Добавь инвестицию в ремонт 500 000" ->
[ACTION_REQUIRED]
{"action": "addInvestment", "data": {"category": "Ремонт", "amount": 500000}}
[/ACTION_REQUIRED]

2. "Добавь доход от продаж 100 000" ->
[ACTION_REQUIRED]
{"action": "addRevenue", "data": {"name": "Продажи", "monthlyAmount": 100000}}
[/ACTION_REQUIRED]

Отвечайте на русском языке. Будьте дружелюбны и профессиональны. Если выполняете действие, кратко прокомментируйте его.`
            : 'Вы - опытный финансовый консультант. Отвечайте на русском языке, давайте конкретные советы.';

        let assistantMessage = '';
        let usage = undefined;

        if (isGoogle) {
            // Helper to list models
            const getAvailableModels = async () => {
                try {
                    const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models?key=${process.env.GOOGLE_API_KEY}`);
                    if (!response.ok) return [];
                    const data = await response.json();
                    // Filter for models that support generateContent
                    return (data.models || []).filter((m: any) =>
                        m.supportedGenerationMethods?.includes('generateContent')
                    ).map((m: any) => m.name.replace('models/', '')); // Remove 'models/' prefix
                } catch (e) {
                    console.error('Failed to list models', e);
                    return [];
                }
            };

            // Helper function to call Google API
            const callGemini = async (modelName: string) => {
                // Ensure model name doesn't have double 'models/' prefix if we already have it
                const cleanModelName = modelName.startsWith('models/') ? modelName.replace('models/', '') : modelName;

                const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/${cleanModelName}:generateContent?key=${process.env.GOOGLE_API_KEY}`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        contents: messages.map((msg: any) => ({
                            role: msg.role === 'assistant' ? 'model' : 'user',
                            parts: [{ text: msg.content }]
                        })),
                        system_instruction: { parts: [{ text: systemPrompt }] },
                        generationConfig: { temperature: 0.7, maxOutputTokens: 8192 }
                    })
                });

                if (!response.ok) {
                    const text = await response.text();
                    throw new Error(`${response.status} ${response.statusText} - ${text}`);
                }
                return response.json();
            };

            // 1. Try specific user model first (if Gemini)
            let modelsToTry = [];
            if (model && model.startsWith('gemini-')) {
                modelsToTry.push(model);
            }

            // 2. Add standard fallbacks just in case listing fails
            modelsToTry.push('gemini-1.5-flash');
            modelsToTry.push('gemini-1.5-flash-latest');
            modelsToTry.push('gemini-pro');

            let lastError;
            let success = false;

            // First pass: Try hardcoded/requested models
            for (const modelName of modelsToTry) {
                try {
                    const data = await callGemini(modelName);
                    assistantMessage = data.candidates?.[0]?.content?.parts?.[0]?.text || 'No response text';
                    targetModel = modelName;
                    usage = { total_tokens: data.usageMetadata?.totalTokenCount || 0 };
                    success = true;
                    break;
                } catch (e: any) {
                    lastError = e;
                    if (e.message.includes('404')) continue; // specific not found
                    if (process.env.NODE_ENV === 'development') console.warn(`Model ${modelName} failed:`, e.message);
                }
            }

            // 3. Last Resort: Dynamic Discovery
            if (!success) {
                const availableModels = await getAvailableModels();
                console.log('Available models from Google:', availableModels);

                // Prioritize flash, then pro, then anything else
                const bestModel = availableModels.find((m: string) => m.includes('flash')) ||
                    availableModels.find((m: string) => m.includes('pro')) ||
                    availableModels[0];

                if (bestModel) {
                    try {
                        const data = await callGemini(bestModel);
                        assistantMessage = data.candidates?.[0]?.content?.parts?.[0]?.text || 'No response text';
                        targetModel = bestModel;
                        usage = { total_tokens: data.usageMetadata?.totalTokenCount || 0 };
                        success = true;
                    } catch (e: any) {
                        lastError = e;
                    }
                }
            }

            if (!success) {
                throw lastError || new Error('All Google models failed, including dynamically discovered ones.');
            }

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
