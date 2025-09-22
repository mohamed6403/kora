# **App Name**: BOTOLA

## Core Features:

- League Management: Admins can create and manage football leagues, including specifying league name and other details.
- Team Management: Admins can add and edit teams within a league, including team name, logo URL, and initial statistics.
- Match Management: Admins can add matches, set the date and time, choose the home and away teams, and enter results. Support for live, upcoming, and completed matches.
- Automated Standings: Automatically updates standings in real time based on match results using a cloud function tool, following standard football point systems (Win=3, Draw=1, Loss=0), and goal difference.
- Live Standings: Displays the league standings in a table, sorted by points and then goal difference.
- Match Results and Fixtures: Displays past match results and upcoming fixtures for a selected team.
- User Authentication and Roles: Firebase Authentication with email/password to protect admin routes and functions. Custom admin claims to protect the /admin routes and provide write access to Teams and Matches in the backend. Public pages do not require login.

## Style Guidelines:

- Primary color: Saturated blue (#4285F4), evoking trustworthiness and dynamism, suitable for a sports-related app.
- Background color: Light desaturated blue (#E8F0FE) for a clean and professional look.
- Accent color: A vivid shade of blue analogous to the primary, to bring attention to important elements in the user interface like active buttons or interactive data visualizations (#0F9D58).
- Body and headline font: 'Inter', a sans-serif font known for its clean and modern appearance, will be used across the app for both headlines and body text. Its readability ensures a smooth experience for viewing standings, team details, and match results.
- Use flat, modern icons for teams, leagues, and navigation.
- Clean and modern layout with a focus on data presentation. Use of tables for standings and cards for match results.
- Subtle transitions and animations when standings are updated or new match results are loaded.