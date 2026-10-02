import { Link } from "react-router-dom";
import { gym } from "../lib/gymInfo";
import { HoursTicker } from "../components/layout/HoursTicker";
import {
  ActivityCards,
  FinalCTA,
  LocationBlock,
  PricingGrid,
  PromotionBlock,
  SectionHeading,
} from "../components/BrandSections";
export function Home() {
  return (
    <>
      <section className="hero">
        <img
          className="hero-image"
          src={gym.hero}
          alt=""
          fetchPriority="high"
        />
        <div className="hero-shade" />
        <div className="hero-content">
          <p className="eyebrow">
            <span /> MORE THAN A GYM · EZZAHRA
          </p>
          <h1>
            BUILD A<br />
            STRONGER
            <br />
            <em>YOU.</em>
          </h1>
          <p className="hero-subtitle">Training. Community. Progress.</p>
          <div className="button-row">
            <Link className="gp-button" to="/abonnements">
              Voir les abonnements <span>↗</span>
            </Link>
            <Link className="hero-secondary" to="/le-club">
              <span>↗</span> Découvrir le club
            </Link>
          </div>
          <div className="hero-pillars">
            {["Équipement", "Coaching", "Communauté"].map((label, i) => (
              <div key={label}>
                <small>0{i + 1}</small>
                <span>{label}</span>
              </div>
            ))}
          </div>
        </div>
        <div className="hero-side-note">
          TRAIN HARD / GET STRONG / STAY TOGETHER
        </div>
        <a href="#abonnements" className="hero-scroll">
          DÉFILER POUR DÉCOUVRIR <span>↓</span>
        </a>
      </section>
      <HoursTicker />
      <section className="section" id="abonnements">
        <SectionHeading
          label="01 / Vos objectifs. Votre formule."
          title="LE BON RYTHME COMMENCE ICI."
          detail="Le matin, en accès libre ou à la séance : choisissez la formule qui vous ressemble."
        />
        <PricingGrid />
      </section>
      <div className="section promo-container">
        <PromotionBlock />
      </div>
      <section className="section classes-preview">
        <SectionHeading
          label="02 / L’énergie du collectif"
          title="PLUS FORTS. ENSEMBLE."
          detail="Du cardio à la force, trouvez votre prochain rendez-vous avec le groupe."
        />
        <ActivityCards preview />
        <Link className="text-link section-link" to="/cours">
          Tous les cours & le planning ↗
        </Link>
      </section>
      <section className="section why-section">
        <div>
          <p className="eyebrow">03 / L’esprit Gym Park</p>
          <h2>
            TRAIN HARD.
            <br />
            GET STRONG.
            <br />
            <em>STAY TOGETHER.</em>
          </h2>
          <p>
            Un objectif personnel. Une énergie collective.
            <br />À Ezzahra, faites de l’entraînement votre rendez-vous.
          </p>
          <Link className="text-link" to="/le-club">
            Découvrir notre univers ↗
          </Link>
        </div>
        <div className="why-list">
          {[
            [
              "01",
              "Le goût de l’effort",
              "Musculation, cardio et entraînement : avancez à votre rythme.",
            ],
            [
              "02",
              "L’énergie du coaching",
              "Des cours et des événements encadrés pour se mettre en mouvement.",
            ],
            [
              "03",
              "La force du groupe",
              "Partagez l’effort, les challenges et l’envie de progresser.",
            ],
          ].map(([n, t, d]) => (
            <article key={n}>
              <span>{n}</span>
              <div>
                <h3>{t}</h3>
                <p>{d}</p>
              </div>
            </article>
          ))}
        </div>
      </section>
      <section className="section member-preview">
        <div>
          <p className="eyebrow">04 / Votre espace, en préparation</p>
          <h2>
            LE CLUB.
            <br />
            DANS VOTRE POCHE.
          </h2>
          <p>
            Découvrez l’aperçu de votre futur espace : abonnement, carte membre,
            assiduité, paiements et points fidélité.
          </p>
          <span className="demo-label">Démonstration · données fictives</span>
          <Link className="gp-button outline" to="/espace-membre">
            Explorer l’aperçu ↗
          </Link>
        </div>
        <div className="digital-preview">
          <div>
            <img src={gym.logo} alt="Gym Park" width="70" height="70" />
            <span>ESPACE MEMBRE / DÉMO</span>
          </div>
          <p>
            VOTRE PROGRESSION.
            <br />
            <strong>TOUJOURS AVEC VOUS.</strong>
          </p>
          <div className="preview-links">
            <span>Abonnement ↗</span>
            <span>Carte membre ↗</span>
            <span>Assiduité ↗</span>
            <span>Points fidélité ↗</span>
          </div>
        </div>
      </section>
      <LocationBlock />
      <FinalCTA />
    </>
  );
}
