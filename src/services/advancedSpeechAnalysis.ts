import { AudioAnalyzer } from './audioAnalysis';

interface SpeechAnalysisResult {
  speechRate: number; // words per minute
  accent: string;
  language: string;
  contextPhrases: string[];
  confidence: number;
}

interface LanguageConfig {
  code: string;
  name: string;
  keywords: string[];
  commonPhrases: string[];
}

export class AdvancedSpeechAnalyzer {
  private audioAnalyzer: AudioAnalyzer;
  private wordCount: number = 0;
  private startTime: number = 0;
  private languages: LanguageConfig[] = [
    {
      code: 'de',
      name: 'German',
      keywords: ['der', 'die', 'das', 'und', 'ist', 'in', 'zu'],
      commonPhrases: ['Guten Tag', 'Auf Wiederhören', 'Danke schön']
    },
    {
      code: 'en',
      name: 'English',
      keywords: ['the', 'and', 'is', 'in', 'to', 'of', 'that'],
      commonPhrases: ['Hello', 'Goodbye', 'Thank you']
    }
  ];

  constructor(audioAnalyzer: AudioAnalyzer) {
    this.audioAnalyzer = audioAnalyzer;
  }

  async analyzeSpeech(transcript: string, duration: number): Promise<SpeechAnalysisResult> {
    const words = transcript.split(/\s+/);
    this.wordCount = words.length;
    
    const speechRate = this.calculateSpeechRate(duration);
    const language = this.detectLanguage(transcript);
    const accent = await this.detectAccent(transcript, language);
    const contextPhrases = this.detectContextPhrases(transcript);
    
    return {
      speechRate,
      accent,
      language: language.name,
      contextPhrases,
      confidence: this.calculateConfidence(transcript, language)
    };
  }

  private calculateSpeechRate(duration: number): number {
    const minutes = duration / 60000; // Convert milliseconds to minutes
    return this.wordCount / minutes;
  }

  private detectLanguage(transcript: string): LanguageConfig {
    let bestMatch = this.languages[0];
    let highestScore = 0;

    this.languages.forEach(lang => {
      const score = this.calculateLanguageScore(transcript, lang);
      if (score > highestScore) {
        highestScore = score;
        bestMatch = lang;
      }
    });

    return bestMatch;
  }

  private calculateLanguageScore(transcript: string, language: LanguageConfig): number {
    const words = transcript.toLowerCase().split(/\s+/);
    let score = 0;

    // Check for keywords
    language.keywords.forEach(keyword => {
      if (words.includes(keyword.toLowerCase())) {
        score += 2;
      }
    });

    // Check for common phrases
    language.commonPhrases.forEach(phrase => {
      if (transcript.toLowerCase().includes(phrase.toLowerCase())) {
        score += 5;
      }
    });

    return score;
  }

  private async detectAccent(transcript: string, language: LanguageConfig): Promise<string> {
    // This is a simplified version. In a real implementation, you would use
    // a more sophisticated accent detection algorithm or API
    const accentPatterns = {
      'Standard': ['standard', 'neutral'],
      'Regional': ['dialect', 'regional'],
      'Foreign': ['foreign', 'non-native']
    };

    // Analyze speech patterns and return the most likely accent
    return 'Standard'; // Placeholder
  }

  private detectContextPhrases(transcript: string): string[] {
    const contextPhrases: string[] = [];
    
    // Define context categories and their associated phrases
    const contexts = {
      'Sales': ['Angebot', 'Preis', 'Kosten', 'Rabatt'],
      'Support': ['Problem', 'Hilfe', 'Fehler', 'Support'],
      'Complaint': ['Beschwerde', 'unzufrieden', 'enttäuscht'],
      'Technical': ['Technik', 'System', 'Software', 'Hardware']
    };

    // Check transcript for context phrases
    Object.entries(contexts).forEach(([context, phrases]) => {
      phrases.forEach(phrase => {
        if (transcript.toLowerCase().includes(phrase.toLowerCase())) {
          contextPhrases.push(context);
        }
      });
    });

    return [...new Set(contextPhrases)]; // Remove duplicates
  }

  private calculateConfidence(transcript: string, language: LanguageConfig): number {
    const words = transcript.split(/\s+/);
    const recognizedWords = words.filter(word => 
      language.keywords.includes(word.toLowerCase()) ||
      language.commonPhrases.some(phrase => phrase.toLowerCase().includes(word.toLowerCase()))
    );

    return (recognizedWords.length / words.length) * 100;
  }

  // Helper method to get speech metrics
  getSpeechMetrics(): { 
    wordCount: number;
    averageWordLength: number;
    uniqueWords: number;
  } {
    const words = this.audioAnalyzer.getCurrentTranscript().split(/\s+/);
    const uniqueWords = new Set(words.map(word => word.toLowerCase())).size;
    
    return {
      wordCount: words.length,
      averageWordLength: words.reduce((sum, word) => sum + word.length, 0) / words.length,
      uniqueWords
    };
  }
} 