'use client';

import { supabase } from '@/lib/supabase-client';
import type { League, Team, Match } from '@/types';

// Helper function to convert Supabase data to our app types
const convertLeague = (row: any): League => ({
  id: row.id.toString(),
  name: row.name,
  slug: row.slug,
  sport: row.sport,
  country: row.country,
  createdAt: new Date(row.created_at),
});

const convertTeam = (row: any): Team => ({
  id: row.id.toString(),
  name: row.name,
  logoURL: row.logo_url,
  played: row.played,
  wins: row.wins,
  draws: row.draws,
  losses: row.losses,
  goalsFor: row.goals_for,
  goalsAgainst: row.goals_against,
  goalDifference: row.goal_difference,
  points: row.points,
  leagueId: row.league_id.toString(),
  updatedAt: new Date(row.updated_at),
});

const convertMatch = (row: any): Match => ({
  id: row.id.toString(),
  leagueId: row.league_id.toString(),
  homeTeamId: row.home_team_id.toString(),
  awayTeamId: row.away_team_id.toString(),
  dateTime: new Date(row.date_time),
  // Provide both naming conventions so UI and server code stay compatible
  homeScore: row.home_score,
  awayScore: row.away_score,
  homeGoals: row.home_score,
  awayGoals: row.away_score,
  status: row.status,
  createdAt: new Date(row.created_at),
  updatedAt: new Date(row.updated_at),
});

// League Operations
export const getLeagues = async (): Promise<League[]> => {
  const { data, error } = await supabase
    .from('leagues')
    .select('*')
    .order('created_at', { ascending: false });

  if (error) {
    console.error('Error fetching leagues:', error);
    return [];
  }

  return data.map(convertLeague);
};

export const getLeagueBySlug = async (slug: string): Promise<League | null> => {
  const { data, error } = await supabase
    .from('leagues')
    .select('*')
    .eq('slug', slug)
    .single();

  if (error) {
    console.error('Error fetching league:', error);
    return null;
  }

  return convertLeague(data);
};

export const addLeague = async (league: Omit<League, 'id' | 'createdAt'>): Promise<League | null> => {
  const { data, error } = await supabase
    .from('leagues')
    .insert({
      name: league.name,
      slug: league.slug,
      sport: league.sport,
      country: league.country,
    })
    .select()
    .single();

  if (error) {
    console.error('Error creating league:', error);
    return null;
  }

  return convertLeague(data);
};

// Team Operations
export const getTeamsByLeagueId = async (leagueId: string): Promise<Team[]> => {
  const { data, error } = await supabase
    .from('teams')
    .select('*')
    .eq('league_id', leagueId)
    .order('name');

  if (error) {
    console.error('Error fetching teams:', error);
    return [];
  }

  return data.map(convertTeam);
};

export const getTeamById = async (teamId: string): Promise<Team | null> => {
  const { data, error } = await supabase
    .from('teams')
    .select('*')
    .eq('id', teamId)
    .single();

  if (error) {
    console.error('Error fetching team:', error);
    return null;
  }

  return convertTeam(data);
};

export const addTeamToLeague = async (
  leagueId: string, 
  team: Omit<Team, 'id' | 'updatedAt' | 'leagueId' | 'played' | 'wins' | 'draws' | 'losses' | 'goalsFor' | 'goalsAgainst' | 'goalDifference' | 'points'>
): Promise<Team | null> => {
  const { data, error } = await supabase
    .from('teams')
    .insert({
      name: team.name,
      logo_url: team.logoURL,
      league_id: parseInt(leagueId),
      played: 0,
      wins: 0,
      draws: 0,
      losses: 0,
      goals_for: 0,
      goals_against: 0,
      goal_difference: 0,
      points: 0,
    })
    .select()
    .single();

  if (error) {
    console.error('Error creating team:', error);
    return null;
  }

  return convertTeam(data);
};

export const updateTeamInLeague = async (teamId: string, teamUpdate: Partial<Team>): Promise<Team | null> => {
  const updateData: any = {};
  
  if (teamUpdate.name !== undefined) updateData.name = teamUpdate.name;
  if (teamUpdate.logoURL !== undefined) updateData.logo_url = teamUpdate.logoURL;
  if (teamUpdate.played !== undefined) updateData.played = teamUpdate.played;
  if (teamUpdate.wins !== undefined) updateData.wins = teamUpdate.wins;
  if (teamUpdate.draws !== undefined) updateData.draws = teamUpdate.draws;
  if (teamUpdate.losses !== undefined) updateData.losses = teamUpdate.losses;
  if (teamUpdate.goalsFor !== undefined) updateData.goals_for = teamUpdate.goalsFor;
  if (teamUpdate.goalsAgainst !== undefined) updateData.goals_against = teamUpdate.goalsAgainst;
  if (teamUpdate.goalDifference !== undefined) updateData.goal_difference = teamUpdate.goalDifference;
  if (teamUpdate.points !== undefined) updateData.points = teamUpdate.points;

  const { data, error } = await supabase
    .from('teams')
    .update(updateData)
    .eq('id', teamId)
    .select()
    .single();

  if (error) {
    console.error('Error updating team:', error);
    return null;
  }

  return convertTeam(data);
};

