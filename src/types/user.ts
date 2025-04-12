export enum UserRole {
  AGENT = 'agent',
  TEAM_LEADER = 'team_leader',
  MANAGER = 'manager',
  ADMIN = 'admin'
}

export interface User {
  id: string;
  email: string;
  full_name: string;
  role: UserRole;
  team_id: string | null;
  created_at: string;
  updated_at: string;
}

export interface Team {
  id: string;
  name: string;
  created_at: string;
} 