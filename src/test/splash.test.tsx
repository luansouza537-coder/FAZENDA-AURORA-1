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

  it('shows "+ Novo Jogo" always and "Continuar" desabilitado sem save', () => {
    render(<SplashScreen onStart={() => {}} hasSave={false} />);
    expect(screen.getByText(/Novo Jogo/i)).toBeInTheDocument();
    // sem save o "Continuar" é um placeholder não-clicável (div), não um botão
    const continuar = screen.getByText(/▶ Continuar/i);
    expect(continuar.closest('button')).toBeNull();
  });

  it('shows "Continuar" clicável quando há save', () => {
    const onStart = vi.fn();
    render(<SplashScreen onStart={onStart} hasSave={true} savePreview={{ day: 5, level: 3 }} />);
    const continuar = screen.getByText(/▶ Continuar/i);
    expect(continuar.closest('button')).not.toBeNull();
    fireEvent.click(continuar);
    expect(onStart).toHaveBeenCalledOnce();
    expect(screen.getByText(/Dia 5/i)).toBeInTheDocument();
  });

  it('"+ Novo Jogo" inicia direto quando não há save', () => {
    const onStart = vi.fn();
    render(<SplashScreen onStart={onStart} hasSave={false} />);
    fireEvent.click(screen.getByText(/Novo Jogo/i));
    expect(onStart).toHaveBeenCalledOnce();
  });

  it('"+ Novo Jogo" pede confirmação quando há save', () => {
    const onStart = vi.fn();
    render(<SplashScreen onStart={onStart} hasSave={true} />);
    fireEvent.click(screen.getByText(/Novo Jogo/i));
    // abre confirmação em vez de iniciar
    expect(onStart).not.toHaveBeenCalled();
    expect(screen.getByText(/Cancelar/i)).toBeInTheDocument();
  });

  it('mostra aviso de apagar save apenas quando há save', () => {
    const { rerender } = render(<SplashScreen onStart={() => {}} hasSave={false} />);
    expect(screen.queryByText(/apagará o save atual/i)).not.toBeInTheDocument();
    rerender(<SplashScreen onStart={() => {}} hasSave={true} />);
    expect(screen.getByText(/apagará o save atual/i)).toBeInTheDocument();
  });

  it('mostra botão "Carregar Save"', () => {
    render(<SplashScreen onStart={() => {}} hasSave={false} />);
    expect(screen.getByText(/Carregar Save/i)).toBeInTheDocument();
  });
});