export const deleteTeamFromLeague = async (teamId: string): Promise<boolean> => {
  // First delete matches associated with this team
  await supabase
    .from('matches')
    .delete()
    .or(`home_team_id.eq.${teamId},away_team_id.eq.${teamId}`);

  // Then delete the team
  const { error } = await supabase
    .from('teams')
    .delete()
    .eq('id', teamId);

  if (error) {
    console.error('Error deleting team:', error);
    return false;
  }

  return true;
};

// Match Operations
export const getMatchesByLeagueId = async (leagueId: string): Promise<Match[]> => {
  const { data, error } = await supabase
    .from('matches')
    .select('*')
    .eq('league_id', leagueId)
    .order('date_time', { ascending: false });

  if (error) {
    console.error('Error fetching matches:', error);
    return [];
  }

  return data.map(convertMatch);
};

export const addMatchToLeague = async (
  leagueId: string, 
  match: Omit<Match, 'id' | 'createdAt' | 'updatedAt'>
): Promise<Match | null> => {
  const { data, error } = await supabase
    .from('matches')
    .insert({
      league_id: parseInt(leagueId),
      home_team_id: parseInt(match.homeTeamId),
      away_team_id: parseInt(match.awayTeamId),
      date_time: match.dateTime.toISOString(),
      home_score: match.homeScore,
      away_score: match.awayScore,
      status: match.status,
    })
    .select()
    .single();

  if (error) {
    console.error('Error creating match:', error);
    return null;
  }

  return convertMatch(data);
};

export const updateMatchInLeague = async (matchId: string, matchUpdate: Partial<Match>): Promise<Match | null> => {
  const updateData: any = {};
  
  if (matchUpdate.homeScore !== undefined) updateData.home_score = matchUpdate.homeScore;
  if (matchUpdate.awayScore !== undefined) updateData.away_score = matchUpdate.awayScore;
  if (matchUpdate.status !== undefined) updateData.status = matchUpdate.status;
  if (matchUpdate.dateTime !== undefined) updateData.date_time = matchUpdate.dateTime.toISOString();

  const { data, error } = await supabase
    .from('matches')
    .update(updateData)
    .eq('id', matchId)
    .select()
    .single();

  if (error) {
    console.error('Error updating match:', error);
    return null;
  }

  return convertMatch(data);
};

export const deleteMatchFromLeague = async (matchId: string): Promise<boolean> => {
  const { error } = await supabase
    .from('matches')
    .delete()
    .eq('id', matchId);

  if (error) {
    console.error('Error deleting match:', error);
    return false;
  }

  return true;
};

// League deletion: remove matches and teams belonging to the league, then remove the league row.
export const deleteLeague = async (leagueId: string): Promise<boolean> => {
  try {
    const leagueInt = parseInt(leagueId);

    // Delete matches for the league
    const { error: matchError } = await supabase
      .from('matches')
      .delete()
      .eq('league_id', leagueInt);

    if (matchError) {
      console.error('Error deleting matches for league:', matchError);
      return false;
    }

    // Delete teams for the league
    const { error: teamError } = await supabase
      .from('teams')
      .delete()
      .eq('league_id', leagueInt);

    if (teamError) {
      console.error('Error deleting teams for league:', teamError);
      return false;
    }

    // Finally delete the league itself
    const { error: leagueError } = await supabase
      .from('leagues')
      .delete()
      .eq('id', leagueInt);

    if (leagueError) {
      console.error('Error deleting league:', leagueError);
      return false;
    }

    return true;
  } catch (err) {
    console.error('Unexpected error deleting league:', err);
    return false;
  }
};

// Real-time subscriptions
export const subscribeToLeagueUpdates = (leagueId: string, callback: (payload: any) => void) => {
  return supabase
    .channel(`league-${leagueId}`)
    .on('postgres_changes', 
      { 
        event: '*', 
        schema: 'public', 
        table: 'matches',
        filter: `league_id=eq.${leagueId}`
      }, 
      callback
    )
    .on('postgres_changes', 
      { 
        event: '*', 
        schema: 'public', 
        table: 'teams',
        filter: `league_id=eq.${leagueId}`
      }, 
      callback
    )
    .subscribe();
};

export const subscribeToTeamUpdates = (teamId: string, callback: (payload: any) => void) => {
  return supabase
    .channel(`team-${teamId}`)
    .on('postgres_changes', 
      { 
        event: '*', 
        schema: 'public', 
        table: 'teams',
        filter: `id=eq.${teamId}`
      }, 
      callback
    )
    .subscribe();
};
