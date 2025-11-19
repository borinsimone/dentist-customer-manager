import type { ReactNode } from "react";
import styles from "./Card.module.scss";

interface CardProps {
  children: ReactNode;
  hover?: boolean;
  className?: string;
}

export const Card = ({
  children,
  hover = false,
  className = "",
}: CardProps) => {
  const classes = [
    styles.card,
    hover ? styles.hover : "",
    className,
  ]
    .filter(Boolean)
    .join(" ");

  return <div className={classes}>{children}</div>;
};

export const CardHeader = ({
  children,
}: {
  children: ReactNode;
}) => (
  <div className={styles["card-header"]}>{children}</div>
);

export const CardBody = ({
  children,
}: {
  children: ReactNode;
}) => <div className={styles["card-body"]}>{children}</div>;

export const CardFooter = ({
  children,
}: {
  children: ReactNode;
}) => (
  <div className={styles["card-footer"]}>{children}</div>
);
