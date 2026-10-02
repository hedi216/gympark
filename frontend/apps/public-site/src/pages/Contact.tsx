import { dayLabels, gym, openingHours } from "../lib/gymInfo";
import { LocationBlock } from "../components/BrandSections";
import { useOpenStatus } from "../lib/useOpenStatus";
export function Contact() {
  const status = useOpenStatus();
  return (
    <>
      <section className="page-intro section">
        <p className="eyebrow">Contact & horaires</p>
        <h1>
          ON SE RETROUVE
          <br />
          <em>À GYM PARK.</em>
        </h1>
        <p>
          Une question, une réservation Spinning, une première visite ?
          L’accueil est à votre écoute.
        </p>
      </section>
      <section className="section contact-grid">
        <div>
          <h2>Parlons entraînement.</h2>
          <a className="contact-number" href={gym.phoneHref}>
            {gym.phoneInternational}
          </a>
          <p>{gym.addressLine}</p>
          <a
            className="text-link"
            href={gym.instagram}
            target="_blank"
            rel="noreferrer"
          >
            Instagram · @gym_park_ ↗
          </a>
          <div className="info-panel">
            <h3>Réserver un cours</h3>
            <p>
              Pour le Spinning, appelez l’accueil. Les horaires des cours et les
              séances dédiées aux femmes sont à confirmer avec le club.
            </p>
            <a className="gp-button" href={gym.phoneHref}>
              Réserver par téléphone ↗
            </a>
          </div>
        </div>
        <div className="hours-panel">
          <p className="eyebrow">Horaires du club</p>
          <h2>
            {status.label} <small>{status.detail}</small>
          </h2>
          {[1, 2, 3, 4, 5, 6, 0].map((day) => {
            const h = openingHours.find((item) => item.day === day)!;
            return (
              <div
                className={`hours-row ${status.day === day ? "today" : ""}`}
                key={day}
              >
                <span>
                  {dayLabels[day]}
                  {status.day === day ? " · Aujourd’hui" : ""}
                </span>
                <strong>
                  {h.open} – {h.close}
                </strong>
              </div>
            );
          })}
          <p className="muted">
            Horaires en vigueur depuis le 1er septembre 2026.
          </p>
        </div>
      </section>
      <LocationBlock />
    </>
  );
}
