'use client';

import Link from 'next/link';
import { ArrowRight, BarChart3, Brain, FileSpreadsheet, Sparkles, CheckCircle2, ChevronRight } from 'lucide-react';
import { motion } from 'framer-motion';

const fadeInUp = {
  hidden: { opacity: 0, y: 30 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.6, ease: "easeOut" } }
};

const staggerContainer = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.2
    }
  }
};

export default function HomePage() {
  return (
    <div className="min-h-screen bg-[#F8FAFC] overflow-x-hidden selection:bg-blue-100 selection:text-blue-900">

      {/* Background Decor */}
      <div className="fixed inset-0 z-0 pointer-events-none">
        <div className="absolute top-[-10%] right-[-5%] w-[500px] h-[500px] bg-purple-200/40 rounded-full blur-[120px]" />
        <div className="absolute bottom-[-10%] left-[-10%] w-[600px] h-[600px] bg-blue-200/40 rounded-full blur-[120px]" />
      </div>

      {/* Header */}
      <motion.header
        initial={{ y: -20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.5 }}
        className="fixed top-0 w-full z-50 border-b border-white/50 bg-white/60 backdrop-blur-xl supports-[backdrop-filter]:bg-white/60"
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-9 h-9 bg-gradient-to-br from-blue-600 to-indigo-600 rounded-xl flex items-center justify-center shadow-lg shadow-blue-500/20">
              <BarChart3 className="w-5 h-5 text-white" />
            </div>
            <span className="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-slate-900 to-slate-700">
              FinModel AI
            </span>
          </div>

          <nav className="hidden md:flex items-center gap-8">
            <button onClick={() => document.getElementById('features')?.scrollIntoView({ behavior: 'smooth' })} className="text-sm font-medium text-slate-600 hover:text-blue-600 transition-colors">Возможности</button>
            <button onClick={() => document.getElementById('how-it-works')?.scrollIntoView({ behavior: 'smooth' })} className="text-sm font-medium text-slate-600 hover:text-blue-600 transition-colors">Как это работает</button>
          </nav>

          <Link
            href="/dashboard"
            className="px-5 py-2.5 bg-slate-900 text-white text-sm font-medium rounded-xl hover:bg-slate-800 transition-all hover:shadow-lg hover:-translate-y-0.5"
          >
            Начать
          </Link>
        </div>
      </motion.header>

      {/* Hero Section */}
      <section className="relative pt-32 pb-20 md:pt-48 md:pb-32 px-6">
        <motion.div
          initial="hidden"
          animate="visible"
          variants={staggerContainer}
          className="max-w-5xl mx-auto text-center relative z-10"
        >
          <motion.div variants={fadeInUp} className="inline-flex items-center gap-2 px-4 py-2 bg-white/80 border border-blue-100 rounded-full text-sm font-medium text-blue-700 mb-8 shadow-sm backdrop-blur-sm">
            <Sparkles className="w-4 h-4 fill-blue-100" />
            <span>Финансовое моделирование нового поколения</span>
          </motion.div>

          <motion.h1 variants={fadeInUp} className="text-5xl md:text-7xl font-extrabold text-slate-900 mb-8 leading-[1.1] tracking-tight">
            Создайте идеальную <br className="hidden md:block" />
            <span className="bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 bg-clip-text text-transparent">
              финмодель за минуты
            </span>
          </motion.h1>

          <motion.p variants={fadeInUp} className="text-xl md:text-2xl text-slate-600 mb-12 max-w-2xl mx-auto leading-relaxed">
            Профессиональный инструмент с ИИ-ассистентом для предпринимателей.
            Расчет, анализ и прогнозирование без сложных формул Excel.
          </motion.p>

          <motion.div variants={fadeInUp} className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link
              href="/dashboard"
              className="w-full sm:w-auto px-8 py-4 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-2xl font-semibold shadow-xl shadow-blue-500/30 hover:shadow-2xl hover:shadow-blue-500/40 hover:-translate-y-1 transition-all flex items-center justify-center gap-2 group"
            >
              <span>Создать модель бесплатно</span>
              <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
            </Link>
            <button
              onClick={() => document.getElementById('how-it-works')?.scrollIntoView({ behavior: 'smooth' })}
              className="w-full sm:w-auto px-8 py-4 bg-white text-slate-700 rounded-2xl font-semibold border border-slate-200 hover:border-slate-300 hover:bg-slate-50 transition-all flex items-center justify-center gap-2 group"
            >
              <span>Как это работает</span>
              <ChevronRight className="w-4 h-4 text-slate-400 group-hover:text-slate-600 transition-colors" />
            </button>
          </motion.div>

          {/* Hero Image / Preview UI Placeholder */}
          <motion.div
            variants={fadeInUp}
            className="mt-20 relative mx-auto max-w-5xl rounded-3xl bg-slate-900 p-2 shadow-2xl shadow-indigo-500/20 md:p-3"
          >
            <div className="rounded-2xl bg-slate-800 overflow-hidden aspect-[16/9] relative group">
              {/* Abstract UI representation */}
              <div className="absolute inset-0 bg-gradient-to-br from-slate-800 to-slate-900 flex items-center justify-center">
                <div className="text-center">
                  <BarChart3 className="w-16 h-16 text-slate-700 mx-auto mb-4" />
                  <p className="text-slate-500 font-medium">Интерактивный дашборд</p>
                </div>
              </div>
              {/* Glass overlay */}
              <div className="absolute inset-0 bg-gradient-to-t from-slate-900/50 to-transparent pointer-events-none" />
            </div>
            {/* Floating Badge */}
            <motion.div
              animate={{ y: [0, -10, 0] }}
              transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
              className="absolute -top-6 -right-6 md:top-10 md:-right-10 bg-white p-4 rounded-2xl shadow-xl border border-slate-100 hidden sm:block"
            >
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center">
                  <TrendingUpIcon className="w-5 h-5 text-green-600" />
                </div>
                <div>
                  <p className="text-xs text-slate-500 font-medium">ROI (Годовой)</p>
                  <p className="text-lg font-bold text-slate-900">+155%</p>
                </div>
              </div>
            </motion.div>
          </motion.div>
        </motion.div>
      </section>

      {/* Features Section */}
      <section id="features" className="py-24 md:py-32 relative z-10">
        <div className="max-w-7xl mx-auto px-6">
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-100px" }}
            variants={fadeInUp}
            className="text-center mb-20"
          >
            <h2 className="text-3xl md:text-5xl font-bold text-slate-900 mb-6">Всё, что нужно для роста</h2>
            <p className="text-xl text-slate-600 max-w-2xl mx-auto">
              Мы объединили профессиональные финансовые инструменты с простотой современного интерфейса.
            </p>
          </motion.div>

          <div className="grid md:grid-cols-3 gap-8">
            <FeatureCard
              icon={<Brain className="w-6 h-6 text-white" />}
              color="bg-purple-600"
              title="ИИ-Консультант 2.0"
              desc="Персональный аналитик, доступный 24/7. Найдет слабые места в бизнес-модели и подскажет точки роста."
            />
            <FeatureCard
              icon={<BarChart3 className="w-6 h-6 text-white" />}
              color="bg-blue-600"
              title="Умная аналитика"
              desc="Автоматический расчет всех метрик: NPV, IRR, ROI, точка безубыточности. Наглядные графики и отчеты."
            />
            <FeatureCard
              icon={<FileSpreadsheet className="w-6 h-6 text-white" />}
              color="bg-emerald-600"
              title="Мгновенный экспорт"
              desc="Скачивайте готовые профессиональные отчеты в PDF или Excel для презентации инвесторам."
            />
          </div>
        </div>
      </section>

      {/* Steps Section */}
      <section id="how-it-works" className="py-24 md:py-32 bg-white relative z-10">
        <div className="max-w-7xl mx-auto px-6">
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-100px" }}
            variants={fadeInUp}
            className="text-center mb-20"
          >
            <h2 className="text-3xl md:text-5xl font-bold text-slate-900 mb-6">От идеи до плана за 3 шага</h2>
          </motion.div>

          <div className="grid md:grid-cols-3 gap-12 relative">
            {/* Connecting Line (Desktop) */}
            <div className="hidden md:block absolute top-12 left-[16%] right-[16%] h-0.5 bg-gradient-to-r from-blue-100 via-purple-100 to-blue-100 z-0" />

            <StepCard number="1" title="Выберите нишу" desc="Используйте готовые шаблоны для розницы, услуг или общепита." delay={0} />
            <StepCard number="2" title="Заполните данные" desc="Внесите основные цифры. ИИ подставит средние значения по рынку." delay={0.2} />
            <StepCard number="3" title="Получите результат" desc="Готовая модель с оценкой рисков и стратегией развития." delay={0.4} />
          </div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.6 }}
            className="text-center mt-20"
          >
            <Link
              href="/dashboard"
              className="inline-flex items-center gap-2 px-10 py-5 bg-slate-900 text-white rounded-2xl hover:bg-slate-800 transition-all hover:scale-105 shadow-xl font-semibold text-lg"
            >
              <span>Попробовать бесплатно</span>
              <ArrowRight className="w-5 h-5" />
            </Link>
          </motion.div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-12 border-t border-slate-200 bg-slate-50">
        <div className="max-w-7xl mx-auto px-6 flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-slate-900 rounded-lg flex items-center justify-center">
              <BarChart3 className="w-4 h-4 text-white" />
            </div>
            <span className="font-bold text-slate-900">FinModel AI</span>
          </div>
          <p className="text-slate-500 text-sm">
            © {new Date().getFullYear()} Antigravity Manager. All rights reserved.
          </p>
        </div>
      </footer>
    </div>
  );
}

