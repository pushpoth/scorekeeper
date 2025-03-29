
import React from "react";
import { Medal, Award } from "lucide-react";
import { cn } from "@/lib/utils";

interface MedalIconProps {
  rank: number;
  size?: number;
  className?: string;
}

const MedalIcon: React.FC<MedalIconProps> = ({ rank, size = 18, className }) => {
  if (rank > 4) return null;
  
  const colors = {
    1: "text-yellow-500", // Gold
    2: "text-gray-400",   // Silver
    3: "text-amber-600",  // Bronze
    4: "text-gray-700"    // Black
  };

  return (
    <span className={cn("flex items-center justify-center", colors[rank as 1|2|3|4], className)}>
      {rank <= 3 ? (
        <Medal size={size} />
      ) : (
        <Award size={size} />
      )}
    </span>
  );
};

export default MedalIcon;
