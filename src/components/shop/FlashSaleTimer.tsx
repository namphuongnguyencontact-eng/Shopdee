"use client";

import React, { useState, useEffect } from "react";
import { Zap } from "lucide-react";

export default function FlashSaleTimer() {
  const [timeLeft, setTimeLeft] = useState({
    hours: 8,
    minutes: 42,
    seconds: 19,
  });

  useEffect(() => {
    const timer = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev.seconds > 0) {
          return { ...prev, seconds: prev.seconds - 1 };
        } else if (prev.minutes > 0) {
          return { ...prev, minutes: 59, seconds: 59 };
        } else if (prev.hours > 0) {
          return { hours: prev.hours - 1, minutes: 59, seconds: 59 };
        } else {
          return { hours: 12, minutes: 0, seconds: 0 };
        }
      });
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  const format2Digits = (n: number) => n.toString().padStart(2, "0");

  return (
    <div className="flex items-center gap-2.5">
      <div className="flex items-center gap-1.5 font-black text-base sm:text-lg text-red-600 tracking-tight uppercase">
        <Zap className="w-5 h-5 fill-red-600 animate-bounce" />
        <span>FLASH SALE</span>
      </div>
      <div className="flex items-center gap-1 text-slate-900 font-bold text-xs">
        <span className="min-w-[24px] h-6 px-1 rounded-xs bg-slate-900 text-white flex items-center justify-center font-mono font-bold text-xs shadow-2xs">
          {format2Digits(timeLeft.hours)}
        </span>
        <span className="font-mono text-slate-800 font-bold">:</span>
        <span className="min-w-[24px] h-6 px-1 rounded-xs bg-slate-900 text-white flex items-center justify-center font-mono font-bold text-xs shadow-2xs">
          {format2Digits(timeLeft.minutes)}
        </span>
        <span className="font-mono text-slate-800 font-bold">:</span>
        <span className="min-w-[24px] h-6 px-1 rounded-xs bg-red-600 text-white flex items-center justify-center font-mono font-bold text-xs shadow-2xs">
          {format2Digits(timeLeft.seconds)}
        </span>
      </div>
    </div>
  );
}