// Sub-components for cleaner code
function FeatureCard({ icon, color, title, desc }: { icon: React.ReactNode, color: string, title: string, desc: string }) {
  return (
    <motion.div
      variants={fadeInUp}
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true, margin: "-50px" }}
      whileHover={{ y: -10 }}
      className="p-8 bg-white rounded-3xl border border-slate-100 shadow-xl shadow-slate-200/50 hover:shadow-2xl hover:shadow-blue-500/10 transition-all"
    >
      <div className={`w-14 h-14 ${color} rounded-2xl flex items-center justify-center mb-6 shadow-lg shadow-current/30`}>
        {icon}
      </div>
      <h3 className="text-xl font-bold text-slate-900 mb-3">{title}</h3>
      <p className="text-slate-600 leading-relaxed">{desc}</p>
    </motion.div>
  );
}

function StepCard({ number, title, desc, delay }: { number: string, title: string, desc: string, delay: number }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ delay, duration: 0.6 }}
      className="relative z-10 text-center"
    >
      <div className="w-24 h-24 bg-white rounded-3xl border border-slate-100 shadow-xl flex items-center justify-center mx-auto mb-8 relative group">
        <div className="absolute inset-0 bg-gradient-to-br from-blue-50 to-purple-50 rounded-3xl opacity-0 group-hover:opacity-100 transition-opacity" />
        <span className="text-3xl font-bold bg-gradient-to-br from-blue-600 to-purple-600 bg-clip-text text-transparent relative z-10">{number}</span>
      </div>
      <h3 className="text-xl font-bold text-slate-900 mb-3">{title}</h3>
      <p className="text-slate-600 leading-relaxed max-w-xs mx-auto">{desc}</p>
    </motion.div>
  );
}

function TrendingUpIcon(props: any) {
  return (
    <svg
      {...props}
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <polyline points="23 6 13.5 15.5 8.5 10.5 1 18" />
      <polyline points="17 6 23 6 23 12" />
    </svg>
  )
}
