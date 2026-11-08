import React, { useState, useEffect, useCallback } from 'react';
import { Header } from './components/Header';
import { Footer } from './components/Footer';
import { LandingPage } from './pages/LandingPage';
import { RollNumberEntryPage } from './pages/RollNumberEntryPage';
import { MysteryBoxesPage } from './pages/MysteryBoxesPage';
import { ScratchCardPage } from './pages/ScratchCardPage';
import { FinalResultPage } from './pages/FinalResultPage';
import { AlreadyCompletedPage } from './pages/AlreadyCompletedPage';
import { api, getStoredToken, getStoredRollNumber, clearStoredToken } from './services/api';
import type {
  GameView,
  IVerifyData,
  ISelectBoxData,
  IReward,
} from './types';
import { Loader2 } from 'lucide-react';

export const App: React.FC = () => {
  const [view, setView] = useState<GameView>('LANDING');
  const [isInitializing, setIsInitializing] = useState(true);

  // Game state
  const [rollNumber, setRollNumber] = useState<string | null>(null);
  const [chancesUsed, setChancesUsed] = useState<number>(0);
  const [selectedBoxes, setSelectedBoxes] = useState<number[]>([]);
  const [rewards, setRewards] = useState<IReward[]>([]);
  const [currentScratchReward, setCurrentScratchReward] = useState<IReward | null>(null);
  const [finalDiscount, setFinalDiscount] = useState<number | null>(null);
  const [finalRewardCode, setFinalRewardCode] = useState<string | null>(null);

  // Restore session from backend on page reload or visit
  const restoreSession = useCallback(async () => {
    const token = getStoredToken();
    const storedRoll = getStoredRollNumber();

    if (!token) {
      setIsInitializing(false);
      return;
    }

    try {
      const statusData = await api.getStatus();
      setRollNumber(statusData.rollNumber);
      setChancesUsed(statusData.chancesUsed);
      setSelectedBoxes(statusData.selectedBoxes || []);
      setRewards(statusData.rewards || []);
      setFinalDiscount(statusData.finalDiscount);
      setFinalRewardCode(statusData.finalRewardCode);

      if (statusData.status === 'COMPLETED') {
        setView('ALREADY_COMPLETED');
      } else if (statusData.chancesUsed === 0) {
        setView('MYSTERY_BOXES');
      } else if (statusData.chancesUsed < 3) {
        // In-progress: return to mystery box grid to pick next box
        setView('MYSTERY_BOXES');
      }
    } catch (error) {
      console.warn('Session restoration failed or expired:', error);
      clearStoredToken();
      if (storedRoll) setRollNumber(null);
      setView('LANDING');
    } finally {
      setIsInitializing(false);
    }
  }, []);

  useEffect(() => {
    restoreSession();
  }, [restoreSession]);

  // Handler: Roll number verified
  const handleRollVerified = (data: IVerifyData) => {
    setRollNumber(data.rollNumber);
    setChancesUsed(data.chancesUsed);
    setSelectedBoxes(data.selectedBoxes || []);
    setRewards(data.rewards || []);
    setFinalDiscount(data.finalDiscount);
    setFinalRewardCode(data.finalRewardCode);

    if (data.status === 'COMPLETED') {
      setView('ALREADY_COMPLETED');
    } else {
      setView('MYSTERY_BOXES');
    }
  };

  // Handler: Box selected from 3x3 grid
  const handleBoxSelected = (data: ISelectBoxData) => {
    setCurrentScratchReward(data.reward);
    setChancesUsed(data.chancesUsed);
    setSelectedBoxes((prev) =>
      prev.includes(data.reward.boxNumber) ? prev : [...prev, data.reward.boxNumber]
    );
    setRewards((prev) => [...prev, data.reward]);
    if (data.finalDiscount !== null) {
      setFinalDiscount(data.finalDiscount);
      setFinalRewardCode(data.finalRewardCode);
    }
    // Transition to scratch card
    setView('SCRATCH_CARD');
  };

  // Handler: Student chooses to move directly to next chance
  const handleMoveToNextChance = () => {
    setView('MYSTERY_BOXES');
  };

  // Handler: Student chooses to utilize their current revealed coupon
  const handleUtilizeCurrentCoupon = async () => {
    try {
      const result = await api.claimCurrent();
      setFinalDiscount(result.finalDiscount);
      setFinalRewardCode(result.finalRewardCode);
      if (result.rewards) {
        setRewards(result.rewards);
      }
      setView('FINAL_RESULT');
    } catch (err: any) {
      console.error('Failed to claim current coupon:', err);
      // If error or already claimed, transition to result
      setView('FINAL_RESULT');
    }
  };

  if (isInitializing) {
    return (
      <div className="min-h-screen bg-brand-cream flex flex-col items-center justify-center p-4">
        <div className="text-center space-y-3">
          <Loader2 className="w-10 h-10 animate-spin text-brand-orange mx-auto" />
          <p className="text-xs font-bold text-brand-deep tracking-wider uppercase">
            Loading Orange Pulp Juice Point...
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-brand-cream flex flex-col font-sans text-brand-dark selection:bg-brand-orange selection:text-white">
      <Header rollNumber={rollNumber} />

      <main className="flex-1 flex flex-col items-center justify-center">
        {view === 'LANDING' && (
          <LandingPage onStart={() => setView('ROLL_ENTRY')} />
        )}

        {view === 'ROLL_ENTRY' && (
          <RollNumberEntryPage
            onVerified={handleRollVerified}
            apiVerify={api.verifyStudent}
          />
        )}

        {view === 'MYSTERY_BOXES' && (
          <MysteryBoxesPage
            chancesUsed={chancesUsed}
            selectedBoxes={selectedBoxes}
            onBoxSelected={handleBoxSelected}
            apiSelectBox={api.selectBox}
          />
        )}

        {view === 'SCRATCH_CARD' && currentScratchReward && (
          <ScratchCardPage
            reward={currentScratchReward}
            chanceNumber={chancesUsed}
            chancesUsed={chancesUsed}
            isFinalChance={chancesUsed === 3}
            onMoveToNextChance={handleMoveToNextChance}
            onUtilizeCurrentCoupon={handleUtilizeCurrentCoupon}
          />
        )}

        {view === 'FINAL_RESULT' && (
          <FinalResultPage
            finalDiscount={finalDiscount || (rewards[rewards.length - 1]?.discount ?? 0)}
            finalRewardCode={finalRewardCode || (rewards[rewards.length - 1]?.rewardCode ?? 'OP-CLAIMED')}
            rewards={rewards}
            rollNumber={rollNumber || 'STUDENT'}
          />
        )}

        {view === 'ALREADY_COMPLETED' && (
          <AlreadyCompletedPage
            finalDiscount={finalDiscount}
            finalRewardCode={finalRewardCode}
            rewards={rewards}
            rollNumber={rollNumber || 'STUDENT'}
          />
        )}
      </main>

      <Footer />
    </div>
  );
};

export default App;
