import { useQuery } from '@tanstack/react-query'
import { statisticsApi } from '../services/api'

export function useDashboardStats() {
  return useQuery({
    queryKey: ['statistics', 'dashboard'],
    queryFn: () => statisticsApi.getDashboard(),
    staleTime: 1000 * 60 * 2, // 2 minutes
  })
}

export function useMonthlyVolume(startDate, endDate) {
  return useQuery({
    queryKey: ['statistics', 'monthly-volume', startDate, endDate],
    queryFn: () => statisticsApi.getMonthlyVolume(startDate, endDate),
  })
}

export function useTopClients(limit = 10) {
  return useQuery({
    queryKey: ['statistics', 'top-clients', limit],
    queryFn: () => statisticsApi.getTopClients(limit),
  })
}

export function useDestinationStats(limit = 10) {
  return useQuery({
    queryKey: ['statistics', 'destinations', limit],
    queryFn: () => statisticsApi.getDestinations(limit),
  })
}

export function useStatsSummary() {
  return useQuery({
    queryKey: ['statistics', 'summary'],
    queryFn: () => statisticsApi.getSummary(),
    staleTime: 1000 * 60 * 2,
  })
}

export function useTrends(days = 30) {
  return useQuery({
    queryKey: ['statistics', 'trends', days],
    queryFn: () => statisticsApi.getTrends(days),
  })
}

export function useRoutes(limit = 20) {
  return useQuery({
    queryKey: ['statistics', 'routes', limit],
    queryFn: () => statisticsApi.getRoutes(limit),
  })
}

export function useAirlines(limit = 10) {
  return useQuery({
    queryKey: ['statistics', 'airlines', limit],
    queryFn: () => statisticsApi.getAirlines(limit),
  })
}

