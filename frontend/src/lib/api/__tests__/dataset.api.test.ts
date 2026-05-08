import { describe, it, expect, vi, beforeEach } from 'vitest'
import { getSources, createPredefinedDataset } from '../dataset.api'

// Mock fetch globally
global.fetch = vi.fn()

describe('Dataset API', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  describe('getSources', () => {
    it('should fetch available data sources', async () => {
      const mockSources = [
        { name: 'Alpha Vantage', type: 'API' },
        { name: 'Yahoo Finance', type: 'API' },
      ]
      
      vi.mocked(fetch).mockResolvedValueOnce({
        ok: true,
        json: async () => mockSources,
      } as Response)

      const result = await getSources()

      expect(fetch).toHaveBeenCalledWith('http://localhost:8083/api/datasets/sources')
      expect(result).toEqual(mockSources)
    })

    it('should throw error when fetch fails', async () => {
      vi.mocked(fetch).mockResolvedValueOnce({
        ok: false,
        status: 500,
      } as Response)

      await expect(getSources()).rejects.toThrow('HTTP error! status: 500')
    })
  })

  describe('createPredefinedDataset', () => {
    it('should create dataset without API key', async () => {
      const mockDataset = { id: 1, sourceName: 'Alpha Vantage' }
      
      vi.mocked(fetch).mockResolvedValueOnce({
        ok: true,
        json: async () => mockDataset,
      } as Response)

      const result = await createPredefinedDataset('Alpha Vantage', 1)

      expect(fetch).toHaveBeenCalled()
      const callArgs = vi.mocked(fetch).mock.calls[0]
      expect(callArgs[0]).toContain('/api/datasets/link-source')
      expect(callArgs[0]).toContain('sourceName=Alpha+Vantage')
      expect(callArgs[0]).toContain('userId=1')
      expect(result).toEqual(mockDataset)
    })

    it('should create dataset with API key', async () => {
      const mockDataset = { id: 2, sourceName: 'Alpha Vantage' }
      
      vi.mocked(fetch).mockResolvedValueOnce({
        ok: true,
        json: async () => mockDataset,
      } as Response)

      await createPredefinedDataset('Alpha Vantage', 1, 'test-api-key')

      const callArgs = vi.mocked(fetch).mock.calls[0]
      expect(callArgs[0]).toContain('apiKey=test-api-key')
    })

    it('should throw error when creation fails', async () => {
      vi.mocked(fetch).mockResolvedValueOnce({
        ok: false,
      } as Response)

      await expect(createPredefinedDataset('Alpha Vantage', 1)).rejects.toThrow('Failed to create dataset')
    })
  })
})
