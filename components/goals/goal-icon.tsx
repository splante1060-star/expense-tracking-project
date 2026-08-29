import { Gem } from "lucide-react";
import { goalIconMap } from "@/lib/goal-icons";

type GoalIconProps = {
  name: string;
  size?: number;
};

export default function GoalIcon({ name, size = 18 }: GoalIconProps) {
  const Icon = goalIconMap[name] ?? Gem;

  return <Icon size={size} strokeWidth={1.8} />;
}
