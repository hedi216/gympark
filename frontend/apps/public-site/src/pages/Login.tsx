import { useEffect, useState } from "react";
import type { FormEvent } from "react";
import { Link, useNavigate } from "react-router-dom";
import { ADMIN_URL, errorMessage, useAuth } from "@gym-platform/api-client";
import { AuthLayout } from "../components/auth/AuthLayout";
import { TextField } from "../components/primitives/TextField";
import { Button } from "../components/primitives/Button";
import styles from "../components/auth/AuthLayout.module.css";
export function Login() {
  const { user, login } = useAuth();
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);
  useEffect(() => {
    if (user) {
      if (user.mustChangePassword)
        navigate("/changer-mot-de-passe", { replace: true });
      else if (user.role === "MEMBER")
        navigate("/espace-membre", { replace: true });
      else window.location.assign(ADMIN_URL);
    }
  }, [user, navigate]);
  async function submit(e: FormEvent) {
    e.preventDefault();
    setBusy(true);
    setError("");
    try {
      await login(email, password);
      setPassword("");
    } catch (e) {
      setError(errorMessage(e));
    } finally {
      setBusy(false);
    }
  }
  return (
    <AuthLayout
      title="Connexion"
      subtitle="Retrouvez votre espace Gym Park avec les accès remis par l’accueil."
      onSubmit={submit}
      footer={
        <>
          {error && (
            <div className="api-error" role="alert">
              {error}
            </div>
          )}
          <Button type="submit" disabled={busy} className={styles.submit}>
            {busy ? "Connexion…" : "Se connecter"}
          </Button>
          <p className={styles.switch}>
            Pas encore d’accès ?{" "}
            <Link to="/rejoindre">Inscription au club</Link>
          </p>
          <Link to="/mot-de-passe-oublie">Mot de passe oublié ?</Link>
        </>
      }
    >
      <TextField
        label="Email"
        type="email"
        value={email}
        onChange={setEmail}
        autoComplete="username"
        required
      />
      <TextField
        label="Mot de passe"
        type="password"
        value={password}
        onChange={setPassword}
        autoComplete="current-password"
        required
      />
    </AuthLayout>
  );
}
