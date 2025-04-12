import { useState, useRef, useEffect } from 'react';
import { Button } from '../../components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/card';
import { Mic, MicOff, Play, Pause, Stop } from 'lucide-react';

const CallAnalysis = () => {
  const [isRecording, setIsRecording] = useState(false);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [audioUrl, setAudioUrl] = useState<string | null>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);

  useEffect(() => {
    return () => {
      if (audioUrl) {
        URL.revokeObjectURL(audioUrl);
      }
    };
  }, [audioUrl]);

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mediaRecorder = new MediaRecorder(stream);
      mediaRecorderRef.current = mediaRecorder;
      audioChunksRef.current = [];

      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          audioChunksRef.current.push(event.data);
        }
      };

      mediaRecorder.onstop = () => {
        const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/wav' });
        const url = URL.createObjectURL(audioBlob);
        setAudioUrl(url);
      };

      mediaRecorder.start();
      setIsRecording(true);
    } catch (error) {
      console.error('Error accessing microphone:', error);
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      mediaRecorderRef.current.stream.getTracks().forEach(track => track.stop());
      setIsRecording(false);
    }
  };

  const analyzeCall = async () => {
    if (!audioUrl) return;

    setIsAnalyzing(true);
    try {
      // Here you would implement the actual call analysis logic
      // This could involve sending the audio to your backend for processing
      // and receiving the analysis results
      await new Promise(resolve => setTimeout(resolve, 2000)); // Simulated analysis
    } catch (error) {
      console.error('Error analyzing call:', error);
    } finally {
      setIsAnalyzing(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-3xl font-bold tracking-tight">Call Analysis</h2>
        <div className="flex items-center space-x-2">
          <Button
            variant={isRecording ? 'destructive' : 'default'}
            onClick={isRecording ? stopRecording : startRecording}
          >
            {isRecording ? (
              <>
                <MicOff className="mr-2 h-4 w-4" />
                Stop Recording
              </>
            ) : (
              <>
                <Mic className="mr-2 h-4 w-4" />
                Start Recording
              </>
            )}
          </Button>
          {audioUrl && (
            <Button variant="outline" onClick={analyzeCall} disabled={isAnalyzing}>
              {isAnalyzing ? 'Analyzing...' : 'Analyze Call'}
            </Button>
          )}
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Audio Controls</CardTitle>
          </CardHeader>
          <CardContent>
            {audioUrl ? (
              <div className="space-y-4">
                <audio src={audioUrl} controls className="w-full" />
                <div className="flex space-x-2">
                  <Button variant="outline" size="icon">
                    <Play className="h-4 w-4" />
                  </Button>
                  <Button variant="outline" size="icon">
                    <Pause className="h-4 w-4" />
                  </Button>
                  <Button variant="outline" size="icon">
                    <Stop className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            ) : (
              <p className="text-muted-foreground">No recording available</p>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Analysis Results</CardTitle>
          </CardHeader>
          <CardContent>
            {isAnalyzing ? (
              <p>Analyzing call...</p>
            ) : (
              <div className="space-y-4">
                <div>
                  <h3 className="font-medium">Tonal Analysis</h3>
                  <p className="text-muted-foreground">Positive: 75%</p>
                  <p className="text-muted-foreground">Neutral: 20%</p>
                  <p className="text-muted-foreground">Negative: 5%</p>
                </div>
                <div>
                  <h3 className="font-medium">Key Phrases</h3>
                  <ul className="list-disc pl-4 text-muted-foreground">
                    <li>Customer satisfaction</li>
                    <li>Technical support</li>
                    <li>Service level</li>
                  </ul>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default CallAnalysis; 