'use client';
import { useEffect, useState } from 'react';

export function TimeDisplay() {
  const [currentTime, setCurrentTime] = useState<Date>();

  useEffect(() => {
    // Set initial time after mount
    setCurrentTime(new Date());
    
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  if (!currentTime) return null;

  const dayOfWeek = currentTime.toLocaleDateString('en-US', { weekday: 'short' }).toLowerCase();
  const date = currentTime.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });

  return (
    <div className="flex flex-col items-center font-mono mt-2">
      <div className="text-2xl">
        {dayOfWeek}, {currentTime.toLocaleTimeString()}
      </div>
      <div className="text-lg mt-1">
        {date}
      </div>
    </div>
  );
}