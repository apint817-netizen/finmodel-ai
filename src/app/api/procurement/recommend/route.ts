import { NextRequest, NextResponse } from "next/server";
import { aiClient } from "@/lib/ai-client";

export async function POST(req: NextRequest) {
    try {
        const { businessDescription, city, budget } = await req.json();

        if (!businessDescription) {
            return NextResponse.json({ error: "Описание бизнеса обязательно" }, { status: 400 });
        }

        const systemPrompt = `Ты бизнес-консультант по закупкам в России. Составь чек-лист закупок.
Отвечай ТОЛЬКО в формате JSON (без markdown-обёртки).

Формат ответа:
{
  "businessType": "тип бизнеса",
  "categories": ["Категория1", "Категория2"],
  "items": [
    {
      "id": "item_1",
      "category": "Категория1",
      "name": "Название",
      "quantity": 1,
      "description": "Зачем нужен",
      "priority": "required",
      "products": [
        {"id": "p1", "name": "Название товара", "variant": "budget", "price": 10000, "rating": 4.5, "marketplace": "yandex_market", "reason": "Почему"},
        {"id": "p2", "name": "Название товара", "variant": "optimal", "price": 20000, "rating": 4.7, "marketplace": "ozon", "reason": "Почему"},
        {"id": "p3", "name": "Название товара", "variant": "premium", "price": 40000, "rating": 4.9, "marketplace": "wildberries", "reason": "Почему"}
      ]
    }
  ],
  "warnings": ["Текст предупреждения"],
  "tips": ["Полезный совет"]
}

5 позиций, 2-3 категории, 3 продукта на позицию. Цены в рублях 2025. Кратко!`;

        const userMessage = `Бизнес: ${businessDescription}
Город: ${city || "Москва"}
Бюджет: ${budget ? budget.toLocaleString("ru-RU") + " ₽" : "Не указан"}`;

        const response = await aiClient.chat.completions.create({
            model: "gemini-2.0-flash",
            messages: [
                { role: "system", content: systemPrompt },
                { role: "user", content: userMessage },
            ],
            temperature: 0.5,
        });

        const content = response.choices[0]?.message?.content ?? "{}";

        // Strip markdown code fences if present
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
        const msg = error?.message || "Unknown";
        const status = error?.status || error?.statusCode || 500;
        const body = error?.error?.message || error?.response?.data?.error?.message || "";
        return NextResponse.json(
            { error: `Ошибка (${status}): ${msg}. ${body}`.trim() },
            { status: typeof status === "number" ? status : 500 }
        );
    }
}
