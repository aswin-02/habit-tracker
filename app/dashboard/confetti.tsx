"use client";

import { useEffect, useState } from "react";

interface Confetto {
  id: number;
  left: number;
  delay: number;
  duration: number;
  size: number;
  color: string;
}

export default function Confetti({ trigger }: { trigger: boolean }) {
  const [confetti, setConfetti] = useState<Confetto[]>([]);

  useEffect(() => {
    if (!trigger) return;

    // Create confetti pieces from bottom left and bottom right
    const newConfetti: Confetto[] = [];
    const colors = [
      "#3b82f6", // blue
      "#10b981", // green
      "#f59e0b", // amber
      "#ec4899", // pink
      "#8b5cf6", // purple
      "#06b6d4", // cyan
    ];

    // Bottom left confetti
    for (let i = 0; i < 30; i++) {
      newConfetti.push({
        id: i,
        left: Math.random() * 20, // 0-20% from left
        delay: Math.random() * 0.3,
        duration: 2.5 + Math.random() * 0.5,
        size: 6 + Math.random() * 8,
        color: colors[Math.floor(Math.random() * colors.length)],
      });
    }

    // Bottom right confetti
    for (let i = 30; i < 60; i++) {
      newConfetti.push({
        id: i,
        left: 80 + Math.random() * 20, // 80-100% from left
        delay: Math.random() * 0.3,
        duration: 2.5 + Math.random() * 0.5,
        size: 6 + Math.random() * 8,
        color: colors[Math.floor(Math.random() * colors.length)],
      });
    }

    setConfetti(newConfetti);

    // Clear confetti after animation completes
    const timer = setTimeout(() => {
      setConfetti([]);
    }, 3500);

    return () => clearTimeout(timer);
  }, [trigger]);

  return (
    <div className="fixed inset-0 pointer-events-none overflow-hidden">
      {confetti.map((item) => (
        <div
          key={item.id}
          className="absolute animate-confetti"
          style={{
            left: `${item.left}%`,
            bottom: "-10px",
            width: `${item.size}px`,
            height: `${item.size}px`,
            backgroundColor: item.color,
            borderRadius: "50%",
            animation: `confetti-fall ${item.duration}s linear forwards`,
            animationDelay: `${item.delay}s`,
            opacity: 0.8,
          }}
        />
      ))}

      <style>{`
        @keyframes confetti-fall {
          to {
            transform: translateY(-100vh) rotateZ(360deg);
            opacity: 0;
          }
        }
      `}</style>
    </div>
  );
}
