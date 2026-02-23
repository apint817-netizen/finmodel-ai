import { NextRequest, NextResponse } from "next/server";
import { aiClient } from "@/lib/ai-client";

export async function POST(req: NextRequest) {
    try {
        const { messages, businessContext } = await req.json();

        if (!messages || !Array.isArray(messages)) {
            return NextResponse.json({ error: "Сообщения обязательны" }, { status: 400 });
        }

        const systemPrompt = `Ты — AI-ассистент по закупкам для бизнеса в России. Помогаешь подбирать товары, оборудование и всё необходимое для открытия и ведения бизнеса.

Контекст бизнеса пользователя:
- Тип бизнеса: ${businessContext?.businessType || "Не указан"}
- Город: ${businessContext?.city || "Не указан"}
- Бюджет: ${businessContext?.budget ? businessContext.budget.toLocaleString("ru-RU") + " ₽" : "Не указан"}

Правила:
- Отвечай на русском языке, кратко и по делу
- При рекомендации товаров указывай примерные цены в рублях
- Рекомендуй покупать на российских маркетплейсах (Яндекс Маркет, Ozon, Wildberries)
- Учитывай требования российского законодательства
- Если пользователь спрашивает про конкретный товар, предлагай варианты в разных ценовых категориях
- Будь практичным и конкретным

Формат ответа: обычный текст с markdown-форматированием (жирный, списки, заголовки).`;

        const response = await aiClient.chat.completions.create({
            model: "gemini-2.0-flash",
            messages: [
                { role: "system", content: systemPrompt },
                ...messages.map((m: any) => ({
                    role: m.role as "user" | "assistant",
                    content: m.content,
                })),
            ],
            temperature: 0.7,
        });

        const content = response.choices[0]?.message?.content ?? "Извините, не удалось получить ответ.";

        return NextResponse.json({ content });
    } catch (error: any) {
        console.error("Procurement chat error:", error);
        return NextResponse.json(
            { error: "Не удалось получить ответ от AI." },
            { status: 500 }
        );
    }
}
