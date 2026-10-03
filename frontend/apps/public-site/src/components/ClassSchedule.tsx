import { useCallback, useEffect, useRef, useState } from "react";
import { Link } from "react-router-dom";
import { api, errorMessage, useAuth } from "@gym-platform/api-client";
import type { ClassSession, Reservation } from "@gym-platform/api-client";
import { Modal } from "@gym-platform/design-system";
import { dayLabels, gym, localDate } from "../lib/gymInfo";
export function ClassSchedule() {
  const requestVersion = useRef(0);
  const invalidate = useCallback(() => { requestVersion.current++; }, []);
  const { user } = useAuth();
  const [offset, setOffset] = useState(0);
  const [sessions, setSessions] = useState<ClassSession[]>([]);
  const [reservations, setReservations] = useState<Reservation[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [busy, setBusy] = useState<string | null>(null);
  const [cancel, setCancel] = useState<ClassSession | null>(null);
  const today = new Date(`${localDate()}T12:00:00Z`);
  today.setUTCDate(
    today.getUTCDate() - ((today.getUTCDay() + 6) % 7) + offset * 7,
  );
  const from = today.toISOString().slice(0, 10);
  const dates = Array.from({ length: 7 }, (_, i) => {
    const d = new Date(today);
    d.setUTCDate(d.getUTCDate() + i);
    return d;
  });
  const to = dates[6].toISOString().slice(0, 10);
  const load = useCallback(
    async (silent = false) => {
      const version = ++requestVersion.current;
      if (!silent) setLoading(true);
      setError("");
      try {
        const [rows, mine] = await Promise.all([
          api.sessions.list(from, to),
          user?.role === "MEMBER"
            ? api.reservations.list()
            : Promise.resolve([]),
        ]);
        if (version === requestVersion.current) {
          setSessions(rows);
          setReservations(mine);
        }
      } catch (e) {
        if (version === requestVersion.current) setError(errorMessage(e));
      } finally {
        if (version === requestVersion.current) setLoading(false);
      }
    },
    [from, to, user?.role],
  );
  useEffect(() => {
    void load();
    const refresh = () => {
      if (document.visibilityState === "visible") void load(true);
    };
    window.addEventListener("focus", refresh);
    document.addEventListener("visibilitychange", refresh);
    const timer = window.setInterval(refresh, 30000);
    return () => {
      invalidate();
      window.removeEventListener("focus", refresh);
      document.removeEventListener("visibilitychange", refresh);
      window.clearInterval(timer);
    };
  }, [load, invalidate]);
  async function book(session: ClassSession) {
    setBusy(session.id);
    setError("");
    setSuccess("");
    try {
      await api.reservations.book(session.id);
      await load();
      setSuccess(`Réservation confirmée : ${session.courseName}.`);
    } catch (e) {
      setError(errorMessage(e));
    } finally {
      setBusy(null);
    }
  }
  async function cancelBooking() {
    if (!cancel) return;
    setBusy(cancel.id);
    try {
      await api.reservations.cancel(cancel.id);
      setCancel(null);
      await load();
      setSuccess("Réservation annulée. La place est à nouveau disponible.");
    } catch (e) {
      setError(errorMessage(e));
    } finally {
      setBusy(null);
    }
  }
  const format = (date: Date) =>
    date.toLocaleDateString("fr-FR", {
      timeZone: gym.timezone,
      day: "numeric",
      month: "short",
    });
  const time = (instant: string) =>
    new Date(instant).toLocaleTimeString("fr-FR", {
      timeZone: gym.timezone,
      hour: "2-digit",
      minute: "2-digit",
    });
  return (
    <div id="planning" className="schedule">
      <div className="section-heading">
        <div>
          <p className="eyebrow">Votre semaine au club · heure de Tunis</p>
          <h2>LE PLANNING.</h2>
        </div>
        <div className="week-control">
          <button
            aria-label="Semaine précédente"
            onClick={() => setOffset((v) => v - 1)}
          >
            ←
          </button>
          <span aria-live="polite">
            {format(dates[0])} — {format(dates[6])}
          </span>
          <button
            aria-label="Semaine suivante"
            onClick={() => setOffset((v) => v + 1)}
          >
            →
          </button>
        </div>
      </div>
      {error && (
        <div className="api-error" role="alert">
          {error}{" "}
          <button
            className="action-button secondary"
            onClick={() => void load()}
          >
            Réessayer
          </button>
        </div>
      )}
      {success && (
        <p className="api-success" role="status">
          {success}
        </p>
      )}
      {loading ? (
        <p className="loading-state">Chargement du planning…</p>
      ) : (
        <div className="schedule-days">
          {dates.map((date) => {
            const key = date.toISOString().slice(0, 10);
            const rows = sessions.filter(
              (s) => localDate(new Date(s.startsAt)) === key,
            );
            return (
              <article key={key}>
                <h3>
                  {dayLabels[date.getUTCDay()]} <small>{format(date)}</small>
                </h3>
                {rows.length ? (
                  rows.map((s) => {
                    const booked = reservations.some(
                      (r) => r.session.id === s.id && r.status === "Booked",
                    );
                    const past = new Date(s.startsAt) <= new Date();
                    return (
                      <div className="session" key={s.id}>
                        <strong>{s.courseName}</strong>
                        <time dateTime={s.startsAt}>
                          {time(s.startsAt)} – {time(s.endsAt)}
                        </time>
                        {s.coach && <span>Coach : {s.coach}</span>}
                        {s.womenOnly && (
                          <span className="demo-label">Séance femmes</span>
                        )}
                        <span className="session-state">
                          {s.status === "Cancelled"
                            ? "ANNULÉ"
                            : s.remainingPlaces === 0
                              ? "COMPLET"
                              : `${s.remainingPlaces} / ${s.capacity} places disponibles`}
                        </span>
                        {s.reservationRequired && (
                          <span>Réservation requise</span>
                        )}
                        {booked && (
                          <strong>Votre réservation est confirmée</strong>
                        )}
                        <div className="session-actions">
                          {user?.role === "MEMBER" ? (
                            booked && !past ? (
                              <button
                                className="action-button secondary"
                                onClick={() => setCancel(s)}
                              >
                                Annuler ma réservation
                              </button>
                            ) : (
                              <button
                                className="action-button"
                                disabled={
                                  busy !== null ||
                                  s.status === "Cancelled" ||
                                  s.remainingPlaces === 0 ||
                                  past ||
                                  booked
                                }
                                onClick={() => void book(s)}
                              >
                                {busy === s.id ? "Réservation…" : "Réserver"}
                              </button>
                            )
                          ) : !user ? (
                            <Link to="/connexion" className="text-link">
                              Se connecter pour réserver
                            </Link>
                          ) : (
                            <span>Réservations depuis la console équipe</span>
                          )}
                        </div>
                      </div>
                    );
                  })
                ) : (
                  <p>Aucune séance publiée</p>
                )}
              </article>
            );
          })}
        </div>
      )}
      {cancel && (
        <Modal title="Annuler ma réservation ?" onClose={() => setCancel(null)}>
          <p>
            {cancel.courseName} · {format(new Date(cancel.startsAt))} à{" "}
            {time(cancel.startsAt)}
          </p>
          <div className="form-actions">
            <button
              className="action-button danger"
              disabled={busy !== null}
              onClick={() => void cancelBooking()}
            >
              Confirmer l’annulation
            </button>
            <button
              className="action-button secondary"
              onClick={() => setCancel(null)}
            >
              Garder ma place
            </button>
          </div>
          {error && (
            <p role="alert" className="api-error">
              {error}
            </p>
          )}
        </Modal>
      )}
    </div>
  );
}
