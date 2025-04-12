import React, { useState, useEffect, useRef } from 'react';
import { Button } from './ui/button';
import { useMonitoring } from '../contexts/MonitoringContext';

interface DropInButtonProps {
  sessionId: string;
  onDropInStart?: () => void;
  onDropInEnd?: () => void;
}

export const DropInButton: React.FC<DropInButtonProps> = ({
  sessionId,
  onDropInStart,
  onDropInEnd
}) => {
  const { dropIn, stopMonitoring } = useMonitoring();
  const [isDroppingIn, setIsDroppingIn] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  useEffect(() => {
    return () => {
      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current.srcObject = null;
      }
    };
  }, []);

  const handleDropIn = async () => {
    try {
      setIsDroppingIn(true);
      setError(null);
      
      // Start drop-in
      await dropIn(sessionId);
      
      // Initialize audio element if not already done
      if (!audioRef.current) {
        audioRef.current = new Audio();
      }

      // Get the remote stream and play it
      const remoteStream = await getRemoteStream();
      if (remoteStream) {
        audioRef.current.srcObject = remoteStream;
        await audioRef.current.play();
      }

      onDropInStart?.();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred during drop-in');
      setIsDroppingIn(false);
    }
  };

  const handleStopDropIn = async () => {
    try {
      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current.srcObject = null;
      }

      await stopMonitoring(sessionId);
      setIsDroppingIn(false);
      onDropInEnd?.();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred while stopping drop-in');
    }
  };

  const getRemoteStream = async (): Promise<MediaStream | null> => {
    // This would be implemented to get the remote stream from the WebRTC service
    // For now, we'll return null as this would be handled by the WebRTC service
    return null;
  };

  return (
    <div className="flex flex-col items-center gap-2">
      <Button
        variant={isDroppingIn ? "destructive" : "default"}
        onClick={isDroppingIn ? handleStopDropIn : handleDropIn}
        disabled={isDroppingIn}
      >
        {isDroppingIn ? 'Stop Drop-in' : 'Start Drop-in'}
      </Button>
      
      {error && (
        <div className="text-red-500 text-sm">
          {error}
        </div>
      )}
    </div>
  );
}; 