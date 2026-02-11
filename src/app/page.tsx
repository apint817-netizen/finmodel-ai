'use client';

import Link from 'next/link';
import { ArrowRight, BarChart3, Brain, FileSpreadsheet, Sparkles } from 'lucide-react';

export default function HomePage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-blue-50">
      {/* Header */}
      <header className="border-b border-slate-200/50 backdrop-blur-sm bg-white/70 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg flex items-center justify-center">
              <BarChart3 className="w-5 h-5 text-white" />
            </div>
            <span className="text-xl font-semibold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
              FinModel AI
            </span>
          </div>
          <nav className="hidden md:flex items-center gap-8">
            <button
              onClick={() => document.getElementById('features')?.scrollIntoView({ behavior: 'smooth' })}
              className="text-sm text-slate-600 hover:text-slate-900 transition-colors"
            >
              Возможности
            </button>
            <button
              onClick={() => document.getElementById('how-it-works')?.scrollIntoView({ behavior: 'smooth' })}
              className="text-sm text-slate-600 hover:text-slate-900 transition-colors"
            >
              Как работает
            </button>
            <Link
              href="/dashboard"
              className="px-4 py-2 bg-slate-900 text-white text-sm rounded-lg hover:bg-slate-800 transition-all hover:shadow-lg"
            >
              Начать
            </Link>
          </nav>
        </div>
      </header>

      {/* Hero Section */}
      <section className="max-w-7xl mx-auto px-6 py-20 md:py-32">
        <div className="text-center max-w-4xl mx-auto">
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-blue-50 border border-blue-100 rounded-full text-sm text-blue-700 mb-8">
            <Sparkles className="w-4 h-4" />
            <span>Финансовое моделирование с ИИ</span>
          </div>

          <h1 className="text-5xl md:text-7xl font-bold text-slate-900 mb-6 leading-tight">
            Создайте финмодель
            <br />
            <span className="bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
              для любого бизнеса
            </span>
          </h1>

          <p className="text-xl text-slate-600 mb-12 max-w-2xl mx-auto leading-relaxed">
            Интеллектуальная платформа для расчёта, анализа и оптимизации финансовых моделей.
            С помощью ИИ-ассистента и готовых шаблонов.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link
              href="/dashboard"
              className="group px-8 py-4 bg-slate-900 text-white rounded-xl hover:bg-slate-800 transition-all hover:shadow-2xl hover:scale-105 flex items-center gap-2"
            >
              <span className="font-medium">Создать модель</span>
              <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
            </Link>
            <button
              onClick={() => document.getElementById('how-it-works')?.scrollIntoView({ behavior: 'smooth' })}
              className="px-8 py-4 bg-white text-slate-900 rounded-xl hover:bg-slate-50 transition-all border border-slate-200 hover:shadow-lg"
            >
              Узнать больше
            </button>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="max-w-7xl mx-auto px-6 py-20">
        <div className="text-center mb-16">
          <h2 className="text-4xl font-bold text-slate-900 mb-4">Всё для вашего бизнеса</h2>
          <p className="text-lg text-slate-600">Мощные инструменты в простом интерфейсе</p>
        </div>

        <div className="grid md:grid-cols-3 gap-8">
          {/* Feature 1 */}
          <div className="group p-8 bg-white rounded-2xl border border-slate-200 hover:border-blue-200 hover:shadow-xl transition-all">
            <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
              <Brain className="w-6 h-6 text-blue-600" />
            </div>
            <h3 className="text-xl font-semibold text-slate-900 mb-3">ИИ-Консультант</h3>
            <p className="text-slate-600 leading-relaxed">
              Получайте советы, анализ рисков и рекомендации от искусственного интеллекта в реальном времени
            </p>
          </div>

          {/* Feature 2 */}
          <div className="group p-8 bg-white rounded-2xl border border-slate-200 hover:border-purple-200 hover:shadow-xl transition-all">
            <div className="w-12 h-12 bg-purple-100 rounded-xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
              <BarChart3 className="w-6 h-6 text-purple-600" />
            </div>
            <h3 className="text-xl font-semibold text-slate-900 mb-3">Умные расчёты</h3>
            <p className="text-slate-600 leading-relaxed">
              ROI, точка безубыточности, NPV, IRR и другие метрики рассчитываются автоматически
            </p>
          </div>

          {/* Feature 3 */}
          <div className="group p-8 bg-white rounded-2xl border border-slate-200 hover:border-green-200 hover:shadow-xl transition-all">
            <div className="w-12 h-12 bg-green-100 rounded-xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
              <FileSpreadsheet className="w-6 h-6 text-green-600" />
            </div>
            <h3 className="text-xl font-semibold text-slate-900 mb-3">Экспорт</h3>
            <p className="text-slate-600 leading-relaxed">
              Выгружайте готовые модели в Google Sheets, Excel или PDF одним кликом
            </p>
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section id="how-it-works" className="max-w-7xl mx-auto px-6 py-20">
        <div className="text-center mb-16">
          <h2 className="text-4xl font-bold text-slate-900 mb-4">Как это работает</h2>
          <p className="text-lg text-slate-600">Три простых шага до готовой финмодели</p>
        </div>

        <div className="grid md:grid-cols-3 gap-12">
          <div className="text-center">
            <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-blue-600 rounded-2xl flex items-center justify-center mx-auto mb-6 text-white text-2xl font-bold shadow-lg">
              1
            </div>
            <h3 className="text-xl font-semibold text-slate-900 mb-3">Выберите шаблон</h3>
            <p className="text-slate-600">
              Розница, общепит, услуги, развлечения — готовые шаблоны для любого бизнеса
            </p>
          </div>

          <div className="text-center">
            <div className="w-16 h-16 bg-gradient-to-br from-purple-500 to-purple-600 rounded-2xl flex items-center justify-center mx-auto mb-6 text-white text-2xl font-bold shadow-lg">
              2
            </div>
            <h3 className="text-xl font-semibold text-slate-900 mb-3">Заполните данные</h3>
            <p className="text-slate-600">
              Укажите инвестиции, доходы и расходы. ИИ подскажет, что вы могли забыть
            </p>
          </div>

          <div className="text-center">
            <div className="w-16 h-16 bg-gradient-to-br from-green-500 to-green-600 rounded-2xl flex items-center justify-center mx-auto mb-6 text-white text-2xl font-bold shadow-lg">
              3
            </div>
            <h3 className="text-xl font-semibold text-slate-900 mb-3">Получите анализ</h3>
            <p className="text-slate-600">
              Смотрите метрики, графики и рекомендации. Экспортируйте результат
            </p>
          </div>
        </div>

        <div className="text-center mt-16">
          <Link
            href="/dashboard"
            className="inline-flex items-center gap-2 px-8 py-4 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-xl hover:shadow-2xl transition-all hover:scale-105 font-medium"
          >
            <span>Начать прямо сейчас</span>
            <ArrowRight className="w-5 h-5" />
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-slate-200 mt-20">
        <div className="max-w-7xl mx-auto px-6 py-12">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-2">
              <div className="w-6 h-6 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg flex items-center justify-center">
                <BarChart3 className="w-4 h-4 text-white" />
              </div>
              <span className="font-semibold text-slate-900">FinModel AI</span>
            </div>
            <p className="text-sm text-slate-500">
              Создано с помощью Antigravity Manager
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}
