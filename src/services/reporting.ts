import { supabase } from './supabaseClient';
import { PerformanceMetrics } from './performanceMetrics';

interface TrendData {
  daily: number[];
  weekly: number[];
  monthly: number[];
}

interface TeamComparison {
  teamId: string;
  teamName: string;
  metrics: {
    averageScore: number;
    trend: 'improving' | 'stable' | 'declining';
    rank: number;
  };
  details: {
    agentCount: number;
    callCount: number;
    averageDuration: number;
  };
}

interface ReportData {
  period: {
    start: Date;
    end: Date;
  };
  metrics: {
    overall: PerformanceMetrics;
    byTeam: TeamComparison[];
    trends: TrendData;
  };
  insights: {
    topPerformers: string[];
    areasForImprovement: string[];
    notableTrends: string[];
  };
}

export class ReportingSystem {
  async generateReport(
    startDate: Date,
    endDate: Date,
    teamId?: string
  ): Promise<ReportData> {
    try {
      // Fetch performance data
      const performanceData = await this.fetchPerformanceData(startDate, endDate, teamId);
      
      // Calculate metrics
      const metrics = this.calculateMetrics(performanceData);
      
      // Generate insights
      const insights = await this.generateInsights(performanceData);
      
      // Get team comparisons
      const teamComparisons = await this.compareTeams(performanceData);

      return {
        period: { start: startDate, end: endDate },
        metrics: {
          overall: metrics,
          byTeam: teamComparisons,
          trends: this.calculateTrends(performanceData)
        },
        insights
      };
    } catch (error) {
      console.error('Error generating report:', error);
      throw error;
    }
  }

  private async fetchPerformanceData(
    startDate: Date,
    endDate: Date,
    teamId?: string
  ): Promise<any[]> {
    try {
      let query = supabase
        .from('performance_metrics')
        .select('*')
        .gte('timestamp', startDate.toISOString())
        .lte('timestamp', endDate.toISOString());

      if (teamId) {
        query = query.eq('team_id', teamId);
      }

      const { data, error } = await query;

      if (error) throw error;
      return data || [];
    } catch (error) {
      console.error('Error fetching performance data:', error);
      throw error;
    }
  }

  private calculateMetrics(data: any[]): PerformanceMetrics {
    if (data.length === 0) {
      return {
        agentScore: 0,
        customerSatisfaction: 0,
        conflictScore: 0,
        qualityScore: 0,
        details: {
          speechRate: 0,
          compliance: 0,
          emotionBalance: 0,
          contextMatch: 0
        }
      };
    }

    const metrics = {
      agentScore: 0,
      customerSatisfaction: 0,
      conflictScore: 0,
      qualityScore: 0,
      details: {
        speechRate: 0,
        compliance: 0,
        emotionBalance: 0,
        contextMatch: 0
      }
    };

    // Calculate averages
    Object.keys(metrics).forEach(key => {
      if (key === 'details') {
        Object.keys(metrics.details).forEach(detailKey => {
          metrics.details[detailKey] = this.calculateAverage(
            data.map(item => item.details[detailKey])
          );
        });
      } else {
        metrics[key] = this.calculateAverage(data.map(item => item[key]));
      }
    });

    return metrics;
  }

  private calculateAverage(numbers: number[]): number {
    if (numbers.length === 0) return 0;
    return numbers.reduce((a, b) => a + b, 0) / numbers.length;
  }

