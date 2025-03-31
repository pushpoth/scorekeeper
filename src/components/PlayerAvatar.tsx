
import React from "react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Player } from "@/types";

interface PlayerAvatarProps {
  player: Player;
  size?: "sm" | "md" | "lg";
}

const PlayerAvatar: React.FC<PlayerAvatarProps> = ({ player, size = "md" }) => {
  const sizeClasses = {
    sm: "h-6 w-6 text-xs",
    md: "h-10 w-10 text-sm",
    lg: "h-14 w-14 text-lg",
  };
  
  const getAvatarFallback = () => {
    if (player.avatar?.type === "emoji") {
      return player.avatar.value;
    } else {
      return player.name.charAt(0).toUpperCase();
    }
  };
  
  // Use player's color as background if available
  const style = player.color ? {
    backgroundColor: player.color,
    color: '#fff' // White text for contrast
  } : undefined;
  
  return (
    <Avatar className={sizeClasses[size]}>
      {player.avatar?.type === "image" && (
        <AvatarImage src={player.avatar.value} alt={player.name} />
      )}
      <AvatarFallback style={style}>
        {getAvatarFallback()}
      </AvatarFallback>
    </Avatar>
  );
};

export default PlayerAvatar;
