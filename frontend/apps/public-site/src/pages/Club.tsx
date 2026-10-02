import { Link } from "react-router-dom";
import { gallery, gym } from "../lib/gymInfo";
import { FinalCTA, LocationBlock } from "../components/BrandSections";
import { HoursTicker } from "../components/layout/HoursTicker";
export function Club() {
  return (
    <>
      <section className="club-intro section">
        <div>
          <p className="eyebrow">Gym Park / Ezzahra</p>
          <h1>
            UN LIEU POUR
            <br />
            <em>ALLER PLUS LOIN.</em>
          </h1>
          <p>
            Musculation. Cardio. Coaching. Et cette énergie qui donne envie de
            revenir.
          </p>
          <Link className="gp-button" to="/cours">
            Découvrir les cours ↗
          </Link>
        </div>
        <figure>
          <img
            src={gym.hero}
            alt="Visuel de marque décoratif : athlète en entraînement"
          />
          <figcaption>
            Univers visuel Gym Park · illustration de marque
          </figcaption>
        </figure>
      </section>
      <HoursTicker />
      <section className="section">
        <div className="club-grid">
          {[
            ["Musculation", "Faites de la force votre prochain objectif."],
            [
              "Cardio",
              "Trouvez votre rythme et donnez du mouvement à votre semaine.",
            ],
            [
              "Cours collectifs",
              "Body Attack, Body Combat, Pump et Spinning : partagez l’énergie.",
            ],
            ["Coaching", "Retrouvez les cours et événements encadrés du club."],
            ["Communauté", "S’entraîner ensemble, s’encourager et avancer."],
            [
              "Challenges",
              "Des défis cardio et force pour sortir de la routine.",
            ],
          ].map(([title, text], i) => (
            <article key={title}>
              <span className="eyebrow">0{i + 1}</span>
              <h2>{title}</h2>
              <p>{text}</p>
            </article>
          ))}
        </div>
        <div className="info-panel">
          <p className="eyebrow">La vie au club</p>
          {gallery.length > 0 && (
            <div className="club-grid">
              {gallery.map((photo) => (
                <figure key={photo.src}>
                  <img src={photo.src} alt={photo.alt} loading="lazy" />
                  {photo.caption && <figcaption>{photo.caption}</figcaption>}
                </figure>
              ))}
            </div>
          )}
          <h2>Rencontrez-nous sur place.</h2>
          <p>
            {gallery.length === 0
              ? "La galerie du club arrive prochainement. En attendant, retrouvez Gym Park et ses actualités sur Instagram."
              : "Retrouvez aussi la vie du club et ses actualités sur Instagram."}
          </p>
          <a
            className="text-link"
            href={gym.instagram}
            target="_blank"
            rel="noreferrer"
          >
            Suivre @gym_park_ ↗
          </a>
        </div>
      </section>
      <LocationBlock />
      <FinalCTA />
    </>
  );
}
