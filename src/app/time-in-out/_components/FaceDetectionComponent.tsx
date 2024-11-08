/* eslint-disable @typescript-eslint/no-explicit-any */
'use client'
import React, { useEffect, useRef, useState } from 'react';

import { useMutation, useQuery } from 'convex/react';
import { Employee } from '@/lib/types';
import { api } from '../../../../convex/_generated/api';
import { TimeDisplay } from '@/components/time-display';
import { ConvexError } from 'convex/values';

interface FaceAPI {
    nets: any;
    fetchImage: any;
    detectSingleFace: any;
    LabeledFaceDescriptors: any;
    FaceMatcher: any;
  }

// Add a flag to track TF initialization

export default function FaceDetectionComponent() {
  const [faceapi, setFaceapi] = useState<FaceAPI | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const employees = useQuery(api.users.getAllEmployees)
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const [openVideo, setOpenVideo] = useState<boolean>(false);
  const filteredEmployees = employees?.filter((employee) => employee.imageUrl !== null)
  const imageUrls = filteredEmployees?.map((employee) => employee.imageUrl)
  const [detectedFace, setDetectedFace] = useState<Employee | undefined>(undefined)
  const [isDetecting, setIsDetecting] = useState<string>("")
  const [timeoutId, setTimeoutId] = useState<NodeJS.Timeout | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [currentTime, setCurrentTime] = useState<Date>();
  const createAttendance = useMutation(api.attendance.timeIn)
  const timeOut = useMutation(api.attendance.timeOut)

  useEffect(() => {
    async function loadLibraries() {
      try {
       
        const faceapiModule = await import('@vladmandic/face-api');
        setFaceapi(faceapiModule);
        setIsLoading(false);
      } catch (error) {
        console.error('Error loading libraries:', error);
        setIsDetecting("Error loading required libraries");
      }
    }

    loadLibraries();

    // Cleanup function
    return () => {
      // Optional: Add any cleanup needed for face-api
    };
  }, []);

  useEffect(() => {
    if (!faceapi) return;

    async function loadModels() {
      try {
        const modelPath = '/models';
        await Promise.all([
          faceapi?.nets.ssdMobilenetv1.loadFromUri(modelPath),
          faceapi?.nets.tinyFaceDetector.loadFromUri(modelPath),
          faceapi?.nets.faceLandmark68Net.loadFromUri(modelPath),
          faceapi?.nets.faceRecognitionNet.loadFromUri(modelPath),
        ]);
      } catch (error) {
        console.error('Error loading models:', error);
        setIsDetecting("Error loading face detection models");
      }
    }

    loadModels();
  }, [faceapi]);

  const startVideo = async () => {
    if (videoRef.current) {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({ video: true });
        videoRef.current.srcObject = stream;
      } catch (error) {
        console.error('Error accessing webcam:', error);
      }
    }
  }

  const detectFace = async () => {
    if (!faceapi || !videoRef.current) return;
    setIsDetecting("Detecting...")
    setError(null)
    setDetectedFace(undefined)
    setCurrentTime(undefined)
    setTimeoutId(null)
    // Set a timeout to stop detection after 10 seconds
    const timeout = setTimeout(() => {
      setIsDetecting("Detection timeout - Please try again");
      setOpenVideo(false);
      if (videoRef.current) {
        videoRef.current.removeEventListener('play', detectFace);
      }
    }, 10000); // 10 seconds
    
    setTimeoutId(timeout);

    if (videoRef.current) {
      const video = videoRef.current;
      const result = await faceapi.detectSingleFace(video)
        .withFaceLandmarks()
        .withFaceDescriptor();

      if (imageUrls) {
        console.log(imageUrls)
        const imageWithDescriptor = await Promise.all(
          imageUrls.map(async (imageUrl) => {
            if (!imageUrl) return null
            const img = await faceapi.fetchImage(imageUrl);
            const fullFaceDescription = await faceapi.detectSingleFace(img)
              .withFaceLandmarks()
              .withFaceDescriptor();

            if (!fullFaceDescription) {
              console.log(`No face detected in image: ${imageUrl}`);
              return null;
            }
            
            return new faceapi.LabeledFaceDescriptors(imageUrl, [fullFaceDescription.descriptor]);
          })
        ).then(descriptors => descriptors.filter(Boolean)); // Remove null values
     
        if (result && imageWithDescriptor.length > 0) {
          // Compare video face with stored employee faces
          const maxDescriptorDistance = 0.5; // Lower threshold for stricter matching
          const faceMatcher = new faceapi.FaceMatcher(imageWithDescriptor, maxDescriptorDistance);
          
          try {
            const matchResult = faceMatcher.findBestMatch(result.descriptor);
            
            if (matchResult.distance < maxDescriptorDistance) {
              // Found a match
              const matchedImageUrl = matchResult.label;
              const matchedEmployee = filteredEmployees?.find(emp => emp.imageUrl === matchedImageUrl);
              console.log('Match found:', matchedEmployee);
              
              setIsDetecting("")
              setOpenVideo(false)
              
              setCurrentTime(new Date())
              clearTimeout(timeout);
              if (matchedEmployee?._id) {
                const now = new Date();
                const isTimeOut = now.getHours() >= 0 && now.getHours() < 12; // 12am-11:59am is timeout period
                if (isTimeOut) {
                  createAttendance({
                    timeIn: now.getTime(),
                    userId: matchedEmployee._id,
                    date: now.toISOString().split('T')[0],
                    type: "Regular",
                  }).then((res) => {
                    console.log('Attendance created:', res);
                  }).catch(() => {
                    setError("You have already timed in for today!")
                  }).finally(() => {
                    setDetectedFace(matchedEmployee)
                  })
                } else {
                  timeOut({
                    timeOut: now.getTime(),
                    userId: matchedEmployee._id,
                    date: now.toISOString().split('T')[0],
                  }).then((res) => {
                    console.log('Attendance created:', res);
                  }).catch((error) => {
                  const errorMessage =  error instanceof ConvexError
                      ? (error.data as { message: string }).message
                      :  "Unexpected error occurred";
                    setError(errorMessage);
                  }).finally(() => {
                    setDetectedFace(matchedEmployee)
                  })
                }
              }
             
            } else {
              setDetectedFace(undefined)
              setIsDetecting("No match found")
            }
          } catch (error) {
            console.error('Error matching faces:', error);
            setDetectedFace(undefined)
            setIsDetecting("Error matching faces")
          }
        } else {
          setDetectedFace(undefined)
          setIsDetecting("No face detected in video feed")
        }
      } else {
        setDetectedFace(undefined)
        setIsDetecting("No employee images available for comparison")
      }
    }
  }

  // Clean up timeout when component unmounts
  useEffect(() => {
    return () => {
      if (timeoutId) {
        clearTimeout(timeoutId);
      }
    };
  }, [timeoutId]);

  // Add this new function to stop the video stream
  const stopVideo = () => {
    if (videoRef.current && videoRef.current.srcObject) {
      const stream = videoRef.current.srcObject as MediaStream;
      stream.getTracks().forEach(track => track.stop());
      videoRef.current.srcObject = null;
    }
    setOpenVideo(false);
    setIsDetecting("");
    if (timeoutId) {
      clearTimeout(timeoutId);
      setTimeoutId(null);
    }
  };

  if (isLoading) {
    return <div>Loading face detection libraries...</div>;
  }

  return (
    <div className="h-screen flex flex-col md:grid md:grid-cols-2 gap-4 p-4 md:p-6">
      <div className="flex flex-col gap-4 h-full">
        <div className="bg-white rounded-lg p-4 md:p-6 shadow-md text-center">
          <div className="text-2xl md:text-3xl">
            <TimeDisplay />
          </div>
        </div>
        <div className="relative rounded-lg overflow-hidden bg-gray-100 shadow-md flex-grow">
          <video 
            id='video' 
            ref={videoRef} 
            autoPlay 
            muted 
            className='w-full h-full object-cover'
          />
          {isDetecting && (
            <div className="absolute inset-0 flex items-center justify-center bg-black/50">
              <h1 className='text-xl md:text-2xl font-bold text-white'>{isDetecting}</h1>
            </div>
          )}
          {openVideo && (
            <button
              onClick={stopVideo}
              className="absolute top-2 right-2 p-2 bg-red-600 text-white rounded-full hover:bg-red-700 transition-colors"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 md:h-6 md:w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          )}
        </div>
        <div className="flex gap-4 justify-center">
          <button
            disabled={openVideo}
            onClick={() => {
              setOpenVideo(true)
              startVideo()
              if (videoRef.current) {
                videoRef.current.addEventListener('play', detectFace);
              }
            }}
            className="px-4 py-2 md:px-6 md:py-3 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed text-sm md:text-base"
          >
            Start Detection
          </button>
          <button
            onClick={() => detectFace()}
            className="px-4 py-2 md:px-6 md:py-3 bg-emerald-600 text-white font-medium rounded-lg hover:bg-emerald-700 transition-colors text-sm md:text-base"
          >
            Retry Detection
          </button>
        </div>
      </div>
      <div className="flex flex-col justify-center gap-4">
      {detectedFace && error === null ? (
           <div className="bg-white rounded-lg p-6 md:p-8 shadow-md">
           <p className="text-2xl md:text-3xl font-bold text-gray-900">
           {currentTime && currentTime.getHours() >= 8 && currentTime.getHours() < 13 && (
             <span className="text-red-500 font-semibold block mb-2">Late</span>
           )}
           {currentTime && (currentTime.getHours() >= 1 && currentTime.getHours() <= 13 ? 'Time In' : 'Time Out')} :  {currentTime?.toLocaleTimeString()}    
         </p>
         <p className="text-xl md:text-2xl text-gray-700 mt-4">
           {detectedFace.firstName} {detectedFace.lastName}
         </p>
       </div>
      ) : (
        <p className="text-2xl md:text-3xl font-bold text-red-500">
          {error}
        </p>
      )}
      </div>
    </div>
  );
}