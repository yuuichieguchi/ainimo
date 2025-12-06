import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { GameContainer } from '@/components/GameContainer';

// Import hooks to mock them
import { useGameState } from '@/hooks/useGameState';
import { usePersistence } from '@/hooks/usePersistence';
import { useDarkMode } from '@/hooks/useDarkMode';
import { useLanguage } from '@/hooks/useLanguage';
import { useLevelUpNotification } from '@/hooks/useLevelUpNotification';

// Mock all hooks
jest.mock('@/hooks/useGameState');
jest.mock('@/hooks/usePersistence');
jest.mock('@/hooks/useDarkMode');
jest.mock('@/hooks/useLanguage');
jest.mock('@/hooks/useLevelUpNotification');

// Mock components
jest.mock('@/components/AinimoPet', () => ({
  AinimoPet: React.forwardRef((props: any, ref: React.Ref<HTMLDivElement>) => (
    <div ref={ref} data-testid="ainimo-pet">Mock AinimoPet</div>
  ))
}));

jest.mock('@/components/StatusPanel', () => ({
  StatusPanel: () => <div>Mock StatusPanel</div>
}));

jest.mock('@/components/ChatLog', () => ({
  ChatLog: () => <div>Mock ChatLog</div>
}));

jest.mock('@/components/ActionButtons', () => ({
  ActionButtons: ({ onAction }: { onAction: (action: string) => void }) => (
    <div data-testid="action-buttons">
      <button onClick={() => onAction('study')} data-testid="study-button">
        Study
      </button>
      <button onClick={() => onAction('play')} data-testid="play-button">
        Play
      </button>
      <button onClick={() => onAction('rest')} data-testid="rest-button">
        Rest
      </button>
    </div>
  )
}));

jest.mock('@/components/LevelUpNotification', () => ({
  LevelUpNotification: () => <div>Mock LevelUpNotification</div>
}));

describe('GameContainer - Mobile Auto Scroll Feature', () => {
  const mockHandleAction = jest.fn();
  const mockHandleChat = jest.fn();
  const mockResetGame = jest.fn();
  const mockLoadState = jest.fn();
  const mockClearSave = jest.fn();
  const mockToggleTheme = jest.fn();
  const mockToggleLanguage = jest.fn();
  const mockHideNotification = jest.fn();

  const mockGameState = {
    parameters: {
      level: 1,
      xp: 0,
      intelligence: 30,
      memory: 50,
      friendliness: 50,
      energy: 80,
      mood: 70,
    },
    messages: [],
    currentActivity: null,
    createdAt: Date.now(),
    lastActionTime: Date.now(),
  };

  beforeEach(() => {
    jest.clearAllMocks();

    // Setup mock implementations
    (useGameState as jest.Mock).mockReturnValue({
      state: mockGameState,
      handleAction: mockHandleAction,
      handleChat: mockHandleChat,
      resetGame: mockResetGame,
      loadState: mockLoadState,
    });

    (usePersistence as jest.Mock).mockReturnValue({
      clearSave: mockClearSave,
    });

    (useDarkMode as jest.Mock).mockReturnValue({
      theme: 'light',
      toggleTheme: mockToggleTheme,
    });

    (useLanguage as jest.Mock).mockReturnValue({
      language: 'en',
      toggleLanguage: mockToggleLanguage,
      mounted: true,
    });

    (useLevelUpNotification as jest.Mock).mockReturnValue({
      notificationState: { isVisible: false, newLevel: 1 },
      isLevelUpRecent: false,
      hideNotification: mockHideNotification,
    });

    // Mock scrollIntoView
    Element.prototype.scrollIntoView = jest.fn();

    // Mock requestAnimationFrame
    jest.spyOn(window, 'requestAnimationFrame').mockImplementation((cb) => {
      cb(0);
      return 0;
    });
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  describe('Mobile auto-scroll behavior', () => {
    it('should scroll to pet on mobile when action button is clicked', () => {
      // Set mobile viewport width
      Object.defineProperty(window, 'innerWidth', {
        writable: true,
        configurable: true,
        value: 375,
      });

      render(<GameContainer />);

      const studyButton = screen.getByTestId('study-button');
      fireEvent.click(studyButton);

      const petElement = screen.getByTestId('ainimo-pet');
      expect(petElement.scrollIntoView).toHaveBeenCalledWith({
        behavior: 'smooth',
        block: 'center',
      });
      expect(mockHandleAction).toHaveBeenCalledWith('study');
    });

    it('should scroll to pet with correct options on mobile', () => {
      Object.defineProperty(window, 'innerWidth', {
        writable: true,
        configurable: true,
        value: 500,
      });

      render(<GameContainer />);

      const playButton = screen.getByTestId('play-button');
      fireEvent.click(playButton);

      const petElement = screen.getByTestId('ainimo-pet');
      expect(petElement.scrollIntoView).toHaveBeenCalledWith({
        behavior: 'smooth',
        block: 'center',
      });
    });

    it('should NOT scroll to pet on desktop when action button is clicked', () => {
      // Set desktop viewport width
      Object.defineProperty(window, 'innerWidth', {
        writable: true,
        configurable: true,
        value: 1024,
      });

      render(<GameContainer />);

      const studyButton = screen.getByTestId('study-button');
      fireEvent.click(studyButton);

      const petElement = screen.getByTestId('ainimo-pet');
      expect(petElement.scrollIntoView).not.toHaveBeenCalled();
      expect(mockHandleAction).toHaveBeenCalledWith('study');
    });

    it('should NOT scroll when width is exactly 768px (boundary)', () => {
      Object.defineProperty(window, 'innerWidth', {
        writable: true,
        configurable: true,
        value: 768,
      });

      render(<GameContainer />);

      const restButton = screen.getByTestId('rest-button');
      fireEvent.click(restButton);

      const petElement = screen.getByTestId('ainimo-pet');
      expect(petElement.scrollIntoView).not.toHaveBeenCalled();
      expect(mockHandleAction).toHaveBeenCalledWith('rest');
    });

    it('should scroll when width is 767px (just below boundary)', () => {
      Object.defineProperty(window, 'innerWidth', {
        writable: true,
        configurable: true,
        value: 767,
      });

      render(<GameContainer />);

      const playButton = screen.getByTestId('play-button');
      fireEvent.click(playButton);

      const petElement = screen.getByTestId('ainimo-pet');
      expect(petElement.scrollIntoView).toHaveBeenCalledWith({
        behavior: 'smooth',
        block: 'center',
      });
    });

    it('should handle multiple action clicks correctly', () => {
      Object.defineProperty(window, 'innerWidth', {
        writable: true,
        configurable: true,
        value: 600,
      });

      render(<GameContainer />);

      const studyButton = screen.getByTestId('study-button');
      const playButton = screen.getByTestId('play-button');

      fireEvent.click(studyButton);
      fireEvent.click(playButton);

      expect(mockHandleAction).toHaveBeenCalledTimes(2);
      expect(mockHandleAction).toHaveBeenNthCalledWith(1, 'study');
      expect(mockHandleAction).toHaveBeenNthCalledWith(2, 'play');

      const petElement = screen.getByTestId('ainimo-pet');
      expect(petElement.scrollIntoView).toHaveBeenCalledTimes(2);
    });
  });

  describe('Pet ref integration', () => {
    it('should render pet element with ref', () => {
      render(<GameContainer />);

      const petElement = screen.getByTestId('ainimo-pet');
      expect(petElement).toBeInTheDocument();
    });
  });
});
