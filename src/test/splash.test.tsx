/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import SplashScreen from '../components/SplashScreen';

describe('SplashScreen', () => {
  it('renders game title', () => {
    render(<SplashScreen onStart={() => {}} hasSave={false} />);
    expect(screen.getByText('Aurora')).toBeInTheDocument();
    expect(screen.getByText('Fazenda')).toBeInTheDocument();
  });

  it('shows "Começar Fazenda" when no save exists', () => {
    render(<SplashScreen onStart={() => {}} hasSave={false} />);
    expect(screen.getByText(/Começar Fazenda/i)).toBeInTheDocument();
  });

  it('shows "Continuar" when a save exists', () => {
    render(<SplashScreen onStart={() => {}} hasSave={true} />);
    expect(screen.getByText(/Continuar/i)).toBeInTheDocument();
  });

  it('calls onStart when the main button is clicked', () => {
    const onStart = vi.fn();
    render(<SplashScreen onStart={onStart} hasSave={false} />);
    fireEvent.click(screen.getByText(/Começar Fazenda/i));
    expect(onStart).toHaveBeenCalledOnce();
  });

  it('shows feature pills', () => {
    render(<SplashScreen onStart={() => {}} hasSave={false} />);
    expect(screen.getByText('19 animais')).toBeInTheDocument();
    expect(screen.getByText('Conquistas')).toBeInTheDocument();
  });

  it('shows "Nova partida" button only when hasSave is true', () => {
    const { rerender } = render(<SplashScreen onStart={() => {}} hasSave={false} />);
    expect(screen.queryByText(/Nova partida/i)).not.toBeInTheDocument();

    rerender(<SplashScreen onStart={() => {}} hasSave={true} />);
    expect(screen.getByText(/Nova partida/i)).toBeInTheDocument();
  });
});
