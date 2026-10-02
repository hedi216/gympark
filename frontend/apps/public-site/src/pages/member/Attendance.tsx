import { DashboardLayout } from "../../components/member/DashboardLayout";
import { Reveal } from "../../components/primitives/Reveal";
import sharedStyles from "./member.module.css";
import styles from "./Attendance.module.css";

const VISITED_DAYS = new Set([
  1, 2, 4, 6, 8, 9, 11, 13, 15, 16, 18, 20, 22, 23, 25, 27, 29,
]);
const WEEKDAY_LABELS = ["Lun", "Mar", "Mer", "Jeu", "Ven", "Sam", "Dim"];
const MONTH_LABELS = [
  "Janvier",
  "Février",
  "Mars",
  "Avril",
  "Mai",
  "Juin",
  "Juillet",
  "Août",
  "Septembre",
  "Octobre",
  "Novembre",
  "Décembre",
];

const recentCheckIns = [
  { day: "Vendredi", time: "18:41" },
  { day: "Mercredi", time: "19:06" },
  { day: "Lundi", time: "17:20" },
  { day: "Samedi", time: "10:12" },
  { day: "Jeudi", time: "18:55" },
];

export function Attendance() {
  const now = new Date();
  const year = now.getFullYear();
  const month = now.getMonth();
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const today = now.getDate();
  const firstWeekday = (new Date(year, month, 1).getDay() + 6) % 7;

  return (
    <DashboardLayout>
      <div className={sharedStyles.page}>
        <div className={sharedStyles.head}>
          <div>
            <h1 className={sharedStyles.title}>Assiduité</h1>
            <p className={sharedStyles.subtitle}>
              Votre présence au club, mois après mois.
            </p>
          </div>
          <span className={sharedStyles.previewTag}>
            Données de démonstration
          </span>
        </div>

        <Reveal className={`${sharedStyles.tileGrid} ${sharedStyles.cols4}`}>
          <div className={sharedStyles.tile}>
            <div className={sharedStyles.rowMeta}>Visites ce mois</div>
            <div
              className={`${sharedStyles.rowTitle} ${sharedStyles.tileValue}`}
            >
              {VISITED_DAYS.size}
            </div>
          </div>
          <div className={sharedStyles.tile}>
            <div className={sharedStyles.rowMeta}>Moyenne / semaine</div>
            <div
              className={`${sharedStyles.rowTitle} ${sharedStyles.tileValue}`}
            >
              3.2
            </div>
          </div>
          <div className={sharedStyles.tile}>
            <div className={sharedStyles.rowMeta}>Série actuelle</div>
            <div
              className={`${sharedStyles.rowTitle} ${sharedStyles.tileValue}`}
            >
              4 séances
            </div>
          </div>
          <div className={sharedStyles.tile}>
            <div className={sharedStyles.rowMeta}>Meilleure série</div>
            <div
              className={`${sharedStyles.rowTitle} ${sharedStyles.tileValue}`}
            >
              9 séances
            </div>
          </div>
        </Reveal>

        <div className={sharedStyles.sectionTitle}>Calendrier du mois</div>
        <div className={styles.calendar}>
          <div className={styles.calendarHead}>
            <span className={styles.calendarMonth}>
              {MONTH_LABELS[month]} {year}
            </span>
          </div>

          <div className={styles.weekdays}>
            {WEEKDAY_LABELS.map((label) => (
              <span key={label}>{label}</span>
            ))}
          </div>

          <div className={styles.heatmap}>
            {Array.from({ length: firstWeekday }, (_, i) => (
              <div
                key={`blank-${i}`}
                className={styles.blank}
                aria-hidden="true"
              />
            ))}
            {Array.from({ length: daysInMonth }, (_, i) => i + 1).map((day) => {
              const isFuture = day > today;
              const isVisited = VISITED_DAYS.has(day);
              return (
                <div
                  key={day}
                  className={`${styles.day} ${isVisited ? styles.visited : ""} ${
                    day === today ? styles.today : ""
                  } ${isFuture ? styles.future : ""}`}
                  style={{ animationDelay: `${Math.min(day * 12, 400)}ms` }}
                  title={`${day} ${MONTH_LABELS[month]} — ${
                    isVisited ? "présence" : isFuture ? "à venir" : "absence"
                  }`}
                >
                  <span className={styles.dayNumber}>{day}</span>
                </div>
              );
            })}
          </div>
        </div>
        <div className={styles.heatmapLegend}>
          <span className={`${styles.legendSwatch} ${styles.on}`} />
          Présence
          <span className={`${styles.legendSwatch} ${styles.off}`} />
          Absence
          <span className={`${styles.legendSwatch} ${styles.future}`} />À venir
        </div>

        <div className={sharedStyles.sectionTitle}>Derniers passages</div>
        <Reveal delay={100} className={sharedStyles.list}>
          {recentCheckIns.map((c, i) => (
            <div className={sharedStyles.row} key={i}>
              <span className={sharedStyles.rowTitle}>{c.day}</span>
              <span className={sharedStyles.rowValue}>{c.time}</span>
            </div>
          ))}
        </Reveal>
      </div>
    </DashboardLayout>
  );
}
