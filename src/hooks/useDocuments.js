import { useQuery, useQueryClient } from '@tanstack/react-query'
import { documentsApi } from '../services/api'

export function useDocuments(params = {}) {
  return useQuery({
    queryKey: ['documents', params],
    queryFn: () => documentsApi.list(params),
    keepPreviousData: true,
  })
}

export function useDocument(id) {
  return useQuery({
    queryKey: ['document', id],
    queryFn: () => documentsApi.getById(id),
    enabled: !!id,
  })
}

export function useDocumentSearch(query, options = {}) {
  return useQuery({
    queryKey: ['documents', 'search', query],
    queryFn: () => documentsApi.search(query),
    enabled: query?.length >= 2,
    ...options,
  })
}

export function useRecentDocuments(days = 7, limit = 50) {
  return useQuery({
    queryKey: ['documents', 'recent', days, limit],
    queryFn: () => documentsApi.getRecent(days, limit),
  })
}

export function useDocumentLogs(documentId) {
  return useQuery({
    queryKey: ['document', documentId, 'logs'],
    queryFn: () => documentsApi.getLogs(documentId),
    enabled: !!documentId,
  })
}

export function useClientDocuments(clientName, clientType = 'shipper', limit = 100) {
  return useQuery({
    queryKey: ['documents', 'client', clientName, clientType],
    queryFn: () => documentsApi.getByClient(clientName, clientType, limit),
    enabled: !!clientName,
  })
}

