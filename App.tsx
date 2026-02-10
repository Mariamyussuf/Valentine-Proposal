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
  const [replyMessage, setReplyMessage] = useState('');
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

  const shortenUrl = async (url: string): Promise<string> => {
    try {
      const response = await fetch(`https://is.gd/create.php?format=json&url=${encodeURIComponent(url)}`);
      if (!response.ok) throw new Error('Failed to shorten');
      const data = await response.json();
      return data.shorturl || url;
    } catch (error) {
      console.error('URL shortening failed:', error);
      return url;
    }
  };

  const notifySender = async () => {
    if (!captureRef.current) return;
    audio.playClick();
    
    try {
      const element = captureRef.current;
      
      // Temporarily fix gradient text for rendering
      const header = element.querySelector('h1');
      const originalClass = header?.className;
      if (header) {
        header.className = 'text-2xl sm:text-4xl md:text-6xl font-serif italic text-white pb-2 sm:pb-4 mb-2 px-2';
      }
      
      const canvas = await html2canvas(element, {
        backgroundColor: '#020617',
        scale: 2,
        logging: false,
        useCORS: true,
      });

      // Restore original styling
      if (header && originalClass) {
        header.className = originalClass;
      }

      canvas.toBlob(async (blob) => {
        if (!blob) return;
        
        const file = new File([blob], 'i-said-yes.png', { type: 'image/png' });
        const longUrl = `${window.location.origin}${window.location.pathname}?data=${btoa(encodeURIComponent(JSON.stringify(generatedContent)))}`;
        const shortUrl = await shortenUrl(longUrl);
        
        const messageText = replyMessage ? `${replyMessage}\n\n` : '';
        const confirmText = 'I said YES! ❤️';
        
        // Try native Web Share API first (works best on mobile)
        if (navigator.share) {
          try {
            await navigator.share({
              title: 'I said YES!',
              text: `${messageText}${confirmText}`,
              url: shortUrl,
              files: [file]
            });
          } catch (error) {
            // User cancelled share, that's ok
            console.log('Share cancelled');
          }
        } else {
          // Fallback for desktop: send to WhatsApp with text and link
          const text = `${messageText}${confirmText}\n\n${shortUrl}`;
          const whatsappUrl = `https://wa.me/?text=${encodeURIComponent(text)}`;
          window.open(whatsappUrl, '_blank');
        }
      });
    } catch (error) {
      console.error('Share failed:', error);
      // Fallback: just open WhatsApp with text
      const text = replyMessage ? `${replyMessage}\n\nI said YES! ❤️` : 'I said YES! ❤️';
      const whatsappUrl = `https://wa.me/?text=${encodeURIComponent(text)}`;
      window.open(whatsappUrl, '_blank');
    }
  };

  const handleDownload = async () => {
    if (!captureRef.current) return;
    audio.playClick();
    
    try {
      const element = captureRef.current;
      
      // Temporarily fix gradient text for rendering
      const header = element.querySelector('h1');
      const originalClass = header?.className;
      if (header) {
        header.className = 'text-2xl sm:text-4xl md:text-6xl font-serif italic text-white pb-2 sm:pb-4 mb-2 px-2';
      }
      
      const canvas = await html2canvas(element, {
        backgroundColor: '#020617', // Force dark background
        scale: 2, // High resolution
        logging: false,
        useCORS: true,
      });

      // Restore original styling
      if (header && originalClass) {
        header.className = originalClass;
      }

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
    <div className="relative w-full h-screen overflow-hidden flex items-center justify-center bg-[#020617] max-h-[100dvh]">
      <div className="absolute inset-0 bg-gradient-to-br from-slate-950 via-[#0a0a1a] to-black opacity-80 z-0 pointer-events-none" />

      {/* 3D Background */}
      <Scene3D 
        intensity={stage === AppStage.PROPOSAL || stage === AppStage.SUCCESS ? 1 : 0} 
        isSuccess={stage === AppStage.SUCCESS}
      />

      {/* Audio Hint for Recipients */}
      {isRecipient && stage === AppStage.PROPOSAL && (
        <div className="absolute top-3 sm:top-6 right-3 sm:right-6 z-30 text-white/40 text-[10px] sm:text-xs tracking-widest uppercase flex items-center gap-2 animate-pulse font-sans">
            <Volume2 size={10} className="sm:w-3 sm:h-3" /> Sound On
        </div>
      )}

      {/* Content Layer */}
      <main className="z-10 w-full h-full flex items-center justify-center p-3 sm:p-4 md:p-6 overflow-y-auto overflow-x-hidden">
        
        {stage === AppStage.SETUP && (
          <SetupForm onSubmit={handleSetupSubmit} isLoading={loading} />
        )}

        {stage === AppStage.GENERATING && (
          <div className="text-center glass-panel p-6 sm:p-8 md:p-12 rounded-2xl animate-pulse border-white/5 mx-2 sm:mx-4 my-auto">
             <Sparkles className="mx-auto text-indigo-400 mb-4 sm:mb-6 animate-spin" size={32} />
             <h2 className="text-xl sm:text-2xl md:text-3xl font-serif italic text-white mb-2">Consulting the Stars...</h2>
             <p className="text-slate-400 font-light tracking-wide text-[11px] sm:text-xs md:text-sm">Crafting the perfect words.</p>
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
          <div className="z-50 flex flex-col items-center animate-[float_5s_ease-in-out_infinite] w-full max-w-2xl px-3 sm:px-4 md:px-6 my-auto">
             
             {/* Capture Area */}
             <div ref={captureRef} className="w-full bg-slate-900/60 backdrop-blur-2xl border border-white/10 p-4 sm:p-6 md:p-10 rounded-xl sm:rounded-2xl text-center shadow-2xl mb-4 sm:mb-6 md:mb-8 relative overflow-hidden group">
                 <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-rose-500 to-transparent opacity-50"></div>
                 
                 {/* Main Success Declaration */}
                 <h1 className="text-2xl sm:text-4xl md:text-6xl font-serif italic text-transparent bg-clip-text bg-gradient-to-b from-white to-rose-200 drop-shadow-[0_0_40px_rgba(225,29,72,0.4)] pb-2 sm:pb-4 mb-2 px-2">
                   {getSuccessHeader()}
                 </h1>
                 
                 {/* Divider */}
                 <div className="flex items-center justify-center gap-3 opacity-50 mb-4 sm:mb-6 md:mb-8">
                    <div className="h-px w-8 sm:w-12 bg-rose-400"></div>
                    <div className="h-1.5 w-1.5 rounded-full bg-rose-400"></div>
                    <div className="h-px w-8 sm:w-12 bg-rose-400"></div>
                 </div>

                 {/* The Personal Note */}
                 <div className="relative">
                    <Sparkles className="absolute -top-4 -left-2 text-rose-300/30 hidden sm:block" size={16} />
                    <p className="text-base sm:text-lg md:text-2xl text-slate-200 leading-relaxed font-serif font-light italic px-2 sm:px-4 md:px-4">
                       "{generatedContent?.personalNote || generatedContent?.poem || "Love Wins."}"
                    </p>
                    <Sparkles className="absolute -bottom-4 -right-2 text-rose-300/30 hidden sm:block" size={16} />
                 </div>

                 <div className="mt-6 sm:mt-8 md:mt-10 pt-4 sm:pt-6 border-t border-white/5">
                   <p className="text-[8px] sm:text-[9px] md:text-[10px] text-slate-500 uppercase tracking-[0.2em] sm:tracking-[0.3em] font-sans opacity-70 px-2">
                     {generatedContent?.relationship === 'friend' ? 'Friendship Sealed • Forever' : 'Official • Cosmic Valentine'}
                   </p>
                 </div>
             </div>

             {/* Optional Reply Message - Only for Recipients */}
             {isRecipient && (
                <textarea
                  placeholder="Say something back (optional)..."
                  value={replyMessage}
                  onChange={(e) => setReplyMessage(e.target.value)}
                  maxLength={500}
                  className="w-full bg-white/5 border border-white/10 rounded-lg p-3 sm:p-4 text-white focus:outline-none focus:border-rose-500/50 focus:bg-white/10 transition-colors resize-none placeholder-white/30 font-serif text-sm leading-relaxed mb-3 sm:mb-4"
                  style={{ minHeight: '80px' }}
                />
             )}

             {/* Action Buttons */}
             <div className="flex flex-col gap-3 sm:gap-4 w-full justify-center px-2 sm:px-4 max-w-full">
                 {isRecipient && (
                    <button
                        onClick={notifySender}
                        className="flex items-center justify-center gap-2 bg-white text-rose-900 px-4 sm:px-6 py-3 sm:py-4 rounded-full font-serif italic text-base sm:text-lg shadow-[0_0_25px_rgba(255,255,255,0.4)] hover:scale-105 active:scale-95 transition-transform w-full"
                    >
                        <MessageCircle size={18} className="sm:w-5 sm:h-5" />
                        Tell {generatedContent?.senderName || "them"} YES!
                    </button>
                 )}
                 
                 <button
                    onClick={handleDownload}
                    className="flex items-center justify-center gap-2 bg-white/10 hover:bg-white/20 text-white border border-white/20 px-4 sm:px-6 py-3 sm:py-4 rounded-full font-sans text-xs sm:text-sm tracking-wide uppercase transition-all backdrop-blur-sm w-full active:scale-95"
                 >
                    <Camera size={16} className="sm:w-[18px] sm:h-[18px]" />
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