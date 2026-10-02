// UI fixtures only. Never use these records as production entitlements or gym policies.
import { plans } from "./gymInfo";
export const demoAnnualPlan = plans.find((plan) => plan.id === "libre-12")!;
export const demoQuarterPlan = plans.find((plan) => plan.id === "libre-3")!;
export const demoMonthPlan = plans.find((plan) => plan.id === "libre-1")!;

export const demoPaymentsPayments = [
  {
    date: "12 jan. 2026",
    desc: "Formule Annuelle",
    amount: `${demoAnnualPlan.price} DT`,
    method: "Carte bancaire",
    status: "Payé",
  },
  {
    date: "03 sept. 2025",
    desc: "Formule 3 Mois",
    amount: `${demoQuarterPlan.price} DT`,
    method: "Espèces",
    status: "Payé",
  },
  {
    date: "12 juin 2025",
    desc: "Formule 3 Mois",
    amount: `${demoQuarterPlan.price} DT`,
    method: "Carte bancaire",
    status: "Payé",
  },
  {
    date: "18 mars 2025",
    desc: "Formule 1 Mois",
    amount: `${demoMonthPlan.price} DT`,
    method: "Carte bancaire",
    status: "Remboursé",
  },
];

export const demoHistoryEntries = [
  {
    plan: "Formule Annuelle",
    range: "12 jan. 2026 → 12 jan. 2027",
    status: "Actif",
    paid: `${demoAnnualPlan.price} DT`,
    points: "+600",
    current: true,
  },
  {
    plan: "Formule 3 Mois",
    range: "03 sept. 2025 → 03 déc. 2025",
    status: "Terminé",
    paid: `${demoQuarterPlan.price} DT`,
    points: "+150",
    current: false,
  },
  {
    plan: "Formule 3 Mois",
    range: "12 juin 2025 → 12 sept. 2025",
    status: "Terminé",
    paid: `${demoQuarterPlan.price} DT`,
    points: "+150",
    current: false,
  },
  {
    plan: "Formule 1 Mois",
    range: "18 mars 2025 → 18 avr. 2025",
    status: "Remboursé",
    paid: `${demoMonthPlan.price} DT`,
    points: "+0",
    current: false,
  },
];

export const demoRewardsRewards = [
  { name: "Shaker protéiné", category: "Boissons", cost: 120 },
  { name: "Boisson énergétique", category: "Boissons", cost: 180 },
  { name: "Serviette de sport", category: "Merchandising", cost: 350 },
  { name: "Pass invité", category: "Accès", cost: 400 },
  { name: "Scan composition corporelle", category: "Bien-être", cost: 450 },
  { name: "T-shirt — exemple", category: "Merchandising", cost: 700 },
  { name: "5% sur le renouvellement", category: "Abonnement", cost: 800 },
  { name: "Mini-session coaching", category: "Coaching", cost: 900 },
  { name: "10% sur le renouvellement", category: "Abonnement", cost: 1500 },
];

export const demoChallengesActive = [
  {
    name: "15 visites ce mois",
    desc: "Visitez le club 15 fois avant la fin du mois.",
    current: 9,
    goal: 15,
    reward: 150,
    deadline: "6 jours restants",
  },
  {
    name: "10 séances du matin",
    desc: "Enchaînez 10 passages avant 9h.",
    current: 6,
    goal: 10,
    reward: 100,
    deadline: "12 jours restants",
  },
];

export const demoChallengesUpcoming = [
  {
    name: "Défi de rentrée",
    desc: "20 visites en septembre.",
    reward: 200,
    starts: "Débute le 1er septembre",
  },
];

export const demoChallengesCompleted = [
  {
    name: "Premier parrainage",
    desc: "Parrainer un premier ami.",
    reward: 250,
    date: "Terminé le 2 juillet",
  },
  {
    name: "20 check-ins",
    desc: "20 passages cumulés.",
    reward: 150,
    date: "Terminé le 18 juin",
  },
];

export const demoReferralReferrals = [
  { name: "Ahmed B.", status: "Validé", points: 250 },
  { name: "Sarra M.", status: "Validé", points: 250 },
  { name: "Yassine T.", status: "Paiement en attente", points: 0 },
  { name: "Mariem K.", status: "Inscription créée", points: 0 },
  { name: "Foulen A.", status: "Invitation envoyée", points: 0 },
];

export const demoNotificationsNotifications = [
  {
    category: "Abonnement",
    title: "Votre abonnement expire dans 73 jours",
    message:
      "Renouvelez avant le 12 janvier pour conserver votre niveau Silver.",
    time: "Aujourd'hui",
    unread: true,
  },
  {
    category: "Parrainage",
    title: "Parrainage validé — Ahmed B.",
    message: "250 points ont été ajoutés à votre solde.",
    time: "Aujourd'hui",
    unread: true,
  },
  {
    category: "Récompense",
    title: "Nouvelle récompense disponible",
    message: "Le T-shirt — exemple est maintenant à votre portée.",
    time: "Hier",
    unread: false,
  },
  {
    category: "Club",
    title: "Exemple — horaires exceptionnels",
    message:
      "Exemple de notification d’un horaire exceptionnel, sans effet sur les horaires du club.",
    time: "3 jours",
    unread: false,
  },
  {
    category: "Défi",
    title: 'Défi "15 visites" — plus que 6 jours',
    message: "Vous êtes à 9/15 visites ce mois-ci.",
    time: "4 jours",
    unread: false,
  },
];

export const demoLoyaltyDashboardHistory = [
  { label: "Parrainage validé — Ahmed B.", date: "Aujourd'hui", points: 250 },
  { label: "Passage au club", date: "Hier", points: 2 },
  { label: "Serviette de sport", date: "04 août", points: -350 },
  { label: "12 visites ce mois", date: "01 août", points: 30 },
  { label: "Passage au club", date: "31 juillet", points: 2 },
  { label: "Renouvellement anticipé", date: "12 janvier", points: 80 },
];

export const demoSupportTickets = [
  {
    subject: "Question sur la pause d'abonnement",
    category: "Pause",
    status: "Résolu",
    date: "02 juillet",
  },
  {
    subject: "Carte QR ne scanne pas",
    category: "Carte QR",
    status: "En cours d'examen",
    date: "18 juin",
  },
];
