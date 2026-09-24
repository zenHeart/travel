import { useMemo } from 'react';
import { scanTrips } from '../utils/tripScanner';

export function useTrips() {
  const trips = useMemo(scanTrips, []);
  return {
    trips,
    getTripById: (id: string) => trips.find(trip => trip.id === id),
  };
}
