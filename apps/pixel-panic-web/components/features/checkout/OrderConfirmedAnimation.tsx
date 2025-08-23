"use client";

import Lottie from "lottie-react";
import orderConfirmedAnimation from "../../../public/lottie/order-confirmed.json";

export function OrderConfirmedAnimation() {
  return (
    <div className="mb-8">
      <Lottie
        animationData={orderConfirmedAnimation}
        loop={false}
        className="w-64 h-64 mx-auto"
      />
    </div>
  );
}
