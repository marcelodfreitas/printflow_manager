"use client";

import { useState } from "react";

export function BackgroundEffects() {
  const [position, setPosition] = useState({ x: 50, y: 50 });

  return (
    <div
      className="pointer-events-none absolute inset-0 overflow-hidden"
      onMouseMove={(event) => {
        const rect = event.currentTarget.getBoundingClientRect();
        setPosition({
          x: ((event.clientX - rect.left) / rect.width) * 100,
          y: ((event.clientY - rect.top) / rect.height) * 100,
        });
      }}
    >
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_12%_16%,rgba(253,100,1,.24),transparent_28%),radial-gradient(circle_at_82%_18%,rgba(34,100,214,.24),transparent_30%),linear-gradient(135deg,#050914_0%,#071124_48%,#160c05_100%)]" />
      <div
        className="absolute h-[34rem] w-[34rem] -translate-x-1/2 -translate-y-1/2 rounded-full bg-[#fd6401]/20 blur-[110px] transition-transform duration-500"
        style={{ left: `${position.x}%`, top: `${position.y}%` }}
      />
      <div className="absolute -left-32 top-1/4 h-96 w-96 rounded-full bg-blue-500/10 blur-[100px]" />
      <div className="absolute -right-20 bottom-6 h-[32rem] w-[32rem] rounded-full bg-[#fd6401]/14 blur-[120px]" />
      <div className="absolute inset-0 opacity-35 [background-image:linear-gradient(rgba(255,255,255,.06)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,.06)_1px,transparent_1px)] [background-size:42px_42px]" />
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,transparent_0%,rgba(0,0,0,.2)_58%,rgba(0,0,0,.68)_100%)]" />
      <div className="login-noise absolute inset-0 opacity-[.08]" />
    </div>
  );
}
