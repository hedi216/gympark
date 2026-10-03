import type {
  AuthUser,
  Account,
  AccountInput,
  Page,
  ProvisionedAccount,
  Course,
  CourseInput,
  Series,
  SeriesInput,
  ClassSession,
  SessionInput,
  Reservation,
  MemberData,
  MembershipPlan,
  Subscription,
  Payment,
  CheckIn,
} from "./types";
export * from "./types";
export { AuthProvider } from "./AuthProvider";
export { useAuth } from "./auth-context";
export const API_BASE_URL = (
  import.meta.env.VITE_API_BASE_URL || "http://localhost:5154/api"
).replace(/\/$/, "");
export const ADMIN_URL = (
  import.meta.env.VITE_ADMIN_CONSOLE_URL || "http://localhost:5182"
).replace(/\/$/, "");
export const PUBLIC_URL = (
  import.meta.env.VITE_PUBLIC_SITE_URL || "http://localhost:5180"
).replace(/\/$/, "");
export class ApiError extends Error {
  status: number;
  code?: string;
  constructor(status: number, message: string, code?: string) {
    super(message);
    this.status = status;
    this.code = code;
  }
}
export async function request<T>(
  path: string,
  method = "GET",
  data?: unknown,
): Promise<T> {
  let response: Response;
  try {
    response = await fetch(`${API_BASE_URL}${path}`, {
      method,
      credentials: "include",
      headers: { "Content-Type": "application/json", "X-GymPark-Request": "1" },
      ...(data === undefined ? {} : { body: JSON.stringify(data) }),
    });
  } catch {
    throw new ApiError(
      0,
      "Connexion au serveur impossible. Vérifiez votre connexion et réessayez.",
    );
  }
  if (!response.ok) {
    const body = await response.json().catch(() => ({}));
    if (response.status === 401 && !path.startsWith("/auth/"))
      window.dispatchEvent(new Event("gympark-session-expired"));
    const validation = body.errors
      ? Object.values(body.errors).flat().join(" ")
      : "";
    throw new ApiError(
      response.status,
      validation ||
        body.title ||
        {
          401: "Connectez-vous pour continuer.",
          403: "Vous n’avez pas accès à cette action.",
          404: "Cet élément est introuvable.",
          409: "Conflit : rechargez et réessayez.",
          429: "Trop de tentatives. Réessayez plus tard.",
        }[response.status] ||
        "Le serveur a rencontré une erreur. Réessayez.",
      body.code,
    );
  }
  return response.status === 204 ? (undefined as T) : response.json();
}
export const api = {
  auth: {
    me: () => request<AuthUser>("/auth/me"),
    login: (email: string, password: string) =>
      request<AuthUser>("/auth/login", "POST", { email, password }),
    changePassword: (
      currentPassword: string,
      newPassword: string,
      confirmPassword: string,
    ) =>
      request<AuthUser>("/auth/change-password", "POST", {
        currentPassword,
        newPassword,
        confirmPassword,
      }),
    logout: () => request<void>("/auth/logout", "POST"),
  },
  accounts: (kind: "members" | "employees") => ({
    list: (query = "") => request<Page<Account>>(`/${kind}?${query}`),
    get: (id: string) => request<Account>(`/${kind}/${id}`),
    create: (input: AccountInput) =>
      request<ProvisionedAccount>(`/${kind}`, "POST", input),
    edit: (id: string, input: AccountInput) =>
      request<Account>(`/${kind}/${id}`, "PUT", input),
    reset: (id: string) =>
      request<ProvisionedAccount>(`/${kind}/${id}/reset-password`, "POST"),
    setActive: (id: string, active: boolean) =>
      request<Account>(
        `/${kind}/${id}/${active ? "reactivate" : "deactivate"}`,
        "POST",
      ),
  }),
  courses: {
    list: (staff = false) =>
      request<Course[]>(`/courses${staff ? "/manage" : ""}`),
    save: (input: CourseInput, id?: string) =>
      request<Course>(
        `/courses${id ? `/${id}` : ""}`,
        id ? "PUT" : "POST",
        input,
      ),
  },
  series: {
    list: () => request<Series[]>("/class-series"),
    save: (input: SeriesInput, id?: string) =>
      request<{
        id: string;
        message: string;
        preservedBookedOrOverriddenSessions: number;
      }>(`/class-series${id ? `/${id}` : ""}`, id ? "PUT" : "POST", input),
    generate: () => request<void>("/class-series/generate", "POST"),
  },
  sessions: {
    list: (from: string, to: string, staff = false) =>
      request<ClassSession[]>(
        `/class-sessions${staff ? "/manage" : ""}?from=${from}&to=${to}`,
      ),
    edit: (id: string, input: SessionInput) =>
      request<ClassSession>(`/class-sessions/${id}`, "PUT", input),
    cancel: (id: string) =>
      request<void>(`/class-sessions/${id}/cancel`, "POST"),
    participants: (id: string) =>
      request<Reservation[]>(`/class-sessions/${id}/reservations`),
    book: (id: string, memberId: string) =>
      request<Reservation>(`/class-sessions/${id}/reservations`, "POST", {
        memberId,
      }),
    cancelBooking: (id: string, memberId: string) =>
      request<void>(`/class-sessions/${id}/reservations/${memberId}`, "DELETE"),
  },
  reservations: {
    list: () => request<Reservation[]>("/me/class-reservations"),
    book: (id: string) =>
      request<Reservation>(`/me/class-reservations/${id}`, "POST"),
    cancel: (id: string) =>
      request<void>(`/me/class-reservations/${id}`, "DELETE"),
  },
  member: {
    get: () => request<MemberData>("/me"),
    profile: (input: { firstName: string; lastName: string; phone: string }) =>
      request("/me/profile", "PUT", input),
  },
  operations: {
    overview: () =>
      request<{
        members: number;
        upcomingSessions: number;
        upcomingReservations: number;
      }>("/operations/overview"),
    member: (id: string) => request<MemberData>(`/operations/members/${id}`),
    subscriptions: () => request<Subscription[]>("/operations/subscriptions"),
    subscribe: (
      id: string,
      input: { planCode: string; startDate: string; amountPaid: number },
    ) => request(`/operations/members/${id}/subscriptions`, "POST", input),
    cancelSubscription: (id: string) =>
      request<void>(`/operations/subscriptions/${id}/cancel`, "POST"),
    attendance: () => request<CheckIn[]>("/operations/attendance"),
    checkin: (memberId: string) =>
      request("/operations/attendance", "POST", { memberId }),
    payments: () => request<Payment[]>("/operations/payments"),
    payment: (memberId: string, amount: number, method: string) =>
      request("/operations/payments", "POST", { memberId, amount, method }),
  },
  getMembershipPlans: () => request<MembershipPlan[]>("/membershipplans"),
};
export const errorMessage = (error: unknown) =>
  error instanceof Error ? error.message : "Une erreur est survenue.";
