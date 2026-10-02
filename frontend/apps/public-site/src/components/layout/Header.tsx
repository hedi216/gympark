import { useEffect, useRef, useState } from "react";
import { Link, NavLink, useLocation } from "react-router-dom";
import { gym } from "../../lib/gymInfo";
const links = [
  ["/", "Accueil"],
  ["/le-club", "Le Club"],
  ["/cours", "Cours"],
  ["/abonnements", "Abonnements"],
  ["/offres", "Offres"],
  ["/contact", "Contact"],
];
export function Header() {
  const [open, setOpen] = useState(false);
  const { pathname } = useLocation();
  const dialog = useRef<HTMLDialogElement>(null);
  const toggle = useRef<HTMLButtonElement>(null);
  useEffect(() => {
    if (open) dialog.current?.showModal();
    else dialog.current?.close();
    document.body.style.overflow = open ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [open]);
  function close() {
    setOpen(false);
    toggle.current?.focus();
  }
  return (
    <header className={`site-header ${pathname === "/" ? "over-hero" : ""}`}>
      <a className="skip-link" href="#main">
        Aller au contenu
      </a>
      <Link to="/" aria-label="Gym Park — accueil" className="brand-logo">
        <img src={gym.logo} alt="Gym Park" width="78" height="78" />
      </Link>
      <nav className="desktop-nav" aria-label="Navigation principale">
        {links.map(([to, label]) => (
          <NavLink key={to} to={to} end={to === "/"}>
            {label}
          </NavLink>
        ))}
      </nav>
      <div className="header-actions">
        <Link className="member-link" to="/connexion">
          Espace membre ↗
        </Link>
        <Link className="gp-button compact" to="/rejoindre">
          Rejoindre <span>↗</span>
        </Link>
        <button
          ref={toggle}
          className="menu-toggle"
          onClick={() => setOpen(true)}
          aria-expanded={open}
          aria-controls="mobile-menu"
          aria-label="Ouvrir le menu"
        >
          ☰
        </button>
      </div>
      <dialog
        ref={dialog}
        id="mobile-menu"
        className="mobile-menu"
        onCancel={close}
        aria-label="Navigation mobile"
      >
        <div className="menu-top">
          <img src={gym.logo} alt="Gym Park" width="72" height="72" />
          <button onClick={close} aria-label="Fermer le menu">
            ✕
          </button>
        </div>
        <nav>
          {links.map(([to, label], i) => (
            <NavLink key={to} to={to} end={to === "/"} onClick={close}>
              <small>0{i + 1}</small>
              {label} <span>↗</span>
            </NavLink>
          ))}
          <Link to="/connexion" onClick={close}>
            Espace membre ↗
          </Link>
        </nav>
        <p>TRAIN HARD. STAY TOGETHER.</p>
      </dialog>
    </header>
  );
}
