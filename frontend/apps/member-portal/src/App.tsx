import { useState } from "react";
import config from "../../../../config/gym-park.json" with { type: "json" };
import "./App.css";
const publicSite = (
  import.meta.env.VITE_PUBLIC_SITE_URL || "http://localhost:5180"
).replace(/\/$/, "");
const sections = [
  "Mon espace",
  "Abonnement",
  "Carte membre",
  "Assiduité",
  "Points fidélité",
  "Paiements",
  "Support",
];
export default function App() {
  const [section, setSection] = useState(sections[0]);
  return (
    <div className="shell">
      <aside>
        <a href={publicSite} aria-label="Gym Park — site public">
          <img src={config.logo} alt="Gym Park" width="85" height="85" />
        </a>
        <p className="eyebrow">Espace membre</p>
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
          <span>Portail membre · aperçu</span>
        </header>
        <div className="content">
          <p className="eyebrow">{section}</p>
          <h1>Votre prochaine séance commence ici.</h1>
          <p className="intro">
            Retrouvez votre abonnement, votre carte membre et votre progression
            dans l’espace Gym Park.
          </p>
          <div className="notice">
            <strong>Votre espace actuel est disponible en aperçu</strong>
            <p>
              Les fonctionnalités membre sont réunies sur le site principal. Ce
              portail prépare leur future séparation, sans dupliquer vos
              parcours.
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
              <h2>Tout au même endroit.</h2>
              <p>
                Découvrez le tableau de bord, les paiements, les défis et les
                notifications. Les données affichées sont fictives.
              </p>
              <a className="cta" href={`${publicSite}/espace-membre`}>
                Ouvrir l’espace membre ↗
              </a>
            </article>
          </div>
          <footer>GYM PARK · TRAIN HARD. STAY TOGETHER.</footer>
        </div>
      </main>
    </div>
  );
}
