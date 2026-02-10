import React, { useState } from 'react';
import { ProposalDetails } from '../types';
import { Loader2, Heart, Music2, Users, Star } from 'lucide-react';
import { audio } from '../services/audioService';

interface SetupFormProps {
  onSubmit: (details: ProposalDetails) => void;
  isLoading: boolean;
}

const MAX_NOTE_LENGTH = 1000;

const SetupForm: React.FC<SetupFormProps> = ({ onSubmit, isLoading }) => {
  const [formData, setFormData] = useState<ProposalDetails>({
    partnerName: '',
    senderName: '',
    memories: '',
    vibe: 'romantic',
    partnerGender: 'She',
    personalNote: '',
    relationship: 'partner'
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    audio.playClick();
    audio.startAmbient(); // Start music on interaction
    onSubmit(formData);
  };

  const handleInteraction = () => {
    audio.playClick();
  };

  const noteLength = formData.personalNote?.length || 0;
  const isNearLimit = noteLength > MAX_NOTE_LENGTH * 0.9;

  return (
    <div className="z-10 relative w-full max-w-4xl p-4 sm:p-5 md:p-8 glass-panel rounded-xl sm:rounded-2xl shadow-2xl my-4 mx-2 sm:mx-0">
      <div className="text-center mb-4 sm:mb-6 md:mb-8">
        <h1 className="text-2xl sm:text-3xl md:text-4xl font-serif italic text-white mb-2 flex items-center justify-center gap-2 sm:gap-3 flex-col sm:flex-row">
          <Heart size={20} className="sm:w-6 sm:h-6" />
          Proposal Engine
        </h1>
        <div className="h-px w-12 sm:w-16 bg-gradient-to-r from-transparent via-rose-500 to-transparent mx-auto mt-2"></div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4 sm:space-y-5 md:space-y-6">
        
        {/* Relationship Toggle - Refined Pill Shape */}
        <div className="flex bg-slate-900/60 p-1 sm:p-1.5 rounded-full border border-white/10 mx-auto max-w-xs shadow-[inset_0_2px_4px_rgba(0,0,0,0.3)]">
            <button
                type="button"
                onClick={() => {
                    handleInteraction();
                    setFormData({ ...formData, relationship: 'partner', vibe: 'romantic' });
                }}
                className={`flex-1 flex items-center justify-center gap-1.5 sm:gap-2 py-2 sm:py-2.5 rounded-full text-[11px] sm:text-sm tracking-wide transition-all duration-300 ${
                    formData.relationship === 'partner' 
                    ? 'bg-gradient-to-r from-rose-600 to-pink-600 text-white shadow-lg shadow-rose-900/20' 
                    : 'text-slate-400 hover:text-white hover:bg-white/5'
                }`}
            >
                <Heart size={12} className="sm:w-[14px] sm:h-[14px]" fill={formData.relationship === 'partner' ? "currentColor" : "none"} /> 
                <span className="hidden sm:inline">Partner</span>
                <span className="sm:hidden">Me</span>
            </button>
            <button
                type="button"
                onClick={() => {
                    handleInteraction();
                    setFormData({ ...formData, relationship: 'friend', vibe: 'funny' });
                }}
                className={`flex-1 flex items-center justify-center gap-1.5 sm:gap-2 py-2 sm:py-2.5 rounded-full text-[11px] sm:text-sm tracking-wide transition-all duration-300 ${
                    formData.relationship === 'friend' 
                    ? 'bg-gradient-to-r from-indigo-500 to-purple-600 text-white shadow-lg shadow-indigo-900/20' 
                    : 'text-slate-400 hover:text-white hover:bg-white/5'
                }`}
            >
                <Users size={12} className="sm:w-[14px] sm:h-[14px]" /> 
                <span className="hidden sm:inline">Bestie</span>
                <span className="sm:hidden">BF</span>
            </button>
        </div>

        {/* Names & Gender Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-12 gap-2 sm:gap-3 md:gap-4">
             <div className="sm:col-span-1 md:col-span-5">
                <label className="block text-[9px] sm:text-[10px] uppercase tracking-widest text-slate-400 mb-1.5 sm:mb-2 ml-1">Your Name</label>
                <input
                    required
                    type="text"
                    onFocus={handleInteraction}
                    className="w-full bg-black/20 border border-white/10 rounded-lg p-2.5 sm:p-3 text-sm sm:text-base md:text-sm text-white focus:outline-none focus:border-rose-500/50 focus:bg-white/5 transition-colors placeholder-slate-600 font-sans"
                    placeholder="Your name"
                    value={formData.senderName}
                    onChange={(e) => setFormData({ ...formData, senderName: e.target.value })}
                />
            </div>
            
            <div className="sm:col-span-1 md:col-span-5">
                <label className="block text-[9px] sm:text-[10px] uppercase tracking-widest text-slate-400 mb-1.5 sm:mb-2 ml-1">
                    <span className="sm:hidden">{formData.relationship === 'partner' ? 'Partner' : 'Friend'}</span>
                    <span className="hidden sm:inline">{formData.relationship === 'partner' ? 'Partner Name' : 'Friend Name'}</span>
                </label>
                <input
                    required
                    type="text"
                    onFocus={handleInteraction}
                    className="w-full bg-black/20 border border-white/10 rounded-lg p-2.5 sm:p-3 text-sm sm:text-base md:text-sm text-white focus:outline-none focus:border-rose-500/50 focus:bg-white/5 transition-colors placeholder-slate-600 font-sans"
                    placeholder="Their name"
                    value={formData.partnerName}
                    onChange={(e) => setFormData({ ...formData, partnerName: e.target.value })}
                />
            </div>

            <div className="sm:col-span-2 md:col-span-2">
                 <label className="block text-[9px] sm:text-[10px] uppercase tracking-widest text-slate-400 mb-1.5 sm:mb-2 ml-1">Gender</label>
                 <select 
                    className="w-full bg-black/20 border border-white/10 rounded-lg p-2.5 sm:p-3 text-sm sm:text-base md:text-sm text-white focus:outline-none focus:border-rose-500/50 focus:bg-white/5 transition-colors"
                    value={formData.partnerGender}
                    onChange={(e) => {
                        handleInteraction();
                        setFormData({ ...formData, partnerGender: e.target.value as any });
                    }}
                 >
                    <option value="She">She</option>
                    <option value="He">He</option>
                    <option value="They">They</option>
                 </select>
            </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 sm:gap-4 md:gap-6">
            <div>
              <label className="block text-[9px] sm:text-[10px] uppercase tracking-widest text-slate-400 mb-1.5 sm:mb-2 ml-1">
                 {formData.vibe === 'roast' ? 'Why roast them?' : 'Why them?'}
              </label>
              <textarea
                required
                onFocus={handleInteraction}
                className="w-full bg-black/20 border border-white/10 rounded-lg p-3 sm:p-4 text-white focus:outline-none focus:border-rose-500/50 focus:bg-white/5 transition-colors h-24 sm:h-28 md:h-32 resize-none placeholder-slate-600 text-sm md:text-sm leading-relaxed font-sans"
                placeholder={formData.vibe === 'roast' ? "Messy, snores..." : "Their laugh, obsessed with..."}
                value={formData.memories}
                onChange={(e) => setFormData({ ...formData, memories: e.target.value })}
              />
            </div>

            <div className="flex flex-col">
                <div className="flex justify-between items-center mb-1.5 sm:mb-2 ml-1">
                    <label className="block text-[9px] sm:text-[10px] uppercase tracking-widest text-slate-400">Personal Note</label>
                    <span className={`text-[8px] sm:text-[9px] ${isNearLimit ? 'text-rose-400' : 'text-slate-500'}`}>
                        {noteLength}/{MAX_NOTE_LENGTH}
                    </span>
                </div>
                <textarea
                    onFocus={handleInteraction}
                    maxLength={MAX_NOTE_LENGTH}
                    className={`w-full flex-grow bg-white/5 border rounded-lg p-3 sm:p-4 text-slate-200 focus:outline-none focus:border-rose-500/50 transition-colors resize-none placeholder-white/10 font-serif italic text-sm md:text-base ${isNearLimit ? 'border-rose-500/50' : 'border-white/10'}`}
                    placeholder="From the heart..."
                    value={formData.personalNote}
                    onChange={(e) => setFormData({ ...formData, personalNote: e.target.value })}
                    style={{ height: '6rem' }}
                />
            </div>
        </div>

        <div>
          <label className="block text-[9px] sm:text-[10px] uppercase tracking-widest text-slate-400 mb-2 ml-1">The Vibe</label>
          <div className="flex flex-wrap gap-1.5 sm:gap-2">
            {(['romantic', 'funny', 'poetic', 'nerdy', 'roast'] as const).map((v) => (
              <button
                key={v}
                type="button"
                onClick={() => {
                    handleInteraction();
                    setFormData({ ...formData, vibe: v });
                }}
                className={`py-1.5 sm:py-2 px-2.5 sm:px-3 md:px-4 rounded-lg text-[9px] sm:text-xs font-medium uppercase tracking-wider border transition-all ${
                  formData.vibe === v 
                    ? 'bg-slate-800 border-white/20 text-white shadow-lg ring-1 ring-white/10' 
                    : 'bg-transparent border-white/5 text-slate-500 hover:border-white/10 hover:text-slate-300'
                }`}
              >
                {v === 'roast' ? '🔥 Roast' : v.charAt(0).toUpperCase() + v.slice(1)}
              </button>
            ))}
          </div>
        </div>

        <button
          type="submit"
          disabled={isLoading}
          className="w-full bg-gradient-to-r from-rose-700 to-indigo-700 hover:from-rose-600 hover:to-indigo-600 text-white font-medium tracking-wide py-3 sm:py-4 rounded-lg mt-3 sm:mt-4 transition-all shadow-lg hover:shadow-rose-900/20 disabled:opacity-50 disabled:cursor-not-allowed text-xs sm:text-sm flex items-center justify-center gap-2 group border border-white/10 active:scale-95"
        >
          {isLoading ? (
            <>
              <Loader2 className="animate-spin text-white/50" size={16} className="sm:w-[18px] sm:h-[18px]" /> 
              <span className="hidden sm:inline">Connecting to Cosmos...</span>
              <span className="sm:hidden">Generating...</span>
            </>
          ) : (
            <>
                <Star size={14} className="sm:w-4 sm:h-4 text-yellow-200 group-hover:rotate-180 transition-transform duration-500" /> 
                <span className="hidden sm:inline">Generate Experience</span>
                <span className="sm:hidden">Generate</span>
            </>
          )}
        </button>
      </form>
    </div>
  );
};

export default SetupForm;