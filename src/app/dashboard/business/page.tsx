"use client";

import { useState, useEffect } from "react";
import { BusinessOnboarding } from "@/components/business/BusinessOnboarding";
import { ConsultantDashboard } from "@/components/business/ConsultantDashboard";
import { ArrowLeft, Loader2 } from "lucide-react";
import Link from "next/link";

export default function BusinessConsultantPage() {
    // State to track if onboarding is complete
    // In a real app, this would come from the database via a server component wrapper
    const [isLoading, setIsLoading] = useState(true);
    const [businessData, setBusinessData] = useState<any>(null);

    useEffect(() => {
        // Simulate checking for existing business profile
        const savedData = localStorage.getItem("finmodel_business_profile");
        if (savedData) {
            setBusinessData(JSON.parse(savedData));
        }
        setIsLoading(false);
    }, []);

    const handleOnboardingComplete = (data: any) => {
        setIsLoading(true);
        // Simulate API call
        setTimeout(() => {
            setBusinessData(data);
            localStorage.setItem("finmodel_business_profile", JSON.stringify(data));
            setIsLoading(false);
        }, 1000);
    };

    if (isLoading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-slate-50 dark:bg-slate-900">
                <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
            </div>
        );
    }

    if (!businessData) {
        return (
            <div className="min-h-screen bg-slate-50 dark:bg-slate-900">
                <div className="max-w-7xl mx-auto px-6 py-6">
                    <Link
                        href="/dashboard"
                        className="inline-flex items-center gap-2 text-slate-500 hover:text-slate-900 transition-colors mb-8"
                    >
                        <ArrowLeft className="w-4 h-4" />
                        Назад
                    </Link>
                    <BusinessOnboarding onComplete={handleOnboardingComplete} />
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-slate-50 dark:bg-slate-900">
            <div className="max-w-7xl mx-auto px-6 py-6" key="dashboard-container">
                <div className="flex items-center gap-4 mb-8">
                    <Link
                        href="/dashboard"
                        className="p-2 hover:bg-white dark:hover:bg-slate-800 rounded-xl transition-colors text-slate-500 hover:text-slate-900"
                    >
                        <ArrowLeft className="w-5 h-5" />
                    </Link>
                    <h1 className="text-xl font-bold text-slate-900 dark:text-white">Бизнес-Консультант</h1>
                </div>

                <ConsultantDashboard data={businessData} />
            </div>
        </div>
    );
}
