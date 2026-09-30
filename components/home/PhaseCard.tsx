import { ArrivedCard } from './ArrivedCard';
import { CountdownCard } from './CountdownCard';
import { FlightProgressCard } from './FlightProgressCard';
import { PlanningCard } from './PlanningCard';
import { TripActiveCard } from './TripActiveCard';
import { formatDatePHT, formatTimePHT } from '@/lib/utils';
import type { Flight, Trip } from '@/lib/types';

export type TripPhase = 'planning' | 'upcoming' | 'inflight' | 'arrived' | 'active';

export interface CountdownState {
  status: 'upcoming' | 'active' | 'completed';
  dayNumber?: number;
  totalDays: number;
}

interface PhaseCardProps {
  phase: TripPhase;
  trip: Trip;
  flights: Flight[];
  countdown: CountdownState;
  totalSpent: number;
  todaySpent: number;
  todayCount: number;
  onBoard: () => void;
  onLanded: () => void;
  onStart: () => void;
}

export function PhaseCard({
  phase,
  trip,
  flights,
  countdown,
  totalSpent,
  todaySpent,
  todayCount,
  onBoard,
  onLanded,
  onStart,
}: PhaseCardProps) {
  if (phase === 'inflight') {
    const outbound = flights.find((f) => f.direction === 'Outbound');
    return (
      <FlightProgressCard
        onLanded={onLanded}
        fromCode={outbound?.from}
        fromCity={outbound?.from === 'MNL' ? 'Manila' : outbound?.from}
        toCode={outbound?.to}
        toCity={outbound?.to === 'MPH' ? 'Caticlan' : outbound?.to}
        etaLabel={outbound?.arriveTime ? formatTimePHT(outbound.arriveTime) : undefined}
        departIso={outbound?.departTime}
        arriveIso={outbound?.arriveTime}
      />
    );
  }

  if (phase === 'arrived') {
    return (
      <ArrivedCard
        destination={trip.destination}
        hotelName={trip.accommodation}
        onStart={onStart}
      />
    );
  }

  if (phase === 'active') {
    return (
      <TripActiveCard
        trip={trip}
        dayOfTrip={
          countdown.status === 'active'
            ? countdown.dayNumber ?? 1
            : 1
        }
        totalDays={countdown.totalDays}
        daysLeft={
          countdown.totalDays -
          (countdown.status === 'active'
            ? countdown.dayNumber ?? 1
            : 0)
        }
        budgetStatus={(() => {
          const b = trip.budgetLimit ?? 0;
          if (b <= 0) return 'cruising';
          const pctSpent = totalSpent / b;
          const pctTime = (countdown.status === 'active' ? (countdown.dayNumber ?? 1) : 1) / countdown.totalDays;
          if (pctSpent > 1) return 'over';
          if (pctSpent > pctTime * 1.15) return 'low';
          return 'cruising';
        })()}
        spent={totalSpent}
        budget={trip.budgetLimit ?? 0}
        todaySpent={todaySpent}
        todayCount={todayCount}
      />
    );
  }

  if (phase === 'planning') {
    return (
      <PlanningCard
        destination={trip.destination}
        startDate={trip.startDate}
        endDate={trip.endDate}
      />
    );
  }

  return (
    <CountdownCard
      tripStartISO={
        flights.find((f) => f.direction === 'Outbound')?.departTime ??
        trip.startDate
      }
      status={'upcoming'}
      dayNumber={undefined}
      totalDays={countdown.totalDays}
      dateLabel={
        flights.find((f) => f.direction === 'Outbound')?.departTime
          ? formatDatePHT(
              flights.find((f) => f.direction === 'Outbound')!
                .departTime,
            )
          : formatDatePHT(trip.startDate)
      }
      onBoard={onBoard}
    />
  );
}
