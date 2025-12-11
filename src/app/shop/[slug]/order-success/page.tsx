
import { notFound } from "next/navigation";
import { getStoreBySlug } from "@/lib/store-data";
import { CheckCircle, ArrowRight } from "lucide-react";
import Link from "next/link";

interface PageProps {
    params: Promise<{ slug: string }>;
    searchParams: Promise<{ id?: string }>;
}

export default async function OrderSuccessPage({ params, searchParams }: PageProps) {
    const { slug } = await params;
    const { id } = await searchParams;
    const storeData = await getStoreBySlug(slug);

    if (!storeData) {
        notFound();
    }

    const theme = (storeData.settings?.themeConfig as any) || {};
    const primaryColor = theme.primaryColor || "#000000";

    return (
        <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center p-4 font-sans" style={{ '--primary': primaryColor } as React.CSSProperties}>
            <div className="bg-white p-8 rounded-2xl shadow-xl max-w-md w-full text-center border-t-8" style={{ borderColor: primaryColor }}>
                <div className="flex justify-center mb-6">
                    <div className="rounded-full p-4 bg-green-50">
                        <CheckCircle className="w-16 h-16 text-green-500" />
                    </div>
                </div>

                <h1 className="text-3xl font-bold text-gray-900 mb-2">Order Confirmed!</h1>
                <p className="text-gray-600 mb-6">
                    Thank you for shopping with <span className="font-semibold" style={{ color: primaryColor }}>{storeData.settings?.businessName || storeData.business.name}</span>.
                </p>

                {id && (
                    <div className="bg-gray-50 rounded-lg p-4 mb-8 border border-gray-100">
                        <p className="text-sm text-gray-500 uppercase tracking-wide font-semibold mb-1">Order ID</p>
                        <p className="text-2xl font-mono text-gray-900">#{id}</p>
                    </div>
                )}

                <p className="text-sm text-gray-500 mb-8">
                    We have sent a confirmation email to you. We will notify you when your order ships.
                </p>

                <Link
                    href={`/shop/${slug}`}
                    className="inline-flex items-center justify-center gap-2 w-full py-3 px-6 rounded-lg text-white font-bold transition-transform active:scale-95"
                    style={{ backgroundColor: primaryColor }}
                >
                    Continue Shopping
                    <ArrowRight className="w-4 h-4" />
                </Link>
            </div>

            <div className="mt-8 text-gray-400 text-sm">
                Powered by WaveGroww
            </div>
        </div>
    );
}
