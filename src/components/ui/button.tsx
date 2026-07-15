import { clsx } from "clsx";
import Link from "next/link";
import type { AnchorHTMLAttributes, ButtonHTMLAttributes } from "react";

type Variant = "primary" | "secondary" | "ghost";

const variants: Record<Variant, string> = {
  primary:
    "bg-orange text-white shadow-lg shadow-orange/30 hover:bg-orange-dark focus-visible:outline-white",
  secondary:
    "bg-white text-navy hover:bg-sky",
  ghost: "border border-white/30 text-white hover:bg-white/10"
};

const base =
  "inline-flex items-center justify-center rounded-full px-6 py-3 font-display text-base font-bold tracking-wide transition disabled:opacity-50 disabled:pointer-events-none";

export function Button({
  variant = "primary",
  className,
  ...props
}: ButtonHTMLAttributes<HTMLButtonElement> & { variant?: Variant }) {
  return <button className={clsx(base, variants[variant], className)} {...props} />;
}

export function LinkButton({
  href,
  variant = "primary",
  className,
  children,
  ...anchorProps
}: {
  href: string;
  variant?: Variant;
  className?: string;
  children: React.ReactNode;
} & Omit<AnchorHTMLAttributes<HTMLAnchorElement>, "href" | "className" | "children">) {
  return (
    <Link href={href} className={clsx(base, variants[variant], className)} {...anchorProps}>
      {children}
    </Link>
  );
}
