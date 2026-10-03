import { useState } from "react";
import { errorMessage, useAuth } from "@gym-platform/api-client";
import { gym } from "../../lib/gymInfo";
import type { ReactNode } from "react";
import { Link, useLocation } from "react-router-dom";
import styles from "./DashboardLayout.module.css";

const SIDEBAR_ITEMS = [
  {
    group: "Compte",
    items: [
      { label: "Vue d'ensemble", to: "/espace-membre" },
      { label: "Cours", to: "/espace-membre/cours" },
      { label: "Mes réservations", to: "/espace-membre/reservations" },
      { label: "Mon abonnement", to: "/espace-membre/abonnement" },
      { label: "Carte membre", to: "/espace-membre/carte" },
      { label: "Assiduité", to: "/espace-membre/assiduite" },
    ],
  },
  {
    group: "Fidélité",
    items: [
      { label: "Points & niveau", to: "/espace-membre/fidelite" },
      { label: "Récompenses", to: "/espace-membre/recompenses" },
      { label: "Défis", to: "/espace-membre/defis" },
      { label: "Parrainage", to: "/espace-membre/parrainage" },
    ],
  },
  {
    group: "Suivi",
    items: [
      { label: "Paiements", to: "/espace-membre/paiements" },
      { label: "Historique", to: "/espace-membre/historique" },
      { label: "Notifications", to: "/espace-membre/notifications" },
    ],
  },
  {
    group: "Aide",
    items: [
      { label: "Support", to: "/espace-membre/support" },
      { label: "Profil", to: "/espace-membre/profil" },
    ],
  },
];

const BOTTOM_ITEMS = [
  { label: "Accueil", to: "/espace-membre" },
  { label: "Abonnement", to: "/espace-membre/abonnement" },
  { label: "Carte", to: "/espace-membre/carte" },
  { label: "Activité", to: "/espace-membre/assiduite" },
  { label: "Profil", to: "/espace-membre/profil" },
];

interface DashboardLayoutProps {
  children: ReactNode;
}

export function DashboardLayout({ children }: DashboardLayoutProps) {
  const { pathname } = useLocation();
  const { logout } = useAuth();
  const [error, setError] = useState("");
  const demo = ["fidelite", "recompenses", "defis", "parrainage", "notifications", "support"].some(name => pathname.endsWith("/" + name));
  const leave = () => { void logout().catch(e => setError(errorMessage(e))); };

  return (
    <div className={styles.shell}>
      <aside className={styles.sidebar}>
        <div className={styles.sidebarInner}>
          <Link to="/" className={styles.fullMark}>
            <img src={gym.logo} alt="Gym Park" className={styles.fullMarkImg} />
          </Link>

          <nav className={styles.nav}>
            {SIDEBAR_ITEMS.map((section) => (
              <div key={section.group}>
                <div className={styles.navGroupLabel}>{section.group}</div>
                {section.items.map((item) => (
                  <Link
                    key={item.label}
                    to={item.to}
                    className={`${styles.navItem} ${pathname === item.to ? styles.active : ""}`}
                  >
                    <span className={styles.navDot} aria-hidden="true" />
                    {item.label}
                  </Link>
                ))}
              </div>
            ))}
          </nav>

          <button type="button" className="logout-button" onClick={leave}>Se déconnecter</button>
        </div>
      </aside>

      <div>
        <div className={styles.topbar}>
          <Link to="/" className={styles.mark}>
            <img src={gym.logo} alt="Gym Park" className={styles.markIcon} />
          </Link>
          <button type="button" className="logout-button" onClick={leave}>Déconnexion</button>
        </div>

        {error && <div className="api-error" role="alert">{error}</div>}
        {demo && <div className="demo-banner">
          <strong>DÉMONSTRATION GYM PARK</strong> · Données fictives. Aucun
          paiement, accès QR ou avantage réel. Les actions restent locales ; les
          règles de fidélité, de pause et de parrainage sont à confirmer.
        </div>}
        <details className="mobile-member-links">
          <summary>Toutes les rubriques membre</summary>
          <nav>
            {SIDEBAR_ITEMS.flatMap((s) => s.items).map((item) => (
              <Link key={item.to} to={item.to}>
                {item.label}
              </Link>
            ))}
          </nav>
        </details>
        <div className={styles.main}>{children}</div>

        <nav className={styles.bottomNav}>
          {BOTTOM_ITEMS.map((item) => (
            <Link
              key={item.label}
              to={item.to}
              className={`${styles.bottomItem} ${pathname === item.to ? styles.active : ""}`}
            >
              <span className={styles.bottomDot} aria-hidden="true" />
              {item.label}
            </Link>
          ))}
        </nav>
      </div>
    </div>
  );
}
