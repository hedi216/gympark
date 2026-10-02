import { Link } from "react-router-dom";
export function Loyalty() {
  return (
    <section className="section page-intro">
      <p className="eyebrow">Points fidélité</p>
      <h1>
        CHAQUE PROGRÈS
        <br />
        <em>COMPTE.</em>
      </h1>
      <p>
        L’espace fidélité est en préparation. Les règles, niveaux et récompenses
        Gym Park seront communiqués après confirmation par le club.
      </p>
      <div className="info-panel">
        <h2>Découvrez le futur espace.</h2>
        <p>
          Le prototype présente des exemples fictifs de points, de défis et de
          parrainages. Ils ne constituent pas des avantages acquis.
        </p>
        <Link className="gp-button" to="/espace-membre/fidelite">
          Explorer la démonstration ↗
        </Link>
      </div>
    </section>
  );
}
