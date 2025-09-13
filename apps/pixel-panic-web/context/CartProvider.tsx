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
  // Unified current slot for the active mode (back-compat for existing consumers)
  timeSlot: string | null;
  // Mode-specific time slots so each mode can retain its own selection
  doorstepTimeSlot: string | null;
  carryInTimeSlot: string | null;
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
  setTimeSlotForMode: (
    mode: Exclude<ServiceMode, null>,
    slot: string | null
  ) => void;
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
    case "SET_SERVICE_MODE": {
      const nextMode: ServiceMode = action.payload;
      // When switching modes, keep per-mode selections and project the active one into timeSlot
      const nextTimeSlot =
        nextMode === "Doorstep"
          ? state.doorstepTimeSlot
          : nextMode === "CarryIn"
            ? state.carryInTimeSlot
            : null;
      // Clear the opposite mode's slot so only the active mode has a selection
      if (nextMode === "Doorstep") {
        return {
          ...state,
          serviceMode: nextMode,
          timeSlot: nextTimeSlot,
          carryInTimeSlot: null,
        };
      }
      if (nextMode === "CarryIn") {
        return {
          ...state,
          serviceMode: nextMode,
          timeSlot: nextTimeSlot,
          doorstepTimeSlot: null,
        };
      }
      return { ...state, serviceMode: nextMode, timeSlot: nextTimeSlot };
    }
    case "SET_TIME_SLOT": {
      // Back-compat: set timeSlot for the active mode, and write to the corresponding per-mode field
      const activeMode = state.serviceMode;
      if (activeMode === "Doorstep") {
        return {
          ...state,
          timeSlot: action.payload,
          doorstepTimeSlot: action.payload,
        };
      }
      if (activeMode === "CarryIn") {
        return {
          ...state,
          timeSlot: action.payload,
          carryInTimeSlot: action.payload,
        };
      }
      return { ...state, timeSlot: action.payload };
    }
    case "SET_TIME_SLOT_FOR_MODE": {
      const { mode, slot } = action.payload as {
        mode: Exclude<ServiceMode, null>;
        slot: string | null;
      };
      if (mode === "Doorstep") {
        return {
          ...state,
          doorstepTimeSlot: slot,
          // If this mode is active, also project to timeSlot for existing consumers
          timeSlot: state.serviceMode === "Doorstep" ? slot : state.timeSlot,
        };
      }
      return {
        ...state,
        carryInTimeSlot: slot,
        timeSlot: state.serviceMode === "CarryIn" ? slot : state.timeSlot,
      };
    }
    case "SET_APPLIED_COUPON":
      return { ...state, appliedCoupon: action.payload };
    case "CLEAR_CART":
      return {
        ...state,
        items: [],
        serviceMode: null,
        timeSlot: null,
        doorstepTimeSlot: null,
        carryInTimeSlot: null,
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
    doorstepTimeSlot: null,
    carryInTimeSlot: null,
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

  const setTimeSlotForMode = useCallback(
    (mode: Exclude<ServiceMode, null>, slot: string | null) => {
      dispatch({ type: "SET_TIME_SLOT_FOR_MODE", payload: { mode, slot } });
    },
    []
  );

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
        setTimeSlotForMode,
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
