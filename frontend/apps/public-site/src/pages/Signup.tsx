import { useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { gym, plans, priceFor } from "../lib/gymInfo";
export function Signup() {
  const [search] = useSearchParams();
  const [planId, setPlanId] = useState(
    plans.some((p) => p.id === search.get("plan"))
      ? search.get("plan")!
      : plans[0].id,
  );
  const plan = plans.find((p) => p.id === planId)!;
  const price = priceFor(plan).price;
  return (
    <section className="section page-intro">
      <p className="eyebrow">Rejoindre Gym Park</p>
      <h1>
        INSCRIPTION
        <br />
        <em>AU CLUB.</em>
      </h1>
      <p>
        Choisissez votre formule et contactez l’accueil. L’équipe crée votre
        compte adhérent et vous remet un mot de passe temporaire à modifier lors
        de votre première connexion.
      </p>
      <div className="info-panel">
        <div className="signup-plan">
          <label htmlFor="signup-plan">Votre formule</label>
          <select
            id="signup-plan"
            value={planId}
            onChange={(e) => setPlanId(e.target.value)}
          >
            {plans.map((p) => (
              <option key={p.id} value={p.id}>
                {p.name} · {p.durationLabel} · {priceFor(p).price} DT
              </option>
            ))}
          </select>
          <p className="signup-total">
            Abonnement : {price} DT
            <br />
            Frais d’inscription : {gym.registrationFee} DT
            <br />
            <strong>Total initial : {price + gym.registrationFee} DT</strong>
          </p>
        </div>
        <div className="button-row">
          <a className="gp-button" href={gym.phoneHref}>
            Appeler l’accueil · {gym.phone} ↗
          </a>
          <Link className="text-link" to="/connexion">
            J’ai déjà mes accès ↗
          </Link>
        </div>
      </div>
    </section>
  );
}
