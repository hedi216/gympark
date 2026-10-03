import { useState } from "react";
import { Modal } from "./Modal";

export function AppDownloadButtons() {
  const [platform, setPlatform] = useState<"iOS" | "Android" | null>(null);

  return (
    <section className="app-downloads" aria-label="Application mobile Gym Park">
      <p className="app-downloads-title">Gym Park sur votre mobile</p>
      <div className="app-downloads-buttons">
        {(["iOS", "Android"] as const).map((device) => (
          <button
            className="app-download-button"
            type="button"
            key={device}
            onClick={() => setPlatform(device)}
          >
            <svg width="24" height="28" viewBox="0 0 24 28" fill="none" aria-hidden="true">
              <rect x="5" y="2" width="14" height="24" rx="3" stroke="currentColor" strokeWidth="1.5" />
              <path d="M9 5h6M10 23h4M12 9v9m-3-3 3 3 3-3" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
            <span>
              <strong>Télécharger pour {device}</strong>
              <small>{device === "iOS" ? "iPhone et iPad" : "Appareils Android"}</small>
            </span>
          </button>
        ))}
      </div>
      {platform && (
        <Modal title={`Application ${platform}`} onClose={() => setPlatform(null)}>
          <p className="app-downloads-message">
            L’application Gym Park pour {platform} sera disponible après l’achat.
            Vous utilisez actuellement une version de démonstration.
          </p>
          <div className="form-actions">
            <button className="action-button" type="button" onClick={() => setPlatform(null)}>
              Compris
            </button>
          </div>
        </Modal>
      )}
    </section>
  );
}
