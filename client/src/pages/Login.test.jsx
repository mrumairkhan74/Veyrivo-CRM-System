import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import Login from './Login';

// ---------- hoisted mocks ----------
const {
  mockLogin,
  mockLoginWithGoogle,
  mockInitialize,
  mockNavigate,
} = vi.hoisted(() => ({
  mockLogin: vi.fn(),
  mockLoginWithGoogle: vi.fn(),
  mockInitialize: vi.fn(),
  mockNavigate: vi.fn(),
}));

// The component imports useAuth from '../store/hooks', not '../store'.
vi.mock('../store/hooks', () => ({
  useAuth: () => ({
    login: mockLogin,
    loginWithGoogle: mockLoginWithGoogle,
    initialize: mockInitialize,
  }),
}));

// Partial mock — keep BrowserRouter, override useNavigate so we can assert on it.
vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual('react-router-dom');
  return {
    ...actual,
    useNavigate: () => mockNavigate,
  };
});

const renderWithRouter = (component) =>
  render(<BrowserRouter>{component}</BrowserRouter>);

beforeEach(() => {
  mockLogin.mockReset().mockResolvedValue({});
  mockLoginWithGoogle.mockReset().mockResolvedValue({});
  mockInitialize.mockReset();
  mockNavigate.mockReset();
});

// =====================================================================
describe('Login Page', () => {
  // ---------- rendering ----------
  it('renders the login form correctly', () => {
    renderWithRouter(<Login />);
    expect(screen.getByText('Welcome Back')).toBeInTheDocument();
    expect(screen.getByLabelText('Email Address')).toBeInTheDocument();
    expect(screen.getByLabelText('Password')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /^login$/i })).toBeInTheDocument();
  });

  it('toggles password visibility when the eye button is clicked', () => {
    renderWithRouter(<Login />);
    const password = screen.getByLabelText('Password');
    expect(password).toHaveAttribute('type', 'password');

    // The eye toggle has no accessible name — grab it by its surrounding container.
    const toggle = password.parentElement.querySelector('button');
    fireEvent.click(toggle);
    expect(password).toHaveAttribute('type', 'text');

    fireEvent.click(toggle);
    expect(password).toHaveAttribute('type', 'password');
  });

  // ---------- email/password flow ----------
  it('calls login with the entered credentials and navigates to the dashboard', async () => {
    renderWithRouter(<Login />);

    fireEvent.change(screen.getByLabelText('Email Address'), {
      target: { value: 'test@example.com' },
    });
    fireEvent.change(screen.getByLabelText('Password'), {
      target: { value: 'password123' },
    });
    fireEvent.click(screen.getByRole('button', { name: /^login$/i }));

    await waitFor(() => {
      expect(mockLogin).toHaveBeenCalledWith('test@example.com', 'password123');
      expect(mockNavigate).toHaveBeenCalledWith('/admin/dashboard');
    });
  });

  it('shows the error message when login fails', async () => {
    mockLogin.mockRejectedValueOnce(new Error('Invalid credentials'));

    renderWithRouter(<Login />);
    fireEvent.change(screen.getByLabelText('Email Address'), {
      target: { value: 'test@example.com' },
    });
    fireEvent.change(screen.getByLabelText('Password'), {
      target: { value: 'wrong' },
    });
    fireEvent.click(screen.getByRole('button', { name: /^login$/i }));

    await waitFor(() => {
      expect(screen.getByText('Invalid credentials')).toBeInTheDocument();
    });
    expect(mockNavigate).not.toHaveBeenCalled();
  });

  it('falls back to a generic message when the error has no message', async () => {
    mockLogin.mockRejectedValueOnce({});

    renderWithRouter(<Login />);
    fireEvent.change(screen.getByLabelText('Email Address'), {
      target: { value: 'test@example.com' },
    });
    fireEvent.change(screen.getByLabelText('Password'), {
      target: { value: 'wrong' },
    });
    fireEvent.click(screen.getByRole('button', { name: /^login$/i }));

    await waitFor(() => {
      expect(
        screen.getByText(/login failed\. please check your credentials/i)
      ).toBeInTheDocument();
    });
  });

  // ---------- Google flow ----------
  it('renders the Google login button', () => {
    renderWithRouter(<Login />);
    expect(
      screen.getByRole('button', { name: /continue with google/i })
    ).toBeInTheDocument();
  });

  it('calls loginWithGoogle when the Google button is clicked', async () => {
    renderWithRouter(<Login />);
    fireEvent.click(screen.getByRole('button', { name: /continue with google/i }));

    await waitFor(() => {
      expect(mockLoginWithGoogle).toHaveBeenCalledTimes(1);
    });
    // The email/password action must NOT fire — the two flows are independent.
    expect(mockLogin).not.toHaveBeenCalled();
    // The component intentionally does NOT navigate — Supabase handles the redirect.
    expect(mockNavigate).not.toHaveBeenCalled();
  });

  it('shows the error message when Google login fails', async () => {
    mockLoginWithGoogle.mockRejectedValueOnce(
      new Error('OAuth provider unavailable')
    );

    renderWithRouter(<Login />);
    fireEvent.click(screen.getByRole('button', { name: /continue with google/i }));

    await waitFor(() => {
      expect(screen.getByText('OAuth provider unavailable')).toBeInTheDocument();
    });
  });

  it('falls back to a generic message when Google login fails with no message', async () => {
    mockLoginWithGoogle.mockRejectedValueOnce({});

    renderWithRouter(<Login />);
    fireEvent.click(screen.getByRole('button', { name: /continue with google/i }));

    await waitFor(() => {
      expect(
        screen.getByText(/google login failed\. please try again/i)
      ).toBeInTheDocument();
    });
  });
});