import { NextRequest, NextResponse } from "next/server";
import { aiClient } from "@/lib/ai-client";

// Allow up to 60 seconds on Vercel (requires Pro plan for >10s)
export const maxDuration = 60;

export async function POST(req: NextRequest) {
    try {
        const { businessDescription, city, budget } = await req.json();

        if (!businessDescription) {
            return NextResponse.json({ error: "Описание бизнеса обязательно" }, { status: 400 });
        }

        const systemPrompt = `Ты — бизнес-консультант по закупкам в России.
Составь чек-лист необходимого оборудования и товаров для открытия бизнеса.

Правила:
- Для каждого пункта предлагай 3 варианта: budget, optimal, premium
- Цены в рублях (2025-2026)
- Учитывай город
- Добавь предупреждения по лицензиям/разрешениям

Формат JSON (без markdown):
{
  "businessType": "тип бизнеса",
  "categories": ["Категория1"],
  "items": [
    {
      "id": "item_1",
      "category": "Категория",
      "name": "Название",
      "quantity": 1,
      "description": "Зачем нужен",
      "priority": "required",
      "products": [
        {"id": "p1", "name": "Товар для поиска", "variant": "budget", "price": 10000, "rating": 4.5, "marketplace": "yandex_market", "reason": "Почему"}
      ]
    }
  ],
  "warnings": ["..."],
  "tips": ["..."]
}

Генерируй 5-8 позиций, 3-4 категории. Каждая позиция = ровно 3 продукта (budget, optimal, premium). Будь кратким.`;

        const userMessage = `Бизнес: ${businessDescription}
Город: ${city || "Москва"}
Бюджет: ${budget ? budget.toLocaleString("ru-RU") + " ₽" : "Не указан"}`;

        const response = await aiClient.chat.completions.create({
            model: "gemini-2.0-flash",
            messages: [
                { role: "system", content: systemPrompt },
                { role: "user", content: userMessage },
            ],
            temperature: 0.6,
        });

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

        // Add search URLs to products
        const marketplaceSearchBases: Record<string, string> = {
            yandex_market: "https://market.yandex.ru/search?text=",
            ozon: "https://www.ozon.ru/search/?text=",
            wildberries: "https://www.wildberries.ru/catalog/0/search.aspx?search=",
            other: "https://www.google.com/search?q=купить+",
        };

        if (parsed.items) {
            parsed.items = parsed.items.map((item: any) => ({
                ...item,
                checked: false,
                products: (item.products || []).map((p: any) => ({
                    ...p,
                    searchUrl: (marketplaceSearchBases[p.marketplace] || marketplaceSearchBases.other)
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
        // Return detailed error for debugging
        const message = error?.message || "Unknown error";
        const status = error?.status || 500;
        return NextResponse.json(
            { error: `Ошибка AI: ${message.slice(0, 200)}` },
            { status }
        );
    }
}
