import { Link } from "react-router-dom";
import {
  activities,
  gym,
  isPromotionVisible,
  plans,
  priceFor,
  promotion,
} from "../lib/gymInfo";
import type { Plan } from "../lib/gymInfo";
export function SectionHeading({
  label,
  title,
  detail,
}: {
  label: string;
  title: string;
  detail?: string;
}) {
  return (
    <div className="section-heading">
      <div>
        <p className="eyebrow">{label}</p>
        <h2>{title}</h2>
      </div>
      {detail && <p>{detail}</p>}
    </div>
  );
}
export function Price({ plan }: { plan: Plan }) {
  const value = priceFor(plan);
  return (
    <span className="price">
      {value.original && <del>{value.original} DT</del>}
      <strong>{value.price}</strong> <small>DT</small>
    </span>
  );
}
export function PricingGrid() {
  return (
    <>
      <div className="pricing-grid">
        {[
          {
            mode: "morning",
            number: "01",
            title: "Le matin.",
            subtitle: "Accès matinal",
            info: "Pour commencer la journée avec énergie.",
          },
          {
            mode: "full",
            number: "02",
            title: "À votre rythme.",
            subtitle: "Accès libre",
            info: "Entraînez-vous pendant les horaires du club.",
          },
          {
            mode: "sessions",
            number: "03",
            title: "À la séance.",
            subtitle: "Pack séances",
            info: "Gardez la liberté de choisir vos jours.",
          },
          {
            mode: "short",
            number: "04",
            title: "Le déclic.",
            subtitle: "Courte durée",
            info: "Deux semaines pour vous mettre en mouvement.",
          },
        ].map((group) => (
          <article
            key={group.mode}
            className={`plan-card ${group.mode === "full" ? "featured" : ""}`}
          >
            <div className="card-kicker">
              <span>{group.subtitle}</span>
              <span>{group.number}</span>
            </div>
            <h3>{group.title}</h3>
            <p>{group.info}</p>
            <div className="plan-prices">
              {plans
                .filter((p) => p.accessMode === group.mode)
                .map((p) => (
                  <div className="price-row" key={p.id}>
                    <span>{p.durationLabel}</span>
                    <Price plan={p} />
                  </div>
                ))}
            </div>
            <p className="plan-note">
              {group.mode === "morning"
                ? `${plans[0].accessStartTime} – ${plans[0].accessEndTime} · selon les jours d’ouverture`
                : group.mode === "sessions"
                  ? `Valable ${plans.find((p) => p.accessMode === "sessions")!.validityMonths} mois`
                  : group.mode === "full"
                    ? "Du lundi au dimanche"
                    : `Accès pendant ${plans.find((p) => p.accessMode === "short")!.validityDays} jours`}
            </p>
            <Link
              className="plan-link"
              to={`/rejoindre?plan=${plans.find((p) => p.accessMode === group.mode)!.id}`}
            >
              Choisir cette formule <span>↗</span>
            </Link>
          </article>
        ))}
      </div>
      <div className="registration-note">
        <span>À prévoir lors de l’inscription</span>
        <strong>Frais d’inscription : {gym.registrationFee} DT</strong>
        <span>En supplément du prix de l’abonnement.</span>
      </div>
    </>
  );
}
export function PromotionBlock() {
  if (!isPromotionVisible()) return null;
  return (
    <section className="promotion-block">
      <div>
        <p className="eyebrow">Offre Gym Park · annoncée le 28 août 2026</p>
        <h2>{promotion.name}</h2>
        <p>
          Disponibilité à confirmer à l’accueil.{" "}
          {promotion.endDate
            ? `Jusqu’au ${promotion.endDate}.`
            : "Aucune date de fin annoncée."}
        </p>
      </div>
      <div className="promo-prices">
        {promotion.prices.map((offer) => (
          <div key={offer.planId}>
            <span>
              {plans.find((p) => p.id === offer.planId)?.durationLabel}
            </span>
            <del>{offer.originalPrice} DT</del>
            <strong>{offer.promotionalPrice} DT</strong>
          </div>
        ))}
      </div>
      <a className="gp-button" href={gym.phoneHref}>
        En parler à l’accueil ↗
      </a>
    </section>
  );
}
export function ActivityCards({ preview = false }: { preview?: boolean }) {
  return (
    <div className="activity-grid">
      {activities.slice(0, preview ? 4 : undefined).map((activity, i) => (
        <article className="activity-card" key={activity.id}>
          <div className="activity-art" aria-hidden="true">
            <span>{["↗", "✳", "↔", "◎", "×", "⚑"][i]}</span>
            <small>GP / 0{i + 1}</small>
          </div>
          <div className="activity-copy">
            <span className="eyebrow">{activity.category}</span>
            <h3>{activity.name}</h3>
            <p>{activity.description}</p>
            {activity.intensity && <p>Intensité : {activity.intensity}</p>}
            {activity.reservationRequired ? (
              <a href={gym.phoneHref}>Réserver par téléphone ↗</a>
            ) : (
              <Link to="/cours#planning">Voir les prochaines séances ↗</Link>
            )}
          </div>
        </article>
      ))}
    </div>
  );
}
export function LocationBlock() {
  return (
    <section className="section location-section">
      <div>
        <p className="eyebrow">On se retrouve au club</p>
        <h2>
          VOTRE PROCHAIN
          <br />
          DÉPART. <em>EZZAHRA.</em>
        </h2>
        <address>
          {gym.addressLine}
          <br />
          {gym.city}, Tunisie
        </address>
        <a className="contact-number" href={gym.phoneHref}>
          {gym.phoneInternational}
        </a>
        <div className="button-row">
          <a
            className="gp-button"
            href={gym.mapsHref}
            target="_blank"
            rel="noreferrer"
          >
            Itinéraire ↗
          </a>
          <a
            className="text-link"
            href={gym.instagram}
            target="_blank"
            rel="noreferrer"
          >
            Instagram ↗
          </a>
        </div>
      </div>
      <div className="location-art">
        <span className="map-cross" aria-hidden="true">
          ＋
        </span>
        <p>GYM PARK</p>
        <strong>EZZAHRA</strong>
        <span>{gym.addressLine}</span>
        <a href={gym.mapsHref} target="_blank" rel="noreferrer">
          Ouvrir Google Maps ↗
        </a>
      </div>
    </section>
  );
}
export function FinalCTA() {
  return (
    <section className="final-cta">
      <span className="eyebrow">Le premier pas, c’est maintenant.</span>
      <h2>
        LET’S GET <span>STRONGER.</span>
      </h2>
      <Link className="gp-button light" to="/rejoindre">
        Rejoindre Gym Park ↗
      </Link>
    </section>
  );
}
