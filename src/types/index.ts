
export interface League {
  id: string;
  name: string;
  slug: string;
  sport: string;
  country: string;
  createdAt: Date;
}

export interface Team {
  id: string;
  leagueId: string; // Added to associate teams with a league
  name: string;
  logoURL: string;
  played: number;
  wins: number;
  draws: number;
  losses: number;
  goalsFor: number;
  goalsAgainst: number;
  goalDifference: number;
  points: number;
  updatedAt: Date;
}

export interface Match {
  id: string;
  homeTeamId: string;
  awayTeamId: string;
  homeTeamName?: string;
  awayTeamName?: string;
  homeTeamLogo?: string;
  awayTeamLogo?: string;
  dateTime: Date;
  // keep both naming variants for compatibility
  homeGoals: number | null;
  awayGoals: number | null;
  homeScore?: number | null;
  awayScore?: number | null;
  leagueId?: string;
  status: 'upcoming' | 'finished';
  createdAt: Date;
  updatedAt: Date;
  _teams?: [string, string]; // For easier querying in local-storage-db
}

export interface UserProfile {
  uid: string;
  email: string | null;
  role: 'admin' | 'user';
  createdAt: Date;
}
