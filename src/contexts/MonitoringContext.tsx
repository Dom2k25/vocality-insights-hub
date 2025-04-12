import React, { createContext, useContext, useState, useEffect } from 'react';
import { MonitoringSystem } from '../services/monitoring';

interface MonitoringContextType {
  startMonitoring: (agentId: string) => Promise<string>;
  stopMonitoring: (sessionId: string) => Promise<void>;
  dropIn: (sessionId: string) => Promise<void>;
  getActiveSessions: () => any[];
  isLoading: boolean;
  error: string | null;
}

const defaultContext: MonitoringContextType = {
  startMonitoring: async () => {
    throw new Error('MonitoringContext not initialized');
  },
  stopMonitoring: async () => {
    throw new Error('MonitoringContext not initialized');
  },
  dropIn: async () => {
    throw new Error('MonitoringContext not initialized');
  },
  getActiveSessions: () => [],
  isLoading: false,
  error: null
};

const MonitoringContext = createContext<MonitoringContextType>(defaultContext);

export const MonitoringProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [monitoringSystem] = useState(() => new MonitoringSystem());
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const startMonitoring = async (agentId: string) => {
    setIsLoading(true);
    setError(null);
    try {
      const sessionId = await monitoringSystem.startMonitoring(agentId, 'current-user-id');
      return sessionId;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  const stopMonitoring = async (sessionId: string) => {
    setIsLoading(true);
    setError(null);
    try {
      await monitoringSystem.stopMonitoring(sessionId);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  const dropIn = async (sessionId: string) => {
    setIsLoading(true);
    setError(null);
    try {
      await monitoringSystem.dropIn(sessionId, 'current-user-id');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  const getActiveSessions = () => {
    return monitoringSystem.getActiveSessions();
  };

  return (
    <MonitoringContext.Provider
      value={{
        startMonitoring,
        stopMonitoring,
        dropIn,
        getActiveSessions,
        isLoading,
        error
      }}
    >
      {children}
    </MonitoringContext.Provider>
  );
};

export const useMonitoring = () => {
  const context = useContext(MonitoringContext);
  if (!context) {
    throw new Error('useMonitoring must be used within a MonitoringProvider');
  }
  return context;
}; 