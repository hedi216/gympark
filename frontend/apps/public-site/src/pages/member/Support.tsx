import { demoSupportTickets as tickets } from "../../lib/demoData";
import { useId, useState } from "react";
import type { FormEvent } from "react";
import { DashboardLayout } from "../../components/member/DashboardLayout";
import { TextField } from "../../components/primitives/TextField";
import { Button } from "../../components/primitives/Button";
import { Reveal } from "../../components/primitives/Reveal";
import { gym } from "../../lib/gymInfo";
import sharedStyles from "./member.module.css";
import styles from "./Support.module.css";

function badgeClass(status: string, styles: typeof sharedStyles) {
  if (status === "Résolu") return styles.positive;
  if (status === "En attente de réponse") return styles.warning;
  return styles.neutral;
}

export function Support() {
  const [subject, setSubject] = useState("");
  const [category, setCategory] = useState("Abonnement");
  const [message, setMessage] = useState("");
  const [sent, setSent] = useState(false);
  const categoryId = useId();
  const messageId = useId();

  function handleSubmit(e: FormEvent) {
    e.preventDefault();
    if (!subject || !message) return;
    setSent(true);
  }

  return (
    <DashboardLayout>
      <div className={sharedStyles.page}>
        <div className={sharedStyles.head}>
          <div>
            <h1 className={sharedStyles.title}>Support</h1>
            <p className={sharedStyles.subtitle}>
              Une question sur votre compte ? Écrivez-nous.
            </p>
          </div>
          <span className={sharedStyles.previewTag}>
            Données de démonstration
          </span>
        </div>

        <div className={sharedStyles.sectionTitle}>Nouvelle demande</div>
        <div className={styles.formRow}>
          <Reveal>
            <form
              onSubmit={handleSubmit}
              noValidate
              className={sharedStyles.form}
            >
              <TextField
                label="Sujet"
                value={subject}
                onChange={setSubject}
                required
              />

              <div className={sharedStyles.field}>
                <label htmlFor={categoryId} className={sharedStyles.label}>
                  Catégorie
                </label>
                <select
                  id={categoryId}
                  className={sharedStyles.select}
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                >
                  <option>Abonnement</option>
                  <option>Paiement</option>
                  <option>Pause</option>
                  <option>Carte QR</option>
                  <option>Récompense</option>
                  <option>Problème technique</option>
                  <option>Autre</option>
                </select>
              </div>

              <div className={sharedStyles.field}>
                <label htmlFor={messageId} className={sharedStyles.label}>
                  Message *
                </label>
                <textarea
                  id={messageId}
                  className={sharedStyles.textarea}
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  required
                />
              </div>

              {sent ? (
                <div className={sharedStyles.empty} role="status">
                  Demande prête à être envoyée — le système de tickets arrive
                  avec le backend.
                </div>
              ) : (
                <Button type="submit" variant="primary">
                  Envoyer la demande
                </Button>
              )}
            </form>
          </Reveal>

          <Reveal delay={100} className={styles.formImage}>
            <img src={gym.logo} alt="Gym Park Support" />
          </Reveal>
        </div>

        <div className={sharedStyles.sectionTitle}>Historique des demandes</div>
        <Reveal delay={100} className={sharedStyles.list}>
          {tickets.map((t) => (
            <div className={sharedStyles.row} key={t.subject}>
              <div className={sharedStyles.rowMain}>
                <span className={sharedStyles.rowTitle}>{t.subject}</span>
                <span className={sharedStyles.rowMeta}>
                  {t.category} · {t.date}
                </span>
              </div>
              <span
                className={`${sharedStyles.badge} ${badgeClass(t.status, sharedStyles)}`}
              >
                {t.status}
              </span>
            </div>
          ))}
        </Reveal>
      </div>
    </DashboardLayout>
  );
}
