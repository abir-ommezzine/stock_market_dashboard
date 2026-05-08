import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import { BrowserRouter } from 'react-router-dom'
import { LoginForm3 } from '../login-form-3'
import { AuthProvider } from '@/contexts/auth.context'

// Mock the auth API
vi.mock('@/lib/api/auth.api', () => ({
  login: vi.fn(),
}))

// Mock react-router-dom navigation
const mockNavigate = vi.fn()
vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual('react-router-dom')
  return {
    ...actual,
    useNavigate: () => mockNavigate,
    useLocation: () => ({ state: null }),
  }
})

import { login } from '@/lib/api/auth.api'

describe('LoginForm3', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    localStorage.clear()
  })

  const renderLoginForm = () => {
    return render(
      <BrowserRouter>
        <AuthProvider>
          <LoginForm3 />
        </AuthProvider>
      </BrowserRouter>
    )
  }

  it('should render login form with email and password fields', () => {
    renderLoginForm()

    expect(screen.getByLabelText(/email/i)).toBeInTheDocument()
    expect(screen.getByLabelText(/password/i)).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /login/i })).toBeInTheDocument()
  })

  it('should have default values in form fields', () => {
    renderLoginForm()

    const emailInput = screen.getByLabelText(/email/i) as HTMLInputElement
    const passwordInput = screen.getByLabelText(/password/i) as HTMLInputElement

    expect(emailInput.value).toBe('test@example.com')
    expect(passwordInput.value).toBe('password')
  })

  it('should update email field when user types', () => {
    renderLoginForm()

    const emailInput = screen.getByLabelText(/email/i) as HTMLInputElement
    fireEvent.change(emailInput, { target: { value: 'newemail@example.com' } })

    expect(emailInput.value).toBe('newemail@example.com')
  })

  it('should update password field when user types', () => {
    renderLoginForm()

    const passwordInput = screen.getByLabelText(/password/i) as HTMLInputElement
    fireEvent.change(passwordInput, { target: { value: 'newpassword' } })

    expect(passwordInput.value).toBe('newpassword')
  })

  it('should call login API with correct credentials on submit', async () => {
    const mockLoginResponse = {
      token: 'mock-jwt-token',
      id: 1,
      email: 'test@example.com',
      firstName: 'Test',
      lastName: 'User',
      role: 'USER' as const,
    }
    vi.mocked(login).mockResolvedValue(mockLoginResponse)

    renderLoginForm()

    const emailInput = screen.getByLabelText(/email/i)
    const passwordInput = screen.getByLabelText(/password/i)
    const submitButton = screen.getByRole('button', { name: /login/i })

    fireEvent.change(emailInput, { target: { value: 'user@example.com' } })
    fireEvent.change(passwordInput, { target: { value: 'mypassword' } })
    fireEvent.click(submitButton)

    await waitFor(() => {
      expect(login).toHaveBeenCalledWith({
        email: 'user@example.com',
        password: 'mypassword',
      })
    })
  })

  it('should call login API and navigate on successful login', async () => {
    const mockLoginResponse = {
      token: 'mock-jwt-token',
      id: 1,
      email: 'test@example.com',
      firstName: 'Test',
      lastName: 'User',
      role: 'USER' as const,
    }
    vi.mocked(login).mockResolvedValue(mockLoginResponse)

    renderLoginForm()

    const submitButton = screen.getByRole('button', { name: /login/i })
    fireEvent.click(submitButton)

    // Wait for the login API to be called and navigation to happen
    await waitFor(() => {
      expect(login).toHaveBeenCalled()
      expect(mockNavigate).toHaveBeenCalledWith('/dashboard', { state: undefined })
    })
  })

  it('should display error message when login fails', async () => {
    vi.mocked(login).mockRejectedValue(new Error('Invalid credentials'))

    renderLoginForm()

    const submitButton = screen.getByRole('button', { name: /login/i })
    fireEvent.click(submitButton)

    await waitFor(() => {
      expect(screen.getByText(/invalid credentials/i)).toBeInTheDocument()
    })
  })

  it('should navigate to dashboard on successful login for regular user', async () => {
    const mockLoginResponse = {
      token: 'mock-jwt-token',
      id: 1,
      email: 'test@example.com',
      firstName: 'Test',
      lastName: 'User',
      role: 'USER' as const,
    }
    vi.mocked(login).mockResolvedValue(mockLoginResponse)

    renderLoginForm()

    const submitButton = screen.getByRole('button', { name: /login/i })
    fireEvent.click(submitButton)

    await waitFor(() => {
      expect(mockNavigate).toHaveBeenCalledWith('/dashboard', { state: undefined })
    })
  })

  it('should navigate to admin page on successful login for admin user', async () => {
    const mockLoginResponse = {
      token: 'mock-jwt-token',
      id: 1,
      email: 'admin@example.com',
      firstName: 'Admin',
      lastName: 'User',
      role: 'ADMIN' as const,
    }
    vi.mocked(login).mockResolvedValue(mockLoginResponse)

    renderLoginForm()

    const submitButton = screen.getByRole('button', { name: /login/i })
    fireEvent.click(submitButton)

    await waitFor(() => {
      expect(mockNavigate).toHaveBeenCalledWith('/admin')
    })
  })

  it('should show loading state while submitting', async () => {
    const mockLoginResponse = {
      token: 'mock-jwt-token',
      id: 1,
      email: 'test@example.com',
      firstName: 'Test',
      lastName: 'User',
      role: 'USER' as const,
    }
    
    // Make login take some time
    vi.mocked(login).mockImplementation(() => 
      new Promise(resolve => setTimeout(() => resolve(mockLoginResponse), 100))
    )

    renderLoginForm()

    const submitButton = screen.getByRole('button', { name: /login/i })
    fireEvent.click(submitButton)

    // Should show loading text
    await waitFor(() => {
      expect(screen.getByText(/signing in/i)).toBeInTheDocument()
    })

    // Wait for completion
    await waitFor(() => {
      expect(mockNavigate).toHaveBeenCalled()
    })
  })
})
