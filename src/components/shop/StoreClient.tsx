
"use client";

import { useState, useEffect } from "react";
import { StoreHeader } from "@/components/shop/StoreHeader";
import { ProductCard } from "@/components/shop/ProductCard";
import type { StoreData } from "@/lib/store-data";
import { X, ShoppingBag, MessageCircle } from "lucide-react";
import { toast } from "sonner";

export function StoreClient({ storeData }: { storeData: StoreData }) {
    const [cart, setCart] = useState<any[]>([]);
    const [isCartOpen, setIsCartOpen] = useState(false);
    const theme = (storeData.settings?.themeConfig as any) || {};

    // Load cart from local storage on mount
    useEffect(() => {
        const saved = localStorage.getItem(`cart_${storeData.business.id}`);
        if (saved) {
            try {
                setCart(JSON.parse(saved));
            } catch (e) {
                console.error("Failed to parse cart", e);
            }
        }
    }, [storeData.business.id]);

    // Save cart
    useEffect(() => {
        localStorage.setItem(`cart_${storeData.business.id}`, JSON.stringify(cart));
    }, [cart, storeData.business.id]);

    const addToCart = (product: any) => {
        setCart(prev => {
            const existing = prev.find(p => p.id === product.id);
            if (existing) {
                return prev.map(p => p.id === product.id ? { ...p, quantity: p.quantity + 1 } : p);
            }
            return [...prev, { ...product, quantity: 1 }];
        });
        toast.success("Added to cart");
        setIsCartOpen(true);
    };

    const removeFromCart = (productId: number) => {
        setCart(prev => prev.filter(p => p.id !== productId));
    };

    const updateQuantity = (productId: number, delta: number) => {
        setCart(prev => prev.map(p => {
            if (p.id === productId) {
                const newQty = Math.max(1, p.quantity + delta);
                return { ...p, quantity: newQty };
            }
            return p;
        }));
    };

    // Checkout State
    const [step, setStep] = useState<'cart' | 'checkout'>('cart');
    const [loading, setLoading] = useState(false);
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        phone: '',
        address: ''
    });

    const handleWhatsAppCheckout = () => {
        if (!formData.name || !formData.phone || !formData.address) {
            toast.error("Please fill in Name, Phone and Address");
            return;
        }

        const phone = storeData.settings?.whatsappNumber || storeData.business.phone;
        if (!phone) {
            toast.error("Seller WhatsApp number not configured");
            return;
        }

        // 1. Construct Message
        let message = `*New Order from ${formData.name}*\n\n`;
        message += `*Items:*\n`;
        cart.forEach(item => {
            message += `- ${item.quantity}x ${item.name} (₹${item.price})\n`;
        });

        const total = cart.reduce((acc, item) => acc + (item.price * item.quantity), 0);
        message += `\n*Total: ₹${total}*\n\n`;
        message += `*Delivery Details:*\n`;
        message += `Name: ${formData.name}\n`;
        message += `Phone: ${formData.phone}\n`;
        message += `Address: ${formData.address}\n`;
        if (formData.email) message += `Email: ${formData.email}\n`;

        message += `\n[Generated via WaveGroww Store]`;

        // 2. Open WhatsApp
        const url = `https://wa.me/${phone}?text=${encodeURIComponent(message)}`;
        window.open(url, '_blank');

        // 3. Clear Cart (optional, or wait for confirmation)
        setCart([]);
        setIsCartOpen(false);
        setStep('cart');
        toast.success("Redirecting to WhatsApp...");
    };

    const handleCheckout = async () => {
        if (!formData.name || !formData.phone || !formData.address) {
            toast.error("Please fill in all required fields");
            return;
        }

        setLoading(true);
        try {
            // 1. Create Order
            const res = await fetch('/api/shop/checkout', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    slug: storeData.business.slug,
                    items: cart,
                    customer: formData
                })
            });

            const data = await res.json();
            if (!res.ok) throw new Error(data.error);

            // 2. Open Razorpay
            const options = {
                key: data.keyId,
                amount: data.amount,
                currency: data.currency,
                name: storeData.settings?.businessName || storeData.business.name,
                description: `Order #${data.orderId}`,
                order_id: data.razorpayOrderId,
                handler: function (response: any) {
                    toast.success("Payment Successful!");
                    setCart([]);
                    setStep('cart');
                    setIsCartOpen(false);
                    // Redirect to success page or show success state
                    window.location.href = `/shop/${storeData.business.slug}/order-success?id=${data.orderId}`;
                },
                prefill: {
                    name: formData.name,
                    email: formData.email,
                    contact: formData.phone
                },
                theme: {
                    color: theme.primaryColor || "#000000"
                }
            };

            const rzp1 = new (window as any).Razorpay(options);
            rzp1.open();

        } catch (error: any) {
            toast.error(error.message || "Checkout failed");
        } finally {
            setLoading(false);
        }
    };

    const cartTotal = cart.reduce((acc, item) => acc + (item.price * item.quantity), 0);

    const [selectedCategory, setSelectedCategory] = useState<string>('all');

    const filteredProducts = storeData.products.filter(p => {
        if (selectedCategory === 'all') return true;
        // Assuming product has categoryId or category name. 
        // Checking schema in store-data.ts, it returns products.$inferSelect[].
        // Let's check products schema again. 
        // If categories are joined, we might need categoryId.
        // For now, let's assume we filter by categoryId if available, or just show all if not linked yet.
        return p.categoryId?.toString() === selectedCategory;
    });

    return (
        <div className="min-h-screen bg-white font-sans text-gray-900" style={{
            '--primary': theme.primaryColor || '#000000',
        } as React.CSSProperties}>
            <script src="https://checkout.razorpay.com/v1/checkout.js"></script>
            <StoreHeader
                storeData={storeData}
                cartCount={cart.reduce((a, b) => a + b.quantity, 0)}
                onCartClick={() => {
                    setIsCartOpen(true);
                    setStep('cart');
                }}
            />

            {/* Hero Section */}
            <div className="bg-gray-50 py-12 md:py-20">
                <div className="container mx-auto px-4 text-center">
                    <h1 className="text-4xl md:text-5xl font-bold mb-4" style={{ color: theme.primaryColor }}>
                        {storeData.settings?.businessName || storeData.business.name}
                    </h1>
                    <p className="text-xl text-gray-600 max-w-2xl mx-auto">
                        {storeData.settings?.shortBio || storeData.business.category}
                    </p>
                </div>
            </div>

            {/* Category Filter */}
            {storeData.categories.length > 0 && (
                <div className="container mx-auto px-4 mt-8 overflow-x-auto">
                    <div className="flex gap-2 pb-2">
                        <button
                            onClick={() => setSelectedCategory('all')}
                            className={`px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap transition-colors border ${selectedCategory === 'all'
                                    ? 'bg-black text-white border-black'
                                    : 'bg-white text-gray-600 border-gray-200 hover:border-gray-300'
                                }`}
                            style={selectedCategory === 'all' ? { backgroundColor: theme.primaryColor, borderColor: theme.primaryColor } : {}}
                        >
                            All Products
                        </button>
                        {storeData.categories.map(cat => (
                            <button
                                key={cat.id}
                                onClick={() => setSelectedCategory(cat.id.toString())}
                                className={`px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap transition-colors border ${selectedCategory === cat.id.toString()
                                        ? 'bg-black text-white border-black'
                                        : 'bg-white text-gray-600 border-gray-200 hover:border-gray-300'
                                    }`}
                                style={selectedCategory === cat.id.toString() ? { backgroundColor: theme.primaryColor, borderColor: theme.primaryColor } : {}}
                            >
                                {cat.name}
                            </button>
                        ))}
                    </div>
                </div>
            )}

            {/* Products Grid */}
            <div className="container mx-auto px-4 py-12">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
                    {filteredProducts.length > 0 ? (
                        filteredProducts.map(product => (
                            <ProductCard
                                key={product.id}
                                product={product}
                                themeConfig={theme}
                                onAddToCart={addToCart}
                            />
                        ))
                    ) : (
                        <div className="col-span-full text-center py-20 text-gray-500">
                            <p className="text-xl">No products found in this category.</p>
                        </div>
                    )}
                </div>
            </div>

            {/* Cart Drawer */}
            {isCartOpen && (
                <div className="fixed inset-0 z-[60] flex justify-end">
                    {/* Backdrop */}
                    <div
                        className="absolute inset-0 bg-black/50 backdrop-blur-sm"
                        onClick={() => setIsCartOpen(false)}
                    />

                    {/* Panel */}
                    <div className="relative w-full max-w-md bg-white h-full shadow-2xl flex flex-col animate-in slide-in-from-right duration-300">
                        <div className="p-4 border-b flex items-center justify-between">
                            <h2 className="text-lg font-bold flex items-center gap-2">
                                <ShoppingBag className="w-5 h-5" />
                                {step === 'cart' ? 'Your Cart' : 'Checkout'}
                            </h2>
                            <button onClick={() => setIsCartOpen(false)} className="p-2 hover:bg-gray-100 rounded-full">
                                <X className="w-5 h-5" />
                            </button>
                        </div>

                        <div className="flex-1 overflow-y-auto p-4 space-y-4">
                            {cart.length === 0 ? (
                                <div className="h-full flex flex-col items-center justify-center text-center text-gray-500 space-y-4">
                                    <ShoppingBag className="w-16 h-16 opacity-20" />
                                    <p>Your cart is empty</p>
                                    <button
                                        onClick={() => setIsCartOpen(false)}
                                        className="text-primary font-medium hover:underline"
                                    >
                                        Start Shopping
                                    </button>
                                </div>
                            ) : step === 'cart' ? (
                                // Cart Items View
                                cart.map(item => (
                                    <div key={item.id} className="flex gap-4">
                                        <div className="w-20 h-20 bg-gray-100 rounded-lg overflow-hidden flex-shrink-0">
                                            {item.imageUrl && (
                                                <img src={item.imageUrl} className="w-full h-full object-cover" />
                                            )}
                                        </div>
                                        <div className="flex-1">
                                            <h4 className="font-medium line-clamp-1">{item.name}</h4>
                                            <p className="text-sm text-gray-500 mb-2">₹{item.price.toLocaleString()}</p>

                                            <div className="flex items-center gap-3">
                                                <button
                                                    onClick={() => updateQuantity(item.id, -1)}
                                                    className="w-8 h-8 flex items-center justify-center border rounded-full hover:bg-gray-50"
                                                >
                                                    -
                                                </button>
                                                <span className="w-4 text-center text-sm">{item.quantity}</span>
                                                <button
                                                    onClick={() => updateQuantity(item.id, 1)}
                                                    className="w-8 h-8 flex items-center justify-center border rounded-full hover:bg-gray-50"
                                                >
                                                    +
                                                </button>
                                                <button
                                                    onClick={() => removeFromCart(item.id)}
                                                    className="ml-auto text-xs text-red-500 hover:text-red-600 underline"
                                                >
                                                    Remove
                                                </button>
                                            </div>
                                        </div>
                                    </div>
                                ))
                            ) : (
                                // Checkout Form View
                                <div className="space-y-4">
                                    <div>
                                        <label className="block text-sm font-medium mb-1">Full Name</label>
                                        <input
                                            type="text"
                                            className="w-full p-2 border rounded-lg"
                                            value={formData.name}
                                            onChange={e => setFormData({ ...formData, name: e.target.value })}
                                            placeholder="Enter your name"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium mb-1">Phone Number</label>
                                        <input
                                            type="tel"
                                            className="w-full p-2 border rounded-lg"
                                            value={formData.phone}
                                            onChange={e => setFormData({ ...formData, phone: e.target.value })}
                                            placeholder="Mobile number"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium mb-1">Email (Optional)</label>
                                        <input
                                            type="email"
                                            className="w-full p-2 border rounded-lg"
                                            value={formData.email}
                                            onChange={e => setFormData({ ...formData, email: e.target.value })}
                                            placeholder="For receipt"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium mb-1">Delivery Address</label>
                                        <textarea
                                            className="w-full p-2 border rounded-lg"
                                            rows={3}
                                            value={formData.address}
                                            onChange={e => setFormData({ ...formData, address: e.target.value })}
                                            placeholder="Full address with pincode"
                                        />
                                    </div>
                                </div>
                            )}
                        </div>

                        {cart.length > 0 && (
                            <div className="p-4 border-t bg-gray-50">
                                <div className="flex justify-between items-center mb-4 text-lg font-bold">
                                    <span>Total</span>
                                    <span>₹{cartTotal.toLocaleString()}</span>
                                </div>
                                {step === 'cart' ? (
                                    <button
                                        onClick={() => setStep('checkout')}
                                        className="w-full py-3 bg-black text-white rounded-lg font-bold hover:bg-gray-900 transition-colors"
                                        style={{ backgroundColor: theme.primaryColor }}
                                    >
                                        Proceed to Checkout
                                    </button>
                                ) : (
                                    <div className="flex flex-col gap-3">
                                        <div className="flex gap-2">
                                            <button
                                                onClick={() => setStep('cart')}
                                                className="flex-1 py-3 border border-gray-300 rounded-lg font-medium hover:bg-gray-100"
                                            >
                                                Back
                                            </button>
                                            <button
                                                onClick={handleCheckout}
                                                disabled={loading}
                                                className="flex-[2] py-3 bg-black text-white rounded-lg font-bold hover:bg-gray-900 transition-colors disabled:opacity-50"
                                                style={{ backgroundColor: theme.primaryColor }}
                                            >
                                                {loading ? 'Processing...' : 'Pay Online'}
                                            </button>
                                        </div>

                                        <div className="relative flex py-1 items-center">
                                            <div className="flex-grow border-t border-gray-300"></div>
                                            <span className="flex-shrink-0 mx-2 text-gray-400 text-xs uppercase">Or</span>
                                            <div className="flex-grow border-t border-gray-300"></div>
                                        </div>

                                        <button
                                            onClick={handleWhatsAppCheckout}
                                            className="w-full py-3 bg-[#25D366] text-white rounded-lg font-bold hover:bg-[#128C7E] transition-colors flex items-center justify-center gap-2"
                                        >
                                            <MessageCircle className="w-5 h-5" />
                                            Order on WhatsApp
                                        </button>
                                    </div>
                                )}
                                <p className="text-xs text-center text-gray-400 mt-2">
                                    Secure checkout via Razorpay/UPI
                                </p>
                            </div>
                        )}
                    </div>
                </div>
            )}
        </div>
    );
}
