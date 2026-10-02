import { Eyebrow } from "../components/primitives/Eyebrow";
import { Button } from "../components/primitives/Button";
import styles from "./ComingSoon.module.css";

interface ComingSoonProps {
  eyebrow: string;
  title: string;
  description: string;
}

export function ComingSoon({ eyebrow, title, description }: ComingSoonProps) {
  return (
    <section className={styles.section}>
      <Eyebrow>{eyebrow}</Eyebrow>
      <h1 className={styles.title}>{title}</h1>
      <p className={styles.desc}>{description}</p>
      <Button to="/" variant="secondary">
        Retour à l'accueil
      </Button>
    </section>
  );
}
