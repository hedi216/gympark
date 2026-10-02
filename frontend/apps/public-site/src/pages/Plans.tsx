import { PricingGrid, PromotionBlock } from "../components/BrandSections";
export function Plans() {
  return (
    <>
      <section className="page-intro section">
        <p className="eyebrow">Les abonnements Gym Park</p>
        <h1>
          VOTRE RYTHME.
          <br />
          <em>VOTRE FORMULE.</em>
        </h1>
        <p>Des tarifs clairs, pour trouver votre façon de vous entraîner.</p>
      </section>
      <section className="section page-body">
        <PricingGrid />
        <PromotionBlock />
        <div className="info-panel">
          <h2>Bon à savoir</h2>
          <p>
            L’accès matinal s’arrête à 13:00, dans les limites des horaires
            d’ouverture du jour. Le pack de 20 séances est valable 6 mois. Les
            frais d’inscription sont distincts de chaque formule.
          </p>
          <p>
            L’inscription et le règlement sont à finaliser auprès de l’accueil.
          </p>
        </div>
      </section>
    </>
  );
}
