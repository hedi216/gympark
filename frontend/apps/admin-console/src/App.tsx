import { useState } from "react";
import {
  Link,
  NavLink,
  Navigate,
  Outlet,
  Route,
  Routes,
} from "react-router-dom";
import { PUBLIC_URL, errorMessage, useAuth } from "@gym-platform/api-client";
import config from "../../../../config/gym-park.json" with { type: "json" };
import { StaffLogin, StaffChangePassword } from "./AuthPages";
import { AccountsPage } from "./pages/AccountsPage";
import { CoursesPage } from "./pages/CoursesPage";
import { OperationsPage, Overview, Settings } from "./pages/OperationsPage";
import "./App.css";
function Guard({ admin = false }: { admin?: boolean }) {
  const { user, loading, error, refresh } = useAuth();
  if (loading)
    return <p className="loading-state">Vérification de la session…</p>;
  if (error)
    return (
      <div className="api-error" role="alert">
        {error}
        <button onClick={() => void refresh()}>Réessayer</button>
      </div>
    );
  if (!user) return <Navigate to="/connexion" replace />;
  if (user.mustChangePassword)
    return <Navigate to="/changer-mot-de-passe" replace />;
  if (user.role === "MEMBER" || (admin && user.role !== "ADMIN"))
    return (
      <div className="content">
        <h1>Accès refusé</h1>
        <p>Cette rubrique n’est pas autorisée pour votre compte.</p>
        <a
          className="action-button"
          href={user.role === "MEMBER" ? `${PUBLIC_URL}/espace-membre` : "/"}
        >
          Retour à mon espace
        </a>
      </div>
    );
  return <Outlet />;
}
function Shell() {
  const { user, logout } = useAuth();
  const [error, setError] = useState("");
  const links = [
    ["/", "Vue d’ensemble"],
    ["/adherents", "Adhérents"],
    ["/abonnements", "Abonnements"],
    ["/presences", "Présences"],
    ["/paiements", "Paiements"],
    ["/cours", "Cours"],
    ["/reservations", "Réservations"],
    ...(user?.role === "ADMIN" ? [["/employes", "Employés"]] : []),
    ["/parametres", "Paramètres"],
  ];
  return (
    <div className="shell">
      <aside>
        <a href={PUBLIC_URL}>
          <img src={config.logo} alt="Gym Park" width="85" height="85" />
        </a>
        <p className="eyebrow">Console administration</p>
        <nav aria-label="Navigation équipe">
          {links.map(([to, label]) => (
            <NavLink end={to === "/"} key={to} to={to}>
              {label}
              <span>↗</span>
            </NavLink>
          ))}
        </nav>
        <button
          className="logout-button"
          onClick={() => void logout().catch((e) => setError(errorMessage(e)))}
        >
          Se déconnecter
        </button>
        <a href={PUBLIC_URL}>Retour au site ↗</a>
      </aside>
      <main>
        <header>
          <span>
            {config.city} / {config.name}
          </span>
          <span>
            {user?.email} · {user?.role === "ADMIN" ? "ADMIN" : "EMPLOYÉ"}
          </span>
        </header>
        {error && (
          <p className="api-error" role="alert">
            {error}
          </p>
        )}
        <div className="content">
          <Outlet />
        </div>
      </main>
    </div>
  );
}
export default function App() {
  return (
    <Routes>
      <Route path="/connexion" element={<StaffLogin />} />
      <Route path="/changer-mot-de-passe" element={<StaffChangePassword />} />
      <Route element={<Guard />}>
        <Route element={<Shell />}>
          <Route index element={<Overview />} />
          <Route path="/adherents" element={<AccountsPage kind="members" />} />
          <Route element={<Guard admin />}>
            <Route
              path="/employes"
              element={<AccountsPage kind="employees" />}
            />
          </Route>
          <Route path="/cours" element={<CoursesPage />} />
          <Route
            path="/reservations"
            element={<CoursesPage reservationsOnly />}
          />
          <Route
            path="/abonnements"
            element={<OperationsPage section="subscriptions" />}
          />
          <Route
            path="/presences"
            element={<OperationsPage section="attendance" />}
          />
          <Route
            path="/paiements"
            element={<OperationsPage section="payments" />}
          />
          <Route path="/parametres" element={<Settings />} />
          <Route
            path="*"
            element={
              <>
                <h1>Page introuvable</h1>
                <Link to="/">Retour à l’accueil</Link>
              </>
            }
          />
        </Route>
      </Route>
    </Routes>
  );
}
