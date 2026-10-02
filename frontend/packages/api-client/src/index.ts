import type { MembershipPlan } from "./types";

const API_BASE_URL = import.meta.env?.VITE_API_BASE_URL ?? "https://localhost:7000/api";

async function request<T>(path: string): Promise<T> {
  const response = await fetch(`${API_BASE_URL}${path}`);
  if (!response.ok) {
    throw new Error(`API request failed: ${response.status} ${path}`);
  }
  return response.json() as Promise<T>;
}

export const api = {
  getMembershipPlans: () => request<MembershipPlan[]>("/membershipplans"),
};

export type { MembershipPlan };
