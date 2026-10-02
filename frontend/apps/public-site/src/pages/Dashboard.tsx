import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { DashboardLayout } from "../components/member/DashboardLayout";
import { Button } from "../components/primitives/Button";
import { Reveal } from "../components/primitives/Reveal";
import { useCountUp } from "../lib/useCountUp";
import { useTilt } from "../lib/useTilt";
import sharedStyles from "./member/member.module.css";
import styles from "./Dashboard.module.css";

const memberFirstName = "Amine";

const quickActions = [
  { label: "Renouveler l'abonnement", href: "/abonnements" },
  { label: "Mettre en pause", href: "/contact" },
  { label: "Ouvrir ma carte QR", href: "#carte" },
  { label: "Parrainer un ami", href: "/espace-membre/parrainage" },
  { label: "Réclamer une récompense", href: "/espace-membre/recompenses" },
  { label: "Contacter l'accueil", href: "/contact" },
];

function Stat({
  value,
  label,
  suffix = "",
}: {
  value: number;
  label: string;
  suffix?: string;
}) {
  const stat = useCountUp<HTMLDivElement>(value);
  return (
    <div className={styles.stat}>
      <div className={styles.statValue} ref={stat.ref}>
        {stat.value}
        {suffix}
      </div>
      <div className={styles.statLabel}>{label}</div>
    </div>
  );
}

function StaticStat({ value, label }: { value: string; label: string }) {
  return (
    <div className={styles.stat}>
      <div className={styles.statValue}>{value}</div>
      <div className={styles.statLabel}>{label}</div>
    </div>
  );
}

export function Dashboard() {
  const [progress, setProgress] = useState(0);
  const tilt = useTilt<HTMLDivElement>(4);

  useEffect(() => {
    const id = requestAnimationFrame(() => setProgress(80));
    return () => cancelAnimationFrame(id);
  }, []);

  const today = new Date().toLocaleDateString("fr-FR", {
    weekday: "long",
    day: "numeric",
    month: "long",
  });

  return (
    <DashboardLayout>
      <div className={styles.page}>
        <div className={styles.head}>
          <div>
            <h1 className={styles.greeting}>Bonjour, {memberFirstName}.</h1>
            <div className={styles.date}>{today}</div>
          </div>
          <span className={styles.previewTag}>Données de démonstration</span>
        </div>

        <Reveal>
          <div
            className={`${styles.membership} ${sharedStyles.glowPanel}`}
            ref={tilt.ref}
            onMouseMove={tilt.onMouseMove}
            onMouseLeave={tilt.onMouseLeave}
          >
            <div>
              <div className={styles.membershipStatus}>
                <span className={styles.statusDot} aria-hidden="true" />
                <span className={styles.statusLabel}>Abonnement actif</span>
              </div>
              <div className={styles.planName}>Formule Annuelle</div>

              <div className={styles.dates}>
                <div>
                  <div className={styles.dateLabel}>Débuté le</div>
                  <div className={styles.dateValue}>12 jan. 2026</div>
                </div>
                <div>
                  <div className={styles.dateLabel}>Expire le</div>
                  <div className={styles.dateValue}>12 jan. 2027</div>
                </div>
              </div>

              <div className={styles.progressTrack}>
                <div
                  className={styles.progressFill}
                  style={{ width: `${progress}%` }}
                />
              </div>

              <div className={styles.membershipActions}>
                <Button to="/abonnements" variant="invert">
                  Renouveler
                </Button>
                <Button to="/contact" variant="ghostInvert">
                  Mettre en pause
                </Button>
                <Button href="#carte" variant="ghostInvert">
                  Voir ma carte
                </Button>
              </div>
            </div>

            <div className={styles.daysRemaining}>
              <div className={styles.daysValue}>73</div>
              <div className={styles.daysLabel}>Jours restants</div>
            </div>
          </div>
        </Reveal>

        <Reveal delay={100} className={styles.stats}>
          <Stat value={12} label="Visites ce mois" />
          <Stat value={3} suffix=".2" label="Moyenne / semaine" />
          <Stat value={4} label="Série en cours" />
          <Stat value={1240} label="Points fidélité" />
          <StaticStat value="Silver" label="Niveau actuel" />
        </Reveal>

        <div className={styles.sectionTitle}>Actions rapides</div>
        <Reveal delay={150} className={styles.actions}>
          {quickActions.map((a) =>
            a.href.startsWith("#") ? (
              <a className={styles.action} href={a.href} key={a.label}>
                <span className={styles.actionLabel}>{a.label}</span>
                <span className={styles.actionArrow}>→</span>
              </a>
            ) : (
              <Link className={styles.action} to={a.href} key={a.label}>
                <span className={styles.actionLabel}>{a.label}</span>
                <span className={styles.actionArrow}>→</span>
              </Link>
            ),
          )}
        </Reveal>

        <Reveal className={styles.cardSection} delay={200}>
          <div id="carte" className={styles.cardCopy}>
            <div className={styles.sectionTitle}>Carte membre</div>
            <p>
              Aperçu de la carte numérique. Le motif ci-dessous est décoratif et
              ne permet pas l’accès au club.
            </p>
          </div>

          <div className={`${styles.card} ${sharedStyles.glowPanel}`}>
            <div className={styles.cardTop}>
              <span className={styles.cardLabel}>Carte membre</span>
              <span className={styles.cardLevel}>Silver</span>
            </div>
            <div className={styles.cardName}>{memberFirstName} B.</div>
            <div className={styles.cardRow}>
              <span>Abonnement</span>
              <span>Annuel</span>
            </div>
            <div className={styles.cardRow}>
              <span>ID membre</span>
              <span>GP-DEMO-04821</span>
            </div>
            <div className={styles.qr} aria-hidden="true" />
          </div>
        </Reveal>
      </div>
    </DashboardLayout>
  );
}
