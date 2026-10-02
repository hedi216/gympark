import { useState } from "react";
import config from "../../../../config/gym-park.json" with { type: "json" };
import "./App.css";
const publicSite = (
  import.meta.env.VITE_PUBLIC_SITE_URL || "http://localhost:5180"
).replace(/\/$/, "");
const sections = [
  "Vue d’ensemble",
  "Adhérents",
  "Abonnements",
  "Présences",
  "Paiements",
  "Cours & événements",
  "Paramètres",
];
export default function App() {
  const [section, setSection] = useState(sections[0]);
  return (
    <div className="shell">
      <aside>
        <a href={publicSite} aria-label="Gym Park — site public">
          <img src={config.logo} alt="Gym Park" width="85" height="85" />
        </a>
        <p className="eyebrow">Console administration</p>
        <nav aria-label="Rubriques">
          {sections.map((name) => (
            <button
              className={name === section ? "active" : ""}
              key={name}
              onClick={() => setSection(name)}
              aria-current={name === section ? "page" : undefined}
            >
              {name}
              <span>↗</span>
            </button>
          ))}
        </nav>
        <a href={publicSite}>Retour au site ↗</a>
      </aside>
      <main>
        <header>
          <span>
            {config.city} / {config.name}
          </span>
          <span>Administration · aperçu</span>
        </header>
        <div className="content">
          <p className="eyebrow">{section}</p>
          <h1>Le club, côté équipe.</h1>
          <p className="intro">
            Un espace de travail pour l’accueil et la gestion de Gym Park.
          </p>
          <div className="notice">
            <strong>Configuration de l’espace en cours</strong>
            <p>
              Cette console est une interface de préparation. Aucun dossier
              adhérent, paiement ou contrôle d’accès réel n’est connecté.
            </p>
          </div>
          <div className="grid">
            <article>
              <small>01 / LE CLUB</small>
              <h2>{config.name}</h2>
              <p>{config.addressLine}</p>
              <a href={config.phoneHref}>{config.phone}</a>
            </article>
            <article>
              <small>02 / {section.toUpperCase()}</small>
              <h2>À connecter.</h2>
              <p>
                Les outils de gestion seront disponibles après connexion des
                services et mise en place des accès équipe.
              </p>
              <a className="cta" href={`${publicSite}/abonnements`}>
                Voir les formules publiques ↗
              </a>
            </article>
          </div>
          <footer>GYM PARK · TRAIN HARD. STAY TOGETHER.</footer>
        </div>
      </main>
    </div>
  );
}
