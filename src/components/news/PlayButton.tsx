import { Play } from 'lucide-react';

export function PlayButton({ className = '' }: { className?: string }) {
  return (
    <div
      className={`bg-blue-500 flex items-center justify-center ${className}`}
      aria-label="Play video"
    >
      <Play className="w-5 h-5 text-white fill-white" />
    </div>
  );
}
