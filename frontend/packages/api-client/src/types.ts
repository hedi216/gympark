export type Role = "ADMIN" | "EMPLOYEE" | "MEMBER";
export interface AuthUser {
  id: string;
  email: string;
  role: Role;
  mustChangePassword: boolean;
  memberId: string | null;
  firstName: string;
  lastName: string;
}
export interface Account {
  id: string;
  email: string;
  role: Role;
  isActive: boolean;
  mustChangePassword: boolean;
  memberId: string | null;
  memberNumber: string | null;
  firstName: string;
  lastName: string;
  phone: string | null;
  createdAt: string;
  lastLoginAt: string | null;
}
export interface AccountInput {
  email: string;
  firstName?: string;
  lastName?: string;
  phone?: string;
}
export interface ProvisionedAccount {
  account: Account;
  temporaryPassword: string;
}
export interface Page<T> {
  items: T[];
  total: number;
  page: number;
  pageSize: number;
}
export interface Course {
  id: string;
  name: string;
  description: string;
  category: string;
  coachName: string | null;
  defaultDurationMinutes: number;
  defaultCapacity: number;
  reservationRequired: boolean;
  womenOnly: boolean;
  active: boolean;
  publiclyVisible: boolean;
  imageUrl: string | null;
  notes: string | null;
}
export type CourseInput = Omit<Course, "id">;
export interface Series {
  id: string;
  courseId: string;
  courseName: string;
  startDate: string;
  endDate: string | null;
  recurrence: "Once" | "Daily" | "Weekly";
  weekdays: string;
  startTime: string;
  durationMinutes: number;
  capacity: number;
  active: boolean;
}
export interface SeriesInput extends Omit<
  Series,
  "id" | "courseName" | "weekdays"
> {
  weekdays: number[];
  effectiveFrom?: string;
}
export interface ClassSession {
  id: string;
  courseId: string;
  seriesId: string;
  courseName: string;
  category: string;
  startsAt: string;
  endsAt: string;
  capacity: number;
  bookedCount: number;
  remainingPlaces: number;
  status: "Scheduled" | "Cancelled";
  coach: string | null;
  womenOnly: boolean;
  reservationRequired: boolean;
  isOverride: boolean;
  notes: string | null;
}
export interface SessionInput {
  startsAt: string;
  endsAt: string;
  capacity: number;
  coachOverride: string | null;
  notesOverride: string | null;
}
export interface Reservation {
  id: string;
  memberId: string;
  memberName: string | null;
  email: string | null;
  memberNumber: string | null;
  status: "Booked" | "Cancelled";
  createdAt: string;
  cancelledAt: string | null;
  session: ClassSession;
}
export interface Subscription {
  id: string;
  name: string;
  plan?: string;
  startDate: string;
  endDate: string;
  status: string;
  amountPaid: number;
  member?: string;
  memberId?: string;
  accessMode?: string;
}
export interface Payment {
  id: string;
  amount: number;
  method: string;
  status: string;
  createdAt: string;
  member?: string;
  memberId?: string;
}
export interface CheckIn {
  id: string;
  checkedInAt: string;
  member?: string;
  memberId?: string;
}
export interface MemberData {
  id: string;
  memberNumber: string;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  createdAt: string;
  isSuspended: boolean;
  subscriptions: Subscription[];
  payments: Payment[];
  attendance: CheckIn[];
  reservations: Reservation[];
}
export interface MembershipPlan {
  id: string;
  name: string;
  description: string;
  durationDays: number;
  price: number;
  discountPrice: number | null;
  pauseDaysAllowed: number;
  guestPasses: number;
  loyaltyPointsAwarded: number;
  recommended: boolean;
  benefits: string[];
}
