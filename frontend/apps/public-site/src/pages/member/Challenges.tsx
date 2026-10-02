import { demoChallengesCompleted as completed } from "../../lib/demoData";
import { demoChallengesUpcoming as upcoming } from "../../lib/demoData";
import { demoChallengesActive as active } from "../../lib/demoData";
import { useEffect, useState } from "react";
import { DashboardLayout } from "../../components/member/DashboardLayout";
import { Reveal } from "../../components/primitives/Reveal";
import sharedStyles from "./member.module.css";
import styles from "./Challenges.module.css";

const TABS = ["Actifs", "À venir", "Terminés"] as const;

export function Challenges() {
  const [tab, setTab] = useState<(typeof TABS)[number]>("Actifs");
  const [grown, setGrown] = useState(false);

  useEffect(() => {
    const id = requestAnimationFrame(() => setGrown(true));
    return () => cancelAnimationFrame(id);
  }, []);

  return (
    <DashboardLayout>
      <div className={sharedStyles.page}>
        <div className={sharedStyles.head}>
          <div>
            <h1 className={sharedStyles.title}>Défis</h1>
            <p className={sharedStyles.subtitle}>
              Des objectifs mensuels fixés par le club.
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
            >
              {t}
            </button>
          ))}
        </div>

        {tab === "Actifs" && (
          <Reveal className={`${sharedStyles.tileGrid} ${sharedStyles.cols2}`}>
            {active.map((c) => (
              <div
                className={`${sharedStyles.tile} ${styles.challenge}`}
                key={c.name}
              >
                <div className={styles.challengeTop}>
                  <span className={styles.challengeName}>{c.name}</span>
                  <span
                    className={`${sharedStyles.badge} ${sharedStyles.neutral}`}
                  >
                    +{c.reward} pts
                  </span>
                </div>
                <p className={styles.challengeDesc}>{c.desc}</p>
                <div className={styles.track}>
                  <div
                    className={styles.fill}
                    style={{
                      width: grown ? `${(c.current / c.goal) * 100}%` : "0%",
                    }}
                  />
                </div>
                <div className={styles.meta}>
                  <span>
                    {c.current} / {c.goal}
                  </span>
                  <span>{c.deadline}</span>
                </div>
              </div>
            ))}
          </Reveal>
        )}

        {tab === "À venir" && (
          <Reveal className={`${sharedStyles.tileGrid} ${sharedStyles.cols2}`}>
            {upcoming.map((c) => (
              <div
                className={`${sharedStyles.tile} ${styles.challenge}`}
                key={c.name}
              >
                <div className={styles.challengeTop}>
                  <span className={styles.challengeName}>{c.name}</span>
                  <span>+{c.reward} pts</span>
                </div>
                <p className={styles.challengeDesc}>{c.desc}</p>
                <div className={styles.meta}>
                  <span>{c.starts}</span>
                </div>
              </div>
            ))}
          </Reveal>
        )}

        {tab === "Terminés" && (
          <Reveal className={sharedStyles.list}>
            {completed.map((c) => (
              <div className={sharedStyles.row} key={c.name}>
                <div className={sharedStyles.rowMain}>
                  <span className={sharedStyles.rowTitle}>{c.name}</span>
                  <span className={sharedStyles.rowMeta}>{c.date}</span>
                </div>
                <span className={sharedStyles.rowValue}>+{c.reward} pts</span>
              </div>
            ))}
          </Reveal>
        )}
      </div>
    </DashboardLayout>
  );
}
