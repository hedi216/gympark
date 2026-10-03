import { Navigate, Outlet } from "react-router-dom";
import { ADMIN_URL, useAuth } from "@gym-platform/api-client";
export function RequireMember() {
  const { user, loading, error, refresh } = useAuth();
  if (loading)
    return (
      <div className="section loading-state">
        Vérification de votre session…
      </div>
    );
  if (error)
    return (
      <div className="section api-error" role="alert">
        {error}
        <button onClick={() => void refresh()} className="action-button">
          Réessayer
        </button>
      </div>
    );
  if (!user) return <Navigate to="/connexion" replace />;
  if (user.mustChangePassword)
    return <Navigate to="/changer-mot-de-passe" replace />;
  if (user.role !== "MEMBER")
    return (
      <section className="section">
        <h1>Espace réservé aux adhérents</h1>
        <a className="gp-button" href={ADMIN_URL}>
          Ouvrir la console équipe ↗
        </a>
      </section>
    );
  return <Outlet />;
}
