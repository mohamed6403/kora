import type { FC } from 'react';
import type { Match } from '@/types';
import { Card, CardContent } from '@/components/ui/card';
import { format } from 'date-fns';
import Image from 'next/image';

interface MatchCardProps {
  match: Match;
}

const MatchCard: FC<MatchCardProps> = ({ match }) => {
  const matchDate = match.dateTime;

  return (
    <Card className="w-full">
      <CardContent className="p-4 flex items-center justify-between">
        <div className="flex items-center gap-3 text-right justify-end w-2/5">
          <span className="font-medium text-sm md:text-base">{match.homeTeamName}</span>
           <Image
              src={match.homeTeamLogo || `https://picsum.photos/seed/${match.homeTeamId}/40`}
              alt={match.homeTeamName || 'Home Team'}
              width={40}
              height={40}
              className="rounded-full object-cover"
              data-ai-hint="team logo"
            />
        </div>

        <div className="text-center w-1/5">
          {match.status === 'finished' ? (
            <div className="text-2xl font-bold">
              <span>{match.homeGoals}</span> - <span>{match.awayGoals}</span>
            </div>
          ) : (
            <div className="text-xs md:text-sm text-muted-foreground">
              <div>{format(matchDate, 'dd MMM')}</div>
              <div>{format(matchDate, 'HH:mm')}</div>
            </div>
          )}
        </div>

        <div className="flex items-center gap-3 w-2/5">
           <Image
              src={match.awayTeamLogo || `https://picsum.photos/seed/${match.awayTeamId}/40`}
              alt={match.awayTeamName || 'Away Team'}
              width={40}
              height={40}
              className="rounded-full object-cover"
              data-ai-hint="team logo"
            />
          <span className="font-medium text-sm md:text-base">{match.awayTeamName}</span>
        </div>
      </CardContent>
    </Card>
  );
};

export default MatchCard;
