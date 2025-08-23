// apps/pixel-panic-web/context/CartProvider.tsx
"use client";

import * as React from "react";
import { createContext, useContext, useReducer, useCallback } from "react";

// --- Type Definitions ---
type ServiceMode = "Doorstep" | "CarryIn" | null;

// Define types for clarity
interface CartItem {
  id: string;
  name: string;
  selectedGrade: "oem" | "aftermarket";
  price: number;
  brand: string;
  model: string;
  cartId: string;
}

interface AppliedCoupon {
  code: string;
  discount: number;
  couponId?: number;
}

interface CartState {
  items: CartItem[];
  serviceMode: ServiceMode;
  timeSlot: string | null;
  appliedCoupon: AppliedCoupon | null;
}

interface CartContextType extends CartState {
  addToCart: (item: Omit<CartItem, "cartId">) => void;
  removeFromCart: (cartId: string) => void;
  updateGrade: (
    cartId: string,
    newGrade: "oem" | "aftermarket",
    newPrice: number
  ) => void;
  total: number;
  discountedTotal: number;
  setServiceMode: (mode: ServiceMode) => void;
  setTimeSlot: (slot: string | null) => void;
  setAppliedCoupon: (coupon: AppliedCoupon | null) => void;
  clearCart: () => void;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

// Reducer to manage complex state logic
function cartReducer(state: CartState, action: any): CartState {
  switch (action.type) {
    case "ADD_TO_CART":
      return { ...state, items: [...state.items, action.payload] };
    case "REMOVE_FROM_CART":
      return {
        ...state,
        items: state.items.filter(
          (item) => item.cartId !== action.payload.cartId
        ),
      };
    case "UPDATE_GRADE":
      return {
        ...state,
        items: state.items.map((item) =>
          item.cartId === action.payload.cartId
            ? {
                ...item,
                selectedGrade: action.payload.newGrade,
                price: action.payload.newPrice,
              }
            : item
        ),
      };
    case "SET_SERVICE_MODE":
      return { ...state, serviceMode: action.payload, timeSlot: null };
    case "SET_TIME_SLOT":
      return { ...state, timeSlot: action.payload };
    case "SET_APPLIED_COUPON":
      return { ...state, appliedCoupon: action.payload };
    case "CLEAR_CART":
      return {
        ...state,
        items: [],
        serviceMode: null,
        timeSlot: null,
        appliedCoupon: null,
      };
    default:
      return state;
  }
}

export function CartProvider({ children }: { children: React.ReactNode }) {
  const [state, dispatch] = useReducer(cartReducer, {
    items: [],
    serviceMode: null,
    timeSlot: null,
    appliedCoupon: null,
  });

  const addToCart = useCallback((item: Omit<CartItem, "cartId">) => {
    dispatch({
      type: "ADD_TO_CART",
      payload: { ...item, cartId: `${item.id}-${Date.now()}` },
    });
  }, []);

  const removeFromCart = useCallback((cartId: string) => {
    dispatch({ type: "REMOVE_FROM_CART", payload: { cartId } });
  }, []);

  const updateGrade = useCallback(
    (cartId: string, newGrade: "oem" | "aftermarket", newPrice: number) => {
      dispatch({
        type: "UPDATE_GRADE",
        payload: { cartId, newGrade, newPrice },
      });
    },
    []
  );

  const setServiceMode = useCallback((mode: ServiceMode) => {
    dispatch({ type: "SET_SERVICE_MODE", payload: mode });
  }, []);

  const setTimeSlot = useCallback((slot: string | null) => {
    dispatch({ type: "SET_TIME_SLOT", payload: slot });
  }, []);

  const setAppliedCoupon = useCallback((coupon: AppliedCoupon | null) => {
    dispatch({ type: "SET_APPLIED_COUPON", payload: coupon });
  }, []);

  const clearCart = useCallback(() => {
    dispatch({ type: "CLEAR_CART" });
  }, []);

  const total = state.items.reduce((sum, item) => sum + item.price, 0);
  const discountedTotal = state.appliedCoupon
    ? Math.max(0, total - state.appliedCoupon.discount)
    : total;

  return (
    <CartContext.Provider
      value={{
        ...state,
        addToCart,
        removeFromCart,
        updateGrade,
        total,
        discountedTotal,
        setServiceMode,
        setTimeSlot,
        setAppliedCoupon,
        clearCart,
      }}
    >
      {children}
    </CartContext.Provider>
  );
}

// Custom hook for easy access to the context
export function useCart() {
  const context = useContext(CartContext);
  if (context === undefined) {
    throw new Error("useCart must be used within a CartProvider");
  }
  return context;
}
