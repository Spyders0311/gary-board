import { useEffect } from "react";

type ToastProps = {
  message: string;
  type: "success" | "error";
  onClose: () => void;
};

export default function Toast({ message, type, onClose }: ToastProps) {
  useEffect(() => {
    const timer = setTimeout(onClose, 2200);
    return () => clearTimeout(timer);
  }, [onClose]);

  const base =
    "pointer-events-auto rounded-full border px-4 py-2 text-sm shadow-lg backdrop-blur";
  const style =
    type === "success"
      ? "border-emerald-400/40 bg-emerald-500/15 text-emerald-100"
      : "border-red-400/40 bg-red-500/15 text-red-100";

  return (
    <div className={`${base} ${style} fade-in`} role="status">
      {message}
    </div>
  );
}
