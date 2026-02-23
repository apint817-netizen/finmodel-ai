import { NextRequest, NextResponse } from "next/server";
import { aiClient } from "@/lib/ai-client";

export const maxDuration = 60;

// Retry with exponential backoff for rate-limit (429)
async function retryWithBackoff<T>(fn: () => Promise<T>, retries = 3): Promise<T> {
    for (let attempt = 0; attempt <= retries; attempt++) {
        try {
            return await fn();
        } catch (error: any) {
            const status = error?.status || error?.response?.status;
            if (status === 429 && attempt < retries) {
                const delay = Math.min(3000 * Math.pow(2, attempt), 15000);
                console.log(`Rate limited (429), retrying in ${delay}ms (attempt ${attempt + 1}/${retries})`);
                await new Promise((r) => setTimeout(r, delay));
                continue;
            }
            throw error;
        }
    }
    throw new Error("Max retries exceeded");
}

export async function POST(req: NextRequest) {
    try {
        const { businessDescription, city, budget } = await req.json();

        if (!businessDescription) {
            return NextResponse.json({ error: "Описание бизнеса обязательно" }, { status: 400 });
        }

        const systemPrompt = `Ты бизнес-консультант по закупкам в России. Составь краткий чек-лист закупок.

Ответ строго JSON без markdown-обёрток (без тройных кавычек):
{"businessType":"тип","categories":["Кат1"],"items":[{"id":"item_1","category":"Кат1","name":"Что купить","quantity":1,"description":"Зачем","priority":"required","products":[{"id":"p1","name":"Товар","variant":"budget","price":10000,"rating":4.5,"marketplace":"yandex_market","reason":"Почему"},{"id":"p2","name":"Товар2","variant":"optimal","price":20000,"rating":4.7,"marketplace":"ozon","reason":"Почему"},{"id":"p3","name":"Товар3","variant":"premium","price":40000,"rating":4.9,"marketplace":"wildberries","reason":"Почему"}]}],"warnings":["Текст"],"tips":["Текст"]}

Правила: 5 позиций, 2-3 категории, каждая позиция = 3 продукта (budget/optimal/premium), цены в рублях 2025. Кратко!`;

        const userMessage = `${businessDescription}, ${city || "Москва"}, бюджет: ${budget ? budget.toLocaleString("ru-RU") + "₽" : "не указан"}`;

        const response = await retryWithBackoff(() =>
            aiClient.chat.completions.create({
                model: "gemini-2.0-flash",
                messages: [
                    { role: "system", content: systemPrompt },
                    { role: "user", content: userMessage },
                ],
                temperature: 0.6,
            })
        );

        const content = response.choices[0]?.message?.content ?? "{}";

        // Strip markdown code fences if present
        const cleaned = content
            .replace(/^```json\s*/i, "")
            .replace(/^```\s*/i, "")
            .replace(/```\s*$/i, "")
            .trim();

        let parsed;
        try {
            parsed = JSON.parse(cleaned);
        } catch {
            console.error("Failed to parse AI response:", cleaned.slice(0, 500));
            parsed = {
                businessType: businessDescription,
                categories: [],
                items: [],
                warnings: ["Не удалось разобрать ответ AI. Попробуйте ещё раз."],
                tips: [],
            };
        }

        // Add search URLs
        const bases: Record<string, string> = {
            yandex_market: "https://market.yandex.ru/search?text=",
            ozon: "https://www.ozon.ru/search/?text=",
            wildberries: "https://www.wildberries.ru/catalog/0/search.aspx?search=",
        };

        if (parsed.items) {
            parsed.items = parsed.items.map((item: any) => ({
                ...item,
                checked: false,
                products: (item.products || []).map((p: any) => ({
                    ...p,
                    searchUrl: (bases[p.marketplace] || "https://www.google.com/search?q=купить+")
                        + encodeURIComponent(p.name),
                })),
            }));
        }

        return NextResponse.json({
            businessType: parsed.businessType || businessDescription,
            businessDescription,
            city: city || "Москва",
            budget: budget || 0,
            categories: parsed.categories || [],
            items: parsed.items || [],
            warnings: parsed.warnings || [],
            tips: parsed.tips || [],
        });
    } catch (error: any) {
        console.error("Procurement recommend error:", error);
        const message = error?.message || "Unknown error";
        const status = error?.status || 500;

        if (status === 429) {
            return NextResponse.json(
                { error: "AI-сервис временно перегружен. Подождите 30 секунд и попробуйте снова." },
                { status: 429 }
            );
        }

        return NextResponse.json(
            { error: `Ошибка AI: ${message.slice(0, 200)}` },
            { status }
        );
    }
}
