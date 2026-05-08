import { describe, it, expect, vi, beforeEach } from 'vitest'
import { runPrediction } from '../prediction.api'
import type { PredictionParams } from '../prediction.api'

// Mock fetch globally
global.fetch = vi.fn()

// Mock localStorage for auth token
const mockToken = 'mock-jwt-token'
beforeEach(() => {
  localStorage.setItem('auth_token', mockToken)
})

describe('Prediction API', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  describe('runPrediction', () => {
    it('should call API with correct prediction parameters', async () => {
      const mockResponse = {
        predictions: [
          { date: '2026-05-09', value: 150.5, type: 'future' },
          { date: '2026-05-10', value: 151.2, type: 'future' },
        ],
        metrics: {
          aic: 100.5,
          bic: 105.2,
          mse: 2.5,
          rmse: 1.58,
          mae: 1.2,
          mape: 0.8,
        },
        optimal_params: { p: 1, d: 1, q: 1 },
        residuals: {},
      }
      
      vi.mocked(fetch).mockResolvedValueOnce({
        ok: true,
        json: async () => mockResponse,
      } as Response)

      const params: PredictionParams = {
        datasetId: 1,
        model_type: 'ARIMA',
        symbol: 'AAPL',
        p: 1,
        d: 1,
        q: 1,
        steps: 10,
      }

      const result = await runPrediction(params)

      expect(fetch).toHaveBeenCalled()
      const callArgs = vi.mocked(fetch).mock.calls[0]
      expect(callArgs[0]).toContain('/api/ml/train-from-dataset')
      expect(result.predictions).toHaveLength(2)
      expect(result.metrics?.mse).toBe(2.5)
    })

    it('should throw error with message when prediction fails', async () => {
      vi.mocked(fetch).mockResolvedValueOnce({
        ok: false,
        json: async () => ({ detail: 'No data available' }),
      } as Response)

      const params: PredictionParams = {
        datasetId: 999,
        model_type: 'ARIMA',
      }

      await expect(runPrediction(params)).rejects.toThrow('No data available')
    })

    it('should handle prediction without optional parameters', async () => {
      const mockResponse = {
        predictions: [],
        metrics: null,
        optimal_params: null,
        residuals: null,
      }
      
      vi.mocked(fetch).mockResolvedValueOnce({
        ok: true,
        json: async () => mockResponse,
      } as Response)

      const params: PredictionParams = {
        datasetId: 1,
        model_type: 'ARMA',
      }

      const result = await runPrediction(params)

      expect(fetch).toHaveBeenCalled()
      expect(result.predictions).toEqual([])
    })

    it('should send request with JSON content type', async () => {
      const mockResponse = {
        predictions: [],
        metrics: null,
        optimal_params: null,
        residuals: null,
      }
      
      vi.mocked(fetch).mockResolvedValueOnce({
        ok: true,
        json: async () => mockResponse,
      } as Response)

      const params: PredictionParams = {
        datasetId: 1,
        model_type: 'ARIMA',
      }

      await runPrediction(params)

      const callArgs = vi.mocked(fetch).mock.calls[0]
      const options = callArgs[1] as RequestInit
      expect(options.headers).toMatchObject({
        'Content-Type': 'application/json',
      })
    })
  })
})
