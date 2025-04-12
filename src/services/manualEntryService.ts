import { supabase } from './supabaseClient';

interface ManualEntry {
  id: string;
  customerNumber: string;
  phoneNumber: string;
  marginLevel: string;
  entryType: 'upgrade' | 'downgrade' | 'sidegrade' | 'mvlz' | 'ovlz';
  notes?: string;
}

interface ManualCall {
  id: string;
  customerNumber: string;
  phoneNumber: string;
  duration: number;
  callType: 'inbound' | 'outbound';
  outcome: 'success' | 'failed' | 'callback';
  notes?: string;
}

interface DailyStats {
  totalEntries: number;
  upgrades: number;
  downgrades: number;
  sidegrades: number;
  mvlz: number;
  ovlz: number;
  upgradeRate: number;
  downgradeRate: number;
  sidegradeRate: number;
  mvlzRate: number;
  ovlzRate: number;
}

export interface Entry {
  id: string;
  customerNumber: string;
  phoneNumber: string;
  marginLevel: string;
  entryType: string;
  notes: string;
  createdAt: Date;
  userId: string;
}

export interface Call {
  id: string;
  customerNumber: string;
  phoneNumber: string;
  duration: number;
  callType: string;
  outcome: string;
  notes: string;
  createdAt: Date;
  userId: string;
}

export class ManualEntryService {
  async createEntry(entry: Omit<ManualEntry, 'id'>): Promise<ManualEntry> {
    const { data, error } = await supabase
      .from('manual_entries')
      .insert({
        customer_number: entry.customerNumber,
        phone_number: entry.phoneNumber,
        margin_level: entry.marginLevel,
        entry_type: entry.entryType,
        notes: entry.notes
      })
      .select()
      .single();

    if (error) throw error;
    return this.mapEntry(data);
  }

  async createCall(call: Omit<ManualCall, 'id'>): Promise<ManualCall> {
    const { data, error } = await supabase
      .from('manual_calls')
      .insert({
        customer_number: call.customerNumber,
        phone_number: call.phoneNumber,
        duration: call.duration,
        call_type: call.callType,
        outcome: call.outcome,
        notes: call.notes
      })
      .select()
      .single();

    if (error) throw error;
    return this.mapCall(data);
  }

  async getDailyStats(userId: string, date: Date): Promise<DailyStats> {
    const startOfDay = new Date(date);
    startOfDay.setHours(0, 0, 0, 0);
    const endOfDay = new Date(date);
    endOfDay.setHours(23, 59, 59, 999);

    const { data: entries, error: entriesError } = await supabase
      .from('manual_entries')
      .select('*')
      .eq('user_id', userId)
      .gte('created_at', startOfDay.toISOString())
      .lte('created_at', endOfDay.toISOString());

    if (entriesError) throw entriesError;

    const stats = {
      totalEntries: entries.length,
      upgrades: entries.filter(e => e.entry_type === 'upgrade').length,
      downgrades: entries.filter(e => e.entry_type === 'downgrade').length,
      sidegrades: entries.filter(e => e.entry_type === 'sidegrade').length,
      mvlz: entries.filter(e => e.entry_type === 'mvlz').length,
      ovlz: entries.filter(e => e.entry_type === 'ovlz').length
    };

    return {
      ...stats,
      upgradeRate: this.calculateRate(stats.upgrades, stats.totalEntries),
      downgradeRate: this.calculateRate(stats.downgrades, stats.totalEntries),
      sidegradeRate: this.calculateRate(stats.sidegrades, stats.totalEntries),
      mvlzRate: this.calculateRate(stats.mvlz, stats.totalEntries),
      ovlzRate: this.calculateRate(stats.ovlz, stats.totalEntries)
    };
  }

  private calculateRate(numerator: number, denominator: number): number {
    return denominator > 0 ? (numerator / denominator) * 100 : 0;
  }

  private mapEntry(data: any): ManualEntry {
    return {
      id: data.id,
      customerNumber: data.customer_number,
      phoneNumber: data.phone_number,
      marginLevel: data.margin_level,
      entryType: data.entry_type,
      notes: data.notes
    };
  }

  private mapCall(data: any): ManualCall {
    return {
      id: data.id,
      customerNumber: data.customer_number,
      phoneNumber: data.phone_number,
      duration: data.duration,
      callType: data.call_type,
      outcome: data.outcome,
      notes: data.notes
    };
  }

  async getEntriesByDateRange(userId: string, startDate: Date, endDate: Date): Promise<Entry[]> {
    const { data, error } = await supabase
      .from('entries')
      .select('*')
      .eq('user_id', userId)
      .gte('created_at', startDate.toISOString())
      .lte('created_at', endDate.toISOString())
      .order('created_at', { ascending: false });

    if (error) throw error;
    return data || [];
  }

  async getCallsByDateRange(userId: string, startDate: Date, endDate: Date): Promise<Call[]> {
    const { data, error } = await supabase
      .from('calls')
      .select('*')
      .eq('user_id', userId)
      .gte('created_at', startDate.toISOString())
      .lte('created_at', endDate.toISOString())
      .order('created_at', { ascending: false });

    if (error) throw error;
    return data || [];
  }
} 