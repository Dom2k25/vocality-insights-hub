
import React, { useState } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Progress } from "@/components/ui/progress";
import { Mic, MicOff, Play, StopCircle } from "lucide-react";
import { toast } from "sonner";

export function VoiceAnalysisPanel() {
  const [isRecording, setIsRecording] = useState(false);
  const [recordingTime, setRecordingTime] = useState(0);
  const [selectedMic, setSelectedMic] = useState("Default Microphone");

  // Mock data for sentiments
  const sentiments = {
    positive: 65,
    neutral: 25,
    negative: 10,
  };

  // Mock data for emotions
  const emotions = {
    confidence: 72,
    enthusiasm: 58,
    satisfaction: 80,
    confusion: 15,
    frustration: 12,
  };

  // Mock data for compliance
  const compliance = {
    greeting: true,
    identityVerification: true,
    disclosure: false,
    farewell: true,
  };

  const toggleRecording = () => {
    if (!isRecording) {
      // Start recording
      setIsRecording(true);
      toast.success("Recording started");
      
      // Reset recording time
      setRecordingTime(0);
      
      // Increment recording time
      const interval = setInterval(() => {
        setRecordingTime((prevTime) => prevTime + 1);
      }, 1000);
      
      // Store interval ID in a data attribute
      (window as any).recordingInterval = interval;
    } else {
      // Stop recording
      setIsRecording(false);
      toast.info("Recording stopped");
      
      // Clear interval
      clearInterval((window as any).recordingInterval);
    }
  };

  // Format time as mm:ss
  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60)
      .toString()
      .padStart(2, "0");
    const secs = (seconds % 60).toString().padStart(2, "0");
    return `${mins}:${secs}`;
  };

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader>
          <CardTitle>Voice Analysis</CardTitle>
          <CardDescription>
            Record and analyze conversations in real-time
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex flex-col sm:flex-row items-center gap-4">
            <div className="w-full sm:w-1/3">
              <div className="flex items-center justify-center w-full aspect-square bg-muted rounded-xl">
                <div className="relative">
                  <div
                    className={`absolute -inset-4 rounded-full ${
                      isRecording
                        ? "bg-red-500/10 animate-pulse-slow"
                        : "bg-transparent"
                    }`}
                  ></div>
                  <div
                    className={`flex items-center justify-center h-16 w-16 rounded-full ${
                      isRecording
                        ? "bg-red-500 text-white"
                        : "bg-primary text-primary-foreground"
                    }`}
                  >
                    {isRecording ? (
                      <StopCircle className="h-8 w-8" />
                    ) : (
                      <Mic className="h-8 w-8" />
                    )}
                  </div>
                </div>
              </div>
              
              <div className="mt-4 text-center">
                <div className="text-2xl font-bold">
                  {formatTime(recordingTime)}
                </div>
                <p className="text-sm text-muted-foreground">
                  {isRecording ? "Recording" : "Ready"}
                </p>
              </div>
            </div>

            <div className="w-full sm:w-2/3 space-y-4">
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span>Microphone</span>
                  <span className="text-muted-foreground">{selectedMic}</span>
                </div>
                <Button
                  variant="outline"
                  className="w-full justify-start"
                  onClick={() => toast.info("Microphone selection would open here")}
                >
                  <Mic className="mr-2 h-4 w-4" />
                  Change Microphone
                </Button>
              </div>

              <div className="space-y-2">
                <div className="flex justify-between items-center">
                  <span>Audio Level</span>
                  <span className="text-xs text-muted-foreground">
                    {isRecording ? "Active" : "Inactive"}
                  </span>
                </div>
                <div className="h-8 bg-muted rounded-md overflow-hidden relative">
                  {isRecording && (
                    <div className="absolute inset-0 flex items-center px-2 gap-0.5">
                      {Array.from({ length: 30 }).map((_, i) => (
                        <div
                          key={i}
                          className="flex-1 h-1 sm:h-2 md:h-3 lg:h-4 rounded-sm bg-primary"
                          style={{
                            opacity: Math.random(),
                            height: `${Math.max(20, Math.random() * 90)}%`,
                          }}
                        ></div>
                      ))}
                    </div>
                  )}
                </div>
              </div>

              <Button
                className="w-full"
                onClick={toggleRecording}
                variant={isRecording ? "destructive" : "default"}
              >
                {isRecording ? (
                  <>
                    <StopCircle className="mr-2 h-4 w-4" />
                    Stop Recording
                  </>
                ) : (
                  <>
                    <Mic className="mr-2 h-4 w-4" />
                    Start Recording
                  </>
                )}
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Speech Analysis</CardTitle>
          <CardDescription>Real-time insights from voice conversations</CardDescription>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="sentiment">
            <TabsList className="grid w-full grid-cols-3 mb-4">
              <TabsTrigger value="sentiment">Sentiment</TabsTrigger>
              <TabsTrigger value="emotion">Emotion</TabsTrigger>
              <TabsTrigger value="compliance">Compliance</TabsTrigger>
            </TabsList>
            
            <TabsContent value="sentiment" className="space-y-4">
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span>Positive</span>
                  <span>{sentiments.positive}%</span>
                </div>
                <Progress value={sentiments.positive} className="h-2 bg-muted" />
              </div>
              
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span>Neutral</span>
                  <span>{sentiments.neutral}%</span>
                </div>
                <Progress value={sentiments.neutral} className="h-2 bg-muted" />
              </div>
              
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span>Negative</span>
                  <span>{sentiments.negative}%</span>
                </div>
                <Progress value={sentiments.negative} className="h-2 bg-muted" />
              </div>
            </TabsContent>
            
            <TabsContent value="emotion" className="space-y-4">
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span>Confidence</span>
                  <span>{emotions.confidence}%</span>
                </div>
                <Progress value={emotions.confidence} className="h-2 bg-muted" />
              </div>
              
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span>Enthusiasm</span>
                  <span>{emotions.enthusiasm}%</span>
                </div>
                <Progress value={emotions.enthusiasm} className="h-2 bg-muted" />
              </div>
              
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span>Satisfaction</span>
                  <span>{emotions.satisfaction}%</span>
                </div>
                <Progress value={emotions.satisfaction} className="h-2 bg-muted" />
              </div>
              
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span>Confusion</span>
                  <span>{emotions.confusion}%</span>
                </div>
                <Progress value={emotions.confusion} className="h-2 bg-muted" />
              </div>
              
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span>Frustration</span>
                  <span>{emotions.frustration}%</span>
                </div>
                <Progress value={emotions.frustration} className="h-2 bg-muted" />
              </div>
            </TabsContent>
            
            <TabsContent value="compliance" className="space-y-4">
              <div className="grid gap-2">
                <div className="flex items-center justify-between">
                  <span>Greeting Phrase</span>
                  <span className={compliance.greeting ? "text-green-500" : "text-red-500"}>
                    {compliance.greeting ? "✓ Detected" : "✗ Missing"}
                  </span>
                </div>
                
                <div className="flex items-center justify-between">
                  <span>Identity Verification</span>
                  <span className={compliance.identityVerification ? "text-green-500" : "text-red-500"}>
                    {compliance.identityVerification ? "✓ Detected" : "✗ Missing"}
                  </span>
                </div>
                
                <div className="flex items-center justify-between">
                  <span>Required Disclosure</span>
                  <span className={compliance.disclosure ? "text-green-500" : "text-red-500"}>
                    {compliance.disclosure ? "✓ Detected" : "✗ Missing"}
                  </span>
                </div>
                
                <div className="flex items-center justify-between">
                  <span>Farewell Phrase</span>
                  <span className={compliance.farewell ? "text-green-500" : "text-red-500"}>
                    {compliance.farewell ? "✓ Detected" : "✗ Missing"}
                  </span>
                </div>
              </div>
              
              <div className="mt-4 p-3 bg-muted rounded-md">
                <h4 className="font-medium mb-2">Overall Compliance</h4>
                <div className="flex items-center">
                  <div className="w-full bg-secondary rounded-full h-2.5">
                    <div 
                      className="bg-primary h-2.5 rounded-full" 
                      style={{ width: "75%" }}
                    ></div>
                  </div>
                  <span className="ml-2 text-sm font-medium">75%</span>
                </div>
              </div>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
}
