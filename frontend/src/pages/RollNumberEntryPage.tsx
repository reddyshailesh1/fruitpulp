import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { OrangeSliceIcon } from '../components/JuiceMascot';
import { GraduationCap, ArrowRight, Loader2, AlertCircle } from 'lucide-react';
import type { IVerifyData } from '../types';

interface RollNumberEntryPageProps {
  onVerified: (data: IVerifyData) => void;
  apiVerify: (rollNumber: string) => Promise<IVerifyData>;
}

export const RollNumberEntryPage: React.FC<RollNumberEntryPageProps> = ({
  onVerified,
  apiVerify,
}) => {
  const [rollNumber, setRollNumber] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    const cleaned = rollNumber.trim().replace(/\s+/g, '').toUpperCase();
    if (!cleaned) {
      setError('Please enter your college roll number.');
      return;
    }

    if (cleaned.length < 3 || cleaned.length > 25) {
      setError('Roll number must be between 3 and 25 characters.');
      return;
    }

    setLoading(true);
    try {
      const data = await apiVerify(cleaned);
      onVerified(data);
    } catch (err: any) {
      setError(err.message || 'Verification failed. Please check your connection.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col items-center justify-center py-6 px-4 max-w-md mx-auto w-full space-y-6">
      <div className="text-center space-y-2">
        <div className="inline-flex p-3 rounded-2xl bg-brand-lightOrange/60 border border-brand-orange/30 shadow-sm text-brand-deep">
          <GraduationCap className="w-8 h-8" />
        </div>
        <h2 className="text-2xl font-black text-brand-dark tracking-tight">
          Enter Your Roll Number
        </h2>
        <p className="text-xs text-brand-dark/70 max-w-xs mx-auto">
          No sign-up required. Your college roll number is your unique participation ID.
        </p>
      </div>

      <form onSubmit={handleSubmit} className="w-full space-y-4">
        <div className="space-y-1.5 text-left">
          <label
            htmlFor="rollInput"
            className="text-xs font-black uppercase tracking-wider text-brand-dark/80 flex items-center justify-between"
          >
            <span>College Roll Number</span>
            <span className="text-[10px] text-gray-400 font-normal">e.g. 21CS045</span>
          </label>

          <div className="relative">
            <input
              id="rollInput"
              type="text"
              autoFocus
              autoCapitalize="characters"
              autoCorrect="off"
              spellCheck="false"
              value={rollNumber}
              onChange={(e) => {
                setRollNumber(e.target.value.toUpperCase());
                if (error) setError(null);
              }}
              placeholder="ENTER ROLL NUMBER..."
              disabled={loading}
              className="w-full px-4 py-3.5 rounded-2xl bg-white border-2 border-brand-orange/30 focus:border-brand-deep focus:ring-4 focus:ring-brand-orange/15 outline-none font-mono text-base font-bold tracking-wider uppercase text-brand-dark transition-all placeholder:text-gray-300 placeholder:font-sans placeholder:normal-case placeholder:font-normal"
            />
            <div className="absolute right-3.5 top-1/2 -translate-y-1/2 pointer-events-none">
              <OrangeSliceIcon className="w-5 h-5 opacity-40" />
            </div>
          </div>
        </div>

        {error && (
          <motion.div
            initial={{ opacity: 0, y: -5 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex items-start gap-2 p-3 rounded-xl bg-red-50 border border-red-200 text-red-700 text-xs text-left"
          >
            <AlertCircle className="w-4 h-4 shrink-0 mt-0.5 text-red-500" />
            <p className="font-medium">{error}</p>
          </motion.div>
        )}

        <motion.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          type="submit"
          disabled={loading || !rollNumber.trim()}
          className="w-full py-4 px-6 rounded-2xl bg-gradient-to-r from-brand-orange to-brand-deep text-white font-extrabold text-sm tracking-wide shadow-brand flex items-center justify-center gap-2 transition-all disabled:opacity-50 disabled:pointer-events-none"
        >
          {loading ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin" />
              <span>Verifying With Orange Pulp DB...</span>
            </>
          ) : (
            <>
              <span>Continue to Mystery Boxes</span>
              <ArrowRight className="w-4 h-4" />
            </>
          )}
        </motion.button>
      </form>

      <div className="text-[11px] text-brand-dark/50 text-center space-y-1">
        <p>🔒 One participation record per college roll number.</p>
        <p>If you have an unfinished game, your progress will be restored.</p>
      </div>
    </div>
  );
};
