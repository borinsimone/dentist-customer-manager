import { useState } from "react";
import { useAuth } from "../../contexts/AuthContext";
import { Button } from "../common/Button";
import styles from "./Login.module.scss";

export const Login = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const success = await login(email, password);
      if (!success) {
        setError("Email o password non corretti");
      }
    } catch (err) {
      setError("Errore durante il login");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={styles["login-container"]}>
      <div className={styles["login-card"]}>
        <h1>🦷 Studio Dentistico</h1>
        <p className={styles.subtitle}>
          Gestionale Pazienti
        </p>

        <form onSubmit={handleSubmit}>
          {error && (
            <div className={styles["error-message"]}>
              {error}
            </div>
          )}

          <div className={styles["form-group"]}>
            <label htmlFor="email">Email</label>
            <input
              type="email"
              id="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              autoComplete="email"
              placeholder="demo@studio.it"
            />
          </div>

          <div className={styles["form-group"]}>
            <label htmlFor="password">Password</label>
            <input
              type="password"
              id="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              autoComplete="current-password"
              placeholder="••••••••"
            />
          </div>

          <Button
            type="submit"
            fullWidth
            disabled={loading}
          >
            {loading ? "Accesso in corso..." : "Accedi"}
          </Button>
        </form>

        <div className={styles["demo-info"]}>
          <strong>👉 Credenziali Demo:</strong>
          <p>Email: demo@studio.it</p>
          <p>Password: demo123</p>
        </div>
      </div>
    </div>
  );
};
