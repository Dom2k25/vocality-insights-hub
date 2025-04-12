import { AdvancedSpeechAnalyzer } from './advancedSpeechAnalysis';
import { supabase } from './supabaseClient';

interface PerformanceMetrics {
  agentScore: number;
  customerSatisfaction: number;
  conflictScore: number;
  qualityScore: number;
  details: {
    speechRate: number;
    compliance: number;
    emotionBalance: number;
    contextMatch: number;
  };
}

interface HistoricalData {
  averageScores: {
    agentScore: number;
    customerSatisfaction: number;
    qualityScore: number;
  };
  trends: {
    daily: number[];
    weekly: number[];
    monthly: number[];
  };
}

export class PerformanceAnalyzer {
  private speechAnalyzer: AdvancedSpeechAnalyzer;
  private historicalData: HistoricalData;

  constructor(speechAnalyzer: AdvancedSpeechAnalyzer) {
    this.speechAnalyzer = speechAnalyzer;
    this.historicalData = this.initializeHistoricalData();
  }

  async calculateMetrics(transcript: string, duration: number): Promise<PerformanceMetrics> {
    const speechAnalysis = await this.speechAnalyzer.analyzeSpeech(transcript, duration);
    const speechMetrics = this.speechAnalyzer.getSpeechMetrics();

    // Calculate individual scores
    const speechRateScore = this.calculateSpeechRateScore(speechAnalysis.speechRate);
    const complianceScore = this.calculateComplianceScore(transcript);
    const emotionScore = this.calculateEmotionScore(transcript);
    const contextScore = this.calculateContextScore(speechAnalysis.contextPhrases);

    // Calculate overall scores
    const agentScore = this.calculateAgentScore({
      speechRateScore,
      complianceScore,
      emotionScore,
      contextScore
    });

    const customerSatisfaction = this.predictCustomerSatisfaction({
      emotionScore,
      contextScore,
      speechRateScore
    });

    const conflictScore = this.detectConflicts(transcript);
    const qualityScore = this.calculateQualityScore({
      agentScore,
      customerSatisfaction,
      conflictScore
    });

    return {
      agentScore,
      customerSatisfaction,
      conflictScore,
      qualityScore,
      details: {
        speechRate: speechRateScore,
        compliance: complianceScore,
        emotionBalance: emotionScore,
        contextMatch: contextScore
      }
    };
  }

  private calculateSpeechRateScore(rate: number): number {
    // Optimal range: 120-160 words per minute
    if (rate >= 120 && rate <= 160) return 100;
    if (rate < 120) return (rate / 120) * 100;
    return Math.max(0, 100 - ((rate - 160) / 2));
  }

  private calculateComplianceScore(transcript: string): number {
    // This would integrate with the compliance check from AudioAnalyzer
    return 85; // Placeholder
  }

  private calculateEmotionScore(transcript: string): number {
    // Analyze emotional balance in the conversation
    const positiveWords = ['great', 'excellent', 'happy', 'satisfied'];
    const negativeWords = ['bad', 'terrible', 'unhappy', 'dissatisfied'];
    
    let positiveCount = 0;
    let negativeCount = 0;
    
    const words = transcript.toLowerCase().split(/\s+/);
    words.forEach(word => {
      if (positiveWords.includes(word)) positiveCount++;
      if (negativeWords.includes(word)) negativeCount++;
    });
    
    const total = positiveCount + negativeCount;
    if (total === 0) return 50;
    
    return (positiveCount / total) * 100;
  }

  private calculateContextScore(contextPhrases: string[]): number {
    // Score based on how well the agent matches the conversation context
    const maxScore = 100;
    const baseScore = 60;
    const bonusPerMatch = 10;
    
    return Math.min(maxScore, baseScore + (contextPhrases.length * bonusPerMatch));
  }

  private calculateAgentScore(scores: {
    speechRateScore: number;
    complianceScore: number;
    emotionScore: number;
    contextScore: number;
  }): number {
    const weights = {
      speechRate: 0.2,
      compliance: 0.3,
      emotion: 0.25,
      context: 0.25
    };

    return (
      scores.speechRateScore * weights.speechRate +
      scores.complianceScore * weights.compliance +
      scores.emotionScore * weights.emotion +
      scores.contextScore * weights.context
    );
  }

