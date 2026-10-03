import { useEffect, useState } from "react";
import { api, errorMessage } from "@gym-platform/api-client";
import type { Course } from "@gym-platform/api-client";
import { ClassSchedule } from "../components/ClassSchedule";
import { gym } from "../lib/gymInfo";
export function Classes() {
  const [courses, setCourses] = useState<Course[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  useEffect(() => {
    let alive = true;
    const load = () => {
      void api.courses
        .list()
        .then((rows) => {
          if (alive) {
            setCourses(rows);
            setError("");
          }
        })
        .catch((e) => {
          if (alive) setError(errorMessage(e));
        })
        .finally(() => {
          if (alive) setLoading(false);
        });
    };
    const refresh = () => {
      if (document.visibilityState === "visible") load();
    };
    load();
    window.addEventListener("focus", refresh);
    document.addEventListener("visibilitychange", refresh);
    const timer = window.setInterval(refresh, 30000);
    return () => {
      alive = false;
      window.removeEventListener("focus", refresh);
      document.removeEventListener("visibilitychange", refresh);
      window.clearInterval(timer);
    };
  }, []);
  return (
    <>
      <section className="page-intro section">
        <p className="eyebrow">Cours & challenges</p>
        <h1>
          VOTRE ÉNERGIE.
          <br />
          <em>NOTRE COLLECTIF.</em>
        </h1>
        <p>
          Retrouvez les cours et créneaux publiés par l’équipe Gym Park.
          Connectez-vous pour réserver votre place.
        </p>
      </section>
      <section className="section page-body">
        {loading ? (
          <p className="loading-state">Chargement des cours…</p>
        ) : error ? (
          <p className="api-error" role="alert">
            {error}
          </p>
        ) : courses.length ? (
          <div className="activity-grid">
            {courses.map((c, i) => (
              <article className="activity-card" key={c.id}>
                {c.imageUrl ? (
                  <img
                    src={c.imageUrl}
                    alt={c.name}
                    loading="lazy"
                    className="course-image"
                  />
                ) : (
                  <div className="activity-art" aria-hidden="true">
                    <span>{["↗", "✳", "↔", "◎"][i % 4]}</span>
                    <small>GP / {String(i + 1).padStart(2, "0")}</small>
                  </div>
                )}
                <div className="activity-copy">
                  <span className="eyebrow">{c.category}</span>
                  <h3>{c.name}</h3>
                  <p>{c.description}</p>
                  {c.coachName && <p>Coach : {c.coachName}</p>}
                  {c.womenOnly && (
                    <span className="demo-label">Séance femmes</span>
                  )}
                  <a href="#planning">Voir les séances ↗</a>
                </div>
              </article>
            ))}
          </div>
        ) : (
          <div className="empty-state">
            Les prochains cours seront affichés dès leur publication par le
            club.
          </div>
        )}
        <ClassSchedule />
        <div className="info-panel">
          <h2>Une question sur les cours ?</h2>
          <p>L’équipe vous accompagne pour votre première séance.</p>
          <a className="gp-button outline" href={gym.phoneHref}>
            Contacter l’accueil ↗
          </a>
        </div>
      </section>
    </>
  );
}
