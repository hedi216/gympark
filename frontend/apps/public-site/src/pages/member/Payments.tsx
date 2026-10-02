import { demoPaymentsPayments as payments } from "../../lib/demoData";
import { DashboardLayout } from "../../components/member/DashboardLayout";
import { Reveal } from "../../components/primitives/Reveal";
import sharedStyles from "./member.module.css";

function badgeClass(status: string, styles: typeof sharedStyles) {
  if (status === "Payé") return styles.positive;
  if (status === "Remboursé") return styles.neutral;
  return styles.warning;
}

export function Payments() {
  return (
    <DashboardLayout>
      <div className={sharedStyles.page}>
        <div className={sharedStyles.head}>
          <div>
            <h1 className={sharedStyles.title}>Paiements</h1>
            <p className={sharedStyles.subtitle}>
              Historique de vos transactions et factures.
            </p>
          </div>
          <span className={sharedStyles.previewTag}>
            Données de démonstration
          </span>
        </div>

        <Reveal className={sharedStyles.tableWrap}>
          <table className={sharedStyles.table}>
            <thead>
              <tr>
                <th>Date</th>
                <th>Description</th>
                <th>Montant</th>
                <th>Méthode</th>
                <th>Statut</th>
                <th>Facture</th>
              </tr>
            </thead>
            <tbody>
              {payments.map((p, i) => (
                <tr key={i}>
                  <td className="mono">{p.date}</td>
                  <td>{p.desc}</td>
                  <td className="mono">{p.amount}</td>
                  <td>{p.method}</td>
                  <td>
                    <span
                      className={`${sharedStyles.badge} ${badgeClass(p.status, sharedStyles)}`}
                    >
                      {p.status}
                    </span>
                  </td>
                  <td className="mono">PDF</td>
                </tr>
              ))}
            </tbody>
          </table>
        </Reveal>
      </div>
    </DashboardLayout>
  );
}
