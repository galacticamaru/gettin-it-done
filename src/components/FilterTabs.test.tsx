import { render, screen, fireEvent } from '@testing-library/react';
import { FilterTabs } from './FilterTabs';
import { vi } from 'vitest';
import '@testing-library/jest-dom';

describe('FilterTabs', () => {
  it('renders with correct ARIA roles', () => {
    const handleFilterChange = vi.fn();
    render(<FilterTabs filter="all" onFilterChange={handleFilterChange} />);

    // Check if tablist exists
    const tablist = screen.getByRole('tablist', { name: /Task filters/i });
    expect(tablist).toBeInTheDocument();

    // Check if tabs exist
    const tabs = screen.getAllByRole('tab');
    expect(tabs).toHaveLength(3);

    // Check initial selection
    expect(screen.getByRole('tab', { name: /All/i })).toHaveAttribute('aria-selected', 'true');
    expect(screen.getByRole('tab', { name: /Completed/i })).toHaveAttribute('aria-selected', 'false');
    expect(screen.getByRole('tab', { name: /Active/i })).toHaveAttribute('aria-selected', 'false');
  });

  it('calls onFilterChange when a tab is clicked', () => {
    const handleFilterChange = vi.fn();
    render(<FilterTabs filter="all" onFilterChange={handleFilterChange} />);

    fireEvent.click(screen.getByRole('tab', { name: /Completed/i }));
    expect(handleFilterChange).toHaveBeenCalledWith('completed');
  });
});
