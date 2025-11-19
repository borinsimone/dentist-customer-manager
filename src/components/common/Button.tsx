import type {
  ReactNode,
  ButtonHTMLAttributes,
} from "react";
import styles from "./Button.module.scss";

interface ButtonProps
  extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "primary" | "secondary" | "success" | "danger";
  size?: "small" | "medium" | "large";
  fullWidth?: boolean;
  children: ReactNode;
}

export const Button = ({
  variant = "primary",
  size = "medium",
  fullWidth = false,
  children,
  className = "",
  ...props
}: ButtonProps) => {
  const classes = [
    styles.button,
    styles[variant],
    size !== "medium" ? styles[size] : "",
    fullWidth ? styles["full-width"] : "",
    className,
  ]
    .filter(Boolean)
    .join(" ");

  return (
    <button className={classes} {...props}>
      {children}
    </button>
  );
};
