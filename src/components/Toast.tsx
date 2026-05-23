export interface ToastState {
  message: string;
  action?: { label: string; onClick: () => void };
  key: number;
  closing?: boolean;
}

interface ToastProps {
  toast: ToastState | null;
}

export function Toast({ toast }: ToastProps) {
  if (!toast) return null;

  return (
    <div
      key={toast.key}
      className={`toast ${toast.closing ? 'toast--closing' : 'toast--open'}`}
      role="status"
      aria-live="polite"
    >
      <span className="toast-message">{toast.message}</span>
      {toast.action && (
        <button
          className="toast-action"
          onClick={() => {
            toast.action!.onClick();
          }}
        >
          {toast.action.label}
        </button>
      )}
    </div>
  );
}
