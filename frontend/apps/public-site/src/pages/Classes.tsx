import { useState } from "react";
import { ActivityCards } from "../components/BrandSections";
import {
  activities,
  classSessions,
  dayLabels,
  gym,
  localDate,
} from "../lib/gymInfo";
export function Classes() {
  const [weekOffset, setWeekOffset] = useState(0);
  const today = new Date(`${localDate()}T12:00:00Z`);
  const monday = new Date(today);
  monday.setUTCDate(
    today.getUTCDate() - ((today.getUTCDay() + 6) % 7) + weekOffset * 7,
  );
  const dates = Array.from({ length: 7 }, (_, i) => {
    const date = new Date(monday);
    date.setUTCDate(monday.getUTCDate() + i);
    return date;
  });
  const format = (date: Date) =>
    date.toLocaleDateString("fr-FR", {
      day: "numeric",
      month: "short",
      timeZone: gym.timezone,
    });
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
          Cardio, force, cycling : découvrez les activités communiquées par Gym
          Park. Les prochains créneaux sont à confirmer avec l’accueil.
        </p>
      </section>
      <section className="section page-body">
        <ActivityCards />
        <div id="planning" className="schedule">
          <div className="section-heading">
            <div>
              <p className="eyebrow">Votre semaine au club</p>
              <h2>LE PLANNING.</h2>
            </div>
            <div className="week-control">
              <button
                onClick={() => setWeekOffset((v) => v - 1)}
                aria-label="Semaine précédente"
              >
                ←
              </button>
              <span aria-live="polite">
                {format(dates[0])} — {format(dates[6])}
              </span>
              <button
                onClick={() => setWeekOffset((v) => v + 1)}
                aria-label="Semaine suivante"
              >
                →
              </button>
            </div>
          </div>
          <div className="schedule-days">
            {dates.map((date) => {
              const key = date.toISOString().slice(0, 10);
              const sessions = classSessions.filter(
                (s) => localDate(new Date(s.startsAt)) === key,
              );
              return (
                <article key={key}>
                  <h3>
                    {dayLabels[date.getUTCDay()]} <small>{format(date)}</small>
                  </h3>
                  {sessions.length ? (
                    sessions.map((session) => (
                      <div className="session" key={session.id}>
                        <strong>
                          {
                            activities.find((a) => a.id === session.activityId)
                              ?.name
                          }
                        </strong>
                        <time dateTime={session.startsAt}>
                          {new Date(session.startsAt).toLocaleTimeString(
                            "fr-FR",
                            {
                              timeZone: gym.timezone,
                              hour: "2-digit",
                              minute: "2-digit",
                            },
                          )}{" "}
                          –{" "}
                          {new Date(session.endsAt).toLocaleTimeString(
                            "fr-FR",
                            {
                              timeZone: gym.timezone,
                              hour: "2-digit",
                              minute: "2-digit",
                            },
                          )}
                        </time>
                        {session.coach && <span>Coach : {session.coach}</span>}
                        {session.intensity && (
                          <span>Intensité : {session.intensity}</span>
                        )}
                        {session.womenOnly && (
                          <span className="demo-label">Séance femmes</span>
                        )}
                        {session.specialEvent && <span>Événement spécial</span>}
                        {(session.reservationRequired ||
                          activities.find((a) => a.id === session.activityId)
                            ?.reservationRequired) && (
                          <a href={gym.phoneHref}>Réservation requise ↗</a>
                        )}
                      </div>
                    ))
                  ) : (
                    <p>Créneaux à confirmer</p>
                  )}
                </article>
              );
            })}
          </div>
          <div className="registration-note">
            <p>
              Aucun horaire permanent n’est annoncé ici sans confirmation.
              Certaines séances sont dédiées aux femmes.
            </p>
            <a className="text-link" href={gym.phoneHref}>
              Confirmer un créneau · {gym.phone} ↗
            </a>
          </div>
        </div>
        <div className="info-panel">
          <p className="eyebrow">Au-delà de la semaine</p>
          <h2>Challenges & événements.</h2>
          <p>
            Challenges cardio, force et entraînements spéciaux : les prochaines
            dates seront affichées dès leur confirmation.
          </p>
          <a
            className="gp-button outline"
            href={gym.instagram}
            target="_blank"
            rel="noreferrer"
          >
            Suivre les annonces sur Instagram ↗
          </a>
        </div>
      </section>
    </>
  );
}
