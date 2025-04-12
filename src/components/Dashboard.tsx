import { useState, useEffect } from 'react';
import { ManualEntryService } from '../services/manualEntryService';
import { ExportService } from '../services/exportService';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from './ui/select';
import { DatePicker } from './ui/date-picker';

const manualEntryService = new ManualEntryService();
const exportService = new ExportService();

export const Dashboard: React.FC = () => {
  const [stats, setStats] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [newEntry, setNewEntry] = useState({
    customerNumber: '',
    phoneNumber: '',
    marginLevel: '',
    entryType: '',
    notes: ''
  });

  const [newCall, setNewCall] = useState({
    customerNumber: '',
    phoneNumber: '',
    duration: 0,
    callType: '',
    outcome: '',
    notes: ''
  });

  const [exportStartDate, setExportStartDate] = useState<Date>(new Date());
  const [exportEndDate, setExportEndDate] = useState<Date>(new Date());
  const [isExporting, setIsExporting] = useState(false);

  useEffect(() => {
    loadDailyStats();
  }, []);

  const loadDailyStats = async () => {
    try {
      setLoading(true);
      const todayStats = await manualEntryService.getDailyStats('current-user-id', new Date());
      setStats(todayStats);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setLoading(false);
    }
  };

  const handleEntrySubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await manualEntryService.createEntry({
        ...newEntry,
        entryType: newEntry.entryType as any
      });
      setNewEntry({
        customerNumber: '',
        phoneNumber: '',
        marginLevel: '',
        entryType: '',
        notes: ''
      });
      loadDailyStats();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    }
  };

  const handleCallSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await manualEntryService.createCall({
        ...newCall,
        callType: newCall.callType as any,
        outcome: newCall.outcome as any
      });
      setNewCall({
        customerNumber: '',
        phoneNumber: '',
        duration: 0,
        callType: '',
        outcome: '',
        notes: ''
      });
      loadDailyStats();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    }
  };

  const handleExport = async () => {
    try {
      setIsExporting(true);
      await exportService.exportAgentDataToExcel('current-user-id', exportStartDate, exportEndDate);
    } catch (error) {
      setError(error instanceof Error ? error.message : 'Fehler beim Exportieren');
    } finally {
      setIsExporting(false);
    }
  };

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-bold mb-6">Dashboard</h1>

      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
          {error}
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
        <Card>
          <CardHeader>
            <CardTitle>Neuer Eintrag</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleEntrySubmit} className="space-y-4">
              <div>
                <Label htmlFor="customerNumber">Kundennummer</Label>
                <Input
                  id="customerNumber"
                  value={newEntry.customerNumber}
                  onChange={(e) => setNewEntry({ ...newEntry, customerNumber: e.target.value })}
                />
              </div>
              <div>
                <Label htmlFor="phoneNumber">Rufnummer</Label>
                <Input
                  id="phoneNumber"
                  value={newEntry.phoneNumber}
                  onChange={(e) => setNewEntry({ ...newEntry, phoneNumber: e.target.value })}
                />
              </div>
              <div>
                <Label htmlFor="marginLevel">Margenstufe</Label>
                <Input
                  id="marginLevel"
                  value={newEntry.marginLevel}
                  onChange={(e) => setNewEntry({ ...newEntry, marginLevel: e.target.value })}
                />
              </div>
              <div>
                <Label htmlFor="entryType">Eintragstyp</Label>
                <Select
                  value={newEntry.entryType}
                  onValueChange={(value) => setNewEntry({ ...newEntry, entryType: value })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Typ auswählen" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="upgrade">Upgrade</SelectItem>
                    <SelectItem value="downgrade">Downgrade</SelectItem>
                    <SelectItem value="sidegrade">Sidegrade</SelectItem>
                    <SelectItem value="mvlz">MVLZ</SelectItem>
                    <SelectItem value="ovlz">OVLZ</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label htmlFor="notes">Notizen</Label>
                <Input
                  id="notes"
                  value={newEntry.notes}
                  onChange={(e) => setNewEntry({ ...newEntry, notes: e.target.value })}
                />
              </div>
              <Button type="submit">Eintrag speichern</Button>
            </form>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Neuer Anruf</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleCallSubmit} className="space-y-4">
              <div>
                <Label htmlFor="callCustomerNumber">Kundennummer</Label>
                <Input
                  id="callCustomerNumber"
                  value={newCall.customerNumber}
                  onChange={(e) => setNewCall({ ...newCall, customerNumber: e.target.value })}
                />
              </div>
              <div>
                <Label htmlFor="callPhoneNumber">Rufnummer</Label>
                <Input
                  id="callPhoneNumber"
                  value={newCall.phoneNumber}
                  onChange={(e) => setNewCall({ ...newCall, phoneNumber: e.target.value })}
                />
              </div>
              <div>
                <Label htmlFor="duration">Dauer (Sekunden)</Label>
                <Input
                  id="duration"
                  type="number"
                  value={newCall.duration}
                  onChange={(e) => setNewCall({ ...newCall, duration: parseInt(e.target.value) })}
                />
              </div>
              <div>
                <Label htmlFor="callType">Anruftyp</Label>
                <Select
                  value={newCall.callType}
                  onValueChange={(value) => setNewCall({ ...newCall, callType: value })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Typ auswählen" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="inbound">Eingehend</SelectItem>
                    <SelectItem value="outbound">Ausgehend</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label htmlFor="outcome">Ergebnis</Label>
                <Select
                  value={newCall.outcome}
                  onValueChange={(value) => setNewCall({ ...newCall, outcome: value })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Ergebnis auswählen" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="success">Erfolgreich</SelectItem>
                    <SelectItem value="failed">Fehlgeschlagen</SelectItem>
                    <SelectItem value="callback">Rückruf</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label htmlFor="callNotes">Notizen</Label>
                <Input
                  id="callNotes"
                  value={newCall.notes}
                  onChange={(e) => setNewCall({ ...newCall, notes: e.target.value })}
                />
              </div>
              <Button type="submit">Anruf speichern</Button>
            </form>
          </CardContent>
        </Card>
      </div>

      <Card className="mb-8">
        <CardHeader>
          <CardTitle>Daten Export</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
            <div>
              <Label>Startdatum</Label>
              <DatePicker
                date={exportStartDate}
                onSelect={setExportStartDate}
              />
            </div>
            <div>
              <Label>Enddatum</Label>
              <DatePicker
                date={exportEndDate}
                onSelect={setExportEndDate}
              />
            </div>
          </div>
          <Button
            onClick={handleExport}
            disabled={isExporting}
          >
            {isExporting ? 'Exportiere...' : 'Als Excel exportieren'}
          </Button>
        </CardContent>
      </Card>

      {stats && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Card>
            <CardHeader>
              <CardTitle>Heutige Statistiken</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <p>Gesamteinträge: {stats.totalEntries}</p>
                <p>Upgrades: {stats.upgrades} ({stats.upgradeRate.toFixed(1)}%)</p>
                <p>Downgrades: {stats.downgrades} ({stats.downgradeRate.toFixed(1)}%)</p>
                <p>Sidegrades: {stats.sidegrades} ({stats.sidegradeRate.toFixed(1)}%)</p>
                <p>MVLZ: {stats.mvlz} ({stats.mvlzRate.toFixed(1)}%)</p>
                <p>OVLZ: {stats.ovlz} ({stats.ovlzRate.toFixed(1)}%)</p>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}; 