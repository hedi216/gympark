// Mirrors GymPlatform.Domain entities exposed by the API.
// Keep in sync with backend/src/GymPlatform.Domain/Entities as endpoints are added.

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