  private predictCustomerSatisfaction(metrics: {
    emotionScore: number;
    contextScore: number;
    speechRateScore: number;
  }): number {
    // Simple prediction model
    const weights = {
      emotion: 0.4,
      context: 0.3,
      speechRate: 0.3
    };

    return (
      metrics.emotionScore * weights.emotion +
      metrics.contextScore * weights.context +
      metrics.speechRateScore * weights.speechRate
    );
  }

  private detectConflicts(transcript: string): number {
    const conflictIndicators = [
      'no', 'never', 'wrong', 'mistake', 'error',
      'complain', 'angry', 'frustrated', 'unacceptable'
    ];
    
    const words = transcript.toLowerCase().split(/\s+/);
    const conflictCount = words.filter(word => 
      conflictIndicators.includes(word)
    ).length;
    
    // Convert to a score where 0 is no conflict, 100 is high conflict
    return Math.min(100, conflictCount * 20);
  }

  private calculateQualityScore(scores: {
    agentScore: number;
    customerSatisfaction: number;
    conflictScore: number;
  }): number {
    const weights = {
      agent: 0.4,
      satisfaction: 0.4,
      conflict: 0.2
    };

    // Invert conflict score since lower is better
    const invertedConflict = 100 - scores.conflictScore;

    return (
      scores.agentScore * weights.agent +
      scores.customerSatisfaction * weights.satisfaction +
      invertedConflict * weights.conflict
    );
  }

  private initializeHistoricalData(): HistoricalData {
    return {
      averageScores: {
        agentScore: 0,
        customerSatisfaction: 0,
        qualityScore: 0
      },
      trends: {
        daily: [],
        weekly: [],
        monthly: []
      }
    };
  }

  async updateHistoricalData(metrics: PerformanceMetrics): Promise<void> {
    try {
      // Update averages
      this.historicalData.averageScores.agentScore = 
        (this.historicalData.averageScores.agentScore + metrics.agentScore) / 2;
      this.historicalData.averageScores.customerSatisfaction = 
        (this.historicalData.averageScores.customerSatisfaction + metrics.customerSatisfaction) / 2;
      this.historicalData.averageScores.qualityScore = 
        (this.historicalData.averageScores.qualityScore + metrics.qualityScore) / 2;

      // Update trends
      this.updateTrends(metrics.qualityScore);

      // Save to database
      await this.saveMetrics(metrics);
    } catch (error) {
      console.error('Error updating historical data:', error);
      throw error;
    }
  }

  private updateTrends(score: number): void {
    const now = new Date();
    
    // Update daily trend (last 24 hours)
    this.historicalData.trends.daily.push(score);
    if (this.historicalData.trends.daily.length > 24) {
      this.historicalData.trends.daily.shift();
    }

    // Update weekly trend (last 7 days)
    if (now.getHours() === 0) {
      this.historicalData.trends.weekly.push(score);
      if (this.historicalData.trends.weekly.length > 7) {
        this.historicalData.trends.weekly.shift();
      }
    }

    // Update monthly trend (last 30 days)
    if (now.getDate() === 1) {
      this.historicalData.trends.monthly.push(score);
      if (this.historicalData.trends.monthly.length > 30) {
        this.historicalData.trends.monthly.shift();
      }
    }
  }

  private async saveMetrics(metrics: PerformanceMetrics): Promise<void> {
    try {
      const { error } = await supabase
        .from('performance_metrics')
        .insert({
          agent_score: metrics.agentScore,
          customer_satisfaction: metrics.customerSatisfaction,
          conflict_score: metrics.conflictScore,
          quality_score: metrics.qualityScore,
          details: metrics.details,
          timestamp: new Date().toISOString()
        });

      if (error) throw error;
    } catch (error) {
      console.error('Error saving metrics:', error);
      throw error;
    }
  }

  getHistoricalData(): HistoricalData {
    return this.historicalData;
  }
} 