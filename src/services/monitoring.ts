import { AudioAnalyzer, defaultAudioConfig } from './audioAnalysis';
import { supabase } from './supabaseClient';
import { WebRTCService } from './webrtc';

interface MonitoringSession {
  id: string;
  agentId: string;
  coachId: string;
  startTime: Date;
  audioAnalyzer: AudioAnalyzer;
  isActive: boolean;
  webRTCService?: WebRTCService;
}

export class MonitoringSystem {
  private activeSessions: Map<string, MonitoringSession> = new Map();
  private config = defaultAudioConfig;

  async startMonitoring(agentId: string, coachId: string): Promise<string> {
    try {
      // Create new monitoring session
      const sessionId = this.generateSessionId();
      const audioAnalyzer = new AudioAnalyzer(this.config);
      
      const session: MonitoringSession = {
        id: sessionId,
        agentId,
        coachId,
        startTime: new Date(),
        audioAnalyzer,
        isActive: true
      };

      // Start audio analysis
      await audioAnalyzer.startAnalysis();
      
      // Store session
      this.activeSessions.set(sessionId, session);

      // Log monitoring start
      await this.logMonitoringEvent(sessionId, 'start');

      return sessionId;
    } catch (error) {
      console.error('Error starting monitoring:', error);
      throw error;
    }
  }

  async stopMonitoring(sessionId: string): Promise<void> {
    const session = this.activeSessions.get(sessionId);
    if (!session) throw new Error('Session not found');

    try {
      // Stop audio analysis
      session.audioAnalyzer.stopAnalysis();
      
      // Update session status
      session.isActive = false;
      
      // Log monitoring end
      await this.logMonitoringEvent(sessionId, 'end');
      
      // Remove session
      this.activeSessions.delete(sessionId);
    } catch (error) {
      console.error('Error stopping monitoring:', error);
      throw error;
    }
  }

  async dropIn(sessionId: string, coachId: string): Promise<void> {
    const session = this.activeSessions.get(sessionId);
    if (!session) throw new Error('Session not found');

    try {
      // Verify coach permissions
      const hasPermission = await this.verifyCoachPermission(coachId, session.agentId);
      if (!hasPermission) throw new Error('Unauthorized drop-in attempt');

      // Initialize WebRTC for the session
      const webRTCService = new WebRTCService();
      await webRTCService.initializeLocalStream();
      await webRTCService.createPeerConnection();

      // Update session with WebRTC service
      session.webRTCService = webRTCService;

      // Create and send offer
      const offer = await webRTCService.createOffer();

      // Log drop-in event with WebRTC details
      await this.logMonitoringEvent(sessionId, 'drop-in', { 
        coachId,
        webRTC: {
          offer,
          timestamp: new Date().toISOString()
        }
      });

      // Subscribe to WebRTC events
      this.subscribeToWebRTCEvents(sessionId, webRTCService);

    } catch (error) {
      console.error('Error during drop-in:', error);
      throw error;
    }
  }

  private subscribeToWebRTCEvents(sessionId: string, webRTCService: WebRTCService): void {
    const subscription = supabase
      .channel(`webrtc-events-${sessionId}`)
      .on('postgres_changes', 
        { 
          event: 'INSERT', 
          schema: 'public', 
          table: 'webrtc_events',
          filter: `session_id=eq.${sessionId}`
        }, 
        async (payload) => {
          const event = payload.new;
          
          switch (event.type) {
            case 'answer':
              await webRTCService.handleAnswer(event.sdp);
              break;
            case 'ice-candidate':
              await webRTCService.addIceCandidate(event.candidate);
              break;
          }
        }
      )
      .subscribe();
  }

  async handleWebRTCOffer(sessionId: string, offer: RTCSessionDescriptionInit): Promise<void> {
    const session = this.activeSessions.get(sessionId);
    if (!session) throw new Error('Session not found');

    try {
      if (!session.webRTCService) {
        session.webRTCService = new WebRTCService();
        await session.webRTCService.initializeLocalStream();
        await session.webRTCService.createPeerConnection();
      }

      const answer = await session.webRTCService.handleOffer(offer);
      
      // Log the answer
      await this.logMonitoringEvent(sessionId, 'webrtc-answer', {
        answer,
        timestamp: new Date().toISOString()
      });

    } catch (error) {
      console.error('Error handling WebRTC offer:', error);
      throw error;
    }
  }

  getActiveSessions(): MonitoringSession[] {
    return Array.from(this.activeSessions.values())
      .filter(session => session.isActive);
  }

  getSessionAnalysis(sessionId: string): any {
    const session = this.activeSessions.get(sessionId);
    if (!session) throw new Error('Session not found');

    // Return current analysis results
    return {
      sessionId,
      agentId: session.agentId,
      duration: Date.now() - session.startTime.getTime(),
      isActive: session.isActive
    };
  }

  private generateSessionId(): string {
    return Math.random().toString(36).substring(2, 15);
  }

  private async verifyCoachPermission(coachId: string, agentId: string): Promise<boolean> {
    try {
      const { data, error } = await supabase
        .from('coach_assignments')
        .select('*')
        .eq('coach_id', coachId)
        .eq('agent_id', agentId)
        .single();

      if (error) throw error;
      return !!data;
    } catch (error) {
      console.error('Error verifying coach permission:', error);
      return false;
    }
  }

  private async logMonitoringEvent(
    sessionId: string, 
    eventType: 'start' | 'end' | 'drop-in' | 'webrtc-answer',
    metadata?: any
  ): Promise<void> {
    try {
      const { error } = await supabase
        .from('monitoring_events')
        .insert({
          session_id: sessionId,
          event_type: eventType,
          metadata: metadata || {},
          timestamp: new Date().toISOString()
        });

      if (error) throw error;
    } catch (error) {
      console.error('Error logging monitoring event:', error);
      throw error;
    }
  }
}

// Export singleton instance
export const monitoringSystem = new MonitoringSystem(); 