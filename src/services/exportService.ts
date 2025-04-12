import * as XLSX from 'xlsx';
import { ManualEntryService, Entry, Call } from './manualEntryService';
import { supabase } from './supabaseClient';

export class ExportService {
  private manualEntryService: ManualEntryService;

  constructor() {
    this.manualEntryService = new ManualEntryService();
  }

  async exportAgentDataToExcel(userId: string, startDate: Date, endDate: Date): Promise<void> {
    try {
      // Fetch data from the manual entry service
      const entries = await this.manualEntryService.getEntriesByDateRange(userId, startDate, endDate);
      const calls = await this.manualEntryService.getCallsByDateRange(userId, startDate, endDate);

      // Fetch user information for all entries and calls
      const uniqueUserIds = [...new Set([
        ...entries.map(entry => entry.userId),
        ...calls.map(call => call.userId)
      ])];

      const { data: users, error: usersError } = await supabase
        .from('users')
        .select('id, email, full_name')
        .in('id', uniqueUserIds);

      if (usersError) throw usersError;

      // Create a map of user IDs to user information
      const userMap = new Map(users?.map(user => [user.id, user]) || []);

      // Create worksheets with agent information
      const entriesWorksheet = XLSX.utils.json_to_sheet(entries.map((entry: Entry) => {
        const user = userMap.get(entry.userId);
        return {
          'Agent': user ? `${user.full_name} (${user.email})` : 'Unbekannt',
          'Kundennummer': entry.customerNumber,
          'Rufnummer': entry.phoneNumber,
          'Margenstufe': entry.marginLevel,
          'Eintragstyp': entry.entryType,
          'Notizen': entry.notes,
          'Datum': entry.createdAt
        };
      }));

      const callsWorksheet = XLSX.utils.json_to_sheet(calls.map((call: Call) => {
        const user = userMap.get(call.userId);
        return {
          'Agent': user ? `${user.full_name} (${user.email})` : 'Unbekannt',
          'Kundennummer': call.customerNumber,
          'Rufnummer': call.phoneNumber,
          'Dauer (Sekunden)': call.duration,
          'Anruftyp': call.callType,
          'Ergebnis': call.outcome,
          'Notizen': call.notes,
          'Datum': call.createdAt
        };
      }));

      // Create workbook
      const workbook = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(workbook, entriesWorksheet, 'Einträge');
      XLSX.utils.book_append_sheet(workbook, callsWorksheet, 'Anrufe');

      // Generate file name with date range
      const fileName = `Agenten_Daten_${startDate.toISOString().split('T')[0]}_bis_${endDate.toISOString().split('T')[0]}.xlsx`;

      // Save the file
      XLSX.writeFile(workbook, fileName);
    } catch (error) {
      console.error('Fehler beim Exportieren der Daten:', error);
      throw error;
    }
  }
} 