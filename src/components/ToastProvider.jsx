import React, { createContext, useContext, useState, useCallback } from 'react';

const ToastContext = createContext();
let idCounter = 1;

export function ToastProvider({ children }){
  const [toasts, setToasts] = useState([]);
  const push = useCallback((msg, opts={})=>{
    const id = idCounter++;
    setToasts((t)=>[...t, { id, msg, opts }]);
    if (!opts.stay) setTimeout(()=> setToasts((t)=> t.filter(x=> x.id!==id)), opts.duration||3500);
  },[]);
  const remove = useCallback((id)=> setToasts((t)=> t.filter(x=> x.id!==id)), []);
  return (
    <ToastContext.Provider value={{ push, remove }}>
      <div className="toast-container" aria-live="polite">
        {toasts.map(t=> (
          <div key={t.id} className="bg-white/90 shadow-md rounded-xl px-4 py-3 animate-pop">
            <div className="flex items-center gap-3">
              <div className="w-3 h-3 bg-blue-500 rounded-full" />
              <div className="flex-1 text-sm">{t.msg}</div>
              <button onClick={()=> remove(t.id)} className="text-gray-500 text-sm">✕</button>
            </div>
          </div>
        ))}
      </div>
      {children}
    </ToastContext.Provider>
  );
}

export function useToast(){
  const ctx = useContext(ToastContext);
  if (!ctx) throw new Error("useToast must be inside ToastProvider");
  return ctx;
}
