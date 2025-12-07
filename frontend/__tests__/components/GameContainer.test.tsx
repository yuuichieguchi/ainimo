import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { GameContainer } from '@/components/GameContainer';

// Import hooks to mock them
import { useGameState } from '@/hooks/useGameState';
import { usePersistence } from '@/hooks/usePersistence';
import { useDarkMode } from '@/hooks/useDarkMode';
import { useLanguage } from '@/hooks/useLanguage';
import { useLevelUpNotification } from '@/hooks/useLevelUpNotification';
import { useAchievements } from '@/hooks/useAchievements';
import { useInventory } from '@/hooks/useInventory';

// Mock all hooks
jest.mock('@/hooks/useGameState');
jest.mock('@/hooks/usePersistence');
jest.mock('@/hooks/useDarkMode');
jest.mock('@/hooks/useLanguage');
jest.mock('@/hooks/useLevelUpNotification');
jest.mock('@/hooks/useAchievements');
jest.mock('@/hooks/useInventory');

// Mock effect hooks
jest.mock('@/hooks/effects', () => ({
  useTimeOfDay: () => ({ timeOfDay: 'day' }),
  useWeather: () => ({ weather: 'sunny', setWeather: jest.fn(), weatherIcon: '☀️' }),
  useSeason: () => ({ season: 'spring', seasonIcon: '🌸' }),
  useFloatingValues: () => ({ values: [], addStatChanges: jest.fn() }),
}));

// Mock effect components
jest.mock('@/components/effects', () => ({
  EnvironmentLayer: ({ children }: { children: React.ReactNode }) => <div data-testid="environment-layer">{children}</div>,
  FloatingValues: () => <div data-testid="floating-values" />,
}));

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

jest.mock('@/components/AchievementModal', () => ({
  AchievementModal: () => <div>Mock AchievementModal</div>
}));

jest.mock('@/components/AchievementNotification', () => ({
  AchievementNotification: () => <div>Mock AchievementNotification</div>
}));

jest.mock('@/components/PersonalityBadge', () => ({
  PersonalityBadge: () => <div data-testid="personality-badge">Mock PersonalityBadge</div>
}));

jest.mock('@/components/minigames', () => ({
  MiniGameModal: () => <div data-testid="minigame-modal">Mock MiniGameModal</div>
}));

jest.mock('@/components/inventory', () => ({
  EquipmentPanel: () => <div data-testid="equipment-panel">Mock EquipmentPanel</div>,
  InventoryModal: () => <div data-testid="inventory-modal">Mock InventoryModal</div>
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
    restLimit: {
      count: 0,
      lastResetDate: '2025-01-01',
    },
    achievements: {
      unlocked: [],
      stats: {
        talkCount: 0,
        studyCount: 0,
        playCount: 0,
        restCount: 0,
        totalActions: 0,
        messagesSent: 0,
        currentLoginStreak: 0,
        maxLoginStreak: 0,
        totalPlayDays: 0,
        lastPlayDate: '',
        restLimitHitDays: 0,
        todayActions: [],
        todayActionsDate: '',
      },
      selectedTitleId: null,
      pendingNotifications: [],
    },
  };

  const mockAchievementState = {
    achievementState: mockGameState.achievements,
    allAchievements: [],
    currentNotification: null,
    dismissNotification: jest.fn(),
    selectedTitle: null,
    selectTitle: jest.fn(),
    unlockedCount: 0,
    totalCount: 52,
    processAction: jest.fn(),
    processChat: jest.fn(),
    processRestLimitHit: jest.fn(),
    processLogin: jest.fn(),
    loadAchievementState: jest.fn(),
    resetAchievements: jest.fn(),
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
      updateAchievements: jest.fn(),
      updateMiniGames: jest.fn(),
      updateInventory: jest.fn(),
      spendEnergy: jest.fn(),
      addXp: jest.fn(),
    });

    (useInventory as jest.Mock).mockReturnValue({
      inventory: {
        coins: 0,
        items: [],
        equipped: { hat: null, accessory: null, background: null },
      },
      addItem: jest.fn(),
      addManyCoins: jest.fn(),
      loadInventory: jest.fn(),
      resetInventory: jest.fn(),
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

    (useAchievements as jest.Mock).mockReturnValue(mockAchievementState);

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
