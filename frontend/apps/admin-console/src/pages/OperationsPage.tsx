import { useCallback, useEffect, useState } from "react";
import type { FormEvent } from "react";
import { Link } from "react-router-dom";
import { api, errorMessage, useAuth } from "@gym-platform/api-client";
import type {
  Account,
  CheckIn,
  Payment,
  Subscription,
} from "@gym-platform/api-client";
import { Modal } from "@gym-platform/design-system";
import config from "../../../../../config/gym-park.json" with { type: "json" };
export function Overview() {
  const [data, setData] = useState<{
    members: number;
    upcomingSessions: number;
    upcomingReservations: number;
  } | null>(null);
  const [error, setError] = useState("");
  useEffect(() => {
    api.operations
      .overview()
      .then(setData)
      .catch((e) => setError(errorMessage(e)));
  }, []);
  return (
    <>
      <p className="eyebrow">Gym Park · gestion quotidienne</p>
      <h1>Vue d’ensemble</h1>
      {error ? (
        <p className="api-error" role="alert">
          {error}
        </p>
      ) : !data ? (
        <p className="loading-state">Chargement…</p>
      ) : (
        <div className="member-stats">
          <article>
            <strong>{data.members}</strong>
            <span>Adhérents actifs</span>
          </article>
          <article>
            <strong>{data.upcomingSessions}</strong>
            <span>Séances à venir</span>
          </article>
          <article>
            <strong>{data.upcomingReservations}</strong>
            <span>Réservations à venir</span>
          </article>
        </div>
      )}
      <div className="form-actions">
        <Link className="action-button" to="/adherents">
          Gérer les adhérents
        </Link>
        <Link className="action-button secondary" to="/cours">
          Ouvrir le planning
        </Link>
      </div>
    </>
  );
}
export function Settings() {
  const { user } = useAuth();
  return (
    <>
      <p className="eyebrow">Club & compte</p>
      <h1>Paramètres</h1>
      <div className="management-card">
        <h2>{config.name}</h2>
        <p>
          {config.addressLine}
          <br />
          {config.phone}
          <br />
          Fuseau horaire : {config.timezone}
        </p>
        <p>
          Les données publiques du club sont gérées dans la configuration du
          projet.
        </p>
      </div>
      <div className="management-card">
        <h2>Mon compte</h2>
        <p>
          {user?.email} · {user?.role === "ADMIN" ? "ADMIN" : "EMPLOYÉ"}
        </p>
        <Link className="action-button" to="/changer-mot-de-passe">
          Changer mon mot de passe
        </Link>
      </div>
    </>
  );
}
export function OperationsPage({
  section,
}: {
  section: "subscriptions" | "attendance" | "payments";
}) {
  const [rows, setRows] = useState<(Subscription | Payment | CheckIn)[]>([]);
  const [members, setMembers] = useState<Account[]>([]);
  const [search, setSearch] = useState("");
  const [memberId, setMemberId] = useState("");
  const [planCode, setPlanCode] = useState(config.plans[0].id);
  const [startDate, setStartDate] = useState(
    new Intl.DateTimeFormat("en-CA", {
      timeZone: config.timezone,
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
    }).format(new Date()),
  );
  const [amount, setAmount] = useState(0);
  const [method, setMethod] = useState("Espèces");
  const [show, setShow] = useState(false);
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [cancel, setCancel] = useState<string | null>(null);
  const load = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      setRows(await api.operations[section]());
    } catch (e) {
      setError(errorMessage(e));
    } finally {
      setLoading(false);
    }
  }, [section]);
  useEffect(() => {
    void load();
  }, [load]);
  useEffect(() => {
    const timer = setTimeout(() => {
      api
        .accounts("members")
        .list(new URLSearchParams({ search, active: "true" }).toString())
        .then((p) => setMembers(p.items))
        .catch((e) => setError(errorMessage(e)));
    }, 200);
    return () => clearTimeout(timer);
  }, [search]);
  const title = {
    subscriptions: "Abonnements",
    attendance: "Présences",
    payments: "Paiements",
  }[section];
  async function save(e: FormEvent) {
    e.preventDefault();
    setBusy(true);
    setError("");
    try {
      if (section === "subscriptions")
        await api.operations.subscribe(memberId, {
          planCode,
          startDate,
          amountPaid: amount,
        });
      else if (section === "attendance") await api.operations.checkin(memberId);
      else await api.operations.payment(memberId, amount, method);
      setShow(false);
      setSuccess("Enregistrement effectué.");
      await load();
    } catch (e) {
      setError(errorMessage(e));
    } finally {
      setBusy(false);
    }
  }
  async function cancelSubscription() {
    if (!cancel) return;
    setBusy(true);
    try {
      await api.operations.cancelSubscription(cancel);
      setCancel(null);
      await load();
    } catch (e) {
      setError(errorMessage(e));
    } finally {
      setBusy(false);
    }
  }
  return (
    <>
      <div className="toolbar">
        <h1>{title}</h1>
        <button
          className="action-button"
          onClick={() => {
            setShow(true);
            setError("");
            setMemberId("");
          }}
        >
          Ajouter{" "}
          {section === "subscriptions"
            ? "un abonnement"
            : section === "attendance"
              ? "une présence"
              : "un paiement"}
        </button>
      </div>
      {section === "payments" && (
        <p>
          Enregistrement manuel des paiements reçus. Aucun prélèvement bancaire
          n’est effectué.
        </p>
      )}
      {error && !show && !cancel && (
        <div className="api-error" role="alert">
          {error}
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
        <p className="loading-state">Chargement…</p>
      ) : rows.length ? (
        <div className="management-list">
          {rows.map((row) => (
            <article className="management-card" key={row.id}>
              <h3>{row.member}</h3>
              {"plan" in row && (
                <>
                  <p>
                    {row.plan} · {row.startDate} — {row.endDate} · {row.status}
                  </p>
                  <p>Montant déclaré payé : {row.amountPaid} DT</p>
                  {row.status === "Active" && (
                    <button
                      className="action-button secondary"
                      onClick={() => setCancel(row.id)}
                    >
                      Annuler l’abonnement
                    </button>
                  )}
                </>
              )}
              {"amount" in row && (
                <p>
                  {row.amount} DT · {row.method} ·{" "}
                  {row.status === "Paid" ? "Payé" : row.status}
                </p>
              )}
              {"checkedInAt" in row && (
                <p>
                  {new Date(row.checkedInAt).toLocaleString("fr-FR", {
                    timeZone: config.timezone,
                  })}
                </p>
              )}
            </article>
          ))}
        </div>
      ) : (
        <p className="empty-state">Aucun enregistrement.</p>
      )}
      <p className="eyebrow">Les 200 derniers enregistrements</p>
      {show && (
        <Modal
          title={`Ajouter · ${title}`}
          onClose={() => !busy && setShow(false)}
        >
          <form className="form-grid" onSubmit={save}>
            <label>
              Rechercher l’adhérent
              <input
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </label>
            <label>
              Adhérent
              <select
                required
                value={memberId}
                onChange={(e) => setMemberId(e.target.value)}
              >
                <option value="">Choisir</option>
                {members.map((m) => (
                  <option key={m.id} value={m.memberId!}>
                    {m.email}
                  </option>
                ))}
              </select>
            </label>
            {section === "subscriptions" && (
              <>
                <label>
                  Formule
                  <select
                    value={planCode}
                    onChange={(e) => setPlanCode(e.target.value)}
                  >
                    {config.plans.map((p) => (
                      <option key={p.id} value={p.id}>
                        {p.name} · {p.durationLabel} · {p.price} DT
                      </option>
                    ))}
                  </select>
                </label>
                <label>
                  Date de début
                  <input
                    type="date"
                    value={startDate}
                    onChange={(e) => setStartDate(e.target.value)}
                    required
                  />
                </label>
                <p>
                  Les frais d’inscription et paiements se consignent séparément.
                  Aucun paiement n’est généré automatiquement.
                </p>
              </>
            )}
            {section !== "attendance" && (
              <label>
                {section === "subscriptions"
                  ? "Montant déclaré payé (DT)"
                  : "Montant reçu (DT)"}
                <input
                  type="number"
                  min={section === "payments" ? 0.001 : 0}
                  max={100000}
                  step="0.001"
                  value={amount}
                  onChange={(e) => setAmount(Number(e.target.value))}
                  required
                />
              </label>
            )}
            {section === "payments" && (
              <label>
                Méthode
                <input
                  value={method}
                  onChange={(e) => setMethod(e.target.value)}
                  maxLength={80}
                  required
                />
              </label>
            )}
            {error && (
              <p className="api-error" role="alert">
                {error}
              </p>
            )}
            <button className="action-button" disabled={busy}>
              Enregistrer
            </button>
          </form>
        </Modal>
      )}
      {cancel && (
        <Modal title="Annuler cet abonnement ?" onClose={() => setCancel(null)}>
          <p>L’historique et les paiements sont conservés.</p>
          {error && (
            <p className="api-error" role="alert">
              {error}
            </p>
          )}
          <div className="form-actions">
            <button
              className="action-button danger"
              disabled={busy}
              onClick={() => void cancelSubscription()}
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
        </Modal>
      )}
    </>
  );
}
