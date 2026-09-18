import { render, screen, waitFor, fireEvent } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import { useAuthStore } from '../../store';
import ConfirmEmail from './ConfirmEmail';
import { supabase } from '../../services/api';

// Mock Supabase
vi.mock('../../services/api', () => ({
  supabase: {
    auth: {
      verifyOtp: vi.fn(),
      resend: vi.fn(),
    },
  },
})
);

// Mock react-router-dom
vi.mock('react-router-dom', () => ({
  useNavigate: () => vi.fn(),
  useSearchParams: () => [new URLSearchParams(), vi.fn()],
  useLocation: () => ({ state: null }),
  NavLink: ({ children, to, className, onClick }) => (
    <a href={to} className={className} onClick={onClick}>{children}</a>
  ),
  Navigate: ({ to, replace }) => <div data-testid="navigate" data-to={to} />,
  Outlet: () => <div data-testid="outlet" />,
  BrowserRouter: ({ children }) => <div>{children}</div>,
}));

const renderWithRouter = (component) => {
  return render(
    <BrowserRouter>
      {component}
    </BrowserRouter>
  );
};

describe('ConfirmEmail Page', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('shows verifying state initially', () => {
    renderWithRouter(<ConfirmEmail />);
    expect(screen.getByText('Verifying your email...')).toBeInTheDocument();
  });

  it('shows success message when verification succeeds', async () => {
    const { supabase } = await import('../../services/api');
    supabase.auth.verifyOtp.mockResolvedValueOnce({
      data: { user: { id: '1', email: 'test@example.com' } },
      error: null,
    });

    renderWithRouter(<ConfirmEmail />);
    
    await waitFor(() => {
      expect(screen.getByText('Email Confirmed!')).toBeInTheDocument();
    });
  });

  it('shows error when token is invalid', async () => {
    const { supabase } = await import('../../services/api');
    supabase.auth.verifyOtp.mockResolvedValueOnce({
      data: { user: null },
      error: { message: 'Invalid token' },
    });

    renderWithRouter(<ConfirmEmail />);

    await waitFor(() => {
      expect(screen.getByText('Verification Failed')).toBeInTheDocument();
    });
  });

  it('shows expired message when token is expired', async () => {
    const { supabase } = await import('../../services/api');
    supabase.auth.verifyOtp.mockResolvedValueOnce({
      data: { user: null },
      error: { message: 'Token expired' },
    });

    renderWithRouter(<ConfirmEmail />);

    await waitFor(() => {
      expect(screen.getByText('Link Expired')).toBeInTheDocument();
    });
  });

  it('can resend confirmation email', async () => {
    const { supabase } = await import('../../services/api');
    supabase.auth.resend.mockResolvedValueOnce({ error: null });

    renderWithRouter(<ConfirmEmail />);
    
    // Set status to expired to show resend button
    // We need to trigger the expired state
    supabase.auth.verifyOtp.mockResolvedValueOnce({
      data: { user: null },
      error: { message: 'Token expired' },
    });

    renderWithRouter(<ConfirmEmail />);

    await waitFor(() => {
      expect(screen.getByText('Link Expired')).toBeInTheDocument();
    });

    fireEvent.click(screen.getByText('Resend Confirmation Email'));

    await waitFor(() => {
      expect(supabase.auth.resend).toHaveBeenCalledWith({
        type: 'signup',
        email: '',
      });
    });
  });
});