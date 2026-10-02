import { gym, plans, priceFor } from "../lib/gymInfo";
import { useState } from "react";
import type { FormEvent } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { AuthLayout } from "../components/auth/AuthLayout";
import { TextField } from "../components/primitives/TextField";
import { Checkbox } from "../components/primitives/Checkbox";
import { Button } from "../components/primitives/Button";
import { useAuth } from "../lib/AuthContext";
import styles from "../components/auth/AuthLayout.module.css";

interface FormState {
  firstName: string;
  lastName: string;
  phone: string;
  email: string;
  birthDate: string;
  password: string;
  referralCode: string;
}

const EMPTY: FormState = {
  firstName: "",
  lastName: "",
  phone: "",
  email: "",
  birthDate: "",
  password: "",
  referralCode: "",
};

export function Signup() {
  const { login } = useAuth();
  const [search] = useSearchParams();
  const [planId, setPlanId] = useState(
    plans.some((p) => p.id === search.get("plan"))
      ? search.get("plan")!
      : plans[0].id,
  );
  const selectedPlan = plans.find((p) => p.id === planId)!;
  const selectedPrice = priceFor(selectedPlan).price;
  const [form, setForm] = useState<FormState>(EMPTY);
  const [acceptTerms, setAcceptTerms] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [done, setDone] = useState(false);

  function set<K extends keyof FormState>(key: K) {
    return (value: string) => setForm((f) => ({ ...f, [key]: value }));
  }

  function handleSubmit(e: FormEvent) {
    e.preventDefault();

    if (
      !form.firstName ||
      !form.lastName ||
      !form.phone ||
      !form.email ||
      !form.password
    ) {
      setError("Merci de renseigner tous les champs obligatoires.");
      return;
    }
    if (form.password.length < 8) {
      setError("Le mot de passe doit contenir au moins 8 caractères.");
      return;
    }
    if (!acceptTerms) {
      setError("Vous devez accepter les conditions pour continuer.");
      return;
    }

    setError(null);
    login(form.firstName);
    setDone(true);
  }

  if (done) {
    return (
      <AuthLayout
        title={`Bienvenue, ${form.firstName}.`}
        subtitle="Votre parcours de démonstration est prêt. Aucun compte ni abonnement réel n’a été créé."
        onSubmit={(e) => e.preventDefault()}
        footer={
          <Button
            to="/espace-membre"
            variant="primary"
            className={styles.submit}
          >
            Ouvrir l’aperçu membre
          </Button>
        }
      >
        <div className={styles.note}>
          Démonstration pour {form.firstName}. Formule sélectionnée :{" "}
          {selectedPlan.name}, {selectedPlan.durationLabel}. Total indicatif :{" "}
          {selectedPrice + gym.registrationFee} DT, dont {gym.registrationFee}{" "}
          DT de frais d’inscription. Aucun règlement effectué. Pour vous
          inscrire, contactez le club au {gym.phone}.
        </div>
      </AuthLayout>
    );
  }

  return (
    <AuthLayout
      title="Créer votre compte"
      subtitle="Choisissez votre formule. Votre inscription définitive se fait auprès de l’accueil."
      onSubmit={handleSubmit}
      footer={
        <>
          {error && (
            <div className={styles.note} role="alert">
              {error}
            </div>
          )}

          <Checkbox checked={acceptTerms} onChange={setAcceptTerms} required>
            Je comprends qu’il s’agit d’une démonstration sans création de
            compte ni paiement.
          </Checkbox>

          <Button type="submit" variant="primary" className={styles.submit}>
            Essayer le parcours
          </Button>

          <p className={styles.switch}>
            Déjà membre ? <Link to="/connexion">Se connecter</Link>
          </p>
        </>
      }
    >
      <div className="signup-plan">
        <label htmlFor="signup-plan">Votre formule</label>
        <select
          id="signup-plan"
          value={planId}
          onChange={(e) => setPlanId(e.target.value)}
        >
          {plans.map((plan) => (
            <option value={plan.id} key={plan.id}>
              {plan.name} · {plan.durationLabel} · {priceFor(plan).price} DT
            </option>
          ))}
        </select>
        <p className="signup-total">
          Abonnement : {selectedPrice} DT
          <br />
          Frais d’inscription : {gym.registrationFee} DT
          <br />
          <strong>
            Total initial : {selectedPrice + gym.registrationFee} DT
          </strong>
        </p>
      </div>
      <div className={styles.row2}>
        <TextField
          label="Prénom"
          value={form.firstName}
          onChange={set("firstName")}
          required
        />
        <TextField
          label="Nom"
          value={form.lastName}
          onChange={set("lastName")}
          required
        />
      </div>

      <TextField
        label="Téléphone"
        type="tel"
        value={form.phone}
        onChange={set("phone")}
        autoComplete="tel"
        required
      />
      <TextField
        label="Email"
        type="email"
        value={form.email}
        onChange={set("email")}
        autoComplete="email"
        required
      />
      <div className={styles.row2}>
        <TextField
          label="Date de naissance"
          type="date"
          value={form.birthDate}
          onChange={set("birthDate")}
        />
        <TextField
          label="Mot de passe"
          type="password"
          value={form.password}
          onChange={set("password")}
          autoComplete="new-password"
          required
        />
      </div>
      <TextField
        label="Code de parrainage (facultatif)"
        value={form.referralCode}
        onChange={set("referralCode")}
        placeholder="PRENOM24"
      />
    </AuthLayout>
  );
}
