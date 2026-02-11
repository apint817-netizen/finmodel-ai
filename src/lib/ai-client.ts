import OpenAI from 'openai';
import type { ChatCompletionMessageParam } from 'openai/resources/chat/completions';

/**
 * AI Client для интеграции с Antigravity Manager
 * Подключается к локальному серверу на порту 8045
 */
export const aiClient = new OpenAI({
    apiKey: process.env.ANTIGRAVITY_API_KEY || 'sk-antigravity',
    baseURL: process.env.ANTIGRAVITY_URL || 'http://127.0.0.1:8045/v1',
    dangerouslyAllowBrowser: false, // Только для серверной стороны
});

/**
 * Анализ финансовой модели с помощью ИИ
 */
export async function analyzeFinancialModel(modelData: any) {
    try {
        const response = await aiClient.chat.completions.create({
            model: 'gemini-2.0-flash',
            messages: [
                {
                    role: 'system',
                    content: `Ты опытный финансовый аналитик. Анализируй бизнес-модели, выявляй риски и давай конкретные рекомендации.
          
Твои задачи:
- Проверять реалистичность прогнозов
- Выявлять забытые расходы
- Оценивать риски
- Давать практические советы
- Отвечать на русском языке`,
                },
                {
                    role: 'user',
                    content: `Проанализируй финансовую модель:\n\n${JSON.stringify(modelData, null, 2)}`,
                },
            ],
            temperature: 0.7,
        });

        return response.choices[0].message.content;
    } catch (error) {
        console.error('Ошибка при обращении к AI:', error);
        throw new Error('Не удалось получить ответ от AI. Убедитесь, что Antigravity Manager запущен.');
    }
}

/**
 * Чат с ИИ-ассистентом
 */
export async function chatWithAI(messages: ChatCompletionMessageParam[]) {
    try {
        const response = await aiClient.chat.completions.create({
            model: 'gemini-2.0-flash',
            messages: [
                {
                    role: 'system',
                    content: 'Ты финансовый консультант. Помогаешь пользователям создавать и анализировать бизнес-модели. Отвечай кратко и по делу на русском языке.',
                },
                ...messages,
            ],
            temperature: 0.8,
            stream: false,
        });

        return response.choices[0].message.content;
    } catch (error) {
        console.error('Ошибка чата с AI:', error);
        throw new Error('Не удалось получить ответ от AI.');
    }
}
