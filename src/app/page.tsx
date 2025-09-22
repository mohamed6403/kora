'use client';

import type { FC } from 'react';
import { useState, useEffect } from 'react';
import * as db from '@/lib/supabase-db';
import type { League } from '@/types';
import Link from 'next/link';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { ArrowRight, Trophy } from 'lucide-react';

const HomePage: FC = () => {
  const [leagues, setLeagues] = useState<League[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Initial fetch from Supabase
    const fetchLeagues = async () => {
      try {
        const leaguesData = await db.getLeagues();
        setLeagues(leaguesData);
      } catch (error) {
        console.error('Error fetching leagues:', error);
      } finally {
        setLoading(false);
      }
    };
    
    fetchLeagues();
  }, []);

  return (
    <div className="min-h-screen bg-background">
      <main className="container mx-auto px-4 py-8">
        <section className="text-center py-16">
          <Trophy className="mx-auto h-16 w-16 text-primary" />
          <h1 className="mt-4 text-4xl md:text-5xl font-bold tracking-tight text-foreground font-headline">
            Welcome to BOTOLA
          </h1>
          <p className="mt-4 max-w-2xl mx-auto text-lg text-muted-foreground">
            Your ultimate destination for live football league standings and match results.
          </p>
        </section>

        <section>
          <h2 className="text-3xl font-bold tracking-tight text-foreground mb-6 font-headline">
            Available Leagues
          </h2>
          {loading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {[...Array(3)].map((_, i) => (
                <Card key={i}>
                  <CardHeader>
                    <Skeleton className="h-6 w-3/4" />
                  </CardHeader>
                  <CardContent>
                    <Skeleton className="h-4 w-1/2" />
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : leagues.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {leagues.map(league => (
                <Link href={`/leagues/${league.slug}`} key={league.id} className="block group">
                    <Card className="transition-all duration-300 ease-in-out hover:shadow-lg hover:-translate-y-1 border-2 border-transparent hover:border-primary">
                      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-xl font-bold font-headline">{league.name}</CardTitle>
                        <Trophy className="h-6 w-6 text-muted-foreground" />
                      </CardHeader>
                      <CardContent>
                        <div className="flex items-center text-primary font-semibold">
                          View Standings
                          <ArrowRight className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-1" />
                        </div>
                      </CardContent>
                    </Card>
                </Link>
              ))}
            </div>
          ) : (
            <Card>
              <CardContent className="pt-6">
                <p className="text-center text-muted-foreground">No leagues available at the moment. Please check back later.</p>
              </CardContent>
            </Card>
          )}
        </section>
      </main>
      <footer className="text-center py-6 border-t mt-12">
        <p className="text-sm text-muted-foreground">© {new Date().getFullYear()} BOTOLA. All rights reserved.</p>
      </footer>
    </div>
  );
};

export default HomePage;
