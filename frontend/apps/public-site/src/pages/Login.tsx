import { useState } from "react";
import type { FormEvent } from "react";
import { Link, useNavigate } from "react-router-dom";
import { AuthLayout } from "../components/auth/AuthLayout";
import { TextField } from "../components/primitives/TextField";
import { Checkbox } from "../components/primitives/Checkbox";
import { Button } from "../components/primitives/Button";
import { useAuth } from "../lib/AuthContext";
import styles from "../components/auth/AuthLayout.module.css";

export function Login() {
  const navigate = useNavigate();
  const { login } = useAuth();
  const [identifier, setIdentifier] = useState("");
  const [password, setPassword] = useState("");
  const [remember, setRemember] = useState(false);
  const [error, setError] = useState<string | null>(null);

  function handleSubmit(e: FormEvent) {
    e.preventDefault();
    if (!identifier || !password) {
      setError("Renseignez votre email (ou téléphone) et votre mot de passe.");
      return;
    }
    setError(null);
    login();
    navigate("/espace-membre");
  }

  return (
    <AuthLayout
      title="Connexion"
      subtitle="Accédez à votre abonnement, votre carte membre et vos points fidélité."
      onSubmit={handleSubmit}
      footer={
        <>
          {error && (
            <div className={styles.note} role="alert">
              {error}
            </div>
          )}

          <Button type="submit" variant="primary" className={styles.submit}>
            Ouvrir la démonstration
          </Button>

          <p className={styles.switch}>
            Pas encore membre ? <Link to="/rejoindre">Créer un compte</Link>
          </p>
        </>
      }
    >
      <TextField
        label="Email ou téléphone"
        type="text"
        value={identifier}
        onChange={setIdentifier}
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

      <div className={styles.inline}>
        <Checkbox checked={remember} onChange={setRemember}>
          Se souvenir de moi
        </Checkbox>
        <Link to="/mot-de-passe-oublie" className={styles.forgot}>
          Mot de passe oublié ?
        </Link>
      </div>
    </AuthLayout>
  );
}
