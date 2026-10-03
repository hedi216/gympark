import { useState } from "react";
import type { FormEvent } from "react";
import { Navigate, useNavigate } from "react-router-dom";
import { PUBLIC_URL, errorMessage, useAuth } from "@gym-platform/api-client";
import config from "../../../../config/gym-park.json" with { type: "json" };
export function StaffLogin() {
  const auth = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);
  const navigate = useNavigate();
  if (auth.user)
    return (
      <Navigate
        to={auth.user.mustChangePassword ? "/changer-mot-de-passe" : "/"}
        replace
      />
    );
  async function submit(e: FormEvent) {
    e.preventDefault();
    setBusy(true);
    setError("");
    try {
      const user = await auth.login(email, password);
      setPassword("");
      navigate(user.mustChangePassword ? "/changer-mot-de-passe" : "/");
    } catch (e) {
      setError(errorMessage(e));
    } finally {
      setBusy(false);
    }
  }
  return (
    <AuthFrame title="Connexion équipe">
      <form className="form-grid" onSubmit={submit}>
        <label>
          Email
          <input
            type="email"
            autoComplete="username"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
        </label>
        <label>
          Mot de passe
          <input
            type="password"
            autoComplete="current-password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
        </label>
        {error && (
          <p className="api-error" role="alert">
            {error}
          </p>
        )}
        <button className="action-button" disabled={busy}>
          {busy ? "Connexion…" : "Se connecter"}
        </button>
        <a href={`${PUBLIC_URL}/connexion`}>Espace adhérent ↗</a>
      </form>
    </AuthFrame>
  );
}
function AuthFrame({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <main className="staff-auth">
      <img src={config.logo} alt="Gym Park" width="80" height="80" />
      <p className="eyebrow">Console Gym Park</p>
      <h1>{title}</h1>
      {children}
    </main>
  );
}
export function StaffChangePassword() {
  const { user, loading, changePassword, logout } = useAuth();
  const [current, setCurrent] = useState("");
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);
  const navigate = useNavigate();
  if (loading) return <p className="loading-state">Chargement…</p>;
  if (!user) return <Navigate to="/connexion" replace />;
  async function submit(e: FormEvent) {
    e.preventDefault();
    setBusy(true);
    setError("");
    try {
      const u = await changePassword(current, password, confirm);
      setCurrent("");
      setPassword("");
      setConfirm("");
      if (u.role === "MEMBER")
        window.location.assign(`${PUBLIC_URL}/espace-membre`);
      else navigate("/", { replace: true });
    } catch (e) {
      setError(errorMessage(e));
    } finally {
      setBusy(false);
    }
  }
  return (
    <AuthFrame title="Changer mon mot de passe">
      <p>12 caractères minimum : majuscule, minuscule, chiffre et symbole.</p>
      <form className="form-grid" onSubmit={submit}>
        <label>
          Mot de passe temporaire / actuel
          <input
            type="password"
            autoComplete="current-password"
            value={current}
            onChange={(e) => setCurrent(e.target.value)}
            required
          />
        </label>
        <label>
          Nouveau mot de passe
          <input
            type="password"
            autoComplete="new-password"
            value={password}
            minLength={12}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
        </label>
        <label>
          Confirmer le nouveau mot de passe
          <input
            type="password"
            autoComplete="new-password"
            value={confirm}
            onChange={(e) => setConfirm(e.target.value)}
            required
          />
        </label>
        {error && (
          <p className="api-error" role="alert">
            {error}
          </p>
        )}
        <button className="action-button" disabled={busy}>
          Enregistrer mon mot de passe
        </button>
        <button
          type="button"
          className="action-button secondary"
          onClick={() => void logout().catch((e) => setError(errorMessage(e)))}
        >
          Se déconnecter
        </button>
      </form>
    </AuthFrame>
  );
}
