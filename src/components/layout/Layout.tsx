import type { ReactNode } from "react";
import { Link, useLocation } from "react-router-dom";
import { useAuth } from "../../contexts/AuthContext";
import { Button } from "../common/Button";
import styles from "./Layout.module.scss";

interface LayoutProps {
  children: ReactNode;
  title: string;
  actions?: ReactNode;
}

const navItems = [
  { path: "/", label: "Dashboard", icon: "📊" },
  { path: "/patients", label: "Pazienti", icon: "👥" },
  {
    path: "/appointments",
    label: "Appuntamenti",
    icon: "📅",
  },
  { path: "/quotes", label: "Preventivi", icon: "💰" },
  { path: "/payments", label: "Pagamenti", icon: "💳" },
  { path: "/settings", label: "Impostazioni", icon: "⚙️" },
];

export const Layout = ({
  children,
  title,
  actions,
}: LayoutProps) => {
  const location = useLocation();
  const { user, logout } = useAuth();

  return (
    <div className={styles.layout}>
      <aside className={styles.sidebar}>
        <div className={styles.logo}>
          <h2>🦷 Studio Dentistico</h2>
          <p>Gestionale Pazienti</p>
        </div>

        <nav className={styles.nav}>
          {navItems.map((item) => (
            <Link
              key={item.path}
              to={item.path}
              className={`${styles["nav-item"]} ${
                location.pathname === item.path
                  ? styles.active
                  : ""
              }`}
            >
              <span className={styles.icon}>
                {item.icon}
              </span>
              <span>{item.label}</span>
            </Link>
          ))}
        </nav>

        <div className={styles["sidebar-footer"]}>
          <div className={styles["user-info"]}>
            <div className={styles.avatar}>
              {user?.name.charAt(0).toUpperCase()}
            </div>
            <div className={styles["user-details"]}>
              <div className={styles.name}>
                {user?.name}
              </div>
              <div className={styles.email}>
                {user?.email}
              </div>
            </div>
          </div>
          <Button
            variant="secondary"
            fullWidth
            onClick={logout}
            size="small"
          >
            Esci
          </Button>
        </div>
      </aside>

      <main className={styles["main-content"]}>
        <header className={styles.header}>
          <h1>{title}</h1>
          {actions && <div>{actions}</div>}
        </header>
        <div className={styles.content}>{children}</div>
      </main>
    </div>
  );
};
