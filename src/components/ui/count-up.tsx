"use client";

import { useEffect, useState, useRef } from "react";

interface CountUpProps {
  end: number;
  start?: number;
  duration?: number;
  decimals?: number;
  prefix?: string;
  suffix?: string;
  className?: string;
  separator?: string;
  decimal?: string;
}

export function CountUp({
  end,
  start = 0,
  duration = 2000,
  decimals = 0,
  prefix = "",
  suffix = "",
  className,
  separator = ",",
  decimal = ".",
}: CountUpProps) {
  const [current, setCurrent] = useState(start);
  const startTimeRef = useRef<number | null>(null);
  const frameRef = useRef<number>(0);

  useEffect(() => {
    const animate = (timestamp: number) => {
      if (!startTimeRef.current) startTimeRef.current = timestamp;
      const progress = timestamp - startTimeRef.current;
      const percentage = Math.min(progress / duration, 1);

      // Easing function (easeOutExpo)
      const ease = percentage === 1 ? 1 : 1 - Math.pow(2, -10 * percentage);

      const nextValue = start + (end - start) * ease;
      setCurrent(nextValue);

      if (percentage < 1) {
        frameRef.current = requestAnimationFrame(animate);
      }
    };

    frameRef.current = requestAnimationFrame(animate);

    return () => {
      if (frameRef.current) cancelAnimationFrame(frameRef.current);
    };
  }, [end, start, duration]);

  const formattedValue = current.toFixed(decimals).toString();
  const [intPart, decPart] = formattedValue.split(".");

  const formattedInt = intPart.replace(/\B(?=(\d{3})+(?!\d))/g, separator);

  return (
    <span className={className}>
      {prefix}
      {formattedInt}
      {decimals > 0 && decimal && decPart ? decimal + decPart : ""}
      {suffix}
    </span>
  );
}
