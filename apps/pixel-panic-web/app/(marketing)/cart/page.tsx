// apps/pixel-panic-web/app/cart/page.tsx
"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useCart } from "@/context/CartProvider";
import Footer from "@/components/shared/Footer";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ArrowLeft } from "lucide-react";
import Link from "next/link";

export default function CartPage() {
  const { items, removeFromCart, total } = useCart();
  const router = useRouter();

  const subtotal = total;
  const gst = subtotal * 0.18; // Assuming 18% GST
  const finalTotal = subtotal + gst;

  const handlePlaceOrder = () => {
    // Navigate to checkout flow
    router.push("/checkout");
  };

  if (items.length === 0) {
    return (
      <div className="flex min-h-screen flex-col bg-slate-50">
        <main className="flex-1 py-12 lg:py-16">
          <div className="container text-center">
            <h1 className="text-center font-display text-4xl font-bold text-pp-navy mb-4">
              Your Cart is Empty
            </h1>
            <p className="text-pp-slate mb-8">
              Add some repair services to get started!
            </p>
            <Button asChild>
              <Link href="/">Browse Services</Link>
            </Button>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  return (
    <div className="flex min-h-screen flex-col bg-slate-50">
      {/* Header */}
      <div className="bg-white border-b">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center gap-4">
            <Button variant="ghost" size="sm" asChild className="p-2">
              <Link href="/">
                <ArrowLeft className="w-5 h-5" />
              </Link>
            </Button>
            <div>
              <h1 className="text-xl font-semibold text-pp-navy">Your Cart</h1>
              <p className="text-sm text-pp-slate">
                Review your selected services
              </p>
            </div>
          </div>
        </div>
      </div>

      <main className="flex-1 py-8">
        <div className="container mx-auto px-4">
          <div className="grid lg:grid-cols-3 gap-8">
            {/* Cart Items */}
            <div className="lg:col-span-2 space-y-6">
              <Card className="p-6">
                <h2 className="text-lg font-semibold text-pp-navy mb-4">
                  Selected Services
                </h2>
                <div className="space-y-4">
                  {items.map((item) => (
                    <div
                      key={item.cartId}
                      className="flex justify-between items-center p-4 border rounded-lg"
                    >
                      <div className="flex-1">
                        <span className="text-pp-navy font-medium">
                          {item.name}
                        </span>
                        <div className="text-sm text-pp-slate">
                          Grade:{" "}
                          <Badge variant="secondary" className="text-xs">
                            {item.selectedGrade}
                          </Badge>
                        </div>
                      </div>
                      <div className="text-right">
                        <span className="font-semibold">
                          ₹{item.price.toLocaleString()}
                        </span>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="text-red-500 hover:bg-red-50 h-7 w-7 p-0 ml-2"
                          aria-label="Remove from cart"
                          onClick={() => removeFromCart(item.cartId)}
                        >
                          <svg
                            xmlns="http://www.w3.org/2000/svg"
                            className="h-4 w-4"
                            fill="none"
                            viewBox="0 0 24 24"
                            stroke="currentColor"
                            strokeWidth={2}
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6M9 7V4a1 1 0 011-1h4a1 1 0 011 1v3m5 0H4"
                            />
                          </svg>
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              </Card>
            </div>

            {/* Order Summary Sidebar */}
            <div className="lg:col-span-1">
              <Card className="p-6 sticky top-8">
                <h3 className="text-lg font-semibold text-pp-navy mb-4">
                  Order Summary
                </h3>

                {/* Services */}
                <div className="space-y-3 mb-6">
                  {items.map((item) => (
                    <div
                      key={item.cartId}
                      className="flex justify-between items-center"
                    >
                      <div className="flex-1">
                        <span className="text-pp-navy font-medium">
                          {item.name}
                        </span>
                        <div className="text-sm text-pp-slate">
                          Grade:{" "}
                          <Badge variant="secondary" className="text-xs">
                            {item.selectedGrade}
                          </Badge>
                        </div>
                      </div>
                      <div className="text-right">
                        <span className="font-semibold">
                          ₹{item.price.toLocaleString()}
                        </span>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="text-red-500 hover:bg-red-50 h-7 w-7 p-0"
                          aria-label="Remove from cart"
                          onClick={() => removeFromCart(item.cartId)}
                        >
                          <svg
                            xmlns="http://www.w3.org/2000/svg"
                            className="h-4 w-4"
                            fill="none"
                            viewBox="0 0 24 24"
                            stroke="currentColor"
                            strokeWidth={2}
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6M9 7V4a1 1 0 011-1h4a1 1 0 011 1v3m5 0H4"
                            />
                          </svg>
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Pricing */}
                <div className="border-t pt-4 space-y-2 mb-6">
                  <div className="flex justify-between text-pp-slate">
                    <span>Subtotal</span>
                    <span>₹{subtotal.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between text-pp-slate">
                    <span>GST (18%)</span>
                    <span>₹{gst.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between text-lg font-bold text-pp-navy">
                    <span>Total</span>
                    <span>₹{finalTotal.toLocaleString()}</span>
                  </div>
                </div>

                {/* Service Features */}
                <div className="space-y-3 mb-6 pt-4 border-t">
                  <div className="flex items-center gap-2 text-sm">
                    <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                    <span className="text-pp-slate">
                      Free pickup & delivery
                    </span>
                  </div>
                  <div className="flex items-center gap-2 text-sm">
                    <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                    <span className="text-pp-slate">90-day warranty</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm">
                    <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                    <span className="text-pp-slate">Genuine parts only</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm">
                    <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                    <span className="text-pp-slate">Expert technicians</span>
                  </div>
                </div>

                <Button
                  className="w-full bg-pp-lime hover:bg-pp-lime/90 text-pp-navy font-semibold"
                  size="lg"
                  onClick={handlePlaceOrder}
                  disabled={items.length === 0}
                >
                  Proceed to Checkout
                </Button>

                <p className="text-xs text-pp-slate mt-3 text-center">
                  By placing this order, you agree to our Terms & Conditions
                </p>
              </Card>
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
}
