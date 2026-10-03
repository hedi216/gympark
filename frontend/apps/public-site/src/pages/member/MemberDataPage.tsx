import { useEffect, useState } from "react";
import type { FormEvent } from "react";
import { Link } from "react-router-dom";
import { api, errorMessage } from "@gym-platform/api-client";
import type { MemberData } from "@gym-platform/api-client";
import { DashboardLayout } from "../../components/member/DashboardLayout";
import { gym, localDate } from "../../lib/gymInfo";
const titles: Record<string, string> = {
  overview: "Mon espace Gym Park",
  membership: "Mon abonnement",
  card: "Carte membre",
  attendance: "Mon assiduité",
  payments: "Mes paiements",
  history: "Historique des abonnements",
  profile: "Mon profil",
};
export function MemberDataPage({ section }: { section: string }) {
  const [data, setData] = useState<MemberData | null>(null);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [success, setSuccess] = useState("");
  useEffect(() => {
    setLoading(true);
    setError("");
    api.member
      .get()
      .then(setData)
      .catch((e) => setError(errorMessage(e)))
      .finally(() => setLoading(false));
  }, [section]);
  async function save(e: FormEvent) {
    e.preventDefault();
    if (!data) return;
    setSaving(true);
    setError("");
    try {
      await api.member.profile({
        firstName: data.firstName,
        lastName: data.lastName,
        phone: data.phone,
      });
      setSuccess("Profil enregistré.");
    } catch (e) {
      setError(errorMessage(e));
    } finally {
      setSaving(false);
    }
  }
  const date = (value: string) =>
    new Date(
      value.length === 10 ? `${value}T12:00:00Z` : value,
    ).toLocaleDateString("fr-FR", { timeZone: gym.timezone });
  return (
    <DashboardLayout>
      <div className="member-content">
        <p className="eyebrow">Votre compte personnel</p>
        <h1>{titles[section]}</h1>
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
          <p className="loading-state">Chargement de vos informations…</p>
        ) : (
          data && (
            <>
              {section === "overview" && (
                <>
                  <p>
                    Bienvenue{data.firstName ? `, ${data.firstName}` : ""}.
                    Retrouvez vos informations et vos prochains entraînements.
                  </p>
                  <div className="member-stats">
                    <article>
                      <strong>
                        {
                          data.subscriptions.filter(
                            (s) =>
                              s.status === "Active" &&
                              s.startDate <= localDate() &&
                              s.endDate >=
                                localDate(),
                          ).length
                        }
                      </strong>
                      <span>Abonnement(s) actif(s)</span>
                    </article>
                    <article>
                      <strong>
                        {
                          data.reservations.filter(
                            (r) =>
                              r.status === "Booked" &&
                              r.session.status !== "Cancelled" &&
                              new Date(r.session.startsAt) > new Date(),
                          ).length
                        }
                      </strong>
                      <span>Réservations à venir</span>
                    </article>
                    <article>
                      <strong>{data.attendance.length}</strong>
                      <span>Passages enregistrés</span>
                    </article>
                  </div>
                  <div className="button-row">
                    <Link className="gp-button" to="/espace-membre/cours">
                      Réserver un cours ↗
                    </Link>
                    <Link
                      className="text-link"
                      to="/espace-membre/reservations"
                    >
                      Mes réservations ↗
                    </Link>
                  </div>
                </>
              )}
              {(section === "membership" || section === "history") && (
                <>
                  {data.subscriptions.length === 0 ? (
                    <p className="empty-state">
                      Aucun abonnement enregistré. Contactez l’accueil pour
                      activer votre formule.
                    </p>
                  ) : (
                    <div className="management-list">
                      {data.subscriptions.map((s) => (
                        <article key={s.id} className="management-card">
                          <h2>{s.name}</h2>
                          <p>
                            {date(s.startDate)} — {date(s.endDate)}
                          </p>
                          <p>
                            {s.status === "Active"
                              ? s.endDate <
                                localDate()
                                ? "Expiré"
                                : s.startDate > localDate() ? "À venir" : "Actif"
                              : s.status === "Cancelled"
                                ? "Annulé"
                                : s.status}{" "}
                            · Montant déclaré payé : {s.amountPaid} DT
                          </p>
                        </article>
                      ))}
                    </div>
                  )}
                  <Link className="text-link" to="/contact">
                    Contacter l’accueil ↗
                  </Link>
                </>
              )}
              {section === "card" && (
                <div className="own-card">
                  <img src={gym.logo} alt="Gym Park" />
                  <strong>
                    {`${data.firstName} ${data.lastName}`.trim() || data.email}
                  </strong>
                  <p>{data.memberNumber}</p>
                  <p>{data.email}</p>
                  <p>
                    Cette carte identifie votre compte. Le contrôle d’accès par
                    QR n’est pas encore activé.
                  </p>
                </div>
              )}
              {section === "attendance" &&
                (data.attendance.length ? (
                  <div className="management-list">
                    {data.attendance.map((a) => (
                      <article className="management-card" key={a.id}>
                        {new Date(a.checkedInAt).toLocaleString("fr-FR", {
                          timeZone: gym.timezone,
                        })}
                      </article>
                    ))}
                  </div>
                ) : (
                  <p className="empty-state">Aucun passage enregistré.</p>
                ))}
              {section === "payments" &&
                (data.payments.length ? (
                  <div className="management-list">
                    {data.payments.map((p) => (
                      <article className="management-card" key={p.id}>
                        <h2>{p.amount} DT</h2>
                        <p>
                          {date(p.createdAt)} · {p.method} ·{" "}
                          {p.status === "Paid" ? "Payé" : p.status}
                        </p>
                      </article>
                    ))}
                  </div>
                ) : (
                  <p className="empty-state">Aucun paiement enregistré.</p>
                ))}
              {section === "profile" && (
                <form className="form-grid" onSubmit={save}>
                  <label>
                    Email
                    <input value={data.email} disabled />
                  </label>
                  {(["firstName", "lastName", "phone"] as const).map(
                    (field, i) => (
                      <label key={field}>
                        {["Prénom", "Nom", "Téléphone"][i]}
                        <input
                          value={data[field]}
                          maxLength={field === "phone" ? 40 : 100}
                          onChange={(e) =>
                            setData({ ...data, [field]: e.target.value })
                          }
                        />
                      </label>
                    ),
                  )}
                  <p>Pour changer votre email, contactez l’accueil.</p>
                  <button className="action-button" disabled={saving}>
                    {saving ? "Enregistrement…" : "Enregistrer le profil"}
                  </button>
                  <Link className="text-link" to="/changer-mot-de-passe">
                    Changer mon mot de passe
                  </Link>
                </form>
              )}
            </>
          )
        )}
      </div>
    </DashboardLayout>
  );
}
