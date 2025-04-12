import { useState, useEffect } from 'react';
import { supabase } from '../services/supabaseClient';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from './ui/select';
import { useAuth } from '../contexts/AuthContext';
import { User, UserRole, Team } from '../types/user';

export const UserManagement: React.FC = () => {
  const [users, setUsers] = useState<User[]>([]);
  const [teams, setTeams] = useState<Team[]>([]);
  const [error, setError] = useState<string | null>(null);
  const { user } = useAuth();

  useEffect(() => {
    fetchUsers();
    fetchTeams();
  }, []);

  const fetchUsers = async () => {
    try {
      const { data, error } = await supabase
        .from('users')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setUsers(data || []);
    } catch (error) {
      setError(error instanceof Error ? error.message : 'Fehler beim Laden der Benutzer');
    }
  };

  const fetchTeams = async () => {
    try {
      const { data, error } = await supabase
        .from('teams')
        .select('id, name')
        .order('name');

      if (error) throw error;
      setTeams(data || []);
    } catch (error) {
      setError(error instanceof Error ? error.message : 'Fehler beim Laden der Teams');
    }
  };

  const handleRoleChange = async (userId: string, newRole: UserRole) => {
    try {
      const { error } = await supabase
        .from('users')
        .update({ role: newRole })
        .eq('id', userId);

      if (error) throw error;
      fetchUsers();
    } catch (error) {
      setError(error instanceof Error ? error.message : 'Fehler beim Aktualisieren der Rolle');
    }
  };

  const handleTeamChange = async (userId: string, teamId: string | null) => {
    try {
      const { error } = await supabase
        .from('users')
        .update({ team_id: teamId })
        .eq('id', userId);

      if (error) throw error;
      fetchUsers();
    } catch (error) {
      setError(error instanceof Error ? error.message : 'Fehler beim Aktualisieren des Teams');
    }
  };

  // Prüfen, ob der aktuelle Benutzer berechtigt ist, Rollen zu ändern
  const canManageRoles = user?.role === UserRole.ADMIN || 
                        user?.role === UserRole.MANAGER || 
                        user?.role === UserRole.TEAM_LEADER;

  // Bestimmen, welche Rollen der aktuelle Benutzer zuweisen darf
  const getAllowedRoles = (currentUserRole: UserRole | undefined) => {
    switch (currentUserRole) {
      case UserRole.ADMIN:
        return Object.values(UserRole);
      case UserRole.MANAGER:
        return [UserRole.AGENT, UserRole.TEAM_LEADER, UserRole.MANAGER];
      case UserRole.TEAM_LEADER:
        return [UserRole.AGENT];
      default:
        return [];
    }
  };

  if (!canManageRoles) {
    return (
      <div className="container mx-auto p-4">
        <Card>
          <CardContent className="p-4">
            <p>Sie haben keine Berechtigung, Benutzerrollen zu verwalten.</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  const allowedRoles = getAllowedRoles(user?.role);

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-bold mb-6">Benutzerverwaltung</h1>

      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
          {error}
        </div>
      )}

      <Card>
        <CardHeader>
          <CardTitle>Benutzer und Rollen</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Name
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    E-Mail
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Rolle
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Team
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {users.map((user) => (
                  <tr key={user.id}>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {user.full_name}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {user.email}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <Select
                        value={user.role}
                        onValueChange={(value) => handleRoleChange(user.id, value as UserRole)}
                      >
                        <SelectTrigger className="w-[180px]">
                          <SelectValue placeholder="Rolle auswählen" />
                        </SelectTrigger>
                        <SelectContent>
                          {allowedRoles.map((role) => (
                            <SelectItem key={role} value={role}>
                              {role.charAt(0).toUpperCase() + role.slice(1).replace('_', ' ')}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <Select
                        value={user.team_id || ''}
                        onValueChange={(value) => handleTeamChange(user.id, value || null)}
                      >
                        <SelectTrigger className="w-[180px]">
                          <SelectValue placeholder="Team auswählen" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="">Kein Team</SelectItem>
                          {teams.map((team) => (
                            <SelectItem key={team.id} value={team.id}>
                              {team.name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}; 