export function Toast({ toast, dismissToast }) {
    const variants = {
      default: "bg-background text-foreground border",
      destructive:
        "bg-destructive text-destructive-foreground border-destructive",
    };
  
    return (
      <div
        className={`pointer-events-auto relative flex w-full items-center justify-between space-x-4 overflow-hidden rounded-md border p-6 pr-8 shadow-lg transition-all ${variants[toast.variant]}`}
      >
        <div className="grid gap-1">
          <h3 className="text-sm font-semibold">{toast.title}</h3>
          <p className="text-sm opacity-90">{toast.description}</p>
        </div>
        <button
          onClick={() => dismissToast(toast.id)}
          className="absolute right-2 top-2 rounded-md p-1 text-foreground/50 hover:text-foreground focus:outline-none focus:ring-2"
        >
          <span className="sr-only">Close</span>
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="16"
            height="16"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <line x1="18" y1="6" x2="6" y2="18"></line>
            <line x1="6" y1="6" x2="18" y2="18"></line>
          </svg>
        </button>
      </div>
    );
  }