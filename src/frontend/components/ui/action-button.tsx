import type { ButtonHTMLAttributes } from "react";

type ActionButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & {
  tone?: "primary" | "secondary";
};

export function ActionButton({
  tone = "secondary", className = "", type = "button", ...props
}: ActionButtonProps) {
  const color = tone === "primary" ? "bg-petal" : "bg-white";
  return <button type={type} className={`action motion-reduce:transition-none ${color} ${className}`} {...props} />;
}
