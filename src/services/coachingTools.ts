import { PerformanceAnalyzer } from './performanceMetrics';
import { supabase } from './supabaseClient';

interface CoachingFeedback {
  type: 'positive' | 'improvement' | 'critical';
  message: string;
  priority: number;
  timestamp: number;
  metrics: {
    score: number;
    threshold: number;
  };
}

interface CoachingSuggestion {
  category: string;
  title: string;
  description: string;
  priority: 'high' | 'medium' | 'low';
  actionItems: string[];
  resources?: string[];
}

interface WeaknessAnalysis {
  category: string;
  score: number;
  trend: 'improving' | 'stable' | 'declining';
  suggestions: CoachingSuggestion[];
}

export class CoachingSystem {
  private performanceAnalyzer: PerformanceAnalyzer;
  private feedbackHistory: CoachingFeedback[] = [];
  private suggestionHistory: CoachingSuggestion[] = [];

  constructor(performanceAnalyzer: PerformanceAnalyzer) {
    this.performanceAnalyzer = performanceAnalyzer;
  }

  async generateRealTimeFeedback(metrics: any): Promise<CoachingFeedback[]> {
    const feedback: CoachingFeedback[] = [];

    // Speech rate feedback
    if (metrics.details.speechRate < 70) {
      feedback.push({
        type: 'improvement',
        message: 'Sprachgeschwindigkeit ist zu langsam. Versuchen Sie, das Tempo leicht zu erhöhen.',
        priority: 2,
        timestamp: Date.now(),
        metrics: {
          score: metrics.details.speechRate,
          threshold: 70
        }
      });
    } else if (metrics.details.speechRate > 90) {
      feedback.push({
        type: 'improvement',
        message: 'Sprachgeschwindigkeit ist zu schnell. Versuchen Sie, das Tempo zu reduzieren.',
        priority: 2,
        timestamp: Date.now(),
        metrics: {
          score: metrics.details.speechRate,
          threshold: 90
        }
      });
    }

    // Emotion balance feedback
    if (metrics.details.emotionBalance < 60) {
      feedback.push({
        type: 'critical',
        message: 'Emotionale Balance ist niedrig. Achten Sie auf eine positivere Gesprächsatmosphäre.',
        priority: 1,
        timestamp: Date.now(),
        metrics: {
          score: metrics.details.emotionBalance,
          threshold: 60
        }
      });
    }

    // Compliance feedback
    if (metrics.details.compliance < 80) {
      feedback.push({
        type: 'improvement',
        message: 'Compliance-Score ist niedrig. Bitte achten Sie auf die erforderlichen Phrasen.',
        priority: 1,
        timestamp: Date.now(),
        metrics: {
          score: metrics.details.compliance,
          threshold: 80
        }
      });
    }

    // Positive feedback for good performance
    if (metrics.qualityScore > 90) {
      feedback.push({
        type: 'positive',
        message: 'Ausgezeichnete Gesprächsqualität! Weiter so!',
        priority: 3,
        timestamp: Date.now(),
        metrics: {
          score: metrics.qualityScore,
          threshold: 90
        }
      });
    }

    // Save feedback to history
    this.feedbackHistory.push(...feedback);
    await this.saveFeedback(feedback);

    return feedback;
  }

  async generateCoachingSuggestions(metrics: any): Promise<CoachingSuggestion[]> {
    const suggestions: CoachingSuggestion[] = [];

    // Speech rate suggestions
    if (metrics.details.speechRate < 70 || metrics.details.speechRate > 90) {
      suggestions.push({
        category: 'Communication',
        title: 'Sprachgeschwindigkeit optimieren',
        description: 'Die optimale Sprachgeschwindigkeit liegt zwischen 120-160 Wörtern pro Minute.',
        priority: 'medium',
        actionItems: [
          'Üben Sie mit einem Metronom',
          'Nehmen Sie sich selbst auf und analysieren Sie das Tempo',
          'Bitten Sie Kollegen um Feedback'
        ],
        resources: [
          'https://example.com/speech-pacing-guide',
          'https://example.com/communication-best-practices'
        ]
      });
    }

    // Emotion management suggestions
    if (metrics.details.emotionBalance < 60) {
      suggestions.push({
        category: 'Emotional Intelligence',
        title: 'Emotionale Intelligenz verbessern',
        description: 'Arbeiten Sie an der emotionalen Balance in Gesprächen.',
        priority: 'high',
        actionItems: [
          'Besuchen Sie das Training "Emotionale Intelligenz"',
          'Führen Sie ein Emotion-Tracking',
          'Üben Sie aktives Zuhören'
        ],
        resources: [
          'https://example.com/emotional-intelligence-course',
          'https://example.com/active-listening-guide'
        ]
      });
    }

    // Compliance suggestions
    if (metrics.details.compliance < 80) {
      suggestions.push({
        category: 'Compliance',
        title: 'Compliance-Verbesserung',
        description: 'Achten Sie auf die korrekte Verwendung von Pflichtphrasen.',
        priority: 'high',
        actionItems: [
          'Überprüfen Sie die Compliance-Checkliste',
          'Nehmen Sie an der Compliance-Schulung teil',
          'Führen Sie regelmäßige Selbstüberprüfungen durch'
        ],
        resources: [
          'https://example.com/compliance-checklist',
          'https://example.com/compliance-training'
        ]
      });
    }

    // Save suggestions to history
    this.suggestionHistory.push(...suggestions);
    await this.saveSuggestions(suggestions);

    return suggestions;
  }

  async analyzeWeaknesses(agentId: string): Promise<WeaknessAnalysis[]> {
    try {
      // Fetch historical data
      const { data: historicalData, error } = await supabase
        .from('performance_metrics')
        .select('*')
        .eq('agent_id', agentId)
        .order('timestamp', { ascending: false })
        .limit(30);

      if (error) throw error;

      // Analyze weaknesses
      const weaknesses: WeaknessAnalysis[] = [
        this.analyzeCategory('Communication', historicalData),
        this.analyzeCategory('Compliance', historicalData),
        this.analyzeCategory('Emotional Intelligence', historicalData),
        this.analyzeCategory('Problem Solving', historicalData)
      ];

      return weaknesses;
    } catch (error) {
      console.error('Error analyzing weaknesses:', error);
      throw error;
    }
  }

  private analyzeCategory(category: string, historicalData: any[]): WeaknessAnalysis {
    // Calculate average score for category
    const scores = historicalData.map(data => data[category.toLowerCase()] || 0);
    const averageScore = scores.reduce((a, b) => a + b, 0) / scores.length;

    // Determine trend
    const recentScores = scores.slice(0, 7);
    const olderScores = scores.slice(7, 14);
    const recentAverage = recentScores.reduce((a, b) => a + b, 0) / recentScores.length;
    const olderAverage = olderScores.reduce((a, b) => a + b, 0) / olderScores.length;
    
    const trend = recentAverage > olderAverage ? 'improving' :
                 recentAverage < olderAverage ? 'declining' : 'stable';

    // Generate suggestions based on score
    const suggestions = this.generateCategorySuggestions(category, averageScore);

    return {
      category,
      score: averageScore,
      trend,
      suggestions
    };
  }

  private generateCategorySuggestions(category: string, score: number): CoachingSuggestion[] {
    const suggestions: CoachingSuggestion[] = [];

    if (score < 70) {
      suggestions.push({
        category,
        title: `${category} Grundlagen verbessern`,
        description: `Arbeiten Sie an den Grundlagen der ${category}.`,
        priority: 'high',
        actionItems: [
          `Besuchen Sie den ${category}-Grundlagenkurs`,
          'Führen Sie regelmäßige Selbstbewertungen durch',
          'Suchen Sie Feedback von Kollegen'
        ]
      });
    } else if (score < 85) {
      suggestions.push({
        category,
        title: `${category} Fähigkeiten verfeinern`,
        description: `Verfeinern Sie Ihre ${category}-Fähigkeiten.`,
        priority: 'medium',
        actionItems: [
          `Nehmen Sie am ${category}-Aufbaukurs teil`,
          'Analysieren Sie Best-Practice-Beispiele',
          'Setzen Sie sich wöchentliche Verbesserungsziele'
        ]
      });
    }

    return suggestions;
  }

  private async saveFeedback(feedback: CoachingFeedback[]): Promise<void> {
    try {
      const { error } = await supabase
        .from('coaching_feedback')
        .insert(feedback.map(f => ({
          ...f,
          timestamp: new Date(f.timestamp).toISOString()
        })));

      if (error) throw error;
    } catch (error) {
      console.error('Error saving feedback:', error);
      throw error;
    }
  }

  private async saveSuggestions(suggestions: CoachingSuggestion[]): Promise<void> {
    try {
      const { error } = await supabase
        .from('coaching_suggestions')
        .insert(suggestions);

      if (error) throw error;
    } catch (error) {
      console.error('Error saving suggestions:', error);
      throw error;
    }
  }

  getFeedbackHistory(): CoachingFeedback[] {
    return this.feedbackHistory;
  }

  getSuggestionHistory(): CoachingSuggestion[] {
    return this.suggestionHistory;
  }
} 