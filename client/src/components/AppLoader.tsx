import { useEffect, useState } from "react";
import type { ReactNode } from "react";
import { useQuery } from "@tanstack/react-query";
import waitImage from "../assets/wait_2.jpg";
import bgImage from "../assets/green1.jpg";

/* -------------------- helpers -------------------- */

function formatMs(ms: number) {
  const totalSeconds = Math.ceil(ms / 1000);
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = totalSeconds % 60;
  return `${minutes}:${seconds.toString().padStart(2, "0")}`;
}

async function checkBackendReady(): Promise<{ status: string }> {
  const wURL = `${import.meta.env.VITE_BACKEND_URL}/test`;
  const res = await fetch(wURL, {
    method: "GET",
    headers: { "Content-Type": "application/json" },
  });
  if (!res.ok) throw new Error("Backend not ready");
  return res.json();
}

/* -------------------- component -------------------- */

interface AppLoaderProps {
  children: ReactNode;
}

export default function AppLoader({ children }: AppLoaderProps) {
  const maxWaitMs = 12_000; // 90 seconds
  const retryDelay = 2000; // 2 seconds
  
  const [remainingMs, setRemainingMs] = useState(maxWaitMs);

  /* Countdown timer */
  useEffect(() => {
    const start = Date.now();

    const interval = setInterval(() => {
      const elapsed = Date.now() - start;
      const remaining = Math.max(maxWaitMs - elapsed, 0);
      setRemainingMs(remaining);

      if (remaining === 0) {
        clearInterval(interval);
      }
    }, 1000);

    return () => clearInterval(interval);
  }, []);

  /* React Query backend readiness check */
  const { data, error, isLoading } = useQuery<{ status: string }>({
    queryKey: ["backendReady"],
    queryFn: checkBackendReady,
    retry: (failureCount: number) => failureCount * retryDelay < maxWaitMs,
    retryDelay,
  });

  /* -------------------- layout helpers -------------------- */

  const Background = ({ children }: { children: ReactNode }) => (
    <div
      className="flex h-screen w-screen items-center justify-center bg-cover bg-center"
      style={{ backgroundImage: `url(${bgImage})` }}
    >
      {children}
    </div>
  );

  /* -------------------- loading screen -------------------- */

  if (isLoading && !data) {
    const progress = remainingMs / maxWaitMs;
    const degrees = Math.round(progress * 360);
    const isEnding = remainingMs < 10_000;

    return (
      <Background>
        <div className="bg-white rounded-2xl shadow-xl p-6 m-6 flex flex-col md:flex-row items-center gap-8 min-h-[260px]">
          
          {/* Text */}
          <div className="flex flex-col items-center md:items-start text-center md:text-left space-y-2">
            <div className="text-2xl font-bold text-gray-800">
              Welcome to my Personal Website
            </div>
            <div className="text-gray-600 font-medium">
              Starting up…
            </div>

            {/* Circular countdown */}
            <div className="mt-4 flex flex-col items-center md:items-start">
              <div className="relative w-28 h-28">
                {/* Progress ring */}
                <div
                  className="absolute inset-0 rounded-full"
                  style={{
                    background: `conic-gradient(
                      ${isEnding ? "#dc2626" : "#16a34a"} ${degrees}deg,
                      #e5e7eb 0deg
                    )`,
                  }}
                />

                {/* Inner circle */}
                <div className="absolute inset-3 rounded-full bg-white flex items-center justify-center shadow-inner">
                  <span
                    className={`text-xl font-mono font-semibold ${
                      isEnding ? "text-red-600" : "text-gray-800"
                    }`}
                  >
                    {formatMs(remainingMs)}
                  </span>
                </div>
              </div>

              <div className="text-sm text-gray-500 mt-2">
                Estimated wait
              </div>
            </div>
          </div>

          {/* Image */}
          <img
            src={waitImage}
            alt="Loading…"
            className="max-w-[280px] md:max-w-[360px] object-contain"
          />
        </div>
      </Background>
    );
  }

  /* -------------------- error screen -------------------- */

if (error && !isLoading && !data) {
    return (
      <Background>
        <div className="bg-white rounded-2xl shadow-xl p-10 m-6 flex flex-col items-center justify-center space-y-6 min-h-[350px] max-w-lg">
          <div className="text-red-600 font-semibold text-lg text-center">
            Backend not available.
            <br />
            Please try again later.
          </div>
        </div>
      </Background>
    );
  }

  /* -------------------- app ready -------------------- */

  return <>{children}</>;
}
