'use client'
import dynamic from 'next/dynamic'

// Create a dynamically imported component with SSR disabled
const FaceDetection = dynamic(
  () => import('./FaceDetectionComponent'),
  { ssr: false } // This is key - it prevents SSR for this component
);

export default FaceDetection;