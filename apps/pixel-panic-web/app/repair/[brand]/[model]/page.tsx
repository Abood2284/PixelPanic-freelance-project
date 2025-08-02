"use client";

import * as React from "react";
import { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import Footer from "@/components/shared/Footer";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { useCart } from "@/context/CartProvider";
import { useAuth } from "@/hooks/use-auth";
import {
  Smartphone,
  Battery,
  Volume2,
  Zap,
  Mic,
  Info,
  CheckCircle,
  Shield,
  Clock,
  Star,
  Wrench,
} from "lucide-react";

interface PricingOption {
  type: "OEM" | "Aftermarket";
  price: number;
  originalPrice: number;
  quality: string;
  warranty: string;
  description: string;
}

interface RepairService {
  id: string;
  name: string;
  icon: React.ReactNode;
  description: string;
  pricing: {
    OEM: PricingOption;
    Aftermarket: PricingOption;
  };
  estimatedRepairTime?: number;
}

// Function to get appropriate icon for service
const getServiceIcon = (serviceName: string): React.ReactNode => {
  const name = serviceName.toLowerCase();
  if (name.includes("screen") || name.includes("display"))
    return <Smartphone className="w-6 h-6" />;
  if (name.includes("battery")) return <Battery className="w-6 h-6" />;
  if (name.includes("speaker") || name.includes("earpiece"))
    return <Volume2 className="w-6 h-6" />;
  if (name.includes("charging") || name.includes("jack"))
    return <Zap className="w-6 h-6" />;
  if (name.includes("microphone") || name.includes("mic"))
    return <Mic className="w-6 h-6" />;
  if (name.includes("camera")) return <Smartphone className="w-6 h-6" />;
  if (name.includes("button")) return <Smartphone className="w-6 h-6" />;
  if (name.includes("panel") || name.includes("back"))
    return <Smartphone className="w-6 h-6" />;
  return <Wrench className="w-6 h-6" />;
};

// Function to fetch services from backend
const fetchServices = async (
  brand: string,
  model: string
): Promise<RepairService[]> => {
  try {
    const response = await fetch(
      `${process.env.NEXT_PUBLIC_API_BASE_URL}/api/services?brand=${encodeURIComponent(brand)}&model=${encodeURIComponent(model)}`,
      {
        cache: "no-store",
      }
    );

    if (!response.ok) {
      throw new Error(`Failed to fetch services: ${response.status}`);
    }

    const data = (await response.json()) as {
      services: RepairService[];
    };

    // Transform the backend data to match our frontend interface
    return data.services.map((service: RepairService) => ({
      id: service.id,
      name: service.name,
      icon: getServiceIcon(service.name),
      description: service.description,
      pricing: service.pricing,
      estimatedRepairTime: service.estimatedRepairTime,
    }));
  } catch (error) {
    console.error("Error fetching services:", error);
    throw error;
  }
};

export default function QuotePage({
  params,
}: {
  params: Promise<{ brand: string; model: string }>;
}) {
  const { addToCart } = useCart();
  const { isAuthenticated, requireAuth, isLoading: authLoading } = useAuth();
  const router = useRouter();
  const [selectedServices, setSelectedServices] = useState<
    Array<{ serviceId: string; type: "OEM" | "Aftermarket" }>
  >([]);
  const [repairServices, setRepairServices] = useState<RepairService[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const { brand, model } = React.use(params);
  const decodedModel = decodeURIComponent(model);

  // --- FIX: SPLIT INTO TWO useEffect HOOKS ---

  // HOOK 1: Handles fetching the repair services data.
  // This runs only when the brand or model changes.
  useEffect(() => {
    const loadServices = async () => {
      setIsLoading(true);
      setError(null);
      try {
        const services = await fetchServices(brand, decodedModel);
        setRepairServices(services);
      } catch (error) {
        console.error("Failed to load services:", error);
        setError("Failed to load repair services. Please try again.");
      } finally {
        setIsLoading(false);
      }
    };

    if (brand && decodedModel) {
      loadServices();
    }
  }, [brand, decodedModel]);

  // HOOK 2: Handles resuming the checkout flow after a successful login.
  // This runs only when isAuthenticated or repairServices state changes.
  // This does NOT cause a loop because it only reads state, it doesn't set its own dependencies.
  useEffect(() => {
    const pendingServicesRaw = sessionStorage.getItem("pendingServices");

    // Only proceed if services are loaded, the user is now authenticated, and there's a pending action.
    if (pendingServicesRaw && isAuthenticated && repairServices.length > 0) {
      const pendingServices = JSON.parse(
        pendingServicesRaw
      ) as typeof selectedServices;

      pendingServices.forEach((selection) => {
        const service = repairServices.find(
          (s) => s.id === selection.serviceId
        );
        if (service) {
          addToCart({
            id: service.id,
            name: service.name,
            brand: brand,
            model: decodedModel,
            selectedGrade: selection.type === "OEM" ? "oem" : "aftermarket",
            price: service.pricing[selection.type].price,
          });
        }
      });

      sessionStorage.removeItem("pendingServices");
      router.push("/checkout/service-mode");
    }
  }, [isAuthenticated, repairServices, brand, decodedModel, addToCart, router]);

  const toggleService = (serviceId: string, type: "OEM" | "Aftermarket") => {
    setSelectedServices((prev) => {
      const existingIndex = prev.findIndex((s) => s.serviceId === serviceId);
      if (existingIndex >= 0) {
        if (prev[existingIndex].type === type) {
          // Remove if same type is clicked
          return prev.filter((s) => s.serviceId !== serviceId);
        } else {
          // Update type if different type is clicked
          return prev.map((s, index) =>
            index === existingIndex ? { serviceId, type } : s
          );
        }
      } else {
        // Add new service
        return [...prev, { serviceId, type }];
      }
    });
  };

  const getTotalAmount = () => {
    return selectedServices.reduce((total, selection) => {
      const service = repairServices.find((s) => s.id === selection.serviceId);
      return total + (service?.pricing[selection.type]?.price || 0);
    }, 0);
  };

  const getOriginalTotal = () => {
    return selectedServices.reduce((total, selection) => {
      const service = repairServices.find((s) => s.id === selection.serviceId);
      return total + (service?.pricing[selection.type]?.originalPrice || 0);
    }, 0);
  };

  const handleAddToCart = () => {
    if (selectedServices.length === 0) return;

    sessionStorage.setItem("pendingServices", JSON.stringify(selectedServices));

    if (!requireAuth()) {
      return;
    }

    // This part runs if the user is already authenticated
    selectedServices.forEach((selection) => {
      const service = repairServices.find((s) => s.id === selection.serviceId);
      if (service) {
        addToCart({
          id: service.id,
          name: service.name,
          brand: brand,
          model: decodedModel,
          selectedGrade: selection.type === "OEM" ? "oem" : "aftermarket",
          price: service.pricing[selection.type].price,
        });
      }
    });

    sessionStorage.removeItem("pendingServices"); // Clean up if user was already logged in
    router.push("/checkout/service-mode");
  };

  const totalAmount = getTotalAmount();
  const originalTotal = getOriginalTotal();
  const savings = originalTotal - totalAmount;

  return (
    <TooltipProvider>
      <div className="flex min-h-screen flex-col">
        <main className="flex-1 bg-slate-50">
          <div className="container mx-auto px-4 py-8">
            <div className="grid lg:grid-cols-3 gap-8">
              {/* Device Info & Services */}
              <div className="lg:col-span-2 space-y-6">
                {/* Device Card */}
                <Card className="p-6">
                  <div className="flex items-center gap-4">
                    <div className="w-16 h-16 bg-slate-100 rounded-lg flex items-center justify-center">
                      <Smartphone className="w-8 h-8 text-pp-slate" />
                    </div>
                    <div>
                      <h2 className="text-lg font-semibold text-pp-navy">
                        {brand} {decodedModel}
                      </h2>
                    </div>
                  </div>
                </Card>

                {/* Services Grid */}
                <div>
                  <h3 className="text-lg font-semibold text-pp-navy mb-4">
                    Pick Your Repair Service
                  </h3>

                  {isLoading && (
                    <div className="text-center py-12">
                      <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-pp-orange mx-auto mb-4"></div>
                      <p className="text-pp-slate">
                        Loading repair services...
                      </p>
                    </div>
                  )}

                  {error && (
                    <div className="text-center py-12">
                      <p className="text-red-600 mb-4">{error}</p>
                      <Button
                        onClick={() => window.location.reload()}
                        className="bg-pp-orange hover:bg-pp-orange/90"
                      >
                        Try Again
                      </Button>
                    </div>
                  )}

                  {!isLoading && !error && (
                    <Accordion type="multiple" className="grid gap-4">
                      {repairServices.map((service) => {
                        const selectedService = selectedServices.find(
                          (s) => s.serviceId === service.id
                        );
                        const hasAftermarket =
                          service.pricing.Aftermarket.price > 0;

                        return (
                          <AccordionItem
                            key={service.id}
                            value={service.id}
                            className="border-none"
                          >
                            <Card className="p-4">
                              <AccordionTrigger className="hover:no-underline">
                                <div className="flex items-center gap-3 w-full">
                                  <div className="p-2 rounded-lg bg-slate-100">
                                    {service.icon}
                                  </div>
                                  <div className="flex-1 flex items-center justify-between">
                                    <div className="flex items-center gap-2">
                                      <h4 className="font-semibold text-pp-navy">
                                        {service.name}
                                      </h4>
                                      <Tooltip>
                                        <TooltipTrigger asChild>
                                          <button className="text-pp-slate hover:text-pp-orange transition-colors">
                                            <Info className="w-4 h-4" />
                                          </button>
                                        </TooltipTrigger>
                                        <TooltipContent
                                          side="top"
                                          className="max-w-xs"
                                        >
                                          <p className="text-sm">
                                            {service.description}
                                          </p>
                                        </TooltipContent>
                                      </Tooltip>
                                    </div>
                                    {selectedService && (
                                      <div className="flex items-center gap-2">
                                        <Badge
                                          variant={
                                            selectedService.type === "OEM"
                                              ? "success-light"
                                              : "info-light"
                                          }
                                          className="text-xs"
                                        >
                                          {selectedService.type}
                                        </Badge>
                                        <span className="text-sm font-semibold text-pp-navy">
                                          ₹
                                          {service.pricing[
                                            selectedService.type
                                          ].price.toLocaleString()}
                                        </span>
                                      </div>
                                    )}
                                  </div>
                                </div>
                              </AccordionTrigger>

                              <AccordionContent>
                                <div className="mt-4">
                                  {/* Pricing Options */}
                                  <div
                                    className={`grid gap-3 ${hasAftermarket ? "md:grid-cols-2" : ""}`}
                                  >
                                    {/* OEM Option */}
                                    <div
                                      className={`p-3 border-2 rounded-lg cursor-pointer transition-all ${
                                        selectedService?.type === "OEM"
                                          ? "border-green-500 bg-green-50"
                                          : "border-gray-200 hover:border-green-300"
                                      }`}
                                      onClick={() =>
                                        toggleService(service.id, "OEM")
                                      }
                                    >
                                      <div className="flex items-center justify-between mb-2">
                                        <div className="flex items-center gap-2">
                                          <Badge
                                            variant="success-light"
                                            className="text-xs"
                                          >
                                            OEM
                                          </Badge>
                                          <Tooltip>
                                            <TooltipTrigger>
                                              <Info className="w-3 h-3 text-pp-slate" />
                                            </TooltipTrigger>
                                            <TooltipContent>
                                              <div className="text-sm max-w-xs">
                                                <p className="font-medium">
                                                  Original Equipment
                                                  Manufacturer
                                                </p>
                                                <p>
                                                  {
                                                    service.pricing.OEM
                                                      .description
                                                  }
                                                </p>
                                                <p className="text-xs mt-1">
                                                  Warranty:{" "}
                                                  {service.pricing.OEM.warranty}
                                                </p>
                                              </div>
                                            </TooltipContent>
                                          </Tooltip>
                                        </div>
                                        {selectedService?.type === "OEM" && (
                                          <CheckCircle className="w-4 h-4 text-green-600" />
                                        )}
                                      </div>

                                      <div className="space-y-1">
                                        <div className="flex items-center gap-2">
                                          <span className="text-lg font-bold text-pp-navy">
                                            ₹
                                            {service.pricing.OEM.price.toLocaleString()}
                                          </span>
                                          <span className="text-sm text-pp-slate line-through">
                                            ₹
                                            {service.pricing.OEM.originalPrice.toLocaleString()}
                                          </span>
                                        </div>
                                        <p className="text-xs text-pp-slate">
                                          {service.pricing.OEM.quality} •{" "}
                                          {service.pricing.OEM.warranty}
                                        </p>
                                      </div>
                                    </div>

                                    {/* Aftermarket Option - Only show if price > 0 */}
                                    {hasAftermarket && (
                                      <div
                                        className={`p-3 border-2 rounded-lg cursor-pointer transition-all ${
                                          selectedService?.type ===
                                          "Aftermarket"
                                            ? "border-blue-500 bg-blue-50"
                                            : "border-gray-200 hover:border-blue-300"
                                        }`}
                                        onClick={() =>
                                          toggleService(
                                            service.id,
                                            "Aftermarket"
                                          )
                                        }
                                      >
                                        <div className="flex items-center justify-between mb-2">
                                          <div className="flex items-center gap-2">
                                            <Badge
                                              variant="info-light"
                                              className="text-xs"
                                            >
                                              Aftermarket
                                            </Badge>
                                            <Tooltip>
                                              <TooltipTrigger>
                                                <Info className="w-3 h-3 text-pp-slate" />
                                              </TooltipTrigger>
                                              <TooltipContent>
                                                <div className="text-sm max-w-xs">
                                                  <p className="font-medium">
                                                    Compatible Parts
                                                  </p>
                                                  <p>
                                                    {
                                                      service.pricing
                                                        .Aftermarket.description
                                                    }
                                                  </p>
                                                  <p className="text-xs mt-1">
                                                    Warranty:{" "}
                                                    {
                                                      service.pricing
                                                        .Aftermarket.warranty
                                                    }
                                                  </p>
                                                </div>
                                              </TooltipContent>
                                            </Tooltip>
                                          </div>
                                          {selectedService?.type ===
                                            "Aftermarket" && (
                                            <CheckCircle className="w-4 h-4 text-blue-600" />
                                          )}
                                        </div>

                                        <div className="space-y-1">
                                          <div className="flex items-center gap-2">
                                            <span className="text-lg font-bold text-pp-navy">
                                              ₹
                                              {service.pricing.Aftermarket.price.toLocaleString()}
                                            </span>
                                            <span className="text-sm text-pp-slate line-through">
                                              ₹
                                              {service.pricing.Aftermarket.originalPrice.toLocaleString()}
                                            </span>
                                          </div>
                                          <p className="text-xs text-pp-slate">
                                            {
                                              service.pricing.Aftermarket
                                                .quality
                                            }{" "}
                                            •{" "}
                                            {
                                              service.pricing.Aftermarket
                                                .warranty
                                            }
                                          </p>
                                        </div>
                                      </div>
                                    )}
                                  </div>
                                </div>
                              </AccordionContent>
                            </Card>
                          </AccordionItem>
                        );
                      })}
                    </Accordion>
                  )}
                </div>

                {/* Promo Banner */}
                <Card className="p-4 bg-gradient-to-r from-orange-300 to-orange-600 text-black/70">
                  <div className="flex items-center justify-between">
                    <div>
                      <span className="text-lg font-bold">
                        Up to 50% OFF on Mobile Repair
                      </span>
                      <div className="flex items-center gap-2 mt-1">
                        <Badge
                          variant="secondary"
                          className="bg-white text-orange-600"
                        >
                          Use Code: PIXEL50
                        </Badge>
                        <span className="text-sm">*Min. Order Value ₹1000</span>
                      </div>
                    </div>
                  </div>
                </Card>
              </div>

              {/* Price Summary Sidebar */}
              <div className="lg:col-span-1">
                <Card className="p-6 sticky top-8">
                  <h3 className="text-lg font-semibold text-pp-navy mb-4">
                    Price Summary
                  </h3>

                  {selectedServices.length === 0 ? (
                    <div className="text-center py-8">
                      <p className="text-pp-slate">No Service Selected</p>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      {selectedServices.map((selection) => {
                        const service = repairServices.find(
                          (s) => s.id === selection.serviceId
                        );
                        const pricing = service?.pricing[selection.type];
                        if (!service || !pricing) return null;

                        return (
                          <div
                            key={`${selection.serviceId}-${selection.type}`}
                            className="flex justify-between items-center"
                          >
                            <div>
                              <span className="text-pp-navy">
                                {service.name}
                              </span>
                              <Badge
                                variant={
                                  selection.type === "OEM"
                                    ? "success-light"
                                    : "info-light"
                                }
                                className="ml-2 text-xs"
                              >
                                {selection.type}
                              </Badge>
                            </div>
                            <span className="font-semibold">
                              ₹{pricing.price.toLocaleString()}
                            </span>
                          </div>
                        );
                      })}

                      <div className="border-t pt-4 space-y-2">
                        <div className="flex justify-between text-pp-slate">
                          <span>Original Price</span>
                          <span className="line-through">
                            ₹{originalTotal.toLocaleString()}
                          </span>
                        </div>
                        <div className="flex justify-between text-lg font-bold text-pp-navy">
                          <span>Total</span>
                          <span>₹{totalAmount.toLocaleString()}</span>
                        </div>
                        <div className="text-sm text-green-600">
                          You save ₹{savings.toLocaleString()}!
                        </div>
                      </div>
                    </div>
                  )}

                  <div className="mt-6 space-y-3">
                    <Button
                      className="w-full bg-orange-300 hover:bg-orange-500 text-black hover:text-white font-semibold"
                      size="lg"
                      onClick={handleAddToCart}
                      disabled={selectedServices.length === 0 || authLoading}
                    >
                      {authLoading ? "Loading..." : "Book Now →"}
                    </Button>
                  </div>

                  {/* Stats */}
                  {/* <div className="grid grid-cols-2 gap-4 mt-6 pt-6 border-t">
                    <div className="text-center">
                      <div className="text-2xl font-bold text-pp-navy">
                        46K+
                      </div>
                      <div className="text-sm text-pp-slate">
                        Device Repaired
                      </div>
                    </div>
                    <div className="text-center">
                      <div className="text-2xl font-bold text-pp-navy">
                        4.8★
                      </div>
                      <div className="text-sm text-pp-slate">
                        Rated Products
                      </div>
                    </div>
                  </div> */}

                  {/* Trust Indicators */}
                  <div className="mt-6 pt-6 border-t space-y-3">
                    <div className="flex items-center gap-2 text-sm text-pp-slate">
                      <Shield className="w-4 h-4" />
                      <span>12-month warranty</span>
                    </div>
                    <div className="flex items-center gap-2 text-sm text-pp-slate">
                      <Clock className="w-4 h-4" />
                      <span>30-minute repair</span>
                    </div>
                    <div className="flex items-center gap-2 text-sm text-pp-slate">
                      <Star className="w-4 h-4" />
                      <span>Expert technicians</span>
                    </div>
                  </div>
                </Card>
              </div>
            </div>
          </div>
        </main>
        <Footer />
      </div>
    </TooltipProvider>
  );
}
