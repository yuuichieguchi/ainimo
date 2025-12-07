'use client';

import { useState, useRef, useEffect, useCallback, useMemo } from 'react';
import { useGameState } from '@/hooks/useGameState';
import { usePersistence } from '@/hooks/usePersistence';
import { useDarkMode } from '@/hooks/useDarkMode';
import { useLanguage } from '@/hooks/useLanguage';
import { useLevelUpNotification } from '@/hooks/useLevelUpNotification';
import { useAchievements } from '@/hooks/useAchievements';
import { useTimeOfDay, useWeather, useSeason, useFloatingValues } from '@/hooks/effects';
import { t } from '@/lib/i18n';
import { ActionType, IntelligenceTier } from '@/types/game';
import { getIntelligenceTier, getRemainingRestCount } from '@/lib/gameEngine';
import { ACTION_EFFECTS, GAME_CONSTANTS } from '@/lib/constants';
import { computePersonalityState, getInitialPersonalityData } from '@/lib/personalityEngine';
import { useMiniGames } from '@/hooks/useMiniGames';
import { useInventory } from '@/hooks/useInventory';
import { AinimoPet } from './AinimoPet';
import { StatusPanel } from './StatusPanel';
import { ChatLog } from './ChatLog';
import { LevelUpNotification } from './LevelUpNotification';
import { AchievementModal } from './AchievementModal';
import { AchievementNotification } from './AchievementNotification';
import { PersonalityBadge } from './PersonalityBadge';
import { EnvironmentLayer, FloatingValues } from './effects';
import { MiniGameModal } from './minigames';
import { EquipmentPanel, InventoryModal } from './inventory';
import { SettingsModal } from './SettingsModal';
import { BottomToolbar } from './BottomToolbar';
import { ActionsModal } from './ActionsModal';
import { ShopModal } from './shop';

