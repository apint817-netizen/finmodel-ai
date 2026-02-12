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
                { status: 500 } // Or 401/500
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
            // Google Gemini Logic
            const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${process.env.GOOGLE_API_KEY}`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    contents: [{
                        role: 'user',
                        parts: [{ text: systemPrompt }]
                    }],
                    generationConfig: {
                        temperature: 0.4,
                        responseMimeType: "application/json"
                    }
                })
            });

            if (!response.ok) {
                const text = await response.text();
                throw new Error(`Google API Error: ${text}`);
            }

            const data = await response.json();
            const textContent = data.candidates?.[0]?.content?.parts?.[0]?.text;

            if (!textContent) throw new Error('No content from Gemini');

            generatedData = JSON.parse(textContent);

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
