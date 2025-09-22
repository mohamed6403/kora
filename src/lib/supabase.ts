import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  realtime: {
    params: {
      eventsPerSecond: 10,
    },
  },
})

// Database types (we'll generate these later)
export type Database = {
  public: {
    Tables: {
      leagues: {
        Row: {
          id: number
          name: string
          slug: string
          sport: string
          country: string
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: number
          name: string
          slug: string
          sport: string
          country: string
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: number
          name?: string
          slug?: string
          sport?: string
          country?: string
          created_at?: string
          updated_at?: string
        }
      }
      teams: {
        Row: {
          id: number
          name: string
          logo_url: string | null
          played: number
          wins: number
          draws: number
          losses: number
          goals_for: number
          goals_against: number
          goal_difference: number
          points: number
          league_id: number
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: number
          name: string
          logo_url?: string | null
          played?: number
          wins?: number
          draws?: number
          losses?: number
          goals_for?: number
          goals_against?: number
          goal_difference?: number
          points?: number
          league_id: number
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: number
          name?: string
          logo_url?: string | null
          played?: number
          wins?: number
          draws?: number
          losses?: number
          goals_for?: number
          goals_against?: number
          goal_difference?: number
          points?: number
          league_id?: number
          created_at?: string
          updated_at?: string
        }
      }
      matches: {
        Row: {
          id: number
          league_id: number
          home_team_id: number
          away_team_id: number
          date_time: string
          home_score: number | null
          away_score: number | null
          status: string
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: number
          league_id: number
          home_team_id: number
          away_team_id: number
          date_time: string
          home_score?: number | null
          away_score?: number | null
          status?: string
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: number
          league_id?: number
          home_team_id?: number
          away_team_id?: number
          date_time?: string
          home_score?: number | null
          away_score?: number | null
          status?: string
          created_at?: string
          updated_at?: string
        }
      }
    }
  }
}
