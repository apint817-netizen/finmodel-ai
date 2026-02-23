import { NextRequest, NextResponse } from "next/server";
import { aiClient } from "@/lib/ai-client";

export async function POST(req: NextRequest) {
    try {
        const { businessDescription, city, budget } = await req.json();

        if (!businessDescription) {
            return NextResponse.json({ error: "Описание бизнеса обязательно" }, { status: 400 });
        }

        const systemPrompt = `Ты — опытный бизнес-консультант по закупкам в России. 
Пользователь хочет открыть бизнес и тебе нужно составить ПОЛНЫЙ чек-лист всего необходимого оборудования, мебели, техники и расходных материалов.

Правила:
- Учитывай требования законодательства РФ (СЭС, пожарная безопасность, лицензии)
- Для каждого пункта предлагай 3 варианта: бюджетный, оптимальный, премиум
- Цены указывай в рублях, актуальные на 2025-2026 год
- Учитывай город для ценообразования
- Добавляй предупреждения о лицензиях, сертификатах, разрешениях

Отвечай СТРОГО в формате JSON (без markdown-обёртки):
{
  "businessType": "краткое название типа бизнеса",
  "categories": ["Категория1", "Категория2"],
  "items": [
    {
      "id": "уникальный_id",
      "category": "Категория",
      "name": "Название предмета",
      "quantity": 1,
      "description": "Зачем нужен",
      "priority": "required | recommended | optional",
      "products": [
        {
          "id": "prod_id",
          "name": "Конкретное название товара для поиска",
          "variant": "budget | optimal | premium",
          "price": 15000,
          "rating": 4.5,
          "marketplace": "yandex_market | ozon | wildberries",
          "reason": "Почему рекомендую этот вариант"
        }
      ]
    }
  ],
  "warnings": ["Предупреждение 1"],
  "tips": ["Полезный совет 1"]
}

Генерируй минимум 8-15 позиций в чек-листе, разбитых по 3-5 категориям.
Для каждой позиции генерируй ровно 3 продукта (budget, optimal, premium).
ID должны быть уникальными строками вида item_1, item_2 и т.д.`;

        const userMessage = `Хочу открыть: ${businessDescription}
Город: ${city || "Москва"}
Бюджет: ${budget ? budget.toLocaleString("ru-RU") + " ₽" : "Не указан"}

Составь полный чек-лист закупок с конкретными товарами и ценами.`;

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
        return NextResponse.json(
            { error: "Не удалось получить рекомендации. Убедитесь, что AI-сервис доступен." },
            { status: 500 }
        );
    }
}
