import { demoAnnualPlan } from "../../lib/demoData";
import { useState } from "react";
import { DashboardLayout } from "../../components/member/DashboardLayout";
import { Button } from "../../components/primitives/Button";
import { Reveal } from "../../components/primitives/Reveal";
import styles from "./member.module.css";

export function Membership() {
  const [pausing, setPausing] = useState(false);
  const [pauseDays, setPauseDays] = useState(5);

  const newExpiry = new Date(
    new Date("2027-01-12").getTime() + pauseDays * 86400000,
  ).toLocaleDateString("fr-FR", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });

  return (
    <DashboardLayout>
      <div className={styles.page}>
        <div className={styles.head}>
          <div>
            <h1 className={styles.title}>Mon abonnement</h1>
            <p className={styles.subtitle}>
              Détail de votre formule actuelle et vos options.
            </p>
          </div>
          <span className={styles.previewTag}>Données de démonstration</span>
        </div>

        <div className={styles.sectionTitle}>Formule actuelle</div>
        <Reveal className={`${styles.tileGrid} ${styles.cols4}`}>
          <div className={styles.tile}>
            <div className={styles.rowMeta}>Plan</div>
            <div className={`${styles.rowTitle} ${styles.tileValue}`}>
              Formule Annuelle
            </div>
          </div>
          <div className={styles.tile}>
            <div className={styles.rowMeta}>Statut</div>
            <div
              className={`${styles.rowTitle} ${styles.tileValue} ${styles.positiveText}`}
            >
              Actif
            </div>
          </div>
          <div className={styles.tile}>
            <div className={styles.rowMeta}>Montant payé</div>
            <div className={`${styles.rowTitle} ${styles.tileValue}`}>
              {demoAnnualPlan.price} DT
            </div>
          </div>
          <div className={styles.tile}>
            <div className={styles.rowMeta}>Points gagnés</div>
            <div className={`${styles.rowTitle} ${styles.tileValue}`}>+600</div>
          </div>
        </Reveal>

        <div className={styles.sectionTitle}>Détails</div>
        <Reveal delay={80} className={styles.list}>
          <div className={styles.row}>
            <span className={styles.rowMeta}>Date de début</span>
            <span className={styles.rowValue}>12 janvier 2026</span>
          </div>
          <div className={styles.row}>
            <span className={styles.rowMeta}>Date d'expiration</span>
            <span className={styles.rowValue}>12 janvier 2027</span>
          </div>
          <div className={styles.row}>
            <span className={styles.rowMeta}>Jours restants</span>
            <span className={styles.rowValue}>73 jours</span>
          </div>
          <div className={styles.row}>
            <span className={styles.rowMeta}>Pause disponible</span>
            <span className={styles.rowValue}>20 jours / an — 20 restants</span>
          </div>
          <div className={styles.row}>
            <span className={styles.rowMeta}>Invités offerts restants</span>
            <span className={styles.rowValue}>4</span>
          </div>
          <div className={styles.row}>
            <span className={styles.rowMeta}>Renouvellement</span>
            <span className={styles.rowValue}>
              Manuel — rappel à 14 puis 3 jours
            </span>
          </div>
        </Reveal>

        <div className={styles.sectionTitle}>Avantages inclus</div>
        <Reveal delay={160} className={`${styles.tileGrid} ${styles.cols4}`}>
          {[
            "Accès QR illimité",
            "Carte numérique",
            "Support prioritaire",
            "4 invités offerts",
          ].map((b) => (
            <div className={styles.tile} key={b}>
              {b}
            </div>
          ))}
        </Reveal>

        <div className={styles.sectionTitle}>Actions</div>
        {!pausing ? (
          <div className={styles.actionsRow}>
            <Button to="/abonnements" variant="secondary">
              Renouveler
            </Button>
            <Button to="/abonnements" variant="secondary">
              Changer de formule
            </Button>
            <Button variant="secondary" onClick={() => setPausing(true)}>
              Mettre en pause
            </Button>
            <Button to="/contact" variant="secondary">
              Contacter l'accueil
            </Button>
          </div>
        ) : (
          <div className={styles.list}>
            <div className={styles.row}>
              <span className={styles.rowMeta}>Nombre de jours de pause</span>
              <input
                type="number"
                aria-label="Nombre de jours de pause — simulation"
                min={1}
                max={20}
                value={pauseDays}
                onChange={(e) => setPauseDays(Number(e.target.value))}
                className={styles.inlineInput}
              />
            </div>
            <div className={styles.row}>
              <span className={styles.rowMeta}>Expiration actuelle</span>
              <span className={styles.rowValue}>12 janvier 2027</span>
            </div>
            <div className={styles.row}>
              <span className={styles.rowMeta}>Nouvelle expiration prévue</span>
              <span className={styles.rowValue}>{newExpiry}</span>
            </div>
            <div className={styles.actionsRow}>
              <Button variant="primary" onClick={() => setPausing(false)}>
                Simuler la demande
              </Button>
              <Button variant="secondary" onClick={() => setPausing(false)}>
                Annuler
              </Button>
            </div>
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}
