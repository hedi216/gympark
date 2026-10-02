import { demoRewardsRewards as rewards } from "../../lib/demoData";
import { useState } from "react";
import { DashboardLayout } from "../../components/member/DashboardLayout";
import { Reveal } from "../../components/primitives/Reveal";
import sharedStyles from "./member.module.css";
import styles from "./Rewards.module.css";

const MEMBER_POINTS = 1240;

const TABS = ["Disponibles", "Verrouillées", "Échangées"] as const;

export function Rewards() {
  const [tab, setTab] = useState<(typeof TABS)[number]>("Disponibles");
  const [redeemed, setRedeemed] = useState<string[]>([]);

  const remainingPoints =
    MEMBER_POINTS -
    rewards
      .filter((r) => redeemed.includes(r.name))
      .reduce((sum, r) => sum + r.cost, 0);

  const filtered = rewards.filter((r) => {
    if (tab === "Échangées") return redeemed.includes(r.name);
    if (redeemed.includes(r.name)) return false;
    if (tab === "Disponibles") return r.cost <= remainingPoints;
    return r.cost > remainingPoints;
  });

  return (
    <DashboardLayout>
      <div className={sharedStyles.page}>
        <div className={sharedStyles.head}>
          <div>
            <h1 className={sharedStyles.title}>Récompenses</h1>
            <p className={sharedStyles.subtitle}>
              {remainingPoints.toLocaleString("fr-FR")} Points fidélité
              disponibles.
            </p>
          </div>
          <span className={sharedStyles.previewTag}>
            Données de démonstration
          </span>
        </div>

        <div className={sharedStyles.tabs}>
          {TABS.map((t) => (
            <button
              key={t}
              className={`${sharedStyles.tab} ${tab === t ? sharedStyles.active : ""}`}
              onClick={() => setTab(t)}
              type="button"
              aria-pressed={tab === t}
            >
              {t}
            </button>
          ))}
        </div>

        {filtered.length === 0 ? (
          <div className={sharedStyles.empty}>
            <div className={sharedStyles.emptyTitle}>
              Rien ici pour le moment.
            </div>
            Continuez à accumuler des points pour débloquer plus de récompenses.
          </div>
        ) : (
          <Reveal className={`${sharedStyles.tileGrid} ${sharedStyles.cols4}`}>
            {filtered.map((r) => (
              <div
                className={`${sharedStyles.tile} ${styles.reward}`}
                key={r.name}
              >
                <span className={styles.rewardCategory}>{r.category}</span>
                <span className={styles.rewardName}>{r.name}</span>
                <div className={styles.rewardFooter}>
                  <span className={styles.cost}>{r.cost} pts</span>
                  {redeemed.includes(r.name) ? (
                    <span className={styles.claimed}>Échangé</span>
                  ) : (
                    <button
                      type="button"
                      className={styles.claim}
                      disabled={r.cost > remainingPoints}
                      onClick={() => setRedeemed((v) => [...v, r.name])}
                    >
                      Débloquer
                    </button>
                  )}
                </div>
              </div>
            ))}
          </Reveal>
        )}
      </div>
    </DashboardLayout>
  );
}
