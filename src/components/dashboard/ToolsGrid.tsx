"use client";

import { BarChart3, Bot, PieChart, Presentation } from "lucide-react";
import { ToolCard } from "./ToolCard";

export function ToolsGrid() {
    return (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <ToolCard
                title="Финансовая модель"
                description="Создавайте и анализируйте финансовые модели для вашего бизнеса. Прогнозируйте доходы, расходы и денежные потоки."
                icon={BarChart3}
                href="/dashboard/projects"
                status="active"
                color="blue"
            />

            <ToolCard
                title="AI Бизнес-Консультант"
                description="Ваш персональный финансовый директор. Анализ рисков, налоговая оптимизация и советы по управлению финансами."
                icon={Bot}
                href="/dashboard/business" // Still keep the route but maybe handle it differently later
                status="coming_soon"
                color="indigo"
            />

            <ToolCard
                title="Unit-экономика"
                description="Быстрый расчет юнит-экономики. Оцените жизнеспособность бизнес-модели: CAC, LTV, Retention."
                icon={PieChart}
                href="/dashboard/unit-economics"
                status="coming_soon"
                color="emerald"
            />

            <ToolCard
                title="Генератор Pitch Deck"
                description="Автоматическое создание презентаций для инвесторов на основе ваших финансовых данных."
                icon={Presentation}
                href="/dashboard/pitch-deck"
                status="coming_soon"
                color="purple"
            />
        </div>
    );
}
