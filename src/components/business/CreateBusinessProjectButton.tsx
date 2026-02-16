"use client";

import { useState } from "react";
import { Loader2, Plus } from "lucide-react";
import { useRouter } from "next/navigation";
import { createProject } from "@/app/actions/project";
// Note: We are reusing the generic createProject action but we might need to update the project type after creation
// Or create a specific action for business projects. 
// For now, let's assume we can update it or create a specific action.
// Actually, let's create a specific server action for this to be clean.

import { createBusinessProject } from "@/actions/business";

export function CreateBusinessProjectButton() {
    const [loading, setLoading] = useState(false);
    const router = useRouter();

    async function handleCreate() {
        setLoading(true);
        try {
            await createBusinessProject();
            router.refresh(); // Refresh to show the new dashboard
        } catch (error) {
            console.error(error);
            alert("Не удалось создать бизнес-проект");
        } finally {
            setLoading(false);
        }
    }

    return (
        <button
            onClick={handleCreate}
            disabled={loading}
            className="mt-4 bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-6 rounded-lg flex items-center gap-2 transition-colors shadow-lg hover:shadow-xl"
        >
            {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : <Plus className="w-5 h-5" />}
            Создать бизнес-проект
        </button>
    );
}
