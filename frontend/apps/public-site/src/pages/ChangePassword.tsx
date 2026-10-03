import { useState } from "react";
import type { FormEvent } from "react";
import { Navigate, useNavigate } from "react-router-dom";
import { ADMIN_URL, errorMessage, useAuth } from "@gym-platform/api-client";
import { AuthLayout } from "../components/auth/AuthLayout";
import { TextField } from "../components/primitives/TextField";
import { Button } from "../components/primitives/Button";
export function ChangePassword() {
  const { user, loading, changePassword, logout } = useAuth();
  const navigate = useNavigate();
  const [current, setCurrent] = useState("");
  const [next, setNext] = useState("");
  const [confirm, setConfirm] = useState("");
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);
  if (loading) return <p className="section loading-state">Chargement…</p>;
  if (!user) return <Navigate to="/connexion" replace />;
  async function submit(e: FormEvent) {
    e.preventDefault();
    setBusy(true);
    setError("");
    try {
      const u = await changePassword(current, next, confirm);
      setCurrent("");
      setNext("");
      setConfirm("");
      if (u.role === "MEMBER") navigate("/espace-membre", { replace: true });
      else window.location.assign(ADMIN_URL);
    } catch (e) {
      setError(errorMessage(e));
    } finally {
      setBusy(false);
    }
  }
  return (
    <AuthLayout
      title="Changer mon mot de passe"
      subtitle="Avant de continuer, choisissez un mot de passe personnel : 12 caractères minimum, avec majuscule, minuscule, chiffre et symbole."
      onSubmit={submit}
      footer={
        <>
          {error && (
            <div role="alert" className="api-error">
              {error}
            </div>
          )}
          <Button type="submit" disabled={busy}>
            {busy ? "Enregistrement…" : "Enregistrer mon mot de passe"}
          </Button>
          <button
            className="logout-button"
            type="button"
            onClick={() =>
              void logout().catch((e) => setError(errorMessage(e)))
            }
          >
            Se déconnecter
          </button>
        </>
      }
    >
      <TextField
        label="Mot de passe temporaire / actuel"
        type="password"
        value={current}
        onChange={setCurrent}
        autoComplete="current-password"
        required
      />
      <TextField
        label="Nouveau mot de passe"
        type="password"
        value={next}
        onChange={setNext}
        autoComplete="new-password"
        required
      />
      <TextField
        label="Confirmer le nouveau mot de passe"
        type="password"
        value={confirm}
        onChange={setConfirm}
        autoComplete="new-password"
        required
      />
    </AuthLayout>
  );
}
