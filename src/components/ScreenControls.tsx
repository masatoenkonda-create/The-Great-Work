import React from 'react';
import { Maximize, Minimize, Volume2, VolumeX } from 'lucide-react';
import { sound } from '../services/audio';

interface ScreenControlsProps {
  isMuted: boolean;
  onToggleMute: () => void;
  isFullscreen: boolean;
  onToggleFullscreen: () => void;
}

// Small sound + fullscreen buttons overlaid in the corner of each screen
export const ScreenControls: React.FC<ScreenControlsProps> = ({
  isMuted,
  onToggleMute,
  isFullscreen,
  onToggleFullscreen
}) => (
  <div className="flex items-center gap-2">
    <button
      onClick={() => {
        sound.playClick();
        onToggleMute();
      }}
      className="p-2 bg-[#030612]/70 hover:bg-[#030612]/90 border border-white/20 rounded text-white/80 hover:text-white cursor-pointer transition-colors"
      title={isMuted ? 'Sound off (M)' : 'Sound on (M)'}
    >
      {isMuted ? <VolumeX size={16} /> : <Volume2 size={16} />}
    </button>
    <button
      onClick={onToggleFullscreen}
      className="p-2 bg-[#030612]/70 hover:bg-[#030612]/90 border border-white/20 rounded text-white/80 hover:text-white cursor-pointer transition-colors"
      title={isFullscreen ? 'Exit fullscreen (F)' : 'Fullscreen (F)'}
    >
      {isFullscreen ? <Minimize size={16} /> : <Maximize size={16} />}
    </button>
  </div>
);
