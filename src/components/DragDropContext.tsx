import React, { useEffect, useState } from 'react';
import { DndProvider } from 'react-dnd';
import { HTML5Backend } from 'react-dnd-html5-backend';
import { TouchBackend } from 'react-dnd-touch-backend';

interface DragDropContextProps {
  children: React.ReactNode;
}

export const DragDropContext = ({ children }: DragDropContextProps) => {
  const [isTouchDevice, setIsTouchDevice] = useState(false);

  useEffect(() => {
    // Check if device supports touch
    const checkTouch = () => {
      setIsTouchDevice(
        'ontouchstart' in window ||
        navigator.maxTouchPoints > 0 ||
        // @ts-ignore
        navigator.msMaxTouchPoints > 0
      );
    };

    checkTouch();
    // Also re-check on resize in case it's a 2-in-1 device
    window.addEventListener('resize', checkTouch);
    return () => window.removeEventListener('resize', checkTouch);
  }, []);

  const backend = isTouchDevice ? TouchBackend : HTML5Backend;
  const backendOptions = isTouchDevice ? { enableMouseEvents: true, delayTouchStart: 200 } : undefined;

  return (
    <DndProvider backend={backend} options={backendOptions}>
      {children}
    </DndProvider>
  );
};
