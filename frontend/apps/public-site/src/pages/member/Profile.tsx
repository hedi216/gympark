import { useState } from "react";
import type { FormEvent } from "react";
import { DashboardLayout } from "../../components/member/DashboardLayout";
import { TextField } from "../../components/primitives/TextField";
import { Button } from "../../components/primitives/Button";
import { Reveal } from "../../components/primitives/Reveal";
import sharedStyles from "./member.module.css";

export function Profile() {
  const [firstName, setFirstName] = useState("Amine");
  const [lastName, setLastName] = useState("B.");
  const [phone, setPhone] = useState("55 123 456");
  const [email, setEmail] = useState("amine@example.com");
  const [saved, setSaved] = useState(false);

  function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setSaved(true);
    window.setTimeout(() => setSaved(false), 2000);
  }

  return (
    <DashboardLayout>
      <div className={sharedStyles.page}>
        <div className={sharedStyles.head}>
          <div>
            <h1 className={sharedStyles.title}>Profil</h1>
            <p className={sharedStyles.subtitle}>
              Vos informations personnelles.
            </p>
          </div>
          <span className={sharedStyles.previewTag}>
            Données de démonstration
          </span>
        </div>

        <Reveal className={`${sharedStyles.tileGrid} ${sharedStyles.cols4}`}>
          <div className={sharedStyles.tile}>
            <div className={sharedStyles.rowMeta}>ID membre</div>
            <div
              className={`${sharedStyles.rowTitle} ${sharedStyles.tileValue}`}
            >
              GP-DEMO-04821
            </div>
          </div>
          <div className={sharedStyles.tile}>
            <div className={sharedStyles.rowMeta}>Membre depuis</div>
            <div
              className={`${sharedStyles.rowTitle} ${sharedStyles.tileValue}`}
            >
              Janvier 2024
            </div>
          </div>
          <div className={sharedStyles.tile}>
            <div className={sharedStyles.rowMeta}>Total visites</div>
            <div
              className={`${sharedStyles.rowTitle} ${sharedStyles.tileValue}`}
            >
              284
            </div>
          </div>
          <div className={sharedStyles.tile}>
            <div className={sharedStyles.rowMeta}>Parrainages</div>
            <div
              className={`${sharedStyles.rowTitle} ${sharedStyles.tileValue}`}
            >
              7
            </div>
          </div>
        </Reveal>

        <div className={sharedStyles.sectionTitle}>
          Informations personnelles
        </div>
        <Reveal delay={100}>
          <form onSubmit={handleSubmit} className={sharedStyles.form}>
            <div className={sharedStyles.formRow2}>
              <TextField
                label="Prénom"
                value={firstName}
                onChange={setFirstName}
                required
              />
              <TextField
                label="Nom"
                value={lastName}
                onChange={setLastName}
                required
              />
            </div>
            <TextField
              label="Téléphone"
              type="tel"
              value={phone}
              onChange={setPhone}
              required
            />
            <TextField
              label="Email"
              type="email"
              value={email}
              onChange={setEmail}
              required
            />

            {saved && (
              <div className={sharedStyles.empty} role="status">
                Modifications enregistrées (aperçu — la sauvegarde réelle arrive
                avec le backend).
              </div>
            )}

            <Button type="submit" variant="primary">
              Enregistrer les modifications
            </Button>
          </form>
        </Reveal>
      </div>
    </DashboardLayout>
  );
}
