import { supabase } from './supabaseClient';
import OpenAI from 'openai';

interface LLMResponse {
  text: string;
  analysis: any;
  confidence: number;
}

export class LLMService {
  private openai: OpenAI;
  private modelId: string;

  constructor(apiKey: string, modelId: string = '1') {
    this.openai = new OpenAI({
      apiKey: apiKey,
      dangerouslyAllowBrowser: true
    });
    this.modelId = modelId;
  }

  async analyzeTranscript(transcript: string): Promise<LLMResponse> {
    try {
      const completion = await this.openai.chat.completions.create({
        model: "gpt-4",
        messages: [
          {
            role: "system",
            content: "You are a sales call analysis assistant. Analyze the following transcript and provide insights about the conversation, including key points, sentiment, and potential follow-up actions."
          },
          {
            role: "user",
            content: transcript
          }
        ],
        temperature: 0.7,
        max_tokens: 1000
      });

      const response = completion.choices[0].message.content;

      // Parse the response
      const analysis = this.parseLLMResponse(response);

      // Store the analysis in the database
      await this.storeAnalysis(transcript, response, analysis);

      return {
        text: response,
        analysis,
        confidence: 0.9 // Placeholder for confidence score
      };
    } catch (error) {
      console.error('Error analyzing transcript:', error);
      throw new Error('Failed to analyze transcript');
    }
  }

  private parseLLMResponse(response: string): any {
    try {
      // Basic parsing of the LLM response
      // This can be enhanced based on the actual response format
      return {
        sentiment: this.extractSentiment(response),
        keyPoints: this.extractKeyPoints(response),
        recommendations: this.extractRecommendations(response)
      };
    } catch (error) {
      console.error('Error parsing LLM response:', error);
      return {};
    }
  }

  private extractSentiment(text: string): string {
    // Basic sentiment extraction
    if (text.toLowerCase().includes('positiv') || text.toLowerCase().includes('gut')) {
      return 'positive';
    } else if (text.toLowerCase().includes('negativ') || text.toLowerCase().includes('schlecht')) {
      return 'negative';
    }
    return 'neutral';
  }

  private extractKeyPoints(text: string): string[] {
    // Extract key points from the response
    const points = text.split('\n').filter(line => 
      line.trim().startsWith('-') || 
      line.trim().match(/^\d+\./)
    );
    return points.map(point => point.trim().replace(/^[-•\d\.\s]+/, ''));
  }

  private extractRecommendations(text: string): string[] {
    // Extract recommendations from the response
    const recommendations = text.split('\n').filter(line => 
      line.toLowerCase().includes('empfehlung') || 
      line.toLowerCase().includes('sollte')
    );
    return recommendations.map(rec => rec.trim());
  }

  private async storeAnalysis(transcript: string, response: string, analysis: any): Promise<void> {
    try {
      const { error } = await supabase
        .from('llm_analyses')
        .insert({
          call_id: 'current-call', // This should be replaced with actual call ID
          model_id: this.modelId,
          prompt_id: '1',
          input_text: transcript,
          output_text: response,
          analysis: analysis
        });

      if (error) throw error;
    } catch (error) {
      console.error('Error storing LLM analysis:', error);
      throw error;
    }
  }
} 