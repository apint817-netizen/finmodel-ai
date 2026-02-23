"use client";

import { ExternalLink, Plus, Star, Check } from "lucide-react";
import { motion } from "framer-motion";
import { ProductRecommendation, VARIANT_CONFIG, getMarketplaceInfo, formatPrice } from "@/lib/procurement";

interface ProductCardProps {
    product: ProductRecommendation;
    onAdd: (product: ProductRecommendation) => void;
    isAdded?: boolean;
}

export function ProductCard({ product, onAdd, isAdded = false }: ProductCardProps) {
    const variant = VARIANT_CONFIG[product.variant];
    const marketplace = getMarketplaceInfo(product.marketplace);

    return (
        <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className={`
                relative group rounded-xl border p-4 transition-all duration-300 hover:shadow-lg
                ${variant.borderColor}
                bg-white dark:bg-slate-900
                hover:shadow-amber-500/5
            `}
        >
            {/* Variant Badge */}
            <div className="flex items-center justify-between mb-3">
                <span className={`px-2.5 py-0.5 rounded-full text-[11px] font-bold uppercase tracking-wider ${variant.color} ${variant.bgColor}`}>
                    {variant.label}
                </span>
                <span className={`text-xs font-medium ${marketplace.color} ${marketplace.bgColor} px-2 py-0.5 rounded-full`}>
                    {marketplace.icon} {marketplace.name}
                </span>
            </div>

            {/* Product Image Placeholder */}
            <div className={`w-full h-28 rounded-lg mb-3 flex items-center justify-center ${variant.bgColor} transition-colors`}>
                <div className="text-3xl opacity-60">
                    {product.variant === "budget" ? "💰" : product.variant === "optimal" ? "⭐" : "👑"}
                </div>
            </div>

            {/* Product Info */}
            <h4 className="text-sm font-semibold text-slate-900 dark:text-white mb-1 line-clamp-2 leading-snug min-h-[2.5rem]">
                {product.name}
            </h4>

            {/* Rating */}
            <div className="flex items-center gap-1 mb-2">
                {Array.from({ length: 5 }).map((_, i) => (
                    <Star
                        key={i}
                        className={`w-3.5 h-3.5 ${i < Math.round(product.rating)
                            ? "text-amber-400 fill-amber-400"
                            : "text-slate-200 dark:text-slate-700"
                            }`}
                    />
                ))}
                <span className="text-xs text-slate-400 ml-1">{product.rating}</span>
            </div>

            {/* Price */}
            <p className="text-lg font-bold text-slate-900 dark:text-white mb-2">
                {formatPrice(product.price)}
            </p>

            {/* Reason */}
            <p className="text-xs text-slate-500 dark:text-slate-400 mb-4 line-clamp-2 leading-relaxed">
                {product.reason}
            </p>

            {/* Actions */}
            <div className="flex gap-2">
                <button
                    onClick={() => onAdd(product)}
                    disabled={isAdded}
                    className={`
                        flex-1 inline-flex items-center justify-center gap-1.5 px-3 py-2 rounded-lg text-xs font-semibold transition-all
                        ${isAdded
                            ? "bg-emerald-50 dark:bg-emerald-900/20 text-emerald-600 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800"
                            : "bg-gradient-to-r from-amber-500 to-orange-600 text-white hover:from-amber-600 hover:to-orange-700 shadow-sm hover:shadow-md"
                        }
                    `}
                >
                    {isAdded ? (
                        <>
                            <Check className="w-3.5 h-3.5" />
                            Добавлено
                        </>
                    ) : (
                        <>
                            <Plus className="w-3.5 h-3.5" />
                            В список
                        </>
                    )}
                </button>
                <a
                    href={product.searchUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center justify-center p-2 rounded-lg border border-slate-200 dark:border-slate-700 text-slate-500 hover:text-amber-600 hover:border-amber-300 dark:hover:border-amber-700 transition-all"
                >
                    <ExternalLink className="w-4 h-4" />
                </a>
            </div>
        </motion.div>
    );
}
