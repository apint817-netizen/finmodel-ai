import { NextRequest, NextResponse } from "next/server";
import { aiClient } from "@/lib/ai-client";

export async function POST(req: NextRequest) {
    try {
        const { businessDescription, city, budget } = await req.json();

        if (!businessDescription) {
            return NextResponse.json({ error: "Описание бизнеса обязательно" }, { status: 400 });
        }

        const systemPrompt = `Ты бизнес-консультант. Ответ строго JSON без markdown.
Формат: {"businessType":"","categories":[],"items":[{"id":"item_1","category":"","name":"","quantity":1,"description":"","priority":"required","products":[{"id":"p1","name":"","variant":"budget","price":0,"rating":4.5,"marketplace":"yandex_market","reason":""}]}],"warnings":[],"tips":[]}
3 позиции, 2 категории, 3 продукта (budget/optimal/premium). Цены руб.`;

        const userMessage = `Закупки для: ${businessDescription}. ${city || "Москва"}. Бюджет: ${budget ? budget + "₽" : "любой"}`;

        const response = await aiClient.chat.completions.create({
            model: "gemini-2.0-flash",
            messages: [
                { role: "system", content: systemPrompt },
                { role: "user", content: userMessage },
            ],
            temperature: 0.5,
        });

        const content = response.choices[0]?.message?.content ?? "{}";
        const cleaned = content.replace(/^```json\s*/i, "").replace(/^```\s*/i, "").replace(/```\s*$/i, "").trim();

        let parsed;
        try {
            parsed = JSON.parse(cleaned);
        } catch {
            parsed = {
                businessType: businessDescription,
                categories: [],
                items: [],
                warnings: ["Не удалось разобрать ответ AI. Попробуйте ещё раз."],
                tips: [],
            };
        }

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
                    searchUrl: (bases[p.marketplace] || "https://www.google.com/search?q=купить+") + encodeURIComponent(p.name),
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
        const msg = error?.message || "Unknown";
        const status = error?.status || 500;
        return NextResponse.json(
            { error: `Ошибка (${status}): ${msg}` },
            { status: typeof status === "number" ? status : 500 }
        );
    }
}
