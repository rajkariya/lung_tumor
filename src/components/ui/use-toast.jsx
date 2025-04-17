import * as React from "react";
import { Toaster } from "./toaster";

const ToastContext = React.createContext(undefined);

export function ToastProvider({ children }) {
  const [toasts, setToasts] = React.useState([]);

  const toast = ({ title, description, variant = "default" }) => {
    const id = Math.random().toString(36).substring(2, 9);
    const newToast = { id, title, description, variant };

    setToasts((prev) => [...prev, newToast]);

    const timer = setTimeout(() => {
      dismissToast(id);
    }, 5000);

    return () => {
      clearTimeout(timer);
      dismissToast(id);
    };
  };

  const dismissToast = (id) => {
    setToasts((prev) => prev.filter((toast) => toast.id !== id));
  };

  return (
    <ToastContext.Provider value={{ toast }}>
      {children}
      <Toaster toasts={toasts} dismissToast={dismissToast} />
    </ToastContext.Provider>
  );
}

export function useToast() {
  const context = React.useContext(ToastContext);
  if (context === undefined) {
    throw new Error("useToast must be used within a ToastProvider");
  }
  return context;
}