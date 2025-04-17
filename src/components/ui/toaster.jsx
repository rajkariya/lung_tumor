import { Toast } from "./toast";

export function Toaster({ toasts, dismissToast }) {
  return (
    <div className="fixed top-4 right-4 z-[100] flex max-h-screen w-full flex-col-reverse gap-2 sm:bottom-auto sm:right-4 sm:top-4 sm:flex-col">
      {toasts.map((toast) => (
        <Toast key={toast.id} toast={toast} dismissToast={dismissToast} />
      ))}
    </div>
  );
}