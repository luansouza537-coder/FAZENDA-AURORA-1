import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import RankingModal from '../components/RankingModal';

const raceProps = {
  user: null,
  farmName: '',
  animals: [],
  gold: 500,
  onOpenAuth: vi.fn(),
  onSpendGold: vi.fn(),
  onEarnGold: vi.fn(),
  onEarnXp: vi.fn(),
  addLog: vi.fn(),
};

describe('Rede — aba Corrida Online', () => {
  it('mostra as 3 abas: Ranking, Chat e Corrida', () => {
    render(<RankingModal onClose={() => {}} isLoggedIn={false} onlineCount={0} raceProps={raceProps} />);
    expect(screen.getByText(/🏆 Ranking/i)).toBeInTheDocument();
    expect(screen.getByText(/💬 Chat/i)).toBeInTheDocument();
    expect(screen.getByText(/🏇 Corrida/i)).toBeInTheDocument();
  });

  it('aba Corrida renderiza o painel com CTA de login para visitantes', () => {
    render(<RankingModal onClose={() => {}} isLoggedIn={false} onlineCount={0} raceProps={raceProps} />);
    fireEvent.click(screen.getByText(/🏇 Corrida/i));
    expect(screen.getByText(/Uma corrida por dia/i)).toBeInTheDocument();
    expect(screen.getByText(/Entrar \/ Criar conta/i)).toBeInTheDocument();
    fireEvent.click(screen.getByText(/Entrar \/ Criar conta/i));
    expect(raceProps.onOpenAuth).toHaveBeenCalled();
  });
});
