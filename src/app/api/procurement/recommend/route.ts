import { NextRequest, NextResponse } from "next/server";

export const maxDuration = 60;

export async function POST(req: NextRequest) {
    try {
        const { businessDescription, city, budget } = await req.json();

        if (!businessDescription) {
            return NextResponse.json({ error: "Описание бизнеса обязательно" }, { status: 400 });
        }

        const apiKey = process.env.GOOGLE_API_KEY;
        if (!apiKey) {
            return NextResponse.json({ error: "GOOGLE_API_KEY не настроен" }, { status: 500 });
        }

        const prompt = `Ты бизнес-консультант по закупкам в России. 
Бизнес: ${businessDescription}
Город: ${city || "Москва"}
Бюджет: ${budget ? budget.toLocaleString("ru-RU") + "₽" : "не указан"}

Составь чек-лист закупок. Ответ строго JSON (без markdown, без тройных кавычек):
{"businessType":"тип","categories":["Кат1","Кат2"],"items":[{"id":"item_1","category":"Кат1","name":"Что купить","quantity":1,"description":"Зачем","priority":"required","products":[{"id":"p1","name":"Товар","variant":"budget","price":10000,"rating":4.5,"marketplace":"yandex_market","reason":"Почему"},{"id":"p2","name":"Товар2","variant":"optimal","price":20000,"rating":4.7,"marketplace":"ozon","reason":"Почему"},{"id":"p3","name":"Товар3","variant":"premium","price":40000,"rating":4.9,"marketplace":"wildberries","reason":"Почему"}]}],"warnings":["Текст"],"tips":["Текст"]}

5 позиций, 2-3 категории, 3 продукта на позицию (budget/optimal/premium). Цены рублях 2025. Кратко!`;

        // Use Google Generative AI REST API directly (not OpenAI-compatible endpoint)
        const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${apiKey}`;

        const body = {
            contents: [{ parts: [{ text: prompt }] }],
            generationConfig: {
                temperature: 0.6,
                responseMimeType: "application/json",
            },
        };

        const response = await fetch(url, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(body),
        });

        if (!response.ok) {
            const errorText = await response.text();
            console.error("Google API error:", response.status, errorText);

            if (response.status === 429) {
                return NextResponse.json(
                    { error: "AI-сервис временно перегружен. Подождите 30 секунд и попробуйте снова." },
                    { status: 429 }
                );
            }

            return NextResponse.json(
                { error: `Ошибка Google API: ${response.status} - ${errorText.slice(0, 200)}` },
                { status: response.status }
            );
        }

        const data = await response.json();
        const content = data?.candidates?.[0]?.content?.parts?.[0]?.text ?? "{}";

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
        return NextResponse.json(
            { error: `Ошибка: ${(error?.message || "Unknown").slice(0, 200)}` },
            { status: 500 }
        );
    }
}
