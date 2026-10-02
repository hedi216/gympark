import { demoNotificationsNotifications as notifications } from "../../lib/demoData";
import { DashboardLayout } from "../../components/member/DashboardLayout";
import { Reveal } from "../../components/primitives/Reveal";
import sharedStyles from "./member.module.css";
import styles from "./Notifications.module.css";

export function Notifications() {
  return (
    <DashboardLayout>
      <div className={sharedStyles.page}>
        <div className={sharedStyles.head}>
          <div>
            <h1 className={sharedStyles.title}>Notifications</h1>
            <p className={sharedStyles.subtitle}>
              Les mises à jour importantes concernant votre compte.
            </p>
          </div>
          <span className={sharedStyles.previewTag}>
            Données de démonstration
          </span>
        </div>

        <div>
          {notifications.map((n, i) => (
            <Reveal
              delay={i * 60}
              className={`${styles.item} ${n.unread ? styles.unread : ""}`}
              key={i}
            >
              <div className={styles.dotCol}>
                {n.unread && <span className={styles.unreadDot} />}
              </div>
              <div className={styles.body}>
                <div className={styles.top}>
                  <span className={styles.category}>{n.category}</span>
                  <span className={styles.time}>{n.time}</span>
                </div>
                <div className={styles.title}>{n.title}</div>
                <div className={styles.message}>{n.message}</div>
              </div>
            </Reveal>
          ))}
        </div>
      </div>
    </DashboardLayout>
  );
}
