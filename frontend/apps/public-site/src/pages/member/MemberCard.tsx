import { DashboardLayout } from "../../components/member/DashboardLayout";
import { Button } from "../../components/primitives/Button";
import { Reveal } from "../../components/primitives/Reveal";
import { useTilt } from "../../lib/useTilt";
import { gym } from "../../lib/gymInfo";
import sharedStyles from "./member.module.css";
import styles from "./MemberCard.module.css";

export function MemberCard() {
  const tilt = useTilt<HTMLDivElement>(8);

  return (
    <DashboardLayout>
      <div className={sharedStyles.page}>
        <div className={sharedStyles.head}>
          <div>
            <h1 className={sharedStyles.title}>Carte membre</h1>
            <p className={sharedStyles.subtitle}>
              Aperçu de votre carte numérique. Ce visuel ne permet pas l’accès
              au club.
            </p>
          </div>
          <span className={sharedStyles.previewTag}>
            Données de démonstration
          </span>
        </div>

        <Reveal className={styles.wrap}>
          <div
            className={`${styles.card} ${sharedStyles.glowPanel}`}
            ref={tilt.ref}
            onMouseMove={tilt.onMouseMove}
            onMouseLeave={tilt.onMouseLeave}
          >
            <div className={styles.cardTop}>
              <span className={styles.mark}>
                <img src={gym.logo} alt="" className={styles.markIcon} />
              </span>
              <span className={styles.level}>Silver</span>
            </div>

            <div className={styles.name}>Amine B.</div>

            <div className={styles.rows}>
              <div className={styles.row}>
                <span>Abonnement</span>
                <span>Formule Annuelle</span>
              </div>
              <div className={styles.row}>
                <span>ID membre</span>
                <span>GP-DEMO-04821</span>
              </div>
              <div className={styles.row}>
                <span>Expire le</span>
                <span>12 jan. 2027</span>
              </div>
              <div className={styles.row}>
                <span>Statut</span>
                <span>Actif</span>
              </div>
            </div>

            <div className={styles.qrWrap}>
              <div className={styles.qr} aria-hidden="true" />
            </div>
          </div>

          <p className={styles.hint}>
            Motif de démonstration non scannable. La génération sécurisée du QR
            code reste à connecter.
          </p>

          <div className={styles.actions}>
            <Button to="/espace-membre/abonnement" variant="secondary">
              Voir mon abonnement
            </Button>
            <Button to="/contact" variant="secondary">
              Carte non fonctionnelle ?
            </Button>
          </div>
        </Reveal>
      </div>
    </DashboardLayout>
  );
}
