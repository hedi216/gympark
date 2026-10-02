import { demoHistoryEntries as entries } from "../../lib/demoData";
import { DashboardLayout } from "../../components/member/DashboardLayout";
import { Reveal } from "../../components/primitives/Reveal";
import sharedStyles from "./member.module.css";
import styles from "./History.module.css";

export function History() {
  return (
    <DashboardLayout>
      <div className={sharedStyles.page}>
        <div className={sharedStyles.head}>
          <div>
            <h1 className={sharedStyles.title}>Historique</h1>
            <p className={sharedStyles.subtitle}>
              Vos abonnements passés et actuel.
            </p>
          </div>
          <span className={sharedStyles.previewTag}>
            Données de démonstration
          </span>
        </div>

        <div className={styles.timeline}>
          {entries.map((e, i) => (
            <Reveal
              delay={i * 90}
              className={`${styles.entry} ${e.current ? styles.current : ""}`}
              key={i}
            >
              <div className={styles.railCol}>
                <span className={styles.dot} aria-hidden="true" />
                {i < entries.length - 1 && (
                  <span className={styles.rail} aria-hidden="true" />
                )}
              </div>
              <div className={styles.body}>
                <div className={styles.entryTop}>
                  <span className={styles.entryTitle}>{e.plan}</span>
                  <span
                    className={`${sharedStyles.badge} ${
                      e.status === "Actif"
                        ? sharedStyles.positive
                        : sharedStyles.neutral
                    }`}
                  >
                    {e.status}
                  </span>
                </div>
                <div className={styles.entryDates}>{e.range}</div>
                <div className={styles.entryMeta}>
                  <span>Payé — {e.paid}</span>
                  <span>Points — {e.points}</span>
                </div>
              </div>
            </Reveal>
          ))}
        </div>
      </div>
    </DashboardLayout>
  );
}
