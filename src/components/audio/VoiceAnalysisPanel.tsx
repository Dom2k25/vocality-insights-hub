
import React, { useState, useRef, useEffect } from "react";
import { Mic, MicOff, Play, Square, Upload, Download, RefreshCw, Headphones, Volume2, Volume1, VolumeX } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { supabase } from "@/lib/supabase";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";

export function VoiceAnalysisPanel() {
  const { user } = useAuth();
  const [recording, setRecording] = useState(false);
  const [audioURL, setAudioURL] = useState<string | null>(null);
  const [audioBlob, setAudioBlob] = useState<Blob | null>(null);
  const [analyzing, setAnalyzing] = useState(false);
  const [duration, setDuration] = useState(0);
  const [elapsed, setElapsed] = useState(0);
  const [selectedMic, setSelectedMic] = useState<MediaDeviceInfo | null>(null);
  const [availableMics, setAvailableMics] = useState<MediaDeviceInfo[]>([]);
  const [analysis, setAnalysis] = useState<any>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const chunksRef = useRef<BlobPart[]>([]);
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  // Fetch available microphones
  useEffect(() => {
    async function getMicrophones() {
      try {
        const devices = await navigator.mediaDevices.enumerateDevices();
        const mics = devices.filter(device => device.kind === 'audioinput');
        setAvailableMics(mics);
        if (mics.length > 0) {
          setSelectedMic(mics[0]);
        }
      } catch (error) {
        console.error('Error fetching microphones:', error);
        toast.error('Could not access microphones');
      }
    }

    getMicrophones();
  }, []);

  // Start recording function
  const startRecording = async () => {
    if (!selectedMic) {
      toast.error('No microphone selected');
      return;
    }

    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        audio: { deviceId: selectedMic.deviceId ? { exact: selectedMic.deviceId } : undefined }
      });
      
      mediaRecorderRef.current = new MediaRecorder(stream);
      chunksRef.current = [];
      
      mediaRecorderRef.current.ondataavailable = (e) => {
        chunksRef.current.push(e.data);
      };
      
      mediaRecorderRef.current.onstop = () => {
        const blob = new Blob(chunksRef.current, { type: 'audio/webm' });
        const url = URL.createObjectURL(blob);
        setAudioBlob(blob);
        setAudioURL(url);
        setRecording(false);
      };
      
      // Start recording
      mediaRecorderRef.current.start();
      setRecording(true);
      setElapsed(0);
      
      // Start timer
      timerRef.current = setInterval(() => {
        setElapsed(prev => prev + 1);
      }, 1000);
      
      toast.success('Recording started');
    } catch (error) {
      console.error('Error starting recording:', error);
      toast.error('Failed to start recording');
    }
  };

  // Stop recording function
  const stopRecording = () => {
    if (mediaRecorderRef.current && mediaRecorderRef.current.state !== 'inactive') {
      mediaRecorderRef.current.stop();
      if (timerRef.current) {
        clearInterval(timerRef.current);
        timerRef.current = null;
      }
      setDuration(elapsed);
      toast.info('Recording stopped');
    }
  };

  // Analyze recording function
  const analyzeRecording = async () => {
    if (!audioBlob) {
      toast.error('No recording to analyze');
      return;
    }

    setAnalyzing(true);
    
    try {
      // Upload recording to Supabase Storage
      const fileName = `recordings/${user?.id}_${Date.now()}.webm`;
      const { error: uploadError, data: uploadData } = await supabase.storage
        .from('audio')
        .upload(fileName, audioBlob);
        
      if (uploadError) {
        throw new Error('Failed to upload recording');
      }
      
      // Get public URL
      const { data: { publicUrl } } = supabase.storage
        .from('audio')
        .getPublicUrl(fileName);
      
      // Simulate analysis for now (would be replaced with real analysis API call)
      // In a real app, you would call an AI service or your own analysis endpoint
      await new Promise(resolve => setTimeout(resolve, 2000)); // Simulate processing time
      
      // Mock analysis result
      const mockAnalysis = {
        sentiment: {
          positive: Math.random() * 70 + 30,
          neutral: Math.random() * 40 + 10,
          negative: Math.random() * 20,
        },
        emotions: {
          joy: Math.random() * 50 + 50,
          frustration: Math.random() * 30,
          confusion: Math.random() * 40,
          engagement: Math.random() * 40 + 60,
        },
        keywords: [
          { text: "customer satisfaction", count: 2, sentiment: "positive" },
          { text: "technical issue", count: 1, sentiment: "negative" },
          { text: "pricing", count: 3, sentiment: "neutral" },
          { text: "upgrade", count: 2, sentiment: "positive" },
        ],
        compliance: {
          required: ["greeting", "disclosure", "closing"],
          detected: ["greeting", "closing"],
          missing: ["disclosure"],
        },
        qualityScore: Math.floor(Math.random() * 20 + 80),
      };
      
      setAnalysis(mockAnalysis);
      
      // Save call to database
      const { error: dbError } = await supabase
        .from('calls')
        .insert({
          user_id: user?.id || '',
          customer_name: 'Sample Customer',
          duration: duration,
          timestamp: new Date().toISOString(),
          score: mockAnalysis.qualityScore,
          recording_url: publicUrl,
          analysis: mockAnalysis,
        });
        
      if (dbError) {
        throw new Error('Failed to save call data');
      }
      
      toast.success('Analysis completed');
    } catch (error) {
      console.error('Analysis error:', error);
      toast.error('Failed to analyze recording');
    } finally {
      setAnalyzing(false);
    }
  };

  // Format time in MM:SS
  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  // Handle microphone selection
  const handleMicChange = (deviceId: string) => {
    const mic = availableMics.find(m => m.deviceId === deviceId);
    if (mic) {
      setSelectedMic(mic);
    }
  };

  return (
    <div className="grid gap-6">
      <Card>
        <CardHeader>
          <div className="flex justify-between items-center">
            <div>
              <CardTitle>Voice Recorder</CardTitle>
              <CardDescription>Record and analyze your conversations</CardDescription>
            </div>
            <div className="flex items-center gap-2">
              <select
                value={selectedMic?.deviceId || ''}
                onChange={(e) => handleMicChange(e.target.value)}
                className="bg-background border-input border rounded-md px-3 py-1.5 text-sm"
                disabled={recording}
              >
                {availableMics.map(mic => (
                  <option key={mic.deviceId} value={mic.deviceId}>
                    {mic.label || `Microphone ${mic.deviceId.slice(0, 5)}...`}
                  </option>
                ))}
                {availableMics.length === 0 && (
                  <option value="">No microphones found</option>
                )}
              </select>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col items-center gap-4">
            <div className="w-full p-4 bg-muted/30 rounded-lg flex flex-col items-center justify-center min-h-[160px]">
              {recording ? (
                <div className="flex flex-col items-center gap-2">
                  <div className="relative w-20 h-20 flex items-center justify-center">
                    <div className="absolute w-full h-full rounded-full bg-red-100 dark:bg-red-900/30 animate-ping opacity-50"></div>
                    <div className="relative w-16 h-16 rounded-full bg-red-500 flex items-center justify-center">
                      <Mic className="h-8 w-8 text-white" />
                    </div>
                  </div>
                  <span className="text-lg font-semibold mt-2">{formatTime(elapsed)}</span>
                  <div className="flex gap-2 mt-2">
                    <Button 
                      variant="destructive" 
                      size="sm" 
                      onClick={stopRecording}
                    >
                      <Square className="h-4 w-4 mr-1" />
                      Stop
                    </Button>
                  </div>
                </div>
              ) : audioURL ? (
                <div className="w-full flex flex-col items-center gap-3">
                  <audio ref={audioRef} src={audioURL} controls className="w-full max-w-md" />
                  <div className="flex flex-wrap gap-2 justify-center">
                    <Button 
                      variant="default" 
                      size="sm" 
                      onClick={analyzeRecording}
                      disabled={analyzing}
                    >
                      {analyzing ? (
                        <>
                          <RefreshCw className="h-4 w-4 mr-1 animate-spin" />
                          Analyzing...
                        </>
                      ) : (
                        <>
                          <Headphones className="h-4 w-4 mr-1" />
                          Analyze
                        </>
                      )}
                    </Button>
                    <Button 
                      variant="outline" 
                      size="sm" 
                      onClick={() => {
                        setAudioURL(null);
                        setAudioBlob(null);
                        setAnalysis(null);
                      }}
                    >
                      <RefreshCw className="h-4 w-4 mr-1" />
                      New Recording
                    </Button>
                    <Button 
                      variant="outline" 
                      size="sm" 
                      onClick={() => {
                        if (audioURL) {
                          const a = document.createElement('a');
                          a.href = audioURL;
                          a.download = `vocality_recording_${new Date().toISOString()}.webm`;
                          a.click();
                        }
                      }}
                    >
                      <Download className="h-4 w-4 mr-1" />
                      Download
                    </Button>
                  </div>
                </div>
              ) : (
                <div className="flex flex-col items-center gap-3">
                  <Button 
                    variant="default" 
                    size="lg" 
                    onClick={startRecording}
                    disabled={!selectedMic}
                    className="h-16 w-16 rounded-full"
                  >
                    <Mic className="h-6 w-6" />
                  </Button>
                  <span className="text-sm text-muted-foreground">Click to start recording</span>
                </div>
              )}
            </div>
          </div>
        </CardContent>
      </Card>

      {analysis && (
        <Card>
          <CardHeader>
            <CardTitle>Voice Analysis Results</CardTitle>
            <CardDescription>Insights from your conversation</CardDescription>
          </CardHeader>
          <CardContent>
            <Tabs defaultValue="overview">
              <TabsList className="grid grid-cols-4 mb-4">
                <TabsTrigger value="overview">Overview</TabsTrigger>
                <TabsTrigger value="sentiment">Sentiment</TabsTrigger>
                <TabsTrigger value="keywords">Keywords</TabsTrigger>
                <TabsTrigger value="compliance">Compliance</TabsTrigger>
              </TabsList>
              
              <TabsContent value="overview" className="space-y-4">
                <div className="grid gap-2">
                  <div className="flex justify-between items-center">
                    <span className="font-medium">Quality Score</span>
                    <Badge className={`text-sm ${
                      analysis.qualityScore >= 90 ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-900/30 dark:text-emerald-400' :
                      analysis.qualityScore >= 70 ? 'bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-400' :
                      'bg-rose-100 text-rose-800 dark:bg-rose-900/30 dark:text-rose-400'
                    }`}>
                      {analysis.qualityScore}%
                    </Badge>
                  </div>
                  <Progress value={analysis.qualityScore} className="h-2" />
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
                  <div className="space-y-2">
                    <h4 className="font-medium text-sm">Emotion Analysis</h4>
                    {Object.entries(analysis.emotions).map(([emotion, value]: [string, any]) => (
                      <div key={emotion} className="space-y-1">
                        <div className="flex justify-between text-sm">
                          <span className="capitalize">{emotion}</span>
                          <span>{Math.round(value)}%</span>
                        </div>
                        <Progress value={value} className="h-1.5" />
                      </div>
                    ))}
                  </div>
                  
                  <div className="space-y-2">
                    <h4 className="font-medium text-sm">Sentiment Distribution</h4>
                    {Object.entries(analysis.sentiment).map(([sentiment, value]: [string, any]) => (
                      <div key={sentiment} className="space-y-1">
                        <div className="flex justify-between text-sm">
                          <span className="capitalize">{sentiment}</span>
                          <span>{Math.round(value)}%</span>
                        </div>
                        <Progress 
                          value={value} 
                          className={`h-1.5 ${
                            sentiment === 'positive' ? 'bg-emerald-100 dark:bg-emerald-900/30' :
                            sentiment === 'negative' ? 'bg-rose-100 dark:bg-rose-900/30' :
                            'bg-blue-100 dark:bg-blue-900/30'
                          }`} 
                        />
                      </div>
                    ))}
                  </div>
                </div>
              </TabsContent>
              
              <TabsContent value="sentiment" className="space-y-4">
                <div className="grid gap-6">
                  <div>
                    <h3 className="font-medium mb-2">Sentiment Timeline</h3>
                    <div className="h-40 bg-muted/30 rounded-md flex items-center justify-center">
                      <span className="text-sm text-muted-foreground">Sentiment visualization would appear here</span>
                    </div>
                  </div>
                  
                  <div>
                    <h3 className="font-medium mb-2">Key Moments</h3>
                    <div className="space-y-2">
                      <div className="p-3 border rounded-md">
                        <div className="flex justify-between">
                          <span className="text-sm font-medium">Strong positive sentiment</span>
                          <span className="text-xs text-muted-foreground">00:42</span>
                        </div>
                        <p className="text-sm mt-1 text-muted-foreground">
                          "I'm really happy with the service you've provided today..."
                        </p>
                      </div>
                      <div className="p-3 border rounded-md">
                        <div className="flex justify-between">
                          <span className="text-sm font-medium">Slight negative sentiment</span>
                          <span className="text-xs text-muted-foreground">01:24</span>
                        </div>
                        <p className="text-sm mt-1 text-muted-foreground">
                          "I was a bit frustrated with how long it took to..."
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </TabsContent>
              
              <TabsContent value="keywords" className="space-y-4">
                <div className="flex flex-wrap gap-2">
                  {analysis.keywords.map((keyword: any, index: number) => (
                    <div
                      key={index}
                      className={`px-3 py-1.5 rounded-full text-sm font-medium ${
                        keyword.sentiment === "positive"
                          ? "bg-emerald-100 text-emerald-800 dark:bg-emerald-900/30 dark:text-emerald-400"
                          : keyword.sentiment === "negative"
                          ? "bg-rose-100 text-rose-800 dark:bg-rose-900/30 dark:text-rose-400"
                          : "bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400"
                      }`}
                      style={{ fontSize: `${Math.max(0.7, Math.min(1.3, 0.8 + keyword.count / 10))}rem` }}
                    >
                      {keyword.text} ({keyword.count})
                    </div>
                  ))}
                </div>
                
                <div className="mt-4">
                  <h3 className="font-medium mb-2">Word Cloud</h3>
                  <div className="h-40 bg-muted/30 rounded-md flex items-center justify-center">
                    <span className="text-sm text-muted-foreground">Word cloud visualization would appear here</span>
                  </div>
                </div>
              </TabsContent>
              
              <TabsContent value="compliance" className="space-y-4">
                <div className="space-y-4">
                  <div>
                    <h3 className="font-medium mb-2">Required Phrases</h3>
                    <div className="space-y-2">
                      {analysis.compliance.required.map((phrase: string, index: number) => (
                        <div key={index} className="flex items-center gap-2">
                          <Badge 
                            variant="outline"
                            className={
                              analysis.compliance.detected.includes(phrase)
                                ? "bg-emerald-100 text-emerald-800 dark:bg-emerald-900/30 dark:text-emerald-400"
                                : "bg-rose-100 text-rose-800 dark:bg-rose-900/30 dark:text-rose-400"
                            }
                          >
                            {analysis.compliance.detected.includes(phrase) ? "Detected" : "Missing"}
                          </Badge>
                          <span className="capitalize">{phrase}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                  
                  <div>
                    <h3 className="font-medium mb-2">Compliance Score</h3>
                    <div className="flex justify-between items-center mb-1">
                      <span className="text-sm">
                        {analysis.compliance.detected.length} of {analysis.compliance.required.length} required phrases detected
                      </span>
                      <span className="font-medium">
                        {Math.round((analysis.compliance.detected.length / analysis.compliance.required.length) * 100)}%
                      </span>
                    </div>
                    <Progress 
                      value={(analysis.compliance.detected.length / analysis.compliance.required.length) * 100} 
                      className="h-2"
                    />
                  </div>
                </div>
              </TabsContent>
            </Tabs>
          </CardContent>
          <CardFooter className="flex justify-between">
            <Button variant="outline" size="sm" onClick={() => setAnalysis(null)}>
              Reset Analysis
            </Button>
            <Button variant="default" size="sm">
              <Download className="h-4 w-4 mr-1" />
              Export Report
            </Button>
          </CardFooter>
        </Card>
      )}
    </div>
  );
}
