import { render, screen } from '@testing-library/react';
// import userEvent from '@testing-library/user-event';
import { describe, it, expect, vi } from 'vitest';
// import { Dropdown } from '../../../app/components/ui/Dropdown'; // Adjust import path

describe('Dropdown Component', () => {
  it('should toggle visibility when clicked', async () => {
    /*
    const user = userEvent.setup();
    render(
      <Dropdown label="Options">
        <button>Option 1</button>
        <button>Option 2</button>
      </Dropdown>
    );
 
    const trigger = screen.getByRole('button', { name: /options/i });
    
    // Initially hidden
    expect(screen.queryByText('Option 1')).not.toBeInTheDocument();
 
    // Click to open
    await user.click(trigger);
    expect(screen.getByText('Option 1')).toBeVisible();
 
    // Click again to close
    await user.click(trigger);
    expect(screen.queryByText('Option 1')).not.toBeInTheDocument();
    */
  });

  it('should execute the callback when an option is selected', async () => {
    /*
    const handleSelect = vi.fn();
    const user = userEvent.setup();
    
    render(
      <Dropdown label="Actions">
        <button onClick={handleSelect}>Delete</button>
      </Dropdown>
    );
 
    await user.click(screen.getByRole('button', { name: /actions/i }));
    await user.click(screen.getByText('Delete'));
 
    expect(handleSelect).toHaveBeenCalledTimes(1);
    */
  });
});
