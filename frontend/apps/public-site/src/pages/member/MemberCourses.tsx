import { useEffect, useState } from "react";
import { api, errorMessage } from "@gym-platform/api-client";
import type { Reservation } from "@gym-platform/api-client";
import { Modal } from "@gym-platform/design-system";
import { DashboardLayout } from "../../components/member/DashboardLayout";
import { ClassSchedule } from "../../components/ClassSchedule";
import { gym } from "../../lib/gymInfo";
export function MemberCourses() {
  return (
    <DashboardLayout>
      <div className="member-content">
        <h1>Mes cours</h1>
        <p>Choisissez une séance et réservez votre place.</p>
        <ClassSchedule />
      </div>
    </DashboardLayout>
  );
}
export function MemberReservations() {
  const [rows, setRows] = useState<Reservation[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [tab, setTab] = useState("À venir");
  const [cancel, setCancel] = useState<Reservation | null>(null);
  const [busy, setBusy] = useState(false);
  async function load() {
    setLoading(true);
    setError("");
    try {
      setRows(await api.reservations.list());
    } catch (e) {
      setError(errorMessage(e));
    } finally {
      setLoading(false);
    }
  }
  useEffect(() => {
    void load();
  }, []);
  const group = (r: Reservation) =>
    r.status === "Cancelled" || r.session.status === "Cancelled"
      ? "Annulées"
      : new Date(r.session.startsAt) > new Date()
        ? "À venir"
        : "Passées";
  async function confirm() {
    if (!cancel) return;
    setBusy(true);
    try {
      await api.reservations.cancel(cancel.session.id);
      setCancel(null);
      await load();
      setSuccess("Votre réservation a été annulée.");
    } catch (e) {
      setError(errorMessage(e));
    } finally {
      setBusy(false);
    }
  }
  const date = (value: string) =>
    new Date(value).toLocaleString("fr-FR", {
      timeZone: gym.timezone,
      dateStyle: "medium",
      timeStyle: "short",
    });
  return (
    <DashboardLayout>
      <div className="member-content">
        <h1>Mes réservations</h1>
        <div className="form-actions">
          {["À venir", "Passées", "Annulées"].map((t) => (
            <button
              className={`action-button ${t !== tab ? "secondary" : ""}`}
              aria-pressed={t === tab}
              key={t}
              onClick={() => setTab(t)}
            >
              {t}
            </button>
          ))}
        </div>
        {error && (
          <p className="api-error" role="alert">
            {error}
          </p>
        )}
        {success && (
          <p className="api-success" role="status">
            {success}
          </p>
        )}
        {loading ? (
          <p className="loading-state">Chargement…</p>
        ) : (
          <div className="management-list">
            {rows.filter((r) => group(r) === tab).length === 0 && (
              <p className="empty-state">
                Aucune réservation dans cette catégorie.
              </p>
            )}
            {rows
              .filter((r) => group(r) === tab)
              .map((r) => (
                <article className="management-card" key={r.id}>
                  <h2>{r.session.courseName}</h2>
                  <p>
                    {date(r.session.startsAt)} ·{" "}
                    {r.session.coach ?? "Coach non précisé"}
                  </p>
                  <p>
                    {r.session.status === "Cancelled"
                      ? "Séance annulée par le club"
                      : r.status === "Cancelled"
                        ? "Réservation annulée"
                        : "Réservation confirmée"}
                  </p>
                  {r.session.womenOnly && (
                    <span className="status-badge">Séance femmes</span>
                  )}
                  {r.status === "Booked" &&
                    new Date(r.session.startsAt) > new Date() && (
                      <button
                        className="action-button secondary"
                        onClick={() => setCancel(r)}
                      >
                        Annuler ma réservation
                      </button>
                    )}
                </article>
              ))}
          </div>
        )}
        {cancel && (
          <Modal
            title="Annuler ma réservation ?"
            onClose={() => setCancel(null)}
          >
            <p>
              {cancel.session.courseName} · {date(cancel.session.startsAt)}
            </p>
            <div className="form-actions">
              <button
                className="action-button danger"
                disabled={busy}
                onClick={() => void confirm()}
              >
                Confirmer l’annulation
              </button>
              <button
                className="action-button secondary"
                onClick={() => setCancel(null)}
              >
                Retour
              </button>
            </div>
            {error && (
              <p className="api-error" role="alert">
                {error}
              </p>
            )}
          </Modal>
        )}
      </div>
    </DashboardLayout>
  );
}
