import { render, screen, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import ProfilePage from '@/app/profile/page';

// Mock fetch globally
global.fetch = jest.fn();

// Mock Avatar component
jest.mock('@/components/Avatar', () => {
  return function MockAvatar({ imageUrl, size, alt }: any) {
    return <div data-testid="avatar" data-size={size} data-alt={alt}>Avatar: {imageUrl}</div>;
  };
});

describe('Profile Page', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('displays loading state initially', () => {
    (fetch as jest.Mock).mockImplementation(() => new Promise(() => {})); // Never resolves
    
    render(<ProfilePage />);
    
    expect(screen.getByText('Loading profile...')).toBeInTheDocument();
  });

  it('displays user profile data when API call succeeds', async () => {
    const mockUserData = {
      status: 'ok',
      user: {
        name: 'John Doe',
        email: 'john@example.com'
      }
    };

    (fetch as jest.Mock).mockResolvedValueOnce({
      ok: true,
      json: async () => mockUserData
    });

    render(<ProfilePage />);

    await waitFor(() => {
      expect(screen.getByText('Profile')).toBeInTheDocument();
      expect(screen.getByText('John Doe')).toBeInTheDocument();
      expect(screen.getByText('john@example.com')).toBeInTheDocument();
    });
  });

  it('displays fallback data when API returns no users', async () => {
    const mockResponse = {
      status: 'no_users',
      message: 'No users found in database'
    };

    (fetch as jest.Mock).mockResolvedValueOnce({
      ok: true,
      json: async () => mockResponse
    });

    render(<ProfilePage />);

    await waitFor(() => {
      expect(screen.getByText('Sample User')).toBeInTheDocument();
      expect(screen.getByText('sample@example.com')).toBeInTheDocument();
    });
  });

  it('displays fallback data when API call fails', async () => {
    (fetch as jest.Mock).mockRejectedValueOnce(new Error('Network error'));

    render(<ProfilePage />);

    await waitFor(() => {
      expect(screen.getByText('Sample User')).toBeInTheDocument();
      expect(screen.getByText('sample@example.com')).toBeInTheDocument();
    });
  });

  it('renders LetterAvatar component with correct props', async () => {
    const mockUserData = {
      status: 'ok',
      user: {
        name: 'Test User',
        email: 'test@example.com'
      }
    };

    (fetch as jest.Mock).mockResolvedValueOnce({
      ok: true,
      json: async () => mockUserData
    });

    render(<ProfilePage />);

    await waitFor(() => {
      const letterAvatar = screen.getByText('T'); // First letter of "Test User"
      expect(letterAvatar).toBeInTheDocument();
    });
  });

  it('renders About section', async () => {
    const mockUserData = {
      status: 'ok',
      user: {
        name: 'Test User',
        email: 'test@example.com'
      }
    };

    (fetch as jest.Mock).mockResolvedValueOnce({
      ok: true,
      json: async () => mockUserData
    });

    render(<ProfilePage />);

    await waitFor(() => {
      expect(screen.getByText('About')).toBeInTheDocument();
      expect(screen.getByText(/Welcome to your profile page/)).toBeInTheDocument();
    });
  });

  it('calls the correct API endpoint', async () => {
    const mockUserData = {
      status: 'ok',
      user: {
        name: 'Test User',
        email: 'test@example.com'
      }
    };

    (fetch as jest.Mock).mockResolvedValueOnce({
      ok: true,
      json: async () => mockUserData
    });

    render(<ProfilePage />);

    await waitFor(() => {
      expect(fetch).toHaveBeenCalledWith('/api/user-profile');
    });
  });

  it('handles user without name gracefully', async () => {
    const mockUserData = {
      status: 'ok',
      user: {
        email: 'noname@example.com'
        // name is undefined
      }
    };

    (fetch as jest.Mock).mockResolvedValueOnce({
      ok: true,
      json: async () => mockUserData
    });

    render(<ProfilePage />);

    await waitFor(() => {
      expect(screen.getByText('User')).toBeInTheDocument(); // Fallback name
      expect(screen.getByText('noname@example.com')).toBeInTheDocument();
    });
  });

  describe('LetterAvatar', () => {
    it('generates correct first letter for user name', async () => {
      const mockUserData = {
        status: 'ok',
        user: {
          name: 'Alice Smith',
          email: 'alice@example.com'
        }
      };

      (fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: async () => mockUserData
      });

      render(<ProfilePage />);

      await waitFor(() => {
        const letterAvatar = screen.getByText('A');
        expect(letterAvatar).toBeInTheDocument();
      });
    });

    it('uses U as fallback when no name provided', async () => {
      const mockUserData = {
        status: 'ok',
        user: {
          email: 'test@example.com'
          // No name provided
        }
      };

      (fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: async () => mockUserData
      });

      render(<ProfilePage />);

      await waitFor(() => {
        const letterAvatar = screen.getByText('U');
        expect(letterAvatar).toBeInTheDocument();
      });
    });

    it('applies correct styling based on name', async () => {
      const mockUserData = {
        status: 'ok',
        user: {
          name: 'Bob Test',
          email: 'bob@example.com'
        }
      };

      (fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: async () => mockUserData
      });

      render(<ProfilePage />);

      await waitFor(() => {
        const letterAvatar = screen.getByText('B');
        // Check the actual avatar element, not its parent container
        expect(letterAvatar).toHaveClass('rounded-full', 'flex', 'items-center', 'justify-center', 'text-white', 'font-bold');
      });
    });
  });

  it('has proper page structure and styling', async () => {
    const mockUserData = {
      status: 'ok',
      user: {
        name: 'Test User',
        email: 'test@example.com'
      }
    };

    (fetch as jest.Mock).mockResolvedValueOnce({
      ok: true,
      json: async () => mockUserData
    });

    render(<ProfilePage />);

    await waitFor(() => {
      // Find the outermost container by looking for the main page div
      const mainContainer = screen.getByText('Profile').closest('.p-6');
      expect(mainContainer).toHaveClass('p-6', 'max-w-xl', 'mx-auto');
    });
  });

  it('renders responsive layout', async () => {
    const mockUserData = {
      status: 'ok',
      user: {
        name: 'Test User',
        email: 'test@example.com'
      }
    };

    (fetch as jest.Mock).mockResolvedValueOnce({
      ok: true,
      json: async () => mockUserData
    });

    render(<ProfilePage />);

    await waitFor(() => {
      // Look for the user info container specifically
      const userInfoContainer = screen.getByText('Test User').closest('.flex.flex-col.items-center.space-y-6');
      expect(userInfoContainer).toBeInTheDocument();
    });
  });
});
