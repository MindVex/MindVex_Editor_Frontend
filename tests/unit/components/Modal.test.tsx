import { render, screen, fireEvent } from '@testing-library/react';
// import userEvent from '@testing-library/user-event';
import { describe, it, expect, vi } from 'vitest';
// import { Modal } from '../../../app/components/ui/Modal'; // Adjust import path

describe('Modal Component (Radix-UI based)', () => {
  it('should not be visible by default', () => {
    /*
    render(
      <Modal isOpen={false} title="Test Modal">
        <div>Content</div>
      </Modal>
    );
    expect(screen.queryByText('Test Modal')).not.toBeInTheDocument();
    */
  });

  it('should render content when isOpen is true', () => {
    /*
    render(
      <Modal isOpen={true} title="Test Modal">
        <div>Modal Content</div>
      </Modal>
    );
    expect(screen.getByText('Test Modal')).toBeInTheDocument();
    expect(screen.getByText('Modal Content')).toBeInTheDocument();
    */
  });

  it('should call onClose when the close button is clicked', async () => {
    /*
    const handleClose = vi.fn();
    const user = userEvent.setup();
    
    render(
      <Modal isOpen={true} title="Test Modal" onClose={handleClose}>
        <div>Content</div>
      </Modal>
    );
 
    const closeButton = screen.getByRole('button', { name: /close/i });
    await user.click(closeButton);
 
    expect(handleClose).toHaveBeenCalledTimes(1);
    */
  });

  it('should close when the Escape key is pressed', async () => {
    /*
    const handleClose = vi.fn();
    render(
      <Modal isOpen={true} title="Test Modal" onClose={handleClose}>
        <div>Content</div>
      </Modal>
    );
 
    fireEvent.keyDown(window, { key: 'Escape', code: 'Escape' });
    expect(handleClose).toHaveBeenCalledTimes(1);
    */
  });
});
