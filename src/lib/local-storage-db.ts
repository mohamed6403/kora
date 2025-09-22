// @ts-nocheck
'use client';

/**
 * This module acts as a mock database using the browser's localStorage.
 * It simulates the structure and functionality of a real database for local development.
 */
import type { League, Team, Match } from '@/types';

const DB_KEY = 'botola_db';

// Helper to generate unique IDs
const generateId = () => Math.random().toString(36).substr(2, 9);

// Structure for our local database
interface LocalDB {
  leagues: League[];
  teams: Team[];
  matches: Match[];
}

// --- Seeding Initial Data ---
const seedData: LocalDB = {
  leagues: [
    {
      id: 'league1',
      name: 'Local Premier League',
      slug: 'local-premier-league',
      sport: 'Football',
      country: 'Local',
      createdAt: new Date(),
    },
  ],
  teams: [
    { id: 'team1', name: 'FC Code', logoURL: 'https://picsum.photos/seed/team1/200', played: 0, wins: 0, draws: 0, losses: 0, goalsFor: 0, goalsAgainst: 0, goalDifference: 0, points: 0, updatedAt: new Date(), leagueId: 'league1' },
    { id: 'team2', name: 'Syntax Strikers', logoURL: 'https://picsum.photos/seed/team2/200', played: 0, wins: 0, draws: 0, losses: 0, goalsFor: 0, goalsAgainst: 0, goalDifference: 0, points: 0, updatedAt: new Date(), leagueId: 'league1' },
    { id: 'team3', name: 'Redux Rovers', logoURL: 'https://picsum.photos/seed/team3/200', played: 0, wins: 0, draws: 0, losses: 0, goalsFor: 0, goalsAgainst: 0, goalDifference: 0, points: 0, updatedAt: new Date(), leagueId: 'league1' },
    { id: 'team4', name: 'API Athletic', logoURL: 'https://picsum.photos/seed/team4/200', played: 0, wins: 0, draws: 0, losses: 0, goalsFor: 0, goalsAgainst: 0, goalDifference: 0, points: 0, updatedAt: new Date(), leagueId: 'league1' },
  ],
  matches: [
      // Initially no matches
  ],
};


// --- Core Database Functions ---

/**
 * Retrieves the entire database from localStorage.
 * If no database exists, it seeds it with initial data.
 */
const getDB = (): LocalDB => {
  if (typeof window === 'undefined') {
    return { leagues: [], teams: [], matches: [] };
  }
  let db = localStorage.getItem(DB_KEY);
  if (!db) {
    localStorage.setItem(DB_KEY, JSON.stringify(seedData));
    db = JSON.stringify(seedData);
  }
  // Parse dates which are stored as strings in JSON
  const parsedDb = JSON.parse(db);
  return {
    leagues: parsedDb.leagues.map(l => ({ ...l, createdAt: new Date(l.createdAt) })),
    teams: parsedDb.teams.map(t => ({ ...t, updatedAt: new Date(t.updatedAt) })),
    matches: parsedDb.matches.map(m => ({ ...m, dateTime: new Date(m.dateTime), createdAt: new Date(m.createdAt), updatedAt: new Date(m.updatedAt) })),
  };
};

/**
 * Saves the entire database object to localStorage.
 */
const saveDB = (db: LocalDB) => {
  if (typeof window === 'undefined') return;
  localStorage.setItem(DB_KEY, JSON.stringify(db));
  // Dispatch a storage event to notify other tabs/windows of the change.
  window.dispatchEvent(new Event('storage'));
};


// --- Public API for Data Operations ---

// League Operations
export const getLeagues = () => getDB().leagues.sort((a,b) => b.createdAt.getTime() - a.createdAt.getTime());
export const getLeagueBySlug = (slug: string) => getDB().leagues.find(l => l.slug === slug);
export const addLeague = (league: Omit<League, 'id' | 'createdAt'>) => {
  const db = getDB();
  const newLeague: League = {
    ...league,
    id: generateId(),
    createdAt: new Date(),
  };
  db.leagues.push(newLeague);
  saveDB(db);
  return newLeague;
};

// Team Operations
export const getTeamsByLeagueId = (leagueId: string) => {
    return getDB().teams.filter(t => t.leagueId === leagueId).sort((a, b) => a.name.localeCompare(b.name));
};
export const getTeamById = (teamId: string) => getDB().teams.find(t => t.id === teamId);
export const addTeamToLeague = (leagueId: string, team: Omit<Team, 'id' | 'updatedAt' | 'leagueId' | 'played' | 'wins' | 'draws' | 'losses' | 'goalsFor' | 'goalsAgainst' | 'goalDifference' | 'points'>) => {
    const db = getDB();
    const newTeam: Team = {
        ...team,
        id: generateId(),
        leagueId: leagueId,
        played: 0, wins: 0, draws: 0, losses: 0, goalsFor: 0, goalsAgainst: 0, goalDifference: 0, points: 0,
        updatedAt: new Date(),
    };
    db.teams.push(newTeam);
    saveDB(db);
    return newTeam;
}
export const updateTeamInLeague = (teamId: string, teamUpdate: Partial<Team>) => {
    const db = getDB();
    const teamIndex = db.teams.findIndex(t => t.id === teamId);
    if (teamIndex > -1) {
        db.teams[teamIndex] = { ...db.teams[teamIndex], ...teamUpdate, updatedAt: new Date() };
        saveDB(db);
        return db.teams[teamIndex];
    }
    return null;
}
export const deleteTeamFromLeague = (teamId: string) => {
    let db = getDB();
    db.teams = db.teams.filter(t => t.id !== teamId);
    // Also delete matches associated with this team
    db.matches = db.matches.filter(m => m.homeTeamId !== teamId && m.awayTeamId !== teamId);
    saveDB(db);
}

// Match Operations
export const getMatchesByLeagueId = (leagueId: string) => {
    const db = getDB();
    const teamIdsInLeague = db.teams.filter(t => t.leagueId === leagueId).map(t => t.id);
    return db.matches
        .filter(m => teamIdsInLeague.includes(m.homeTeamId))
        .sort((a,b) => b.dateTime.getTime() - a.dateTime.getTime());
}
export const addMatchToLeague = (leagueId: string, match: Omit<Match, 'id' | 'createdAt' | 'updatedAt' >) => {
    const db = getDB();
    const newMatch: Match = {
        ...match,
        id: generateId(),
        createdAt: new Date(),
        updatedAt: new Date(),
    };
    db.matches.push(newMatch);
    saveDB(db);
    return newMatch;
}
export const updateMatchInLeague = (matchId: string, matchUpdate: Partial<Match>) => {
    const db = getDB();
    const matchIndex = db.matches.findIndex(m => m.id === matchId);
    if (matchIndex > -1) {
        db.matches[matchIndex] = { ...db.matches[matchIndex], ...matchUpdate, updatedAt: new Date() };
        saveDB(db);
        return db.matches[matchIndex];
    }
    return null;
}
export const deleteMatchFromLeague = (matchId: string) => {
    let db = getDB();
    db.matches = db.matches.filter(m => m.id !== matchId);
    saveDB(db);
}
