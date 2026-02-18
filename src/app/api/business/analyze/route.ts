import { NextRequest, NextResponse } from "next/server";
import { aiClient } from "@/lib/ai-client";

export async function POST(req: NextRequest) {
    try {
        const { transactions, profile, metrics } = await req.json();

        const totalIncome = metrics?.income ?? 0;
        const totalExpense = metrics?.expense ?? 0;
        const taxToPay = metrics?.taxToPay ?? 0;
        const taxLoad = metrics?.taxLoad ?? 0;
        const profit = metrics?.profit ?? 0;

        // Build a compact summary for the AI
        const topExpenses = (transactions ?? [])
            .filter((t: any) => t.type === "expense")
            .sort((a: any, b: any) => b.amount - a.amount)
            .slice(0, 5)
            .map((t: any) => `• ${t.description || t.category}: ${t.amount.toLocaleString("ru-RU")} ₽`)
            .join("\n");

        const topIncome = (transactions ?? [])
            .filter((t: any) => t.type === "income")
            .sort((a: any, b: any) => b.amount - a.amount)
            .slice(0, 5)
            .map((t: any) => `• ${t.description || t.category}: ${t.amount.toLocaleString("ru-RU")} ₽`)
            .join("\n");

        const systemPrompt = `Ты — опытный финансовый консультант для малого бизнеса в России. 
Анализируй данные чётко и конкретно. Отвечай ТОЛЬКО в формате JSON (без markdown-обёртки).

Формат ответа:
{
  "health": "good" | "warning" | "critical",
  "summary": "Краткий вывод 1-2 предложения",
  "risks": [{"title": "...", "description": "..."}],
  "recommendations": [{"title": "...", "description": "...", "saving": "..."}],
  "taxOptimization": "Конкретный совет по снижению налоговой нагрузки"
}`;

        const userMessage = `Данные бизнеса:
Налоговый режим: ${profile?.taxSystem || profile?.taxSystems?.join(", ") || "УСН 6%"}
Доходы: ${totalIncome.toLocaleString("ru-RU")} ₽
Расходы: ${totalExpense.toLocaleString("ru-RU")} ₽
Прибыль: ${profit.toLocaleString("ru-RU")} ₽
Налог к уплате: ${taxToPay.toLocaleString("ru-RU")} ₽
Налоговая нагрузка: ${taxLoad}%

Топ расходов:
${topExpenses || "Нет данных"}

Топ доходов:
${topIncome || "Нет данных"}

Количество транзакций: ${(transactions ?? []).length}`;

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
                health: "warning",
                summary: cleaned.slice(0, 200),
                risks: [],
                recommendations: [],
                taxOptimization: "",
            };
        }

        return NextResponse.json(parsed);
    } catch (error: any) {
        console.error("AI Analysis error:", error);
        return NextResponse.json(
            { error: "Не удалось получить анализ. Убедитесь, что AI-сервис доступен." },
            { status: 500 }
        );
    }
}
