import React, { useState, useEffect, useRef } from 'react';
import Scene3D from './components/Scene3D';
import SetupForm from './components/SetupForm';
import ProposalCard from './components/ProposalCard';
import { AppStage, ProposalDetails, GeneratedContent } from './types';
import { generateProposalContent } from './services/geminiService';
import { Sparkles, Volume2, MessageCircle, Share2, Download, Camera } from 'lucide-react';
import { audio } from './services/audioService';
import html2canvas from 'html2canvas';

const App: React.FC = () => {
  const [stage, setStage] = useState<AppStage>(AppStage.SETUP);
  const [generatedContent, setGeneratedContent] = useState<GeneratedContent | null>(null);
  const [loading, setLoading] = useState(false);
  const [isRecipient, setIsRecipient] = useState(false);
  const captureRef = useRef<HTMLDivElement>(null);

  // Check for shared proposal in URL on mount
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const sharedData = params.get('data');
    if (sharedData) {
      try {
        const decoded = JSON.parse(decodeURIComponent(atob(sharedData)));
        setGeneratedContent(decoded);
        setStage(AppStage.PROPOSAL);
        setIsRecipient(true);
      } catch (e) {
        console.error("Failed to decode proposal", e);
      }
    }
  }, []);

  const handleSetupSubmit = async (details: ProposalDetails) => {
    setLoading(true);
    setStage(AppStage.GENERATING);
    
    try {
      const content = await generateProposalContent(details);
      // Attach manual inputs to content object
      content.personalNote = details.personalNote;
      content.partnerGender = details.partnerGender;
      content.relationship = details.relationship;
      content.senderName = details.senderName; // Persist sender name
      
      setGeneratedContent(content);
      setStage(AppStage.PROPOSAL);
      audio.playDramaticBoom(); // Dramatic entrance for the card
    } catch (error) {
      console.error(error);
      setStage(AppStage.SETUP); // Go back on error
      alert("Oops! The love satellites are misaligned. Check the console or API Key.");
    } finally {
      setLoading(false);
    }
  };

  const handleYes = () => {
    setStage(AppStage.SUCCESS);
  };

  const getSuccessHeader = () => {
    const gender = generatedContent?.partnerGender || 'She';
    if (gender === 'He') return "He Said YES";
    if (gender === 'They') return "They Said YES";
    return "She Said YES";
  };

  const notifySender = () => {
    const text = "I said YES! ❤️";
    const whatsappUrl = `https://wa.me/?text=${encodeURIComponent(text)}`;
    window.open(whatsappUrl, '_blank');
  };

  const handleDownload = async () => {
    if (!captureRef.current) return;
    audio.playClick();
    
    try {
      // Temporarily remove shadow and animation for cleaner capture
      const element = captureRef.current;
      
      const canvas = await html2canvas(element, {
        backgroundColor: '#020617', // Force dark background
        scale: 2, // High resolution
        logging: false,
        useCORS: true,
      });

      const image = canvas.toDataURL('image/png');
      const link = document.createElement('a');
      link.href = image;
      link.download = `cosmic-valentine-${Date.now()}.png`;
      link.click();
    } catch (e) {
      console.error("Capture failed", e);
      alert("Could not save image. Try taking a screenshot!");
    }
  };

  return (
    <div className="relative w-full h-screen overflow-hidden flex items-center justify-center bg-[#020617]">
      <div className="absolute inset-0 bg-gradient-to-br from-slate-950 via-[#0a0a1a] to-black opacity-80 z-0 pointer-events-none" />

      {/* 3D Background */}
      <Scene3D 
        intensity={stage === AppStage.PROPOSAL || stage === AppStage.SUCCESS ? 1 : 0} 
        isSuccess={stage === AppStage.SUCCESS}
      />

      {/* Audio Hint for Recipients */}
      {isRecipient && stage === AppStage.PROPOSAL && (
        <div className="absolute top-6 right-6 z-30 text-white/40 text-xs tracking-widest uppercase flex items-center gap-2 animate-pulse font-sans">
            <Volume2 size={12} /> Sound On
        </div>
      )}

      {/* Content Layer */}
      <main className="z-10 w-full h-full flex items-center justify-center p-4">
        
        {stage === AppStage.SETUP && (
          <SetupForm onSubmit={handleSetupSubmit} isLoading={loading} />
        )}

        {stage === AppStage.GENERATING && (
          <div className="text-center glass-panel p-8 md:p-12 rounded-2xl animate-pulse border-white/5 mx-4">
             <Sparkles className="mx-auto text-indigo-400 mb-6 animate-spin" size={40} />
             <h2 className="text-2xl md:text-3xl font-serif italic text-white mb-2">Consulting the Stars...</h2>
             <p className="text-slate-400 font-light tracking-wide text-xs md:text-sm">Crafting the perfect words.</p>
          </div>
        )}

        {stage === AppStage.PROPOSAL && generatedContent && (
          <ProposalCard 
            content={generatedContent} 
            onYes={handleYes} 
            isRecipient={isRecipient}
          />
        )}

        {stage === AppStage.SUCCESS && (
          <div className="z-50 flex flex-col items-center animate-[float_5s_ease-in-out_infinite] w-full max-w-2xl px-2">
             
             {/* Capture Area */}
             <div ref={captureRef} className="w-full bg-slate-900/60 backdrop-blur-2xl border border-white/10 p-6 md:p-10 rounded-2xl text-center shadow-2xl mb-6 md:mb-8 relative overflow-hidden group">
                 <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-rose-500 to-transparent opacity-50"></div>
                 
                 {/* Main Success Declaration */}
                 <h1 className="text-3xl md:text-6xl font-serif italic text-transparent bg-clip-text bg-gradient-to-b from-white to-rose-200 drop-shadow-[0_0_40px_rgba(225,29,72,0.4)] pb-4 mb-2">
                   {getSuccessHeader()}
                 </h1>
                 
                 {/* Divider */}
                 <div className="flex items-center justify-center gap-3 opacity-50 mb-6 md:mb-8">
                    <div className="h-px w-12 bg-rose-400"></div>
                    <div className="h-1.5 w-1.5 rounded-full bg-rose-400"></div>
                    <div className="h-px w-12 bg-rose-400"></div>
                 </div>

                 {/* The Personal Note */}
                 <div className="relative">
                    <Sparkles className="absolute -top-4 -left-2 text-rose-300/30" size={20} />
                    <p className="text-lg md:text-2xl text-slate-200 leading-relaxed font-serif font-light italic px-2 md:px-4">
                       "{generatedContent?.personalNote || generatedContent?.poem || "Love Wins."}"
                    </p>
                    <Sparkles className="absolute -bottom-4 -right-2 text-rose-300/30" size={20} />
                 </div>

                 <div className="mt-8 md:mt-10 pt-6 border-t border-white/5">
                   <p className="text-[9px] md:text-[10px] text-slate-500 uppercase tracking-[0.3em] font-sans opacity-70">
                     {generatedContent?.relationship === 'friend' ? 'Friendship Sealed • Forever' : 'Official • Cosmic Valentine'}
                   </p>
                 </div>
             </div>

             {/* Action Buttons */}
             <div className="flex flex-col sm:flex-row gap-4 w-full justify-center px-4">
                 {isRecipient && (
                    <button
                        onClick={notifySender}
                        className="flex-1 flex items-center justify-center gap-2 bg-white text-rose-900 px-6 py-3 rounded-full font-serif italic text-lg shadow-[0_0_25px_rgba(255,255,255,0.4)] hover:scale-105 transition-transform w-full"
                    >
                        <MessageCircle size={20} />
                        Tell {generatedContent?.senderName || "them"} YES!
                    </button>
                 )}
                 
                 <button
                    onClick={handleDownload}
                    className="flex-1 flex items-center justify-center gap-2 bg-white/10 hover:bg-white/20 text-white border border-white/20 px-6 py-3 rounded-full font-sans text-sm tracking-wide uppercase transition-all backdrop-blur-sm w-full"
                 >
                    <Camera size={18} />
                    Save Memory
                 </button>
             </div>
          </div>
        )}
      </main>
    </div>
  );
};

export default App;