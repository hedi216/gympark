import { useCallback, useEffect, useState } from "react";
import type { FormEvent } from "react";
import { api, errorMessage } from "@gym-platform/api-client";
import type {
  Account,
  Course,
  CourseInput,
  ClassSession,
  Reservation,
  Series,
  SeriesInput,
  SessionInput,
} from "@gym-platform/api-client";
import { Modal } from "@gym-platform/design-system";
import config from "../../../../../config/gym-park.json" with { type: "json" };
const localDate = (date = new Date()) =>
  new Intl.DateTimeFormat("en-CA", {
    timeZone: config.timezone,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).format(date);
const time = (value: string) =>
  new Date(value).toLocaleTimeString("fr-FR", {
    timeZone: config.timezone,
    hour: "2-digit",
    minute: "2-digit",
  });
const fullDate = (value: string) =>
  new Date(value).toLocaleString("fr-FR", {
    timeZone: config.timezone,
    dateStyle: "medium",
    timeStyle: "short",
  });
const labels = ["Dim", "Lun", "Mar", "Mer", "Jeu", "Ven", "Sam"];
// Resolve the configured club timezone, independently of the browser timezone.
function clubInstant(date: string, time: string) {
  const wall = Date.parse(`${date}T${time}:00Z`);
  let instant = wall;
  for (let i = 0; i < 3; i++) {
    const parts = new Intl.DateTimeFormat("en-CA", {
      timeZone: config.timezone,
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
      hourCycle: "h23",
    }).formatToParts(new Date(instant));
    const part = (name: string) => parts.find((p) => p.type === name)!.value;
    const displayed = Date.parse(
      `${part("year")}-${part("month")}-${part("day")}T${part("hour")}:${part("minute")}:${part("second")}Z`,
    );
    instant += wall - displayed;
  }
  return new Date(instant).toISOString();
}

export function CoursesPage({
  reservationsOnly = false,
}: {
  reservationsOnly?: boolean;
}) {
  const [courses, setCourses] = useState<Course[]>([]);
  const [series, setSeries] = useState<Series[]>([]);
  const [sessions, setSessions] = useState<ClassSession[]>([]);
  const [offset, setOffset] = useState(0);
  const [view, setView] = useState("Liste");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [courseEditor, setCourseEditor] = useState<Course | "new" | null>(null);
  const [seriesEditor, setSeriesEditor] = useState<{
    series?: Series;
    from?: string;
  } | null>(null);
  const [sessionEditor, setSessionEditor] = useState<ClassSession | null>(null);
  const [participants, setParticipants] = useState<ClassSession | null>(null);
  const [cancel, setCancel] = useState<ClassSession | null>(null);
  const [busy, setBusy] = useState(false);
  const monday = new Date(`${localDate()}T12:00:00Z`);
  monday.setUTCDate(
    monday.getUTCDate() - ((monday.getUTCDay() + 6) % 7) + offset * 7,
  );
  const dates = Array.from({ length: 7 }, (_, i) => {
    const d = new Date(monday);
    d.setUTCDate(d.getUTCDate() + i);
    return d;
  });
  const from = dates[0].toISOString().slice(0, 10);
  const to = dates[6].toISOString().slice(0, 10);
  const load = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const [a, b, c] = await Promise.all([
        api.courses.list(true),
        api.series.list(),
        api.sessions.list(from, to, true),
      ]);
      setCourses(a);
      setSeries(b);
      setSessions(c);
    } catch (e) {
      setError(errorMessage(e));
    } finally {
      setLoading(false);
    }
  }, [from, to]);
  useEffect(() => {
    void load();
  }, [load]);
  async function saved(message = "Enregistré.") {
    setSuccess(message);
    setCourseEditor(null);
    setSeriesEditor(null);
    setSessionEditor(null);
    await load();
  }
  async function cancelSession() {
    if (!cancel) return;
    setBusy(true);
    try {
      await api.sessions.cancel(cancel.id);
      setCancel(null);
      await saved(
        "Séance annulée. Les réservations sont conservées dans l’historique.",
      );
    } catch (e) {
      setError(errorMessage(e));
    } finally {
      setBusy(false);
    }
  }
  function sessionCard(s: ClassSession) {
    return (
      <article className="management-card" key={s.id}>
        <h3>{s.courseName}</h3>
        <p>
          {fullDate(s.startsAt)} — {time(s.endsAt)}
        </p>
        <p>
          {s.coach ?? "Coach à préciser"}
          {s.womenOnly ? " · Séance femmes" : ""}
        </p>
        <p>
          {s.bookedCount} réservés / {s.capacity} · {s.remainingPlaces} places
          libres
        </p>
        <span className="status-badge">
          {s.status === "Cancelled"
            ? "ANNULÉ"
            : s.remainingPlaces === 0
              ? "COMPLET"
              : "PROGRAMMÉ"}
        </span>
        <div className="session-actions">
          <button className="action-button" onClick={() => setParticipants(s)}>
            Participants
          </button>
          {!reservationsOnly &&
            s.status !== "Cancelled" &&
            new Date(s.startsAt) > new Date() && (
              <>
                <button
                  className="action-button secondary"
                  onClick={() => setSessionEditor(s)}
                >
                  Cette séance
                </button>
                <button
                  className="action-button secondary"
                  onClick={() =>
                    setSeriesEditor({
                      series: series.find((item) => item.id === s.seriesId),
                      from: localDate(new Date(s.startsAt)),
                    })
                  }
                >
                  Cette séance et suivantes
                </button>
                <button
                  className="action-button danger"
                  onClick={() => setCancel(s)}
                >
                  Annuler la séance
                </button>
              </>
            )}
        </div>
      </article>
    );
  }
  return (
    <>
      <div className="toolbar">
        <div>
          <p className="eyebrow">Planning & participants · heure de Tunis</p>
          <h1>{reservationsOnly ? "Réservations" : "Cours"}</h1>
        </div>
        {!reservationsOnly && (
          <div className="form-actions">
            <button
              className="action-button"
              onClick={() => setCourseEditor("new")}
            >
              Créer un cours
            </button>
            <button
              className="action-button secondary"
              disabled={!courses.length}
              onClick={() => setSeriesEditor({})}
            >
              Programmer des séances
            </button>
          </div>
        )}
      </div>
      {error && !cancel && (
        <p className="api-error" role="alert">
          {error}
          <button
            onClick={() => void load()}
            className="action-button secondary"
          >
            Réessayer
          </button>
        </p>
      )}
      {success && (
        <p className="api-success" role="status">
          {success}
        </p>
      )}
      <div className="filter-bar">
        <button
          className="action-button secondary"
          aria-label="Semaine précédente"
          onClick={() => setOffset((v) => v - 1)}
        >
          ←
        </button>
        <span>
          {from} — {to}
        </span>
        <button
          className="action-button secondary"
          aria-label="Semaine suivante"
          onClick={() => setOffset((v) => v + 1)}
        >
          →
        </button>
        <select
          aria-label="Affichage du planning"
          value={view}
          onChange={(e) => setView(e.target.value)}
        >
          <option>Liste</option>
          <option>Semaine</option>
        </select>
      </div>
      {loading ? (
        <p className="loading-state">Chargement du planning…</p>
      ) : view === "Semaine" ? (
        <div className="calendar-view">
          {dates.map((date) => (
            <div className="calendar-day" key={date.toISOString()}>
              <h3>
                {labels[date.getUTCDay()]} {date.getUTCDate()}
              </h3>
              {sessions
                .filter(
                  (s) =>
                    localDate(new Date(s.startsAt)) ===
                    date.toISOString().slice(0, 10),
                )
                .map(sessionCard)}
            </div>
          ))}
        </div>
      ) : sessions.length ? (
        <div className="session-grid">{sessions.map(sessionCard)}</div>
      ) : (
        <p className="empty-state">Aucune séance cette semaine.</p>
      )}
      {!reservationsOnly && (
        <>
          <h2>Catalogue des cours</h2>
          <div className="management-list">
            {courses.length === 0 && !loading && (
              <p className="empty-state">
                Créez un premier cours pour commencer le planning.
              </p>
            )}
            {courses.map((c) => (
              <article className="management-card" key={c.id}>
                <h3>{c.name}</h3>
                <p>
                  {c.category} · {c.defaultDurationMinutes} minutes ·{" "}
                  {c.defaultCapacity} places · {c.active ? "Actif" : "Inactif"}{" "}
                  · {c.publiclyVisible ? "Public" : "Non public"}
                </p>
                <button
                  className="action-button secondary"
                  onClick={() => setCourseEditor(c)}
                >
                  Modifier le cours
                </button>
              </article>
            ))}
          </div>
          <h2>Séries programmées</h2>
          <div className="management-list">
            {series.map((s) => (
              <article className="management-card" key={s.id}>
                <h3>{s.courseName}</h3>
                <p>
                  {s.recurrence === "Weekly"
                    ? `Hebdomadaire · ${s.weekdays
                        .split(",")
                        .map((n) => labels[Number(n)])
                        .join(", ")}`
                    : s.recurrence === "Daily"
                      ? "Quotidien"
                      : "Séance unique"}{" "}
                  · {s.startTime.slice(0, 5)} · {s.capacity} places ·{" "}
                  {s.active ? "Active" : "Inactive"}
                </p>
                <p>
                  {s.startDate} → {s.endDate ?? "Sans date de fin"} · Génération
                  sur 12 semaines
                </p>
                <button
                  className="action-button secondary"
                  onClick={() => setSeriesEditor({ series: s })}
                >
                  Modifier les séances futures
                </button>
              </article>
            ))}
          </div>
        </>
      )}
      {courseEditor && (
        <CourseEditor
          value={courseEditor === "new" ? null : courseEditor}
          onClose={() => setCourseEditor(null)}
          onSaved={saved}
        />
      )}
      {seriesEditor && (
        <SeriesEditor
          value={seriesEditor.series}
          from={seriesEditor.from}
          courses={courses}
          onClose={() => setSeriesEditor(null)}
          onSaved={saved}
        />
      )}
      {sessionEditor && (
        <SessionEditor
          value={sessionEditor}
          onClose={() => setSessionEditor(null)}
          onSaved={saved}
        />
      )}
      {participants && (
        <Participants
          session={participants}
          onClose={() => {
            setParticipants(null);
            void load();
          }}
        />
      )}
      {cancel && (
        <Modal
          title="Annuler cette séance ?"
          onClose={() => !busy && setCancel(null)}
        >
          <p>
            {cancel.courseName} · {fullDate(cancel.startsAt)}
          </p>
          <p>
            {cancel.bookedCount} réservation(s) resteront dans l’historique. Les
            membres verront la séance annulée.
          </p>
          {error && (
            <p className="api-error" role="alert">
              {error}
            </p>
          )}
          <div className="form-actions">
            <button
              className="action-button danger"
              disabled={busy}
              onClick={() => void cancelSession()}
            >
              Confirmer l’annulation
            </button>
            <button
              className="action-button secondary"
              onClick={() => setCancel(null)}
            >
              Retour
            </button>
          </div>
        </Modal>
      )}
    </>
  );
}
function CourseEditor({
  value,
  onClose,
  onSaved,
}: {
  value: Course | null;
  onClose: () => void;
  onSaved: (message?: string) => Promise<void>;
}) {
  const [form, setForm] = useState<CourseInput>(
    value ?? {
      name: "",
      description: "",
      category: "",
      coachName: "",
      defaultDurationMinutes: 60,
      defaultCapacity: 20,
      reservationRequired: true,
      womenOnly: false,
      active: true,
      publiclyVisible: true,
      imageUrl: null,
      notes: "",
    },
  );
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);
  async function save(e: FormEvent) {
    e.preventDefault();
    setBusy(true);
    try {
      await api.courses.save(form, value?.id);
      await onSaved();
    } catch (e) {
      setError(errorMessage(e));
    } finally {
      setBusy(false);
    }
  }
  return (
    <Modal
      title={value ? "Modifier le cours" : "Créer un cours"}
      onClose={() => !busy && onClose()}
    >
      <form className="form-grid" onSubmit={save}>
        <label>
          Nom du cours
          <input
            value={form.name}
            onChange={(e) => setForm({ ...form, name: e.target.value })}
            maxLength={150}
            required
          />
        </label>
        <label>
          Description
          <textarea
            value={form.description}
            onChange={(e) => setForm({ ...form, description: e.target.value })}
            maxLength={2000}
          />
        </label>
        <label>
          Catégorie
          <input
            value={form.category}
            onChange={(e) => setForm({ ...form, category: e.target.value })}
            maxLength={80}
          />
        </label>
        <label>
          Coach
          <input
            value={form.coachName ?? ""}
            onChange={(e) => setForm({ ...form, coachName: e.target.value })}
            maxLength={150}
          />
        </label>
        <div className="date-grid">
          <label>
            Durée (minutes)
            <input
              type="number"
              min={15}
              max={240}
              value={form.defaultDurationMinutes}
              onChange={(e) =>
                setForm({
                  ...form,
                  defaultDurationMinutes: Number(e.target.value),
                })
              }
              required
            />
          </label>
          <label>
            Capacité par défaut
            <input
              type="number"
              min={1}
              max={1000}
              value={form.defaultCapacity}
              onChange={(e) =>
                setForm({ ...form, defaultCapacity: Number(e.target.value) })
              }
              required
            />
          </label>
        </div>
        {(
          [
            "reservationRequired",
            "womenOnly",
            "active",
            "publiclyVisible",
          ] as const
        ).map((key, i) => (
          <label className="check-field" key={key}>
            <input
              type="checkbox"
              checked={form[key]}
              onChange={(e) => setForm({ ...form, [key]: e.target.checked })}
            />
            {
              [
                "Réservation requise",
                "Séance femmes",
                "Cours actif",
                "Visible publiquement",
              ][i]
            }
          </label>
        ))}
        <label>
          Image (URL HTTPS, facultatif)
          <input
            type="url"
            value={form.imageUrl ?? ""}
            onChange={(e) =>
              setForm({ ...form, imageUrl: e.target.value || null })
            }
          />
        </label>
        <label>
          Notes internes
          <textarea
            value={form.notes ?? ""}
            onChange={(e) => setForm({ ...form, notes: e.target.value })}
          />
        </label>
        {error && (
          <p className="api-error" role="alert">
            {error}
          </p>
        )}
        <button className="action-button" disabled={busy}>
          {busy ? "Enregistrement…" : "Enregistrer le cours"}
        </button>
      </form>
    </Modal>
  );
}
function SeriesEditor({
  value,
  from,
  courses,
  onClose,
  onSaved,
}: {
  value?: Series;
  from?: string;
  courses: Course[];
  onClose: () => void;
  onSaved: (message?: string) => Promise<void>;
}) {
  const [form, setForm] = useState<SeriesInput>(
    value
      ? {
          ...value,
          weekdays: value.weekdays ? value.weekdays.split(",").map(Number) : [],
          effectiveFrom: from ?? localDate(),
        }
      : {
          courseId: courses[0]?.id ?? "",
          startDate: localDate(),
          endDate: null,
          recurrence: "Weekly",
          weekdays: [],
          startTime: "18:00:00",
          durationMinutes: courses[0]?.defaultDurationMinutes ?? 60,
          capacity: courses[0]?.defaultCapacity ?? 20,
          active: true,
        },
  );
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);
  async function save(e: FormEvent) {
    e.preventDefault();
    setBusy(true);
    try {
      const result = await api.series.save(form, value?.id);
      await onSaved(result.message);
    } catch (e) {
      setError(errorMessage(e));
    } finally {
      setBusy(false);
    }
  }
  return (
    <Modal
      title={value ? "Modifier les séances futures" : "Programmer des séances"}
      onClose={() => !busy && onClose()}
    >
      <form className="form-grid" onSubmit={save}>
        <label>
          Cours
          <select
            value={form.courseId}
            disabled={!!value}
            onChange={(e) => {
              const c = courses.find((c) => c.id === e.target.value)!;
              setForm({
                ...form,
                courseId: c.id,
                durationMinutes: c.defaultDurationMinutes,
                capacity: c.defaultCapacity,
              });
            }}
          >
            {courses.map((c) => (
              <option key={c.id} value={c.id}>
                {c.name}
              </option>
            ))}
          </select>
        </label>
        <label>
          Récurrence
          <select
            value={form.recurrence}
            onChange={(e) =>
              setForm({
                ...form,
                recurrence: e.target.value as SeriesInput["recurrence"],
              })
            }
          >
            <option value="Once">Séance unique</option>
            <option value="Daily">Tous les jours</option>
            <option value="Weekly">Chaque semaine</option>
          </select>
        </label>
        {form.recurrence === "Weekly" && (
          <div className="weekdays">
            {[1, 2, 3, 4, 5, 6, 0].map((day) => (
              <label key={day}>
                <input
                  type="checkbox"
                  checked={form.weekdays.includes(day)}
                  onChange={(e) =>
                    setForm({
                      ...form,
                      weekdays: e.target.checked
                        ? [...form.weekdays, day]
                        : form.weekdays.filter((d) => d !== day),
                    })
                  }
                />
                {labels[day]}
              </label>
            ))}
          </div>
        )}
        <div className="date-grid">
          <label>
            Date de début
            <input
              type="date"
              value={form.startDate}
              onChange={(e) => setForm({ ...form, startDate: e.target.value })}
              required
            />
          </label>
          <label>
            Date de fin (facultatif)
            <input
              type="date"
              value={form.endDate ?? ""}
              min={form.startDate}
              onChange={(e) =>
                setForm({ ...form, endDate: e.target.value || null })
              }
            />
          </label>
          <label>
            Heure de début (Tunis)
            <input
              type="time"
              value={form.startTime.slice(0, 5)}
              onChange={(e) =>
                setForm({ ...form, startTime: `${e.target.value}:00` })
              }
              required
            />
          </label>
          <label>
            Durée (minutes)
            <input
              type="number"
              min={15}
              max={240}
              value={form.durationMinutes}
              onChange={(e) =>
                setForm({ ...form, durationMinutes: Number(e.target.value) })
              }
              required
            />
          </label>
          <label>
            Capacité
            <input
              type="number"
              min={1}
              max={1000}
              value={form.capacity}
              onChange={(e) =>
                setForm({ ...form, capacity: Number(e.target.value) })
              }
              required
            />
          </label>
          {value && (
            <label>
              Appliquer à partir du
              <input
                type="date"
                min={localDate()}
                value={form.effectiveFrom}
                onChange={(e) =>
                  setForm({ ...form, effectiveFrom: e.target.value })
                }
                required
              />
            </label>
          )}
        </div>
        <label className="check-field">
          <input
            type="checkbox"
            checked={form.active}
            onChange={(e) => setForm({ ...form, active: e.target.checked })}
          />
          Série active
        </label>
        <p>
          Les séances avec réservations ou modifications individuelles sont
          préservées. Les autres séances futures sont mises à jour ou annulées,
          sans suppression.
        </p>
        {error && (
          <p className="api-error" role="alert">
            {error}
          </p>
        )}
        <button className="action-button" disabled={busy}>
          {busy ? "Enregistrement…" : "Enregistrer le planning"}
        </button>
      </form>
    </Modal>
  );
}
function SessionEditor({
  value,
  onClose,
  onSaved,
}: {
  value: ClassSession;
  onClose: () => void;
  onSaved: (message?: string) => Promise<void>;
}) {
  const [date, setDate] = useState(localDate(new Date(value.startsAt)));
  const [start, setStart] = useState(time(value.startsAt));
  const [end, setEnd] = useState(time(value.endsAt));
  const [capacity, setCapacity] = useState(value.capacity);
  const [coach, setCoach] = useState(value.coach ?? "");
  const [notes, setNotes] = useState(value.notes ?? "");
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);
  async function save(e: FormEvent) {
    e.preventDefault();
    setBusy(true);
    try {
      const input: SessionInput = {
        startsAt: clubInstant(date, start),
        endsAt: clubInstant(
          end <= start
            ? new Date(Date.parse(`${date}T12:00:00Z`) + 86400000)
                .toISOString()
                .slice(0, 10)
            : date,
          end,
        ),
        capacity,
        coachOverride: coach || null,
        notesOverride: notes || null,
      };
      await api.sessions.edit(value.id, input);
      await onSaved("Cette séance a été modifiée. La série reste inchangée.");
    } catch (e) {
      setError(errorMessage(e));
    } finally {
      setBusy(false);
    }
  }
  return (
    <Modal
      title="Modifier cette séance uniquement"
      onClose={() => !busy && onClose()}
    >
      <form className="form-grid" onSubmit={save}>
        <p>
          {value.courseName} · {value.bookedCount} réservation(s)
        </p>
        <label>
          Date
          <input
            type="date"
            value={date}
            onChange={(e) => setDate(e.target.value)}
            required
          />
        </label>
        <div className="date-grid">
          <label>
            Début (Tunis)
            <input
              type="time"
              value={start}
              onChange={(e) => setStart(e.target.value)}
              required
            />
          </label>
          <label>
            Fin (Tunis)
            <input
              type="time"
              value={end}
              onChange={(e) => setEnd(e.target.value)}
              required
            />
          </label>
        </div>
        <label>
          Capacité
          <input
            type="number"
            min={Math.max(1, value.bookedCount)}
            max={1000}
            value={capacity}
            onChange={(e) => setCapacity(Number(e.target.value))}
            required
          />
        </label>
        <label>
          Coach de cette séance
          <input value={coach} onChange={(e) => setCoach(e.target.value)} />
        </label>
        <label>
          Notes internes
          <textarea value={notes} onChange={(e) => setNotes(e.target.value)} />
        </label>
        {error && (
          <p className="api-error" role="alert">
            {error}
          </p>
        )}
        <button className="action-button" disabled={busy}>
          Enregistrer cette séance
        </button>
      </form>
    </Modal>
  );
}
function Participants({
  session,
  onClose,
}: {
  session: ClassSession;
  onClose: () => void;
}) {
  const [rows, setRows] = useState<Reservation[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [members, setMembers] = useState<Account[]>([]);
  const [selected, setSelected] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [busy, setBusy] = useState(false);
  const [cancel, setCancel] = useState<Reservation | null>(null);
  const load = useCallback(async () => {
    setLoading(true);
    try {
      setRows(await api.sessions.participants(session.id));
    } catch (e) {
      setError(errorMessage(e));
    } finally {
      setLoading(false);
    }
  }, [session.id]);
  useEffect(() => {
    void load();
  }, [load]);
  useEffect(() => {
    let alive = true;
    const timer = setTimeout(() => {
      api
        .accounts("members")
        .list(new URLSearchParams({ search, active: "true" }).toString())
        .then((p) => {
          if (alive) setMembers(p.items);
        })
        .catch((e) => {
          if (alive) setError(errorMessage(e));
        });
    }, 200);
    return () => {
      alive = false;
      clearTimeout(timer);
    };
  }, [search]);
  async function book(e: FormEvent) {
    e.preventDefault();
    if (!selected) return;
    setBusy(true);
    setError("");
    try {
      await api.sessions.book(session.id, selected);
      setSelected("");
      await load();
      setSuccess("Adhérent ajouté à la séance.");
    } catch (e) {
      setError(errorMessage(e));
    } finally {
      setBusy(false);
    }
  }
  async function remove() {
    if (!cancel) return;
    setBusy(true);
    try {
      await api.sessions.cancelBooking(session.id, cancel.memberId);
      setCancel(null);
      await load();
      setSuccess("Réservation annulée.");
    } catch (e) {
      setError(errorMessage(e));
    } finally {
      setBusy(false);
    }
  }
  const booked = rows.filter((r) => r.status === "Booked").length;
  return (
    <Modal title={`Participants · ${session.courseName}`} onClose={onClose}>
      <p>
        {fullDate(session.startsAt)} · Capacité {session.capacity}
      </p>
      <p>
        {booked} réservés · {Math.max(0, session.capacity - booked)} places
        disponibles{session.status === "Cancelled" ? " · ANNULÉ" : ""}
      </p>
      {error && (
        <p className="api-error" role="alert">
          {error}
        </p>
      )}
      {success && (
        <p className="api-success" role="status">
          {success}
        </p>
      )}
      {loading ? (
        <p className="loading-state">Chargement…</p>
      ) : rows.length ? (
        <div>
          {rows.map((r) => (
            <div className="details-row" key={r.id}>
              <div>
                <strong>{r.memberName || r.email}</strong>
                <p>
                  {r.email}
                  <br />
                  {r.memberNumber}
                </p>
                <p>
                  {r.status === "Booked" ? "Réservé" : "Annulé"} ·{" "}
                  {fullDate(r.createdAt)}
                </p>
              </div>
              {r.status === "Booked" &&
                new Date(session.startsAt) > new Date() && (
                  <button
                    className="action-button secondary"
                    onClick={() => setCancel(r)}
                  >
                    Annuler la réservation
                  </button>
                )}
            </div>
          ))}
        </div>
      ) : (
        <p className="empty-state">Aucun participant.</p>
      )}
      {session.status !== "Cancelled" &&
        new Date(session.startsAt) > new Date() && (
          <form className="form-grid" onSubmit={book}>
            <h3>Ajouter un adhérent</h3>
            <label>
              Rechercher un adhérent
              <input
                value={search}
                onChange={(e) => {
                  setSearch(e.target.value);
                  setSelected("");
                }}
                placeholder="Nom, email ou numéro"
              />
            </label>
            <label>
              Adhérent
              <select
                value={selected}
                onChange={(e) => setSelected(e.target.value)}
                required
              >
                <option value="">Choisir un adhérent</option>
                {members.map((m) => (
                  <option value={m.memberId!} key={m.id}>
                    {m.email} · {m.firstName} {m.lastName}
                  </option>
                ))}
              </select>
            </label>
            <button
              className="action-button"
              disabled={busy || booked >= session.capacity || !selected}
            >
              Confirmer la réservation
            </button>
          </form>
        )}
      {cancel && (
        <div className="notice">
          <p>Annuler la réservation de {cancel.email} ?</p>
          <div className="form-actions">
            <button
              className="action-button danger"
              disabled={busy}
              onClick={() => void remove()}
            >
              Confirmer l’annulation
            </button>
            <button
              className="action-button secondary"
              onClick={() => setCancel(null)}
            >
              Retour
            </button>
          </div>
        </div>
      )}
    </Modal>
  );
}
