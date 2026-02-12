import { NextRequest, NextResponse } from 'next/server';
import { aiClient } from '@/lib/ai-client';

export async function POST(req: NextRequest) {
    try {
        const { prompt } = await req.json();

        if (!prompt) {
            return NextResponse.json({ error: 'Prompt is required' }, { status: 400 });
        }

        const googleKey = process.env.GOOGLE_API_KEY;
        const openaiKey = process.env.OPENAI_API_KEY;

        if (!googleKey && !openaiKey) {
            return NextResponse.json(
                { error: 'API Keys missing. Configure GOOGLE_API_KEY or OPENAI_API_KEY in Vercel.' },
                { status: 500 }
            );
        }

        const isGoogle = !!googleKey;
        let generatedData = null;

        const systemPrompt = `
Вы - профессиональный финансовый аналитик, специализирующийся на малом и среднем бизнесе в РФ.
Ваша задача: на основе описания идеи пользователя создать полную, реалистичную финансовую модель.

Входные данные: "${prompt}"

Требования:
1. Валюта: Рубли (₽).
2. Цены и зарплаты: Реалистичные для РФ (регионы/Москва - определите по контексту или берите среднее).
3. Структура ответа: СТРОГИЙ JSON формат без markdown блоком.

JSON Структура:
{
  "name": "Название проекта (например: Компьютерный клуб CyberZone)",
  "investments": [
    { "category": "Название (Ремонт/Оборудование/Лицензии)", "amount": 100000 }
  ],
  "revenues": [
    { "name": "Название услуги", "monthlyAmount": 50000, "type": "recurring" }
  ],
  "expenses": [
    { "name": "Название расхода (Аренда/Зарплата/Интернет)", "monthlyAmount": 30000, "type": "fixed" }
  ],
  "aiChatMessage": "Приветственное сообщение от консультанта. Кратко опишите, что вы посчетали (например: 'Я составил модель для клуба на 5 ПК. Заложил аренду 50к и выручку 200к. Хотите скорректировать цены?')"
}

Будьте реалистичны. Не завышайте доходы. Не занижайте расходы.
`;

        if (isGoogle) {
            // Helper to list models (borrowed from chat route for consistency)
            const getAvailableModels = async () => {
                try {
                    const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models?key=${process.env.GOOGLE_API_KEY}`);
                    if (!response.ok) return [];
                    const data = await response.json();
                    return (data.models || []).filter((m: any) =>
                        m.supportedGenerationMethods?.includes('generateContent')
                    ).map((m: any) => m.name.replace('models/', ''));
                } catch (e) {
                    console.error('Failed to list models', e);
                    return [];
                }
            };

            const callGemini = async (modelName: string) => {
                const cleanModelName = modelName.startsWith('models/') ? modelName.replace('models/', '') : modelName;
                const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/${cleanModelName}:generateContent?key=${process.env.GOOGLE_API_KEY}`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        contents: [{
                            role: 'user',
                            parts: [{ text: systemPrompt }]
                        }],
                        // Use older format just in case, but system instruction is better if supported.
                        // Ideally we pass system prompt in 'contents' if system_instruction fails, but let's stick to standard config.
                        generationConfig: {
                            temperature: 0.4,
                            responseMimeType: "application/json"
                        }
                    })
                });

                if (!response.ok) {
                    const text = await response.text();
                    throw new Error(`${response.status} ${response.statusText} - ${text}`);
                }
                return response.json();
            };

            // Strategy: Try standard models first, then fallback to dynamic discovery
            const modelsToTry = [
                'gemini-1.5-flash',
                'gemini-1.5-flash-latest',
                'gemini-1.5-pro',
                'gemini-pro'
            ];

            let lastError;
            let success = false;

            // 1. Try known models
            for (const modelName of modelsToTry) {
                try {
                    console.log(`Trying model: ${modelName}`);
                    const data = await callGemini(modelName);
                    const textContent = data.candidates?.[0]?.content?.parts?.[0]?.text;
                    if (textContent) {
                        generatedData = JSON.parse(textContent);
                        success = true;
                        break;
                    }
                } catch (e: any) {
                    lastError = e;
                    console.warn(`Model ${modelName} failed:`, e.message);
                }
            }

            // 2. Dynamic discovery fallback
            if (!success) {
                console.log('Trying dynamic model discovery...');
                const availableModels = await getAvailableModels();
                console.log('Available models:', availableModels);

                // Prioritize flash
                const bestModel = availableModels.find((m: string) => m.includes('flash')) || availableModels[0];

                if (bestModel) {
                    try {
                        console.log(`Trying dynamic model: ${bestModel}`);
                        const data = await callGemini(bestModel);
                        const textContent = data.candidates?.[0]?.content?.parts?.[0]?.text;
                        if (textContent) {
                            generatedData = JSON.parse(textContent);
                            success = true;
                        }
                    } catch (e: any) {
                        lastError = e;
                        console.error('Dynamic model failed:', e);
                    }
                }
            }

            if (!success) {
                throw lastError || new Error('All Google models failed.');
            }

        } else {
            // OpenAI / Compatible Logic
            const completion = await aiClient.chat.completions.create({
                model: 'gpt-4o',
                messages: [
                    { role: 'system', content: systemPrompt },
                ],
                response_format: { type: "json_object" },
                temperature: 0.4,
            });

            const content = completion.choices[0]?.message?.content;
            if (!content) throw new Error('No content from OpenAI');

            generatedData = JSON.parse(content);
        }

        return NextResponse.json(generatedData);

    } catch (error: any) {
        console.error('Project Generation Error:', error);
        return NextResponse.json(
            { error: 'Failed to generate project', details: error.message },
            { status: 500 }
        );
    }
}