export function GameContainer() {
  const { language, toggleLanguage, mounted } = useLanguage();
  const {
    state,
    handleAction,
    handleChat,
    resetGame,
    loadState,
    updateAchievements,
    updateMiniGames,
    updateInventory,
    spendEnergy,
    addXp,
  } = useGameState();
  const { clearSave } = usePersistence(state, (loadedState) => {
    loadState(loadedState);
    if (loadedState.achievements) {
      loadAchievementState(loadedState.achievements);
    }
  });
  const { theme, toggleTheme } = useDarkMode();
  const { notificationState, isLevelUpRecent, hideNotification, resetNotificationState } = useLevelUpNotification(state.parameters.level);

  // 実績システム
  const {
    achievementState,
    allAchievements,
    currentNotification,
    dismissNotification,
    selectedTitle,
    selectTitle,
    unlockedCount,
    totalCount,
    processAction: processAchievementAction,
    processChat: processAchievementChat,
    processRestLimitHit,
    processLogin,
    loadAchievementState,
    resetAchievements,
  } = useAchievements(state.achievements);

  // 実績モーダル
  const [isAchievementModalOpen, setIsAchievementModalOpen] = useState(false);

  // ミニゲームモーダル
  const [isMiniGameModalOpen, setIsMiniGameModalOpen] = useState(false);

  // インベントリモーダル
  const [isInventoryModalOpen, setIsInventoryModalOpen] = useState(false);

  // 設定モーダル
  const [isSettingsModalOpen, setIsSettingsModalOpen] = useState(false);

  // アクションモーダル
  const [isActionsModalOpen, setIsActionsModalOpen] = useState(false);

  // ショップモーダル
  const [isShopModalOpen, setIsShopModalOpen] = useState(false);

  // インベントリフック
  const {
    inventory,
    addItem,
    addManyCoins,
    equip,
    unequip,
    purchaseItem,
    loadInventory,
    resetInventory,
  } = useInventory();

  // ミニゲームフック
  const {
    miniGameState,
    activeGame,
    canPlay,
    startGame,
    endGame,
    cancelGame,
    getCooldownRemaining,
    getEnergyCost,
    flipCard,
    resetCards,
    beginRhythm,
    hitNote,
    missNote,
    moveTile,
    answerQuestion,
    loadMiniGameState,
    resetMiniGames,
  } = useMiniGames();

  // ログイン処理（初回マウント時）
  const hasProcessedLogin = useRef(false);
  useEffect(() => {
    if (mounted && !hasProcessedLogin.current) {
      processLogin();
      hasProcessedLogin.current = true;
    }
  }, [mounted, processLogin]);

  // 実績状態をGameStateに同期（永続化用）
  // ロード完了後のみ同期を行う（初期値で上書きしない）
  const hasLoadedAchievements = useRef(false);
  useEffect(() => {
    if (state.achievements) {
      hasLoadedAchievements.current = true;
    }
  }, [state.achievements]);

  useEffect(() => {
    if (hasLoadedAchievements.current) {
      updateAchievements(achievementState);
    }
  }, [achievementState, updateAchievements]);

  // 保存データからインベントリをロード（初回マウント時のみ）
  const hasLoadedInventory = useRef(false);
  useEffect(() => {
    if (!hasLoadedInventory.current && state.inventory) {
      loadInventory(state.inventory);
      hasLoadedInventory.current = true;
    }
  }, [state.inventory, loadInventory]);

  // インベントリ状態をGameStateに同期（永続化用）
  useEffect(() => {
    if (hasLoadedInventory.current) {
      updateInventory(inventory);
    }
  }, [inventory, updateInventory]);

  // 保存データからミニゲーム状態をロード（初回マウント時のみ）
  const hasLoadedMiniGames = useRef(false);
  useEffect(() => {
    if (!hasLoadedMiniGames.current && state.miniGames) {
      loadMiniGameState(state.miniGames);
      hasLoadedMiniGames.current = true;
    }
  }, [state.miniGames, loadMiniGameState]);

  // ミニゲーム状態をGameStateに同期（永続化用）
  useEffect(() => {
    if (hasLoadedMiniGames.current) {
      updateMiniGames(miniGameState);
    }
  }, [miniGameState, updateMiniGames]);

  // 環境エフェクト
  const { timeOfDay } = useTimeOfDay();
  const { weather, setWeather, weatherIcon } = useWeather({ randomizeOnMount: true });
  const { season, seasonIcon } = useSeason();

  // 浮遊数値エフェクト
  const { values: floatingValues, addStatChanges } = useFloatingValues();

  // 成長追跡
  const [previousTier, setPreviousTier] = useState<IntelligenceTier | null>(null);
  const prevIntelligenceRef = useRef(state.parameters.intelligence);

  const [chatInput, setChatInput] = useState('');
  const petRef = useRef<HTMLDivElement>(null);
  const statusPanelRef = useRef<HTMLDivElement>(null);

  // 性格状態を計算（メモ化）
  const personalityData = state.personality || getInitialPersonalityData();
  const personalityState = useMemo(
    () => computePersonalityState(personalityData),
    [personalityData]
  );

  // 成長検出
  useEffect(() => {
    const currentTier = getIntelligenceTier(state.parameters.intelligence);
    const prevTier = getIntelligenceTier(prevIntelligenceRef.current);

    if (currentTier !== prevTier) {
      setPreviousTier(prevTier);
      const timer = setTimeout(() => setPreviousTier(null), 1000);
      return () => clearTimeout(timer);
    }

    prevIntelligenceRef.current = state.parameters.intelligence;
  }, [state.parameters.intelligence]);

  const scrollToPetOnMobile = () => {
    if (typeof window === 'undefined') return;

    if (window.innerWidth < 768) {
      requestAnimationFrame(() => {
        if (petRef.current) {
          petRef.current.scrollIntoView({
            behavior: 'smooth',
            block: 'center',
          });
        }
      });
    }
  };

  // ステータスパネルの中心座標を取得
  const getStatusPanelCenter = useCallback(() => {
    if (!statusPanelRef.current) return { x: 200, y: 100 };
    const rect = statusPanelRef.current.getBoundingClientRect();
    return {
      x: rect.width / 2,
      y: rect.height / 2,
    };
  }, []);

  const handleActionWithScroll = (action: ActionType) => {
    // 休憩の場合、上限に達しているかチェック（次のアクションで上限になる場合）
    const remainingRest = getRemainingRestCount(state.restLimit);
    const willHitRestLimit = action === 'rest' && remainingRest === 1;

    // handleActionは更新後のパラメータを返す（アクションが実行されなかった場合はnull）
    const newParameters = handleAction(action);

    // アクションが実行されない場合はスクロールやエフェクトを表示しない
    if (!newParameters) return;

    // 実績処理（更新後のパラメータを使用）
    processAchievementAction(action, newParameters);

    // 休憩上限に達した場合
    if (willHitRestLimit) {
      processRestLimitHit();
    }

    scrollToPetOnMobile();

    // アクション効果を直接表示（定数から取得）
    const effects = ACTION_EFFECTS[action];
    const center = getStatusPanelCenter();
    const changes: Record<string, number> = {};

    if (effects.xp !== 0) changes.xp = effects.xp;
    if (effects.intelligence !== 0) changes.intelligence = effects.intelligence;
    if (effects.memory !== 0) changes.memory = effects.memory;
    if (effects.friendliness !== 0) changes.friendliness = effects.friendliness;
    if (effects.energy !== 0) changes.energy = effects.energy;

    if (Object.keys(changes).length > 0) {
      addStatChanges(changes, center.x, center.y);
    }
  };

  // ペットインタラクション
  const handlePetInteraction = useCallback(() => {
    // 将来的にインタラクションによるボーナスを追加可能
  }, []);

  // 天気変更ハンドラー
  const cycleWeather = useCallback(() => {
    const weathers: Array<'sunny' | 'cloudy' | 'rainy' | 'snowy'> = ['sunny', 'cloudy', 'rainy', 'snowy'];
    const currentIndex = weathers.indexOf(weather);
    const nextIndex = (currentIndex + 1) % weathers.length;
    setWeather(weathers[nextIndex]);
  }, [weather, setWeather]);

  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if (chatInput.trim()) {
      handleChat(chatInput.trim(), language);
      setChatInput('');
      // 実績処理（チャット）
      processAchievementChat(state.parameters);
    }
  };

  const handleReset = async () => {
    if (confirm(t('resetConfirm', language))) {
      await clearSave();
      resetGame();
      resetAchievements();
      resetInventory();
      resetMiniGames();
      resetNotificationState();
    }
  };

  // ミニゲーム報酬ハンドラ
  const handleMiniGameRewards = useCallback(
    (xp: number, coins: number, itemId: string | null) => {
      addXp(xp);
      addManyCoins(coins);
      if (itemId) {
        addItem(itemId);
      }
    },
    [addXp, addManyCoins, addItem]
  );

  if (!mounted) {
    return null;
  }

  return (
    <EnvironmentLayer
      timeOfDay={timeOfDay}
      weather={weather}
      season={season}
      className="min-h-screen py-8 px-4"
    >
      <div className="max-w-4xl mx-auto space-y-6">
        <header className="text-center">
          <div className="mb-4 flex justify-center">
            <img
              src="/logo_light_3d.png"
              alt="Ainimo"
              className="h-40 w-auto dark:hidden"
            />
            <img
              src="/logo_dark_3d.png"
              alt="Ainimo"
              className="h-40 w-auto hidden dark:block"
            />
          </div>
          <p className="text-gray-600 dark:text-gray-300">
            {t('appSubtitle', language)}
          </p>
          {/* 環境インジケーター */}
          <div className="mt-2 flex justify-center gap-2 text-lg">
            <button
              onClick={cycleWeather}
              className="hover:scale-110 transition-transform cursor-pointer"
              title={`Weather: ${weather}`}
            >
              {weatherIcon}
            </button>
            <span title={`Season: ${season}`}>{seasonIcon}</span>
          </div>
        </header>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="md:col-span-2 space-y-6">
            <AinimoPet
              ref={petRef}
              parameters={state.parameters}
              language={language}
              currentActivity={state.currentActivity}
              previousTier={previousTier}
              onInteraction={handlePetInteraction}
              personalityType={personalityState.type}
              personalityStrength={personalityState.strength}
              equipped={inventory.equipped}
            />

            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-md p-6">
              <h3 className="text-lg font-bold text-gray-800 dark:text-white mb-4">
                {t('chatWith', language)}
              </h3>
              <ChatLog messages={state.messages} language={language} />

              <form onSubmit={handleSendMessage} className="mt-4 flex gap-2">
                <input
                  type="text"
                  value={chatInput}
                  onChange={(e) => setChatInput(e.target.value)}
                  placeholder={t('typeMessage', language)}
                  maxLength={500}
                  className="flex-1 min-w-0 px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-800 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                  disabled={state.parameters.energy < Math.abs(ACTION_EFFECTS.talk.energy)}
                />
                <button
                  type="submit"
                  disabled={!chatInput.trim() || state.parameters.energy < Math.abs(ACTION_EFFECTS.talk.energy)}
                  className="px-6 py-2 bg-blue-500 text-white rounded-lg font-semibold hover:bg-blue-600 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors"
                >
                  {t('send', language)}
                </button>
              </form>
            </div>

          </div>

          <div className="space-y-6">
            <div ref={statusPanelRef} className="relative">
              <StatusPanel
                parameters={state.parameters}
                language={language}
                isLevelUpRecent={isLevelUpRecent}
                selectedTitle={selectedTitle}
              />
              <FloatingValues values={floatingValues} />
            </div>

            {/* 性格バッジ */}
            <PersonalityBadge
              personalityState={personalityState}
              totalActions={personalityData.totalActions}
              language={language}
            />

            {/* インベントリパネル */}
            <EquipmentPanel
              equipped={inventory.equipped}
              onOpenInventory={() => setIsInventoryModalOpen(true)}
              language={language}
            />
          </div>
        </div>

        {/* ツールバー（デスクトップ：セクション表示） */}
        <BottomToolbar
          onActionsClick={() => setIsActionsModalOpen(true)}
          onMiniGamesClick={() => setIsMiniGameModalOpen(true)}
          onShopClick={() => setIsShopModalOpen(true)}
          onInventoryClick={() => setIsInventoryModalOpen(true)}
          onAchievementsClick={() => setIsAchievementModalOpen(true)}
          onSettingsClick={() => setIsSettingsModalOpen(true)}
          energy={state.parameters.energy}
          coins={inventory.coins}
          unlockedCount={unlockedCount}
          totalCount={totalCount}
          language={language}
        />

        <footer className="text-center text-sm text-gray-500 dark:text-gray-400">
          <p>{t('footerMade', language)}</p>
          <p className="mt-1">{t('footerNoAI', language)}</p>
        </footer>
      </div>

      <LevelUpNotification
        isVisible={notificationState.isVisible}
        newLevel={notificationState.newLevel}
        language={language}
        onClose={hideNotification}
      />

      <AchievementModal
        isOpen={isAchievementModalOpen}
        onClose={() => setIsAchievementModalOpen(false)}
        achievements={allAchievements}
        unlockedAchievements={achievementState.unlocked}
        stats={achievementState.stats}
        parameters={state.parameters}
        selectedTitleId={achievementState.selectedTitleId}
        onSelectTitle={selectTitle}
        language={language}
      />

      <AchievementNotification
        isVisible={currentNotification !== null}
        achievement={currentNotification}
        language={language}
        onClose={dismissNotification}
      />

      <MiniGameModal
        isOpen={isMiniGameModalOpen}
        onClose={() => setIsMiniGameModalOpen(false)}
        energy={state.parameters.energy}
        tier={getIntelligenceTier(state.parameters.intelligence)}
        personalityState={personalityState}
        onEnergySpent={spendEnergy}
        onRewardsEarned={handleMiniGameRewards}
        language={language}
        activeGame={activeGame}
        canPlay={canPlay}
        startGame={startGame}
        endGame={endGame}
        cancelGame={cancelGame}
        getCooldownRemaining={getCooldownRemaining}
        flipCard={flipCard}
        resetCards={resetCards}
        beginRhythm={beginRhythm}
        hitNote={hitNote}
        missNote={missNote}
        moveTile={moveTile}
        answerQuestion={answerQuestion}
      />

      <InventoryModal
        isOpen={isInventoryModalOpen}
        onClose={() => setIsInventoryModalOpen(false)}
        language={language}
        inventory={inventory}
        onEquip={equip}
        onUnequip={unequip}
      />

      <SettingsModal
        isOpen={isSettingsModalOpen}
        onClose={() => setIsSettingsModalOpen(false)}
        language={language}
        theme={theme}
        onToggleTheme={toggleTheme}
        onToggleLanguage={toggleLanguage}
        onReset={handleReset}
      />

      <ActionsModal
        isOpen={isActionsModalOpen}
        onClose={() => setIsActionsModalOpen(false)}
        onAction={handleActionWithScroll}
        energy={state.parameters.energy}
        restLimit={state.restLimit}
        language={language}
      />

      <ShopModal
        isOpen={isShopModalOpen}
        onClose={() => setIsShopModalOpen(false)}
        language={language}
        inventory={inventory}
        onPurchase={purchaseItem}
      />
    </EnvironmentLayer>
  );
}
