import { createContext, useContext, useState } from 'react';
import { LLMService } from '../services/llmService';

interface LLMResponse {
  text: string;
  analysis: any;
  confidence: number;
}

interface LLMContextType {
  isLoading: boolean;
  error: string | null;
  analyzeTranscript: (transcript: string) => Promise<LLMResponse>;
}

const defaultContext: LLMContextType = {
  isLoading: false,
  error: null,
  analyzeTranscript: async () => {
    throw new Error('LLMContext not initialized');
  }
};

const LLMContext = createContext<LLMContextType>(defaultContext);

export const LLMProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const llmService = new LLMService();

  const analyzeTranscript = async (transcript: string) => {
    setIsLoading(true);
    setError(null);
    try {
      const result = await llmService.analyzeTranscript(transcript);
      return result;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <LLMContext.Provider value={{ isLoading, error, analyzeTranscript }}>
      {children}
    </LLMContext.Provider>
  );
};

export const useLLM = () => {
  const context = useContext(LLMContext);
  if (!context) {
    throw new Error('useLLM must be used within an LLMProvider');
  }
  return context;
}; 