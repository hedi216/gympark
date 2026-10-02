import { Link } from "react-router-dom";
import { isPromotionVisible, gym } from "../lib/gymInfo";
import { PromotionBlock } from "../components/BrandSections";
export function Offers() {
  return (
    <>
      <section className="page-intro section">
        <p className="eyebrow">Les offres Gym Park</p>
        <h1>
          UNE BONNE RAISON
          <br />
          <em>DE COMMENCER.</em>
        </h1>
        <p>Retrouvez ici les promotions confirmées par le club.</p>
      </section>
      <section className="section page-body">
        {isPromotionVisible() ? (
          <PromotionBlock />
        ) : (
          <div className="empty-offer">
            <span className="large-symbol" aria-hidden="true">
              ↗
            </span>
            <h2>Le prochain départ vous appartient.</h2>
            <p>
              Aucune promotion confirmée en ligne pour le moment. Nos formules
              habituelles restent disponibles ; contactez l’accueil pour
              connaître les offres du moment.
            </p>
            <div className="button-row">
              <Link className="gp-button" to="/abonnements">
                Voir les tarifs ↗
              </Link>
              <a className="text-link" href={gym.phoneHref}>
                Appeler le club ↗
              </a>
            </div>
          </div>
        )}
      </section>
    </>
  );
}
