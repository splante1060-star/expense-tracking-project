import {
  BanknoteArrowUp,
  Car,
  CircleDollarSign,
  Clapperboard,
  CreditCard,
  House,
  Plane,
  ReceiptText,
  ShoppingBag,
  Utensils,
  ShieldAlert,
  Salad,
} from "lucide-react";

import type { LucideIcon } from "lucide-react";

export const categoryIconMap: Record<string, LucideIcon> = {
  GROCERIES: Salad,
  DINING: Utensils,
  SHOPPING: ShoppingBag,
  ENTERTAINMENT: Clapperboard,
  TRANSPORTATION: Car,
  TRAVEL: Plane,
  HOUSING: House,
  UTILITIES: ReceiptText,
  LOANS: CreditCard,
  INSURANCE: ShieldAlert,
  INCOME: BanknoteArrowUp,
  OTHER: CircleDollarSign,
};
