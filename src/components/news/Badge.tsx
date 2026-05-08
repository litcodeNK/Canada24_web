import { Play, Star } from 'lucide-react';

type BadgeType = 'live' | 'exclusive' | 'data' | 'podcast' | 'subscribers' | 'jailed';

interface BadgeProps {
  type: BadgeType;
  className?: string;
}

export function Badge({ type, className = '' }: BadgeProps) {
  switch (type) {
    case 'live':
      return (
        <span className={`bg-red-600 text-white text-[10px] font-bold px-1.5 py-0.5 rounded-sm tracking-wider uppercase ${className}`}>
          LIVE
        </span>
      );
    case 'exclusive':
      return (
        <span className={`bg-yellow-400 text-black text-[10px] font-bold px-1.5 py-0.5 rounded-sm tracking-wider uppercase ${className}`}>
          EXCLUSIVE
        </span>
      );
    case 'data':
      return (
        <span className={`bg-yellow-400 text-black text-[10px] font-bold px-1.5 py-0.5 rounded-sm tracking-wider uppercase ${className}`}>
          DATA GRAPHIC
        </span>
      );
    case 'podcast':
      return (
        <span className={`flex items-center gap-1 text-blue-500 text-[10px] font-bold tracking-wider uppercase ${className}`}>
          <div className="bg-blue-500 p-0.5 rounded-sm">
            <Play className="w-2.5 h-2.5 text-white fill-white" />
          </div>
          PODCAST
        </span>
      );
    case 'subscribers':
      return (
        <span className={`border border-blue-500 text-blue-500 text-[10px] font-bold px-1.5 py-0.5 rounded-sm tracking-wider uppercase flex items-center gap-1 w-fit ${className}`}>
          <Star className="w-3 h-3 fill-blue-500" />
          FOR SUBSCRIBERS
        </span>
      );
    case 'jailed':
      return (
        <span className={`flex items-center gap-1 bg-gray-100 text-black text-[10px] font-bold px-1.5 py-0.5 rounded-full tracking-wider uppercase border border-gray-200 ${className}`}>
          <div className="w-3 h-3 rounded-full bg-gradient-to-r from-orange-400 to-green-500 flex items-center justify-center">
            <div className="w-1.5 h-1.5 bg-white rounded-full" />
          </div>
          JAILED AND PREGNANT
        </span>
      );
    default:
      return null;
  }
}
