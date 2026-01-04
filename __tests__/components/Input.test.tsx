/**
 * Input Component Tests
 */

import { render, screen, fireEvent } from '@testing-library/react';
import { Input } from '@/components/ui/Input';

describe('Input', () => {
  it('renders with placeholder', () => {
    render(<Input placeholder="Enter text" />);

    expect(screen.getByPlaceholderText('Enter text')).toBeInTheDocument();
  });

  it('handles value changes', () => {
    const handleChange = jest.fn();
    render(<Input onChange={handleChange} />);

    const input = screen.getByRole('textbox');
    fireEvent.change(input, { target: { value: 'test value' } });

    expect(handleChange).toHaveBeenCalled();
  });

  it('can be disabled', () => {
    render(<Input disabled />);

    expect(screen.getByRole('textbox')).toBeDisabled();
  });

  it('displays error state', () => {
    render(<Input error="This field is required" />);

    expect(screen.getByText('This field is required')).toBeInTheDocument();
    expect(screen.getByRole('textbox')).toHaveClass('border-red-500');
  });

  it('displays label when provided', () => {
    render(<Input label="Email Address" />);

    expect(screen.getByText('Email Address')).toBeInTheDocument();
  });

  it('displays hint text', () => {
    render(<Input hint="We will never share your email" />);

    expect(screen.getByText('We will never share your email')).toBeInTheDocument();
  });

  it('supports different types', () => {
    render(<Input type="password" data-testid="password-input" />);

    const input = screen.getByTestId('password-input');
    expect(input).toHaveAttribute('type', 'password');
  });

  it('applies custom className', () => {
    render(<Input className="custom-class" />);

    expect(screen.getByRole('textbox')).toHaveClass('custom-class');
  });

  it('forwards ref', () => {
    const ref = { current: null as HTMLInputElement | null };
    render(<Input ref={ref} />);

    expect(ref.current).toBeInstanceOf(HTMLInputElement);
  });

  it('shows required indicator', () => {
    render(<Input label="Name" required />);

    // Required indicator is a span with asterisk after label text
    expect(screen.getByText('*')).toBeInTheDocument();
  });

  it('hides hint when error is present', () => {
    render(<Input hint="Helpful hint" error="Error message" />);

    expect(screen.getByText('Error message')).toBeInTheDocument();
    expect(screen.queryByText('Helpful hint')).not.toBeInTheDocument();
  });
});
