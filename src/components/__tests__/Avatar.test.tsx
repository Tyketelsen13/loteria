import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import Avatar from '@/components/Avatar';

// Mock the boardBackgrounds module
jest.mock('@/lib/boardBackgrounds', () => ({
  getAvatarImageUrl: jest.fn((url) => url || '')
}));

describe('Avatar Component', () => {
  const mockGetAvatarImageUrl = require('@/lib/boardBackgrounds').getAvatarImageUrl;

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders with image URL', () => {
    const imageUrl = 'https://example.com/avatar.jpg';
    mockGetAvatarImageUrl.mockReturnValue(imageUrl);
    
    render(<Avatar imageUrl={imageUrl} size={64} alt="Test Avatar" />);
    
    const img = screen.getByRole('img');
    expect(img).toBeInTheDocument();
    expect(img).toHaveAttribute('alt', 'Test Avatar');
    expect(img).toHaveAttribute('src', imageUrl);
    expect(img).toHaveAttribute('width', '64');
    expect(img).toHaveAttribute('height', '64');
  });

  it('renders default avatar icon when no image URL provided', () => {
    render(<Avatar />);
    
    // Should render the default SVG icon - query by tagName instead of role
    const container = document.querySelector('svg');
    expect(container).toBeInTheDocument();
    
    // Should not render an img element
    expect(screen.queryByRole('img')).not.toBeInTheDocument();
  });

  it('applies custom size correctly', () => {
    const imageUrl = 'https://example.com/avatar.jpg';
    mockGetAvatarImageUrl.mockReturnValue(imageUrl);
    
    render(<Avatar imageUrl={imageUrl} size={128} />);
    
    const img = screen.getByRole('img');
    expect(img).toHaveAttribute('width', '128');
    expect(img).toHaveAttribute('height', '128');
  });

  it('applies custom className', () => {
    const imageUrl = 'https://example.com/avatar.jpg';
    mockGetAvatarImageUrl.mockReturnValue(imageUrl);
    
    render(<Avatar imageUrl={imageUrl} className="custom-class" />);
    
    const img = screen.getByRole('img');
    expect(img).toHaveClass('custom-class');
    expect(img).toHaveClass('rounded-full');
  });

  it('handles image load error by switching to fallback', async () => {
    const imageUrl = 'https://example.com/broken-avatar.jpg';
    mockGetAvatarImageUrl.mockReturnValue(imageUrl);
    
    render(<Avatar imageUrl={imageUrl} size={64} />);
    
    const img = screen.getByRole('img');
    expect(img).toHaveAttribute('src', imageUrl);
    
    // Simulate image load error
    fireEvent.error(img);
    
    await waitFor(() => {
      expect(img.getAttribute('src')).toMatch(/ui-avatars\.com/);
    });
  });

  it('generates correct fallback URL on error', async () => {
    const imageUrl = 'https://example.com/broken-avatar.jpg';
    mockGetAvatarImageUrl.mockReturnValue(imageUrl);
    
    render(<Avatar imageUrl={imageUrl} size={100} />);
    
    const img = screen.getByRole('img');
    fireEvent.error(img);
    
    await waitFor(() => {
      const src = img.getAttribute('src');
      expect(src).toContain('ui-avatars.com');
      expect(src).toContain('size=100');
      expect(src).toContain('background=b89c3a');
      expect(src).toContain('color=ffffff');
    });
  });

  it('only switches to fallback once per error', async () => {
    const imageUrl = 'https://example.com/broken-avatar.jpg';
    mockGetAvatarImageUrl.mockReturnValue(imageUrl);
    
    render(<Avatar imageUrl={imageUrl} />);
    
    const img = screen.getByRole('img');
    
    // First error - should switch to fallback
    fireEvent.error(img);
    await waitFor(() => {
      expect(img.getAttribute('src')).toMatch(/ui-avatars\.com/);
    });
    
    const fallbackSrc = img.getAttribute('src');
    
    // Second error - should not change again
    fireEvent.error(img);
    await waitFor(() => {
      expect(img.getAttribute('src')).toBe(fallbackSrc);
    });
  });

  it('shows default icon when imageUrl is empty string', () => {
    render(<Avatar imageUrl="" />);
    
    // Should render the default SVG icon instead of img
    const container = document.querySelector('svg');
    expect(container).toBeInTheDocument();
    expect(screen.queryByRole('img')).not.toBeInTheDocument();
  });

  it('uses provided alt text', () => {
    const imageUrl = 'https://example.com/avatar.jpg';
    mockGetAvatarImageUrl.mockReturnValue(imageUrl);
    
    render(<Avatar imageUrl={imageUrl} alt="User Profile Picture" />);
    
    const img = screen.getByRole('img');
    expect(img).toHaveAttribute('alt', 'User Profile Picture');
  });

  it('has default alt text when none provided', () => {
    const imageUrl = 'https://example.com/avatar.jpg';
    mockGetAvatarImageUrl.mockReturnValue(imageUrl);
    
    render(<Avatar imageUrl={imageUrl} />);
    
    const img = screen.getByRole('img');
    expect(img).toHaveAttribute('alt', 'Avatar');
  });

  it('calls getAvatarImageUrl when imageUrl changes', () => {
    const { rerender } = render(<Avatar imageUrl="https://example.com/avatar1.jpg" />);
    
    expect(mockGetAvatarImageUrl).toHaveBeenCalledWith('https://example.com/avatar1.jpg');
    
    rerender(<Avatar imageUrl="https://example.com/avatar2.jpg" />);
    
    expect(mockGetAvatarImageUrl).toHaveBeenCalledWith('https://example.com/avatar2.jpg');
    expect(mockGetAvatarImageUrl).toHaveBeenCalledTimes(2);
  });

  it('renders with standard border styling', () => {
    const imageUrl = 'https://example.com/avatar.jpg';
    mockGetAvatarImageUrl.mockReturnValue(imageUrl);
    
    render(<Avatar imageUrl={imageUrl} />);
    
    const img = screen.getByRole('img');
    expect(img).toHaveClass('border', 'border-gray-300', 'object-cover');
  });
});
