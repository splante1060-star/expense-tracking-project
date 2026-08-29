import {
  Car,
  Gem,
  Gift,
  GraduationCap,
  Heart,
  House,
  Laptop,
  Palmtree,
  ShoppingBag,
} from "lucide-react";

import type { LucideIcon } from "lucide-react";

export const goalIcons = [
  {
    value: "GEM",
    label: "General",
    icon: Gem,
  },
  {
    value: "PALM_TREE",
    label: "Trip",
    icon: Palmtree,
  },
  {
    value: "CAR",
    label: "Car",
    icon: Car,
  },
  {
    value: "HOUSE",
    label: "Home",
    icon: House,
  },
  {
    value: "GRADUATION",
    label: "Education",
    icon: GraduationCap,
  },
  {
    value: "SHOPPING_BAG",
    label: "Shopping",
    icon: ShoppingBag,
  },
  {
    value: "HEART",
    label: "Special",
    icon: Heart,
  },
  {
    value: "LAPTOP",
    label: "Tech",
    icon: Laptop,
  },
  {
    value: "GIFT",
    label: "Gift",
    icon: Gift,
  },
] as const;

export type GoalIconName = (typeof goalIcons)[number]["value"];

export const goalIconMap: Record<string, LucideIcon> = Object.fromEntries(
  goalIcons.map(({ value, icon }) => [value, icon]),
);
