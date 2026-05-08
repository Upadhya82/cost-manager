import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import App from './App';

const setItemSpy = vi.spyOn(Storage.prototype, 'setItem');

describe('App', () => {
  beforeEach(() => {
    localStorage.clear();
    setItemSpy.mockClear();
    vi.spyOn(window, 'confirm').mockReturnValue(true);
  });

  it('shows validation errors when saving without required values', async () => {
    const user = userEvent.setup();
    render(<App />);

    await user.click(screen.getByRole('button', { name: /save progress/i }));

    expect(screen.getByText(/please fix the following issues/i)).toBeInTheDocument();
    expect(screen.getByText(/product name is required/i)).toBeInTheDocument();
  });

  it('saves item to history and allows loading it', async () => {
    const user = userEvent.setup();
    render(<App />);

    const productNameInput = screen.getByLabelText(/product name/i);
    await user.type(productNameInput, 'Cinnamon Powder');

    await user.click(screen.getByRole('button', { name: /save progress/i }));
    await user.click(screen.getByRole('button', { name: /toggle history/i }));

    expect(screen.getByText('Cinnamon Powder')).toBeInTheDocument();

    await user.click(screen.getByText('Cinnamon Powder'));
    expect(productNameInput).toHaveValue('Cinnamon Powder');
  });

  it('writes to localStorage when inputs change', async () => {
    const user = userEvent.setup();
    render(<App />);

    await user.type(screen.getByLabelText(/product name/i), 'Pepper Mix');

    expect(setItemSpy).toHaveBeenCalled();
  });
});
