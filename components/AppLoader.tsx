import React, { useLayoutEffect } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { Moon, Sun } from "lucide-react";
export function AppLoader({
  active,
  fa,
  light,
  reduced,
  onLanguage,
  onTheme,
}: {
  active: boolean;
  fa: boolean;
  light: boolean;
  reduced: boolean;
  onLanguage: () => void;
  onTheme: () => void;
}) {
  useLayoutEffect(() => {
    document.documentElement.classList.remove("js-pending");
  }, []);
  return (
    <AnimatePresence>
      {active && (
        <motion.div
          key="boot"
          className={`app-loader ${reduced ? "loader-still" : ""}`}
          initial={false}
          exit={{ opacity: 0 }}
          transition={{ duration: reduced ? 0 : 0.3, ease: [0.22, 1, 0.36, 1] }}
          dir={fa ? "rtl" : "ltr"}
        >
          <div className="loader-toolbar">
            <span>PIMX PASS</span>
            <div>
              <button
                onClick={onLanguage}
                aria-label={fa ? "Switch to English" : "تغییر زبان به فارسی"}
              >
                {fa ? "EN" : "فا"}
              </button>
              <button
                onClick={onTheme}
                aria-label={
                  light
                    ? fa
                      ? "تم تاریک"
                      : "Dark theme"
                    : fa
                      ? "تم روشن"
                      : "Light theme"
                }
              >
                {light ? <Moon size={19} /> : <Sun size={19} />}
              </button>
            </div>
          </div>
          <div className="loader-center" role="status" aria-live="polite">
            <div className="loader-object" aria-hidden="true">
              <div className="loader-orbit orbit-a" />
              <div className="loader-orbit orbit-b" />
              <div className="loader-core">
                <i />
                <i />
                <i />
              </div>
              <div className="loader-satellite" />
            </div>
            <h2>{fa ? "یک لحظه، تا شروع." : "A moment before we begin."}</h2>
            <p>
              {fa
                ? "داریم ابزارها را آماده می‌کنیم."
                : "Getting your tools ready."}
            </p>
            <span className="loader-pulse" aria-hidden="true">
              <i />
              <i />
              <i />
            </span>
          </div>
          <div className="loader-bottom">
            <span>
              {fa ? "آزمایشگاه شخصی DNS" : "Your personal DNS laboratory"}
            </span>
            <span>FA / EN</span>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
