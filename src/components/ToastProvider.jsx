import { createContext, useContext, useState, useCallback } from "react";

const ToastContext = createContext();
let idCounter = 1;

export function ToastProvider({ children }) {
  const [toasts, setToasts] = useState([]);

  const push = useCallback((msg, opts = {}) => {
    const id = idCounter++;
    setToasts((t) => [...t, { id, msg, opts }]);
    if (!opts.stay)
      setTimeout(
        () => setToasts((t) => t.filter((x) => x.id !== id)),
        opts.duration || 3500
      );
  }, []);

  const remove = useCallback(
    (id) => setToasts((t) => t.filter((x) => x.id !== id)),
    []
  );

  return (
    <ToastContext.Provider value={{ push, remove }}>
      <div className="toast-container" aria-live="polite">
        {toasts.map((t) => (
          <div
            key={t.id}
            className="bg-white/90 dark:bg-gray-900/90 
              border border-indigo-200 dark:border-indigo-700 
              shadow-md rounded-xl px-4 py-3 animate-pop 
              text-gray-800 dark:text-gray-200"
          >
            <div className="flex items-center gap-3">
              {/* Aksen bulat */}
              <div className="w-3 h-3 bg-indigo-500 rounded-full" />
              <div className="flex-1 text-sm">{t.msg}</div>
              <button
                type="button"
                onClick={() => remove(t.id)}
                className="text-gray-500 dark:text-gray-400 text-sm hover:text-indigo-500 dark:hover:text-indigo-300"
              >
                ✕
              </button>
            </div>
          </div>
        ))}
      </div>
      {children}
    </ToastContext.Provider>
  );
}

export function useToast() {
  const ctx = useContext(ToastContext);
  if (!ctx) throw new Error("useToast must be inside ToastProvider");
  return ctx;
}
