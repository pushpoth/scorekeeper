
import React from 'react';
import { GameType } from '@/types';
import { Cards, Coins } from 'lucide-react';

interface GameTypeIconProps {
  gameType: GameType;
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

const GameTypeIcon: React.FC<GameTypeIconProps> = ({ 
  gameType, 
  size = 'md',
  className = '' 
}) => {
  const sizeClasses = {
    sm: 'h-4 w-4',
    md: 'h-6 w-6',
    lg: 'h-8 w-8'
  };

  const IconComponent = gameType === 'Phase 10' ? Cards : Coins;
  
  return (
    <div className={`inline-flex items-center justify-center ${className}`}>
      <IconComponent className={`${sizeClasses[size]} text-phase10-blue`} />
    </div>
  );
};

export default GameTypeIcon;
