import { demoLoyaltyDashboardHistory as history } from "../../lib/demoData";
import { useEffect, useState } from "react";
import { DashboardLayout } from "../../components/member/DashboardLayout";
import { Reveal } from "../../components/primitives/Reveal";
import { useCountUp } from "../../lib/useCountUp";
import sharedStyles from "./member.module.css";
import styles from "./LoyaltyDashboard.module.css";

export function LoyaltyDashboard() {
  const points = 1240;
  const nextThreshold = 3000;
  const targetPercent = Math.round((points / nextThreshold) * 100);
  const [percent, setPercent] = useState(0);
  const pointsStat = useCountUp<HTMLDivElement>(points, 1400);

  useEffect(() => {
    const id = requestAnimationFrame(() => setPercent(targetPercent));
    return () => cancelAnimationFrame(id);
  }, [targetPercent]);

  return (
    <DashboardLayout>
      <div className={sharedStyles.page}>
        <div className={sharedStyles.head}>
          <div>
            <h1 className={sharedStyles.title}>Points &amp; niveau</h1>
            <p className={sharedStyles.subtitle}>
              Votre solde Points fidélité et votre progression.
            </p>
          </div>
          <span className={sharedStyles.previewTag}>
            Données de démonstration
          </span>
        </div>

        <Reveal className={`${styles.levelCard} ${sharedStyles.glowPanel}`}>
          <div className={styles.levelTop}>
            <div>
              <div className={styles.points} ref={pointsStat.ref}>
                {pointsStat.value.toLocaleString("fr-FR")}
              </div>
              <div className={styles.pointsLabel}>Points fidélité</div>
            </div>
            <span className={styles.level}>Silver</span>
          </div>
          <div className={styles.track}>
            <div className={styles.fill} style={{ width: `${percent}%` }} />
          </div>
          <div className={styles.trackMeta}>
            <span>
              {points.toLocaleString("fr-FR")} /{" "}
              {nextThreshold.toLocaleString("fr-FR")}
            </span>
            <span>
              Gold — {(nextThreshold - points).toLocaleString("fr-FR")} pts
              restants
            </span>
          </div>
        </Reveal>

        <Reveal
          delay={100}
          className={`${sharedStyles.tileGrid} ${sharedStyles.cols4}`}
        >
          <div className={sharedStyles.tile}>
            <div className={sharedStyles.rowMeta}>Gagnés ce mois</div>
            <div
              className={`${sharedStyles.rowTitle} ${sharedStyles.tileValue}`}
            >
              +284
            </div>
          </div>
          <div className={sharedStyles.tile}>
            <div className={sharedStyles.rowMeta}>Via parrainage</div>
            <div
              className={`${sharedStyles.rowTitle} ${sharedStyles.tileValue}`}
            >
              1 250
            </div>
          </div>
          <div className={sharedStyles.tile}>
            <div className={sharedStyles.rowMeta}>Via visites</div>
            <div
              className={`${sharedStyles.rowTitle} ${sharedStyles.tileValue}`}
            >
              184
            </div>
          </div>
          <div className={sharedStyles.tile}>
            <div className={sharedStyles.rowMeta}>Dépensés</div>
            <div
              className={`${sharedStyles.rowTitle} ${sharedStyles.tileValue}`}
            >
              1 040
            </div>
          </div>
        </Reveal>

        <div className={sharedStyles.sectionTitle}>Historique des points</div>
        <Reveal delay={150} className={sharedStyles.list}>
          {history.map((h, i) => (
            <div className={sharedStyles.row} key={i}>
              <div className={sharedStyles.rowMain}>
                <span className={sharedStyles.rowTitle}>{h.label}</span>
                <span className={sharedStyles.rowMeta}>{h.date}</span>
              </div>
              <span
                className={`${sharedStyles.rowValue} ${
                  h.points > 0 ? styles.txPositive : styles.txNegative
                }`}
              >
                {h.points > 0 ? "+" : ""}
                {h.points}
              </span>
            </div>
          ))}
        </Reveal>
      </div>
    </DashboardLayout>
  );
}
