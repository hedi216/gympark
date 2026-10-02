import { Link } from "react-router-dom";
import { gym } from "../../lib/gymInfo";
export function Footer() {
  return (
    <footer className="site-footer">
      <div className="footer-top">
        <Link className="brand-logo" to="/">
          <img src={gym.logo} alt="Gym Park — accueil" width="90" height="90" />
        </Link>
        <p>
          TRAIN HARD.
          <br />
          <strong>STAY TOGETHER.</strong>
        </p>
        <nav aria-label="Pied de page">
          <Link to="/cours">Cours</Link>
          <Link to="/abonnements">Abonnements</Link>
          <Link to="/contact">Contact</Link>
          <a href={gym.instagram} target="_blank" rel="noreferrer">
            Instagram ↗
          </a>
        </nav>
      </div>
      <div className="footer-bottom">
        <span>
          © {new Date().getFullYear()} {gym.name} · {gym.city}, Tunisie
        </span>
        <Link to="/legal">Confidentialité & mentions légales</Link>
        <span>MORE THAN A GYM.</span>
      </div>
    </footer>
  );
}
