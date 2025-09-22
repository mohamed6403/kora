# Frontend to API Migration Guide

This guide explains how to update your frontend fetch calls to use the new API routes instead of localStorage.

## Setting up Environment Variables

1. Create a `.env.local` file in your project root with your Neon database connection string:
   ```
   DATABASE_URL=postgresql://username:password@host:port/database?sslmode=require
   ```

2. Add the `pg` package to your dependencies:
   ```
   npm install pg
   ```

## Fetch Call Examples

### Leagues

#### Get all leagues (replaces localStorage.getItem)
```javascript
// Before
const leagues = JSON.parse(localStorage.getItem('leagues')) || [];

// After
try {
  const response = await fetch('/api/leagues');
  if (!response.ok) {
    throw new Error('Failed to fetch leagues');
  }
  const leagues = await response.json();
  // Use leagues data
} catch (error) {
  console.error('Error fetching leagues:', error);
}
```

#### Create a new league (replaces localStorage.setItem)
```javascript
// Before
const newLeague = { id: Date.now(), name, description };
const leagues = [...JSON.parse(localStorage.getItem('leagues') || '[]'), newLeague];
localStorage.setItem('leagues', JSON.stringify(leagues));

// After
try {
  const response = await fetch('/api/leagues', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ name, description }),
  });

  if (!response.ok) {
    throw new Error('Failed to create league');
  }

  const createdLeague = await response.json();
  // Use createdLeague data
} catch (error) {
  console.error('Error creating league:', error);
}
```

### Teams

#### Get all teams for a league (replaces localStorage.getItem)
```javascript
// Before
const teams = JSON.parse(localStorage.getItem(`teams-${leagueId}`)) || [];

// After
try {
  const response = await fetch(`/api/teams?leagueId=${leagueId}`);
  if (!response.ok) {
    throw new Error('Failed to fetch teams');
  }
  const teams = await response.json();
  // Use teams data
} catch (error) {
  console.error('Error fetching teams:', error);
}
```

#### Create a new team (replaces localStorage.setItem)
```javascript
// Before
const newTeam = { id: Date.now(), name, leagueId };
const teams = [...JSON.parse(localStorage.getItem(`teams-${leagueId}`) || '[]'), newTeam];
localStorage.setItem(`teams-${leagueId}`, JSON.stringify(teams));

// After
try {
  const response = await fetch('/api/teams', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ name, leagueId }),
  });

  if (!response.ok) {
    throw new Error('Failed to create team');
  }

  const createdTeam = await response.json();
  // Use createdTeam data
} catch (error) {
  console.error('Error creating team:', error);
}
```

### Matches

#### Get matches for a league (replaces localStorage.getItem)
```javascript
// Before
const matches = JSON.parse(localStorage.getItem(`matches-${leagueId}`)) || [];

// After
try {
  const response = await fetch(`/api/matches?leagueId=${leagueId}`);
  if (!response.ok) {
    throw new Error('Failed to fetch matches');
  }
  const matches = await response.json();
  // Use matches data
} catch (error) {
  console.error('Error fetching matches:', error);
}
```

#### Create a new match (replaces localStorage.setItem)
```javascript
// Before
const newMatch = { id: Date.now(), homeTeamId, awayTeamId, leagueId, matchDate, homeScore: 0, awayScore: 0 };
const matches = [...JSON.parse(localStorage.getItem(`matches-${leagueId}`) || '[]'), newMatch];
localStorage.setItem(`matches-${leagueId}`, JSON.stringify(matches));

// After
try {
  const response = await fetch('/api/matches', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ homeTeamId, awayTeamId, leagueId, matchDate }),
  });

  if (!response.ok) {
    throw new Error('Failed to create match');
  }

  const createdMatch = await response.json();
  // Use createdMatch data
} catch (error) {
  console.error('Error creating match:', error);
}
```

#### Update match scores (replaces localStorage.setItem)
```javascript
// Before
const matches = JSON.parse(localStorage.getItem(`matches-${leagueId}`)) || [];
const updatedMatches = matches.map(match => 
  match.id === id ? { ...match, homeScore, awayScore } : match
);
localStorage.setItem(`matches-${leagueId}`, JSON.stringify(updatedMatches));

// After
try {
  const response = await fetch('/api/matches', {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ id, homeScore, awayScore }),
  });

  if (!response.ok) {
    throw new Error('Failed to update match');
  }

  const updatedMatch = await response.json();
  // Use updatedMatch data
} catch (error) {
  console.error('Error updating match:', error);
}
```

### Authentication

#### Login (replaces localStorage.setItem for auth)
```javascript
// Before
const admins = JSON.parse(localStorage.getItem('admins')) || [];
const admin = admins.find(a => a.email === email && a.password === password);
if (admin) {
  localStorage.setItem('currentUser', JSON.stringify(admin));
}

// After
try {
  const response = await fetch('/api/login', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ email, password }),
  });

  if (!response.ok) {
    throw new Error('Login failed');
  }

  const admin = await response.json();
  // Store admin in state management (e.g., Context, Redux, or state)
  // localStorage.setItem('currentUser', JSON.stringify(admin)); // Optional if you still want to use localStorage for client-side persistence
} catch (error) {
  console.error('Login error:', error);
}
```

## Error Handling

All API endpoints include error handling and return appropriate HTTP status codes:

- 200: Success
- 201: Created (for POST requests)
- 400: Bad Request (missing required fields)
- 401: Unauthorized (for failed login)
- 404: Not Found (when a resource doesn't exist)
- 405: Method Not Allowed
- 500: Internal Server Error

Make sure to handle these status codes appropriately in your frontend code.
