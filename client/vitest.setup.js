// Vitest setup file
import { vi } from 'vitest';

// Mock Supabase
vi.mock('@supabase/supabase-js', () => ({
  createClient: vi.fn(() => ({
    auth: {
      signUp: vi.fn(),
      signInWithPassword: vi.fn(),
      signInWithOAuth: vi.fn(),
      signOut: vi.fn(),
      getSession: vi.fn(),
      getUser: vi.fn(),
      updateUser: vi.fn(),
      onAuthStateChange: vi.fn(),
      admin: {
        createUser: vi.fn(),
        deleteUser: vi.fn(),
        getUserById: vi.fn(),
        inviteUserByEmail: vi.fn(),
      },
    },
    from: vi.fn(() => ({
      select: vi.fn().mockReturnThis(),
      insert: vi.fn().mockReturnThis(),
      update: vi.fn().mockReturnThis(),
      delete: vi.fn().mockReturnThis(),
      eq: vi.fn().mockReturnThis(),
      or: vi.fn().mockReturnThis(),
      order: vi.fn().mockReturnThis(),
      range: vi.fn().mockReturnThis(),
      single: vi.fn(),
      is: vi.fn().mockReturnThis(),
    })),
    storage: {
      from: vi.fn(() => ({
        upload: vi.fn(),
        getPublicUrl: vi.fn(),
      })),
    },
  })),
}));

// Mock react-router-dom
vi.mock('react-router-dom', () => ({
  useNavigate: vi.fn(() => vi.fn()),
  useSearchParams: vi.fn(() => [new URLSearchParams(), vi.fn()]),
  useLocation: vi.fn(() => ({ state: null })),
  NavLink: ({ children, to, className, onClick }) => (
    <a href={to} className={className} onClick={onClick}>{children}</a>
  ),
  Navigate: ({ to, replace }) => <div data-testid="navigate" data-to={to} />,
  Outlet: () => <div data-testid="outlet" />,
});

// Mock lucide-react
vi.mock('lucide-react', () => {
  const icons = {
    LayoutDashboard: 'LayoutDashboard',
    Users: 'Users',
    Building2: 'Building2',
    Contact: 'Contact',
    Handshake: 'Handshake',
    CalendarCheck: 'CalendarCheck',
    BarChart3: 'BarChart3',
    Settings: 'Settings',
    X: 'X',
    Bot: 'Bot',
    LogOut: 'LogOut',
    User: 'User',
    Mail: 'Mail',
    Phone: 'Phone',
    Key: 'Key',
    Eye: 'Eye',
    EyeOff: 'EyeOff',
    ChevronDown: 'ChevronDown',
    MoreVertical: 'MoreVertical',
    CheckCircle: 'CheckCircle',
    AlertCircle: 'AlertCircle',
    Download: 'Download',
    Upload: 'Upload',
    Camera: 'Camera',
    Globe: 'Globe',
    Plus: 'Plus',
    Search: 'Search',
    Filter: 'Filter',
    ChevronLeft: 'ChevronLeft',
    ChevronRight: 'ChevronRight',
    Trash2: 'Trash2',
    Pencil: 'Pencil',
    Eye: 'Eye',
    ArrowUpDown: 'ArrowUpDown',
    TrendingUp: 'TrendingUp',
    Target: 'Target',
    Clock: 'Clock',
    ArrowUpRight: 'ArrowUpRight',
    Save: 'Save',
    FileText: 'FileText',
    Calendar: 'Calendar',
    LockKeyhole: 'LockKeyhole',
    Building2: 'Building2',
    User: 'User',
    Plus: 'Plus',
    Search: 'Search',
    Filter: 'Filter',
    X: 'X',
    Download: 'Download',
    Upload: 'Upload',
    Camera: 'Camera',
    Globe: 'Globe',
    Lightbulb: 'Lightbulb',
    Sparkles: 'Sparkles',
    RefreshCw: 'RefreshCw',
    ChevronLeft: 'ChevronLeft',
    ChevronRight: 'ChevronRight',
    Copy: 'Copy',
    Download: 'Download',
    FileText: 'FileText',
    Mail: 'Mail',
    Target: 'Target',
    TrendingUp: 'TrendingUp',
    DollarSign: 'DollarSign',
    Users: 'Users',
    Clock: 'Clock',
    AlertTriangle: 'AlertTriangle',
    CheckCircle: 'CheckCircle',
    XCircle: 'XCircle',
    Loader2: 'Loader2',
    History: 'History',
    BarChart3: 'BarChart3',
    Lightbulb: 'Lightbulb',
    Sparkles: 'Sparkles',
    Lock: 'Lock',
    LogOut: 'LogOut',
  };
  return Object.fromEntries(Object.entries(icons).map(([key, value]) => [key, () => <div data-testid={value.toLowerCase()} />]));
}));

// Mock recharts
vi.mock('recharts', () => ({
  BarChart: ({ children, ...props }) => <div data-testid="bar-chart" {...props}>{children}</div>,
  Bar: ({ ...props }) => <div data-testid="bar" {...props} />,
  LineChart: ({ children, ...props }) => <div data-testid="line-chart" {...props}>{children}</div>,
  Line: ({ ...props }) => <div data-testid="line" {...props} />,
  PieChart: ({ children, ...props }) => <div data-testid="pie-chart" {...props}>{children}</div>,
  Pie: ({ ...props }) => <div data-testid="pie" {...props} />,
  Cell: ({ ...props }) => <div data-testid="cell" {...props} />,
  XAxis: ({ ...props }) => <div data-testid="x-axis" {...props} />,
  YAxis: ({ ...props }) => <div data-testid="y-axis" {...props} />,
  CartesianGrid: ({ ...props }) => <div data-testid="cartesian-grid" {...props} />,
  Tooltip: ({ ...props }) => <div data-testid="tooltip" {...props} />,
  Legend: ({ ...props }) => <div data-testid="legend" {...props} />,
  ResponsiveContainer: ({ children, ...props }) => <div data-testid="responsive-container" {...props}>{children}</div>,
  FunnelChart: ({ children, ...props }) => <div data-testid="funnel-chart" {...props}>{children}</div>,
  Funnel: ({ ...props }) => <div data-testid="funnel" {...props} />,
  AreaChart: ({ children, ...props }) => <div data-testid="area-chart" {...props}>{children}</div>,
  Area: ({ ...props }) => <div data-testid="area" {...props} />,
}));

// Mock react-router-dom
vi.mock('react-router-dom', () => ({
  useNavigate: () => vi.fn(),
  useSearchParams: () => [new URLSearchParams(), vi.fn()],
  useLocation: () => ({ state: null }),
  NavLink: ({ children, to, className, onClick }) => <a href={to} className={className} onClick={onClick}>{children}</a>,
  Navigate: ({ to, replace }) => <div data-testid="navigate" data-to={to} />,
  Outlet: () => <div data-testid="outlet" />,
}));

// Mock zustand
vi.mock('zustand', () => ({
  create: (fn) => {
    let state = fn((set) => set, () => state, undefined);
    return (selector) => selector(state);
  },
}));

// Suppress console logs in tests
if (!process.env.DEBUG_TESTS) {
  global.console = {
    ...console,
    log: vi.fn(),
    warn: vi.fn(),
    error: vi.fn(),
    info: vi.fn(),
  };
}