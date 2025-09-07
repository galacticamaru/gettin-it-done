import { useState, useRef, useEffect, ReactNode } from 'react';
import { RefreshCw } from 'lucide-react';

interface PullToRefreshProps {
  onRefresh: () => Promise<void>;
  children: ReactNode;
  className?: string;
}

export const PullToRefresh = ({ onRefresh, children, className = '' }: PullToRefreshProps) => {
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [pullDistance, setPullDistance] = useState(0);
  const [startY, setStartY] = useState(0);
  const containerRef = useRef<HTMLDivElement>(null);
  
  const threshold = 80; // Distance needed to trigger refresh
  
  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;
    
    const handleTouchStart = (e: TouchEvent) => {
      if (container.scrollTop === 0) {
        setStartY(e.touches[0].clientY);
      }
    };
    
    const handleTouchMove = (e: TouchEvent) => {
      if (container.scrollTop === 0 && !isRefreshing) {
        const currentY = e.touches[0].clientY;
        const distance = Math.max(0, (currentY - startY) * 0.5); // Damped pull
        
        if (distance > 0) {
          e.preventDefault();
          setPullDistance(Math.min(distance, threshold + 20));
        }
      }
    };
    
    const handleTouchEnd = async () => {
      if (pullDistance > threshold && !isRefreshing) {
        setIsRefreshing(true);
        
        // Add haptic feedback
        if ('vibrate' in navigator) {
          navigator.vibrate(50);
        }
        
        try {
          await onRefresh();
        } finally {
          setIsRefreshing(false);
        }
      }
      
      setPullDistance(0);
      setStartY(0);
    };
    
    container.addEventListener('touchstart', handleTouchStart, { passive: false });
    container.addEventListener('touchmove', handleTouchMove, { passive: false });
    container.addEventListener('touchend', handleTouchEnd);
    
    return () => {
      container.removeEventListener('touchstart', handleTouchStart);
      container.removeEventListener('touchmove', handleTouchMove);
      container.removeEventListener('touchend', handleTouchEnd);
    };
  }, [pullDistance, startY, isRefreshing, onRefresh, threshold]);
  
  return (
    <div ref={containerRef} className={`relative overflow-auto ${className}`}>
      {/* Pull indicator */}
      <div 
        className="absolute top-0 left-0 right-0 flex items-center justify-center transition-all duration-200 ease-out"
        style={{
          height: `${Math.max(0, pullDistance)}px`,
          transform: `translateY(-${Math.max(0, pullDistance - 60)}px)`,
        }}
      >
        <div className={`flex items-center gap-2 text-muted-foreground transition-opacity duration-200 ${
          pullDistance > 20 ? 'opacity-100' : 'opacity-0'
        }`}>
          <RefreshCw 
            className={`h-5 w-5 transition-transform duration-200 ${
              isRefreshing ? 'animate-spin' : pullDistance > threshold ? 'rotate-180' : ''
            }`} 
          />
          <span className="text-sm font-medium">
            {isRefreshing ? 'Refreshing...' : pullDistance > threshold ? 'Release to refresh' : 'Pull to refresh'}
          </span>
        </div>
      </div>
      
      {children}
    </div>
  );
};