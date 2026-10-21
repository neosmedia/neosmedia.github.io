import Link from "next/link";
import type { ReactNode } from "react";

/**
 * Pill button (see DESIGN.md "Buttons"). Renders a link (`href`) or a <button>.
 * variant: "primary" (filled) | "outline".  size: "sm" | "md" | "lg".
 * iconLeft / iconRight: name of a built-in icon. iconOnly: round icon button (give it a `label`).
 */
const ICONS = {
  arrowLeft: <path d="M19 12H5m6-6-6 6 6 6" />,
  arrowRight: <path d="M5 12h14m-6-6 6 6-6 6" />,
  arrowUpRight: <path d="M7 17 17 7M8 7h9v9" />,
  plus: <path d="M12 5v14M5 12h14" />,
  mail: (
    <>
      <rect x="3" y="5" width="18" height="14" rx="2" />
      <path d="m4 7 8 6 8-6" />
    </>
  ),
};

export type ButtonIcon = keyof typeof ICONS;

function Icon({ name }: { name: ButtonIcon }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      {ICONS[name]}
    </svg>
  );
}

type Props = {
  children?: ReactNode;
  variant?: "primary" | "outline";
  size?: "sm" | "md" | "lg";
  iconLeft?: ButtonIcon;
  iconRight?: ButtonIcon;
  /** Round icon-only button. Uses `iconLeft` (or `iconRight`) and requires `label` for screen readers. */
  iconOnly?: boolean;
  label?: string;
  href?: string;
  external?: boolean;
  type?: "button" | "submit";
  className?: string;
};

export default function Button({
  children,
  variant = "primary",
  size = "md",
  iconLeft,
  iconRight,
  iconOnly = false,
  label,
  href,
  external = false,
  type = "button",
  className = "",
}: Props) {
  const cls = [
    "btn",
    variant === "primary" ? "btn-primary" : "btn-outline",
    size === "sm" ? "btn-sm" : size === "lg" ? "btn-lg" : "",
    iconOnly ? "btn-icon" : "",
    className,
  ]
    .filter(Boolean)
    .join(" ");

  const inner = iconOnly ? (
    <Icon name={(iconLeft ?? iconRight ?? "arrowRight") as ButtonIcon} />
  ) : (
    <>
      {iconLeft && <Icon name={iconLeft} />}
      {children}
      {iconRight && <Icon name={iconRight} />}
    </>
  );

  if (href) {
    return external ? (
      <a className={cls} href={href} target="_blank" rel="noreferrer" aria-label={iconOnly ? label : undefined}>
        {inner}
      </a>
    ) : (
      <Link className={cls} href={href} aria-label={iconOnly ? label : undefined}>
        {inner}
      </Link>
    );
  }
  return (
    <button className={cls} type={type} aria-label={iconOnly ? label : undefined}>
      {inner}
    </button>
  );
}
