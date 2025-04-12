import { analyzeCallTranscript } from './database';

interface AudioAnalysisConfig {
  silenceThreshold: number; // in decibels
  silenceDuration: number; // in milliseconds
  minSpeechDuration: number; // in milliseconds
  compliancePhrases: string[];
}

export class AudioAnalyzer {
  private audioContext: AudioContext;
  private analyser: AnalyserNode;
  private microphone: MediaStream | null = null;
  private isAnalyzing: boolean = false;
  private silenceStartTime: number = 0;
  private config: AudioAnalysisConfig;
  private speechBuffer: string[] = [];
  private lastAnalysisTime: number = 0;
  private analysisInterval: number = 5000; // Analyze every 5 seconds

  constructor(config: AudioAnalysisConfig) {
    this.config = config;
    this.audioContext = new AudioContext();
    this.analyser = this.audioContext.createAnalyser();
    this.analyser.fftSize = 2048;
  }

  async startAnalysis(): Promise<void> {
    try {
      this.microphone = await navigator.mediaDevices.getUserMedia({ audio: true });
      const source = this.audioContext.createMediaStreamSource(this.microphone);
      source.connect(this.analyser);
      
      this.isAnalyzing = true;
      this.startSilenceDetection();
      this.startLiveAnalysis();
    } catch (error) {
      console.error('Error starting audio analysis:', error);
      throw error;
    }
  }

  stopAnalysis(): void {
    this.isAnalyzing = false;
    if (this.microphone) {
      this.microphone.getTracks().forEach(track => track.stop());
    }
  }

  private startSilenceDetection(): void {
    const bufferLength = this.analyser.frequencyBinCount;
    const dataArray = new Uint8Array(bufferLength);

    const checkSilence = () => {
      if (!this.isAnalyzing) return;

      this.analyser.getByteFrequencyData(dataArray);
      const average = dataArray.reduce((a, b) => a + b) / bufferLength;
      
      if (average < this.config.silenceThreshold) {
        if (this.silenceStartTime === 0) {
          this.silenceStartTime = Date.now();
        } else if (Date.now() - this.silenceStartTime > this.config.silenceDuration) {
          this.handleSilenceDetected();
        }
      } else {
        this.silenceStartTime = 0;
      }

      requestAnimationFrame(checkSilence);
    };

    checkSilence();
  }

  private handleSilenceDetected(): void {
    // Emit silence event or handle silence period
    console.log('Silence detected');
    // Here you can implement custom silence handling logic
  }

  private startLiveAnalysis(): void {
    const analyze = async () => {
      if (!this.isAnalyzing) return;

      const currentTime = Date.now();
      if (currentTime - this.lastAnalysisTime >= this.analysisInterval) {
        try {
          const transcript = this.speechBuffer.join(' ');
          if (transcript.length > 0) {
            const analysis = await analyzeCallTranscript(transcript);
            this.handleAnalysisResults(analysis);
            this.speechBuffer = [];
          }
        } catch (error) {
          console.error('Error in live analysis:', error);
        }
        this.lastAnalysisTime = currentTime;
      }

      setTimeout(analyze, 1000);
    };

    analyze();
  }

  private handleAnalysisResults(analysis: any): void {
    // Emit analysis results or handle them as needed
    console.log('Live analysis results:', analysis);
    // Here you can implement custom result handling logic
  }

  // Compliance check methods
  checkCompliance(transcript: string): { 
    missingPhrases: string[],
    complianceScore: number 
  } {
    const missingPhrases: string[] = [];
    let foundCount = 0;

    this.config.compliancePhrases.forEach(phrase => {
      if (!transcript.toLowerCase().includes(phrase.toLowerCase())) {
        missingPhrases.push(phrase);
      } else {
        foundCount++;
      }
    });

    const complianceScore = (foundCount / this.config.compliancePhrases.length) * 100;

    return {
      missingPhrases,
      complianceScore
    };
  }

  // Speech recognition callback
  onSpeechRecognized(text: string): void {
    this.speechBuffer.push(text);
  }
}

// Default configuration
export const defaultAudioConfig: AudioAnalysisConfig = {
  silenceThreshold: 20, // Adjust based on testing
  silenceDuration: 2000, // 2 seconds
  minSpeechDuration: 1000, // 1 second
  compliancePhrases: [
    "Darf ich Sie verbinden?",
    "Vielen Dank für Ihren Anruf",
    "Haben Sie noch weitere Fragen?",
    "Auf Wiederhören"
  ]
}; 