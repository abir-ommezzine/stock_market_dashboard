import { describe, it, expect, vi, beforeEach } from 'vitest'
import { login, register, verifyEmail } from '../auth.api'

// Mock fetch globally
global.fetch = vi.fn()

describe('Auth API', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  describe('login', () => {
    it('should login with correct credentials', async () => {
      const mockUser = {
        id: 1,
        token: 'mock-token',
        email: 'test@example.com',
        firstName: 'Test',
        lastName: 'User',
        role: 'USER' as const,
      }
      
      vi.mocked(fetch).mockResolvedValueOnce({
        ok: true,
        json: async () => mockUser,
      } as Response)

      const result = await login({ email: 'test@example.com', password: 'password123' })

      expect(fetch).toHaveBeenCalledWith('http://localhost:8083/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: 'test@example.com',
          password: 'password123',
        }),
      })
      expect(result).toEqual(mockUser)
    })

    it('should throw error when login fails', async () => {
      vi.mocked(fetch).mockResolvedValueOnce({
        ok: false,
        json: async () => ({ error: 'Invalid credentials' }),
      } as Response)

      await expect(login({ email: 'test@example.com', password: 'wrong' })).rejects.toThrow('Invalid credentials')
    })

    it('should throw generic error when no error message provided', async () => {
      vi.mocked(fetch).mockResolvedValueOnce({
        ok: false,
        json: async () => ({}),
      } as Response)

      await expect(login({ email: 'test@example.com', password: 'wrong' })).rejects.toThrow('Login failed')
    })
  })

  describe('register', () => {
    it('should register new user with correct data', async () => {
      const mockUser = {
        id: 2,
        email: 'new@example.com',
        firstName: 'John',
        lastName: 'Doe',
        token: 'new-token',
        role: 'USER' as const,
      }
      
      vi.mocked(fetch).mockResolvedValueOnce({
        ok: true,
        json: async () => mockUser,
      } as Response)

      const result = await register({
        firstName: 'John',
        lastName: 'Doe',
        email: 'new@example.com',
        password: 'password123',
        confirmPassword: 'password123',
      })

      expect(fetch).toHaveBeenCalledWith('http://localhost:8083/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          firstName: 'John',
          lastName: 'Doe',
          email: 'new@example.com',
          password: 'password123',
        }),
      })
      expect(result).toEqual(mockUser)
    })

    it('should throw error when registration fails', async () => {
      vi.mocked(fetch).mockResolvedValueOnce({
        ok: false,
        json: async () => ({ error: 'Email already exists' }),
      } as Response)

      await expect(register({
        firstName: 'John',
        lastName: 'Doe',
        email: 'existing@example.com',
        password: 'password123',
        confirmPassword: 'password123',
      })).rejects.toThrow('Email already exists')
    })
  })

  describe('verifyEmail', () => {
    it('should verify email with token', async () => {
      const mockUser = {
        id: 1,
        token: 'jwt-token',
        email: 'test@example.com',
        firstName: 'Test',
        lastName: 'User',
        role: 'USER' as const,
      }
      
      vi.mocked(fetch).mockResolvedValueOnce({
        ok: true,
        json: async () => mockUser,
      } as Response)

      const result = await verifyEmail('verification-token-123')

      expect(fetch).toHaveBeenCalledWith('http://localhost:8083/api/auth/verify-email?token=verification-token-123', {
        method: 'GET',
        headers: { 'Content-Type': 'application/json' },
      })
      expect(result).toEqual(mockUser)
    })

    it('should throw error when verification fails', async () => {
      vi.mocked(fetch).mockResolvedValueOnce({
        ok: false,
        json: async () => ({ error: 'Invalid token' }),
      } as Response)

      await expect(verifyEmail('invalid-token')).rejects.toThrow('Invalid token')
    })
  })
})