  private async compareTeams(data: any[]): Promise<TeamComparison[]> {
    try {
      // Group data by team
      const teamData = new Map<string, any[]>();
      data.forEach(item => {
        if (!teamData.has(item.team_id)) {
          teamData.set(item.team_id, []);
        }
        teamData.get(item.team_id).push(item);
      });

      // Calculate team metrics
      const comparisons: TeamComparison[] = [];
      for (const [teamId, teamMetrics] of teamData) {
        const { data: teamInfo } = await supabase
          .from('teams')
          .select('name')
          .eq('id', teamId)
          .single();

        const averageScore = this.calculateAverage(
          teamMetrics.map(m => m.quality_score)
        );

        const trend = this.calculateTrend(teamMetrics);

        comparisons.push({
          teamId,
          teamName: teamInfo?.name || 'Unknown Team',
          metrics: {
            averageScore,
            trend,
            rank: 0 // Will be set after sorting
          },
          details: {
            agentCount: new Set(teamMetrics.map(m => m.agent_id)).size,
            callCount: teamMetrics.length,
            averageDuration: this.calculateAverage(
              teamMetrics.map(m => m.duration)
            )
          }
        });
      }

      // Sort and rank teams
      comparisons.sort((a, b) => b.metrics.averageScore - a.metrics.averageScore);
      comparisons.forEach((team, index) => {
        team.metrics.rank = index + 1;
      });

      return comparisons;
    } catch (error) {
      console.error('Error comparing teams:', error);
      throw error;
    }
  }

  private calculateTrend(data: any[]): 'improving' | 'stable' | 'declining' {
    if (data.length < 2) return 'stable';

    const recentScores = data
      .slice(0, Math.floor(data.length / 2))
      .map(item => item.quality_score);
    const olderScores = data
      .slice(Math.floor(data.length / 2))
      .map(item => item.quality_score);

    const recentAverage = this.calculateAverage(recentScores);
    const olderAverage = this.calculateAverage(olderScores);

    if (recentAverage > olderAverage + 5) return 'improving';
    if (recentAverage < olderAverage - 5) return 'declining';
    return 'stable';
  }

  private calculateTrends(data: any[]): TrendData {
    const trends: TrendData = {
      daily: [],
      weekly: [],
      monthly: []
    };

    // Group data by time period
    const dailyGroups = new Map<string, number[]>();
    const weeklyGroups = new Map<string, number[]>();
    const monthlyGroups = new Map<string, number[]>();

    data.forEach(item => {
      const date = new Date(item.timestamp);
      
      // Daily grouping
      const dailyKey = date.toISOString().split('T')[0];
      if (!dailyGroups.has(dailyKey)) {
        dailyGroups.set(dailyKey, []);
      }
      dailyGroups.get(dailyKey).push(item.quality_score);

      // Weekly grouping
      const weekStart = new Date(date);
      weekStart.setDate(date.getDate() - date.getDay());
      const weeklyKey = weekStart.toISOString().split('T')[0];
      if (!weeklyGroups.has(weeklyKey)) {
        weeklyGroups.set(weeklyKey, []);
      }
      weeklyGroups.get(weeklyKey).push(item.quality_score);

      // Monthly grouping
      const monthlyKey = `${date.getFullYear()}-${date.getMonth() + 1}`;
      if (!monthlyGroups.has(monthlyKey)) {
        monthlyGroups.set(monthlyKey, []);
      }
      monthlyGroups.get(monthlyKey).push(item.quality_score);
    });

    // Calculate averages for each period
    trends.daily = Array.from(dailyGroups.values())
      .map(scores => this.calculateAverage(scores));
    trends.weekly = Array.from(weeklyGroups.values())
      .map(scores => this.calculateAverage(scores));
    trends.monthly = Array.from(monthlyGroups.values())
      .map(scores => this.calculateAverage(scores));

    return trends;
  }

