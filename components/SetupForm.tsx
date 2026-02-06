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
    <div className="z-10 relative w-full max-w-4xl p-5 md:p-8 glass-panel rounded-2xl shadow-2xl my-4">
      <div className="text-center mb-6 md:mb-8">
        <h1 className="text-3xl md:text-4xl font-serif italic text-white mb-2 flex items-center justify-center gap-3">
          Proposal Engine
        </h1>
        <div className="h-px w-16 bg-gradient-to-r from-transparent via-rose-500 to-transparent mx-auto"></div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-5 md:space-y-6">
        
        {/* Relationship Toggle - Refined Pill Shape */}
        <div className="flex bg-slate-900/60 p-1.5 rounded-full border border-white/10 mx-auto max-w-xs shadow-[inset_0_2px_4px_rgba(0,0,0,0.3)]">
            <button
                type="button"
                onClick={() => {
                    handleInteraction();
                    setFormData({ ...formData, relationship: 'partner', vibe: 'romantic' });
                }}
                className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-full text-sm tracking-wide transition-all duration-300 ${
                    formData.relationship === 'partner' 
                    ? 'bg-gradient-to-r from-rose-600 to-pink-600 text-white shadow-lg shadow-rose-900/20' 
                    : 'text-slate-400 hover:text-white hover:bg-white/5'
                }`}
            >
                <Heart size={14} fill={formData.relationship === 'partner' ? "currentColor" : "none"} /> Partner
            </button>
            <button
                type="button"
                onClick={() => {
                    handleInteraction();
                    setFormData({ ...formData, relationship: 'friend', vibe: 'funny' });
                }}
                className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-full text-sm tracking-wide transition-all duration-300 ${
                    formData.relationship === 'friend' 
                    ? 'bg-gradient-to-r from-indigo-500 to-purple-600 text-white shadow-lg shadow-indigo-900/20' 
                    : 'text-slate-400 hover:text-white hover:bg-white/5'
                }`}
            >
                <Users size={14} /> Bestie
            </button>
        </div>

        {/* Names & Gender Grid */}
        <div className="grid grid-cols-1 md:grid-cols-12 gap-4">
             <div className="md:col-span-5">
                <label className="block text-[10px] uppercase tracking-widest text-slate-400 mb-2 ml-1">Your Name</label>
                <input
                    required
                    type="text"
                    onFocus={handleInteraction}
                    className="w-full bg-black/20 border border-white/10 rounded-lg p-3 text-base md:text-sm text-white focus:outline-none focus:border-rose-500/50 focus:bg-white/5 transition-colors placeholder-slate-600 font-sans"
                    placeholder="Enter your name"
                    value={formData.senderName}
                    onChange={(e) => setFormData({ ...formData, senderName: e.target.value })}
                />
            </div>
            
            <div className="md:col-span-5">
                <label className="block text-[10px] uppercase tracking-widest text-slate-400 mb-2 ml-1">
                    {formData.relationship === 'partner' ? 'Partner Name' : 'Friend Name'}
                </label>
                <input
                    required
                    type="text"
                    onFocus={handleInteraction}
                    className="w-full bg-black/20 border border-white/10 rounded-lg p-3 text-base md:text-sm text-white focus:outline-none focus:border-rose-500/50 focus:bg-white/5 transition-colors placeholder-slate-600 font-sans"
                    placeholder="Enter their name"
                    value={formData.partnerName}
                    onChange={(e) => setFormData({ ...formData, partnerName: e.target.value })}
                />
            </div>

            <div className="md:col-span-2">
                 <label className="block text-[10px] uppercase tracking-widest text-slate-400 mb-2 ml-1">Gender</label>
                 <select 
                    className="w-full bg-black/20 border border-white/10 rounded-lg p-3 text-base md:text-sm text-white focus:outline-none focus:border-rose-500/50 focus:bg-white/5 transition-colors"
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

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6">
            <div>
              <label className="block text-[10px] uppercase tracking-widest text-slate-400 mb-2 ml-1">
                 {formData.vibe === 'roast' ? 'Why roast them?' : 'Why them?'}
              </label>
              <textarea
                required
                onFocus={handleInteraction}
                className="w-full bg-black/20 border border-white/10 rounded-lg p-4 text-white focus:outline-none focus:border-rose-500/50 focus:bg-white/5 transition-colors h-32 resize-none placeholder-slate-600 text-base md:text-sm leading-relaxed font-sans"
                placeholder={formData.vibe === 'roast' ? "They are messy, they snore..." : "The way they laugh, their obsession with..."}
                value={formData.memories}
                onChange={(e) => setFormData({ ...formData, memories: e.target.value })}
              />
            </div>

            <div className="flex flex-col">
                <div className="flex justify-between items-center mb-2 ml-1">
                    <label className="block text-[10px] uppercase tracking-widest text-slate-400">Personal Note (Optional)</label>
                    <span className={`text-[10px] ${isNearLimit ? 'text-rose-400' : 'text-slate-500'}`}>
                        {noteLength}/{MAX_NOTE_LENGTH}
                    </span>
                </div>
                <textarea
                    onFocus={handleInteraction}
                    maxLength={MAX_NOTE_LENGTH}
                    className={`w-full flex-grow bg-white/5 border rounded-lg p-4 text-slate-200 focus:outline-none focus:border-rose-500/50 transition-colors resize-none placeholder-white/10 font-serif italic text-lg md:text-lg text-base ${isNearLimit ? 'border-rose-500/50' : 'border-white/10'}`}
                    placeholder="Write something from the heart..."
                    value={formData.personalNote}
                    onChange={(e) => setFormData({ ...formData, personalNote: e.target.value })}
                    style={{ height: '8rem' }}
                />
            </div>
        </div>

        <div>
          <label className="block text-[10px] uppercase tracking-widest text-slate-400 mb-2 ml-1">The Vibe</label>
          <div className="flex flex-wrap gap-2">
            {(['romantic', 'funny', 'poetic', 'nerdy', 'roast'] as const).map((v) => (
              <button
                key={v}
                type="button"
                onClick={() => {
                    handleInteraction();
                    setFormData({ ...formData, vibe: v });
                }}
                className={`flex-1 min-w-[80px] py-2 px-3 md:px-4 rounded-lg text-xs font-medium uppercase tracking-wider border transition-all ${
                  formData.vibe === v 
                    ? 'bg-slate-800 border-white/20 text-white shadow-lg ring-1 ring-white/10' 
                    : 'bg-transparent border-white/5 text-slate-500 hover:border-white/10 hover:text-slate-300'
                }`}
              >
                {v === 'roast' ? 'Roast' : v}
              </button>
            ))}
          </div>
        </div>

        <button
          type="submit"
          disabled={isLoading}
          className="w-full bg-gradient-to-r from-rose-700 to-indigo-700 hover:from-rose-600 hover:to-indigo-600 text-white font-medium tracking-wide py-4 rounded-lg mt-4 transition-all shadow-lg hover:shadow-rose-900/20 disabled:opacity-50 disabled:cursor-not-allowed text-sm flex items-center justify-center gap-2 group border border-white/10"
        >
          {isLoading ? (
            <>
              <Loader2 className="animate-spin text-white/50" size={18} /> Connecting to Cosmos...
            </>
          ) : (
            <>
                <Star size={16} className="text-yellow-200 group-hover:rotate-180 transition-transform duration-500" /> Generate Experience
            </>
          )}
        </button>
      </form>
    </div>
  );
};

export default SetupForm;