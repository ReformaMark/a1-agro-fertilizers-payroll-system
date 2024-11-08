'use client';
import Link from 'next/link';

export function AttendanceButtons() {
  return (
    <div className="">
      <Link
        href="/time-in-out"
        className="flex items-center justify-center px-6 py-4 bg-emerald-600 text-white font-medium rounded-lg hover:bg-emerald-700 transition-colors"
      >
        TimeIn and TimeOut
      </Link>
    
    </div>
  );
}