  private async generateInsights(data: any[]): Promise<{
    topPerformers: string[];
    areasForImprovement: string[];
    notableTrends: string[];
  }> {
    const insights = {
      topPerformers: [],
      areasForImprovement: [],
      notableTrends: []
    };

    if (data.length === 0) return insights;

    // Identify top performers
    const agentScores = new Map<string, number>();
    data.forEach(item => {
      const currentScore = agentScores.get(item.agent_id) || 0;
      agentScores.set(item.agent_id, currentScore + item.quality_score);
    });

    const topAgents = Array.from(agentScores.entries())
      .sort((a, b) => b[1] - a[1])
      .slice(0, 3);

    for (const [agentId] of topAgents) {
      const { data: agentInfo } = await supabase
        .from('users')
        .select('name')
        .eq('id', agentId)
        .single();
      
      if (agentInfo) {
        insights.topPerformers.push(agentInfo.name);
      }
    }

    // Identify areas for improvement
    const metrics = this.calculateMetrics(data);
    if (metrics.details.compliance < 80) {
      insights.areasForImprovement.push('Compliance-Verbesserung erforderlich');
    }
    if (metrics.details.emotionBalance < 60) {
      insights.areasForImprovement.push('Emotionale Balance verbessern');
    }
    if (metrics.details.speechRate < 70 || metrics.details.speechRate > 90) {
      insights.areasForImprovement.push('Sprachgeschwindigkeit optimieren');
    }

    // Identify notable trends
    const trends = this.calculateTrends(data);
    if (trends.daily.length >= 2) {
      const lastDay = trends.daily[trends.daily.length - 1];
      const previousDay = trends.daily[trends.daily.length - 2];
      if (lastDay > previousDay + 5) {
        insights.notableTrends.push('Signifikante Verbesserung in den letzten 24 Stunden');
      } else if (lastDay < previousDay - 5) {
        insights.notableTrends.push('Rückgang der Performance in den letzten 24 Stunden');
      }
    }

    return insights;
  }

  async exportReport(report: ReportData, format: 'pdf' | 'csv' | 'json'): Promise<string> {
    try {
      // Generate report content based on format
      let content: string;
      
      switch (format) {
        case 'pdf':
          content = this.generatePDFContent(report);
          break;
        case 'csv':
          content = this.generateCSVContent(report);
          break;
        case 'json':
          content = JSON.stringify(report, null, 2);
          break;
        default:
          throw new Error('Unsupported export format');
      }

      // Save to database
      const { data, error } = await supabase
        .from('reports')
        .insert({
          content,
          format,
          period_start: report.period.start.toISOString(),
          period_end: report.period.end.toISOString(),
          created_at: new Date().toISOString()
        })
        .select()
        .single();

      if (error) throw error;
      return data.id;
    } catch (error) {
      console.error('Error exporting report:', error);
      throw error;
    }
  }

  private generatePDFContent(report: ReportData): string {
    // This would typically use a PDF generation library
    // For now, return a simple text representation
    return `
      Performance Report
      Period: ${report.period.start.toLocaleDateString()} - ${report.period.end.toLocaleDateString()}
      
      Overall Metrics:
      - Quality Score: ${report.metrics.overall.qualityScore.toFixed(2)}
      - Agent Score: ${report.metrics.overall.agentScore.toFixed(2)}
      - Customer Satisfaction: ${report.metrics.overall.customerSatisfaction.toFixed(2)}
      
      Top Performers:
      ${report.insights.topPerformers.join('\n')}
      
      Areas for Improvement:
      ${report.insights.areasForImprovement.join('\n')}
    `;
  }

  private generateCSVContent(report: ReportData): string {
    const headers = [
      'Metric',
      'Value',
      'Team Rank',
      'Trend'
    ];

    const rows = [
      [
        'Quality Score',
        report.metrics.overall.qualityScore.toFixed(2),
        report.metrics.byTeam[0]?.metrics.rank || 'N/A',
        report.metrics.byTeam[0]?.metrics.trend || 'N/A'
      ],
      [
        'Agent Score',
        report.metrics.overall.agentScore.toFixed(2),
        'N/A',
        'N/A'
      ],
      [
        'Customer Satisfaction',
        report.metrics.overall.customerSatisfaction.toFixed(2),
        'N/A',
        'N/A'
      ]
    ];

    return [
      headers.join(','),
      ...rows.map(row => row.join(','))
    ].join('\n');
  }
} 