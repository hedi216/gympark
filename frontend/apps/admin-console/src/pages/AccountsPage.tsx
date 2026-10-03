import { useCallback, useEffect, useState } from "react";
import type { FormEvent } from "react";
import { api, errorMessage, useAuth } from "@gym-platform/api-client";
import type {
  Account,
  AccountInput,
  MemberData,
  Page,
  ProvisionedAccount,
} from "@gym-platform/api-client";
import { Modal } from "@gym-platform/design-system";
type Kind = "members" | "employees";
export function AccountsPage({ kind }: { kind: Kind }) {
  const { user } = useAuth();
  const [data, setData] = useState<Page<Account>>({
    items: [],
    total: 0,
    page: 1,
    pageSize: 20,
  });
  const [search, setSearch] = useState("");
  const [active, setActive] = useState("");
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [edit, setEdit] = useState<Account | "new" | null>(null);
  const [form, setForm] = useState<AccountInput>({
    email: "",
    firstName: "",
    lastName: "",
    phone: "",
  });
  const [createKind, setCreateKind] = useState<Kind>(kind);
  const [secret, setSecret] = useState<ProvisionedAccount | null>(null);
  const [copied, setCopied] = useState(false);
  const [busy, setBusy] = useState(false);
  const [confirm, setConfirm] = useState<{
    account: Account;
    action: "reset" | "status";
  } | null>(null);
  const [detail, setDetail] = useState<Account | null>(null);
  const [member, setMember] = useState<MemberData | null>(null);
  const [detailLoading, setDetailLoading] = useState(false);
  const load = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      setData(
        await api
          .accounts(kind)
          .list(
            new URLSearchParams({
              search,
              page: String(page),
              ...(active ? { active } : {}),
            }).toString(),
          ),
      );
    } catch (e) {
      setError(errorMessage(e));
    } finally {
      setLoading(false);
    }
  }, [kind, search, page, active]);
  useEffect(() => {
    const timer = setTimeout(() => void load(), 180);
    return () => clearTimeout(timer);
  }, [load]);
  useEffect(() => {
    setPage(1);
    setSearch("");
    setActive("");
  }, [kind]);
  function open(account: Account | "new") {
    setError("");
    setCreateKind(kind);
    setEdit(account);
    setForm(
      account === "new"
        ? { email: "", firstName: "", lastName: "", phone: "" }
        : {
            email: account.email,
            firstName: account.firstName,
            lastName: account.lastName,
            phone: account.phone ?? "",
          },
    );
  }
  async function save(e: FormEvent) {
    e.preventDefault();
    setBusy(true);
    setError("");
    try {
      if (edit === "new") {
        const result = await api.accounts(createKind).create(form);
        setSecret(result);
        setCopied(false);
      } else if (edit) {
        await api.accounts(kind).edit(edit.id, form);
        setSuccess("Profil enregistré.");
      }
      setEdit(null);
      await load();
    } catch (e) {
      setError(errorMessage(e));
    } finally {
      setBusy(false);
    }
  }
  async function apply() {
    if (!confirm) return;
    setBusy(true);
    setError("");
    try {
      if (confirm.action === "reset") {
        setSecret(await api.accounts(kind).reset(confirm.account.id));
        setCopied(false);
      } else {
        await api
          .accounts(kind)
          .setActive(confirm.account.id, !confirm.account.isActive);
        setSuccess("Statut du compte mis à jour.");
      }
      setConfirm(null);
      await load();
    } catch (e) {
      setError(errorMessage(e));
    } finally {
      setBusy(false);
    }
  }
  async function details(account: Account) {
    setDetail(account);
    setMember(null);
    setError("");
    if (account.memberId) {
      setDetailLoading(true);
      try {
        setMember(await api.operations.member(account.memberId));
      } catch (e) {
        setError(errorMessage(e));
      } finally {
        setDetailLoading(false);
      }
    }
  }
  const date = (value: string | null) =>
    value
      ? new Date(value).toLocaleString("fr-FR", {
          timeZone: "Africa/Tunis",
          dateStyle: "medium",
          timeStyle: "short",
        })
      : "Jamais";
  return (
    <>
      <div className="toolbar">
        <div>
          <p className="eyebrow">Gestion des comptes</p>
          <h1>{kind === "members" ? "Adhérents" : "Employés"}</h1>
        </div>
        <button className="action-button" onClick={() => open("new")}>
          Créer {kind === "members" ? "un adhérent" : "un employé"}
        </button>
      </div>
      <div className="filter-bar">
        <input
          aria-label="Rechercher un compte"
          placeholder="Nom, email ou numéro adhérent"
          value={search}
          onChange={(e) => {
            setSearch(e.target.value);
            setPage(1);
          }}
        />
        <select
          aria-label="Statut du compte"
          value={active}
          onChange={(e) => {
            setActive(e.target.value);
            setPage(1);
          }}
        >
          <option value="">Tous les statuts</option>
          <option value="true">Actifs</option>
          <option value="false">Inactifs</option>
        </select>
      </div>
      {error && !edit && !confirm && !detail && (
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
        <p className="loading-state">Chargement des comptes…</p>
      ) : data.items.length ? (
        <div className="data-table-wrap">
          <table className="data-table">
            <thead>
              <tr>
                <th>Compte</th>
                <th>Profil</th>
                <th>Statut</th>
                <th>Créé le</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {data.items.map((a) => (
                <tr key={a.id}>
                  <td>
                    {a.email}
                    {a.memberNumber && (
                      <small className="member-number">{a.memberNumber}</small>
                    )}
                  </td>
                  <td>
                    {`${a.firstName} ${a.lastName}`.trim() ||
                      "Profil à compléter"}
                  </td>
                  <td>
                    <span className="status-badge">
                      {a.isActive ? "Actif" : "Inactif"}
                    </span>
                    {a.mustChangePassword && <p>Mot de passe à modifier</p>}
                  </td>
                  <td>{date(a.createdAt)}</td>
                  <td>
                    <div className="table-actions">
                      <button
                        className="action-button secondary"
                        onClick={() => void details(a)}
                      >
                        Détails
                      </button>
                      <button
                        className="action-button secondary"
                        onClick={() => open(a)}
                      >
                        Modifier
                      </button>
                      <button
                        className="action-button secondary"
                        onClick={() =>
                          setConfirm({ account: a, action: "reset" })
                        }
                      >
                        Réinitialiser
                      </button>
                      <button
                        className="action-button secondary"
                        onClick={() =>
                          setConfirm({ account: a, action: "status" })
                        }
                      >
                        {a.isActive ? "Désactiver" : "Réactiver"}
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : (
        <p className="empty-state">
          Aucun compte ne correspond à votre recherche.
        </p>
      )}
      <div className="pagination">
        <button
          className="action-button secondary"
          disabled={page <= 1}
          onClick={() => setPage((p) => p - 1)}
        >
          Précédent
        </button>
        <span>
          {data.total} compte(s) · page {page}
        </span>
        <button
          className="action-button secondary"
          disabled={page * 20 >= data.total}
          onClick={() => setPage((p) => p + 1)}
        >
          Suivant
        </button>
      </div>
      {edit && (
        <Modal
          title={edit === "new" ? "Créer le compte" : "Modifier le profil"}
          onClose={() => !busy && setEdit(null)}
        >
          <form className="form-grid" onSubmit={save}>
            {edit === "new" && user?.role === "ADMIN" && (
              <label>
                Catégorie
                <select
                  value={createKind}
                  onChange={(e) => setCreateKind(e.target.value as Kind)}
                >
                  <option value="members">ADHÉRENT</option>
                  <option value="employees">EMPLOYÉ</option>
                </select>
              </label>
            )}
            {edit === "new" && user?.role === "EMPLOYEE" && (
              <p>Catégorie : ADHÉRENT</p>
            )}
            {(
              [
                "email",
                "firstName",
                "lastName",
                ...(createKind === "members" ? ["phone"] : []),
              ] as (keyof AccountInput)[]
            ).map((key, i) => (
              <label key={key}>
                {
                  [
                    "Email",
                    "Prénom (facultatif)",
                    "Nom (facultatif)",
                    "Téléphone (facultatif)",
                  ][i]
                }
                <input
                  type={key === "email" ? "email" : "text"}
                  required={key === "email"}
                  value={form[key] ?? ""}
                  maxLength={key === "email" ? 254 : key === "phone" ? 40 : 100}
                  onChange={(e) => setForm({ ...form, [key]: e.target.value })}
                />
              </label>
            ))}
            {error && (
              <p className="api-error" role="alert">
                {error}
              </p>
            )}
            <button className="action-button" disabled={busy}>
              {busy
                ? "Enregistrement…"
                : edit === "new"
                  ? "Créer le compte"
                  : "Enregistrer"}
            </button>
          </form>
        </Modal>
      )}
      {secret && (
        <Modal
          title="Compte prêt — accès temporaire"
          onClose={() => {
            setSecret(null);
            setCopied(false);
          }}
        >
          <p>{secret.account.email}</p>
          <p>Mot de passe temporaire</p>
          <code className="secret-value">{secret.temporaryPassword}</code>
          <button
            className="action-button"
            onClick={() =>
              void navigator.clipboard
                .writeText(secret.temporaryPassword)
                .then(() => setCopied(true))
                .catch(() =>
                  setError(
                    "Copie impossible. Sélectionnez le mot de passe pour le copier.",
                  ),
                )
            }
          >
            {copied ? "Copié ✓" : "Copier le mot de passe"}
          </button>
          <p className="notice">
            Ce mot de passe ne sera plus affiché. L’utilisateur devra le
            modifier lors de sa première connexion.
          </p>
          <button
            className="action-button secondary"
            onClick={() => {
              setSecret(null);
              setCopied(false);
            }}
          >
            J’ai conservé les accès
          </button>
          {error && (
            <p className="api-error" role="alert">
              {error}
            </p>
          )}
        </Modal>
      )}
      {confirm && (
        <Modal
          title={
            confirm.action === "reset"
              ? "Réinitialiser le mot de passe ?"
              : confirm.account.isActive
                ? "Désactiver ce compte ?"
                : "Réactiver ce compte ?"
          }
          onClose={() => !busy && setConfirm(null)}
        >
          <p>{confirm.account.email}</p>
          <p>Les sessions existantes seront invalidées.</p>
          {error && (
            <p className="api-error" role="alert">
              {error}
            </p>
          )}
          <div className="form-actions">
            <button
              className="action-button danger"
              disabled={busy}
              onClick={() => void apply()}
            >
              Confirmer
            </button>
            <button
              className="action-button secondary"
              onClick={() => setConfirm(null)}
            >
              Annuler
            </button>
          </div>
        </Modal>
      )}
      {detail && (
        <Modal title="Détails du compte" onClose={() => setDetail(null)}>
          <div className="person-detail">
            <strong>{detail.email}</strong>
            <p>
              {detail.firstName} {detail.lastName}
            </p>
            <p>{detail.memberNumber}</p>
            <p>
              Création : {date(detail.createdAt)}
              <br />
              Dernière connexion : {date(detail.lastLoginAt)}
            </p>
            {detailLoading ? (
              <p className="loading-state">Chargement du dossier…</p>
            ) : (
              member && (
                <>
                  <h3>Abonnements</h3>
                  {member.subscriptions.length ? (
                    member.subscriptions.map((s) => (
                      <p key={s.id}>
                        {s.name} · {s.startDate} — {s.endDate} · {s.status}
                      </p>
                    ))
                  ) : (
                    <p>Aucun abonnement enregistré.</p>
                  )}
                  <h3>Réservations à venir</h3>
                  {member.reservations.filter(
                    (r) => new Date(r.session.startsAt) > new Date(),
                  ).length ? (
                    member.reservations
                      .filter((r) => new Date(r.session.startsAt) > new Date())
                      .map((r) => (
                        <p key={r.id}>
                          {r.session.courseName} · {date(r.session.startsAt)} ·{" "}
                          {r.status}
                        </p>
                      ))
                  ) : (
                    <p>Aucune réservation à venir.</p>
                  )}
                </>
              )
            )}
            {error && (
              <p className="api-error" role="alert">
                {error}
              </p>
            )}
          </div>
        </Modal>
      )}
    </>
  );
}
