import { demoReferralReferrals as referrals } from "../../lib/demoData";
import { useState } from "react";
import { DashboardLayout } from "../../components/member/DashboardLayout";
import { Button } from "../../components/primitives/Button";
import { Reveal } from "../../components/primitives/Reveal";
import sharedStyles from "./member.module.css";
import styles from "./Referral.module.css";

const CODE = "AMINE24";

function statusBadgeClass(status: string, styles: typeof sharedStyles) {
  if (status === "Validé") return styles.positive;
  if (status === "Paiement en attente") return styles.warning;
  return styles.neutral;
}

export function Referral() {
  const [copied, setCopied] = useState(false);

  async function copyCode() {
    try {
      await navigator.clipboard.writeText(CODE);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 1800);
    } catch {
      setCopied(false);
    }
  }

  return (
    <DashboardLayout>
      <div className={sharedStyles.page}>
        <div className={sharedStyles.head}>
          <div>
            <h1 className={sharedStyles.title}>Parrainage</h1>
            <p className={sharedStyles.subtitle}>
              Invitez. Gagnez. Progressez.
            </p>
          </div>
          <span className={sharedStyles.previewTag}>
            Données de démonstration
          </span>
        </div>

        <Reveal className={`${styles.codeCard} ${sharedStyles.glowPanel}`}>
          <div>
            <div className={styles.codeLabel}>Votre code</div>
            <div className={styles.code}>{CODE}</div>
          </div>
          <div className={styles.shareRow}>
            <button type="button" className={styles.copyBtn} onClick={copyCode}>
              {copied ? "Copié ✓" : "Copier le code"}
            </button>
            <Button
              href={`https://wa.me/?text=Démonstration%20Gym%20Park%20—%20code%20fictif%20${CODE}`}
              variant="onInk"
            >
              Partager sur WhatsApp
            </Button>
          </div>
        </Reveal>

        <Reveal
          delay={100}
          className={`${sharedStyles.tileGrid} ${sharedStyles.cols4}`}
        >
          <div className={sharedStyles.tile}>
            <div className={sharedStyles.rowMeta}>Invitations</div>
            <div
              className={`${sharedStyles.rowTitle} ${sharedStyles.tileValue}`}
            >
              12
            </div>
          </div>
          <div className={sharedStyles.tile}>
            <div className={sharedStyles.rowMeta}>Inscrits</div>
            <div
              className={`${sharedStyles.rowTitle} ${sharedStyles.tileValue}`}
            >
              7
            </div>
          </div>
          <div className={sharedStyles.tile}>
            <div className={sharedStyles.rowMeta}>Validés</div>
            <div
              className={`${sharedStyles.rowTitle} ${sharedStyles.tileValue}`}
            >
              5
            </div>
          </div>
          <div className={sharedStyles.tile}>
            <div className={sharedStyles.rowMeta}>Points gagnés</div>
            <div
              className={`${sharedStyles.rowTitle} ${sharedStyles.tileValue}`}
            >
              1 250
            </div>
          </div>
        </Reveal>

        <div className={sharedStyles.sectionTitle}>
          Historique de parrainage
        </div>
        <Reveal delay={150} className={sharedStyles.list}>
          {referrals.map((r) => (
            <div className={sharedStyles.row} key={r.name}>
              <span className={sharedStyles.rowTitle}>{r.name}</span>
              <span
                className={`${sharedStyles.badge} ${statusBadgeClass(r.status, sharedStyles)}`}
              >
                {r.status}
              </span>
            </div>
          ))}
        </Reveal>
      </div>
    </DashboardLayout>
  );
}
