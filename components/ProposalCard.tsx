import React, { useState, useRef, useEffect } from 'react';
import { GeneratedContent } from '../types';
import { Heart, Link as LinkIcon, Check, Facebook, Twitter, MessageCircle, Camera } from 'lucide-react';
import { audio } from '../services/audioService';
import html2canvas from 'html2canvas';

interface ProposalCardProps {
  content: GeneratedContent;
  onYes: () => void;
  isRecipient: boolean;
}

const ProposalCard: React.FC<ProposalCardProps> = ({ content, onYes, isRecipient }) => {
  const [noBtnPosition, setNoBtnPosition] = useState({ x: 0, y: 0 });
  const containerRef = useRef<HTMLDivElement>(null);
  const [isHoveringNo, setIsHoveringNo] = useState(false);
  const [copied, setCopied] = useState(false);
  const [shortened, setShortened] = useState(false);
  const [shorteningLoading, setShorteningLoading] = useState(false);

  // Start ambient music if Recipient opens the link and interacts
  const handleInteraction = () => {
     audio.startAmbient();
  };

  const moveNoButton = () => {
    if (!containerRef.current) return;
    audio.playGlitch(); // Play glitch sound
    const maxOffset = 100; // Reduced for mobile safety
    const randomX = (Math.random() - 0.5) * maxOffset * 2;
    const randomY = (Math.random() - 0.5) * maxOffset * 2;
    setNoBtnPosition({ x: randomX, y: randomY });
    setIsHoveringNo(true);
  };

  const handleYesClick = () => {
    audio.playSuccess();
    onYes();
  }

  const getShareUrl = () => {
    const encoded = btoa(encodeURIComponent(JSON.stringify(content)));
    return `${window.location.origin}${window.location.pathname}?data=${encoded}`;
  };

  const copyShareLink = () => {
    audio.playClick();
    navigator.clipboard.writeText(getShareUrl());
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const shortenAndCopyLink = async () => {
    audio.playClick();
    setShorteningLoading(true);
    try {
      const longUrl = getShareUrl();
      const response = await fetch(`https://tinyurl.com/api/create.php?url=${encodeURIComponent(longUrl)}`);
      const shortUrl = await response.text();
      
      if (shortUrl && !shortUrl.includes('error')) {
        navigator.clipboard.writeText('https://tinyurl.com/' + shortUrl);
        setShortened(true);
        setTimeout(() => setShortened(false), 2000);
      } else {
        throw new Error('Failed to shorten URL');
      }
    } catch (error) {
      console.error('URL shortening failed:', error);
      // Fallback: just copy the long URL
      navigator.clipboard.writeText(getShareUrl());
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } finally {
      setShorteningLoading(false);
    }
  };

  const shareToSocial = (platform: 'whatsapp' | 'twitter' | 'facebook') => {
    audio.playClick();
    const url = getShareUrl();
    const text = `I have a very important question for you... ❤️`;
    
    let shareLink = '';
    switch (platform) {
      case 'whatsapp':
        shareLink = `https://api.whatsapp.com/send?text=${encodeURIComponent(text + ' ' + url)}`;
        break;
      case 'twitter':
        shareLink = `https://twitter.com/intent/tweet?text=${encodeURIComponent(text)}&url=${encodeURIComponent(url)}`;
        break;
      case 'facebook':
        shareLink = `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(url)}`;
        break;
    }
    window.open(shareLink, '_blank', 'width=600,height=400');
  };

  const handleDownload = async (e: React.MouseEvent) => {
    e.stopPropagation(); // Prevent ambient audio trigger duplication
    if (!containerRef.current) return;
    audio.playClick();
    
    try {
        const element = containerRef.current;
        // Temporarily adjust styles for capture
        const originalOverflow = element.style.overflow;
        const originalMaxHeight = element.style.maxHeight;
        
        // Expand to fit content
        element.style.overflow = 'visible';
        element.style.maxHeight = 'none';
        
        const canvas = await html2canvas(element, {
            backgroundColor: 'rgba(10, 10, 20, 0.95)', // Darker opaque background for the image
            scale: 2,
            useCORS: true,
            logging: false,
            height: element.scrollHeight,
            windowHeight: element.scrollHeight
        });

        // Restore styles
        element.style.overflow = originalOverflow;
        element.style.maxHeight = originalMaxHeight;

        const image = canvas.toDataURL('image/png');
        const link = document.createElement('a');
        link.href = image;
        link.download = `valentine-proposal-${Date.now()}.png`;
        link.click();
    } catch (e) {
        console.error("Capture failed", e);
    }
  };

  return (
    <div className="relative w-full max-w-2xl z-20 flex flex-col items-center px-2 sm:px-3 md:px-4 my-auto">
      
      {/* Floating Heart Badge - Responsive positioning */}
      <div className="absolute -top-4 sm:-top-6 md:-top-8 left-1/2 transform -translate-x-1/2 z-30 pointer-events-none">
        <div className="relative hover:scale-105 transition-transform duration-500 scale-50 sm:scale-75 md:scale-100">
            <div className="absolute inset-0 bg-rose-500/40 blur-2xl opacity-50 rounded-full"></div>
            <Heart className="text-rose-600 relative z-10 drop-shadow-xl" size={70} fill="#e11d48" strokeWidth={1} />
        </div>
      </div>

      <div 
        ref={containerRef} 
        onClick={handleInteraction} 
        className="w-full p-3 pt-8 sm:p-5 sm:pt-12 md:p-8 md:pt-14 glass-panel rounded-lg sm:rounded-xl border border-white/10 text-center flex flex-col items-center shadow-2xl max-h-[82vh] sm:max-h-[85vh] overflow-y-auto custom-scrollbar bg-black/40 relative group"
      >
        {/* Download Button */}
        <button 
            onClick={handleDownload}
            className="absolute top-2 right-2 sm:top-3 sm:right-3 p-2 text-white/20 hover:text-white/80 hover:bg-white/10 rounded-full transition-all opacity-100 md:opacity-0 md:group-hover:opacity-100 active:scale-90"
            title="Save as Image"
        >
            <Camera size={16} className="sm:w-[18px] sm:h-[18px]" />
        </button>

        <h2 className="text-xl sm:text-2xl md:text-4xl font-serif italic text-white mb-3 sm:mb-4 md:mb-6 leading-tight px-2">
          {content.headline}
        </h2>

        {/* AI Generated Poem */}
        <div className="mb-4 sm:mb-6 md:mb-8 w-full px-2 sm:px-3">
          <p className="text-xs sm:text-sm md:text-lg text-slate-200 leading-relaxed font-serif font-light">
            {content.poem}
          </p>
        </div>

        {/* Manual Love Note */}
        {content.personalNote && (
          <div className="relative w-full mb-4 sm:mb-6 md:mb-8 px-2 transform -rotate-1 hover:rotate-0 transition-transform duration-500">
              <div className="bg-[#fff1f2] p-2.5 sm:p-3 md:p-5 rounded-sm shadow-xl text-slate-800 text-left relative overflow-hidden">
                  <div className="absolute top-0 left-0 w-full h-1 bg-rose-900/10"></div>
                  <p className="font-serif italic text-xs sm:text-sm md:text-base leading-relaxed text-slate-800">
                      "{content.personalNote}"
                  </p>
              </div>
          </div>
        )}

        <div className="w-10 sm:w-12 md:w-16 h-px bg-white/20 mb-3 sm:mb-4 md:mb-6"></div>

        <h3 className="text-[8px] sm:text-xs md:text-sm font-sans tracking-[0.15em] sm:tracking-[0.2em] uppercase text-slate-400 mb-3 sm:mb-4 md:mb-6 px-2">
          The Question
        </h3>

        <div className="flex flex-col sm:flex-row gap-2 sm:gap-3 md:gap-4 items-center justify-center w-full relative min-h-[2.5rem] sm:min-h-[4rem] mb-3 sm:mb-4 shrink-0 px-1">
          <button
            onClick={handleYesClick}
            onMouseEnter={() => audio.playHover()}
            className="bg-white text-black hover:bg-rose-50 font-serif italic text-sm sm:text-base md:text-lg px-4 sm:px-6 md:px-10 py-2 sm:py-2.5 md:py-3 rounded-full shadow-[0_0_30px_rgba(255,255,255,0.2)] transition-all transform hover:scale-105 active:scale-95 z-10 border border-transparent hover:border-rose-200 w-full sm:w-auto"
          >
            Yes, I will
          </button>

          <button
            onMouseEnter={moveNoButton}
            onTouchStart={moveNoButton}
            onClick={moveNoButton}
            style={{
              transform: `translate(${noBtnPosition.x}px, ${noBtnPosition.y}px)`,
              transition: 'transform 0.2s cubic-bezier(0.1, 0.7, 1.0, 0.1)'
            }}
            className="text-slate-500 font-sans uppercase tracking-widest text-[9px] sm:text-xs py-2 sm:py-2.5 px-3 sm:px-5 rounded-full border border-white/5 hover:bg-white/5 transition-colors whitespace-nowrap"
          >
            {isHoveringNo ? "Not an option" : "No"}
          </button>
        </div>

        {/* Share Section - Only visible to Creator */}
        {!isRecipient && (
          <div className="mt-4 sm:mt-5 md:mt-6 pt-3 sm:pt-4 border-t border-white/5 w-full flex flex-col items-center gap-2 sm:gap-3 shrink-0 px-1">
              <p className="text-[7px] sm:text-[9px] md:text-[10px] text-slate-500 uppercase tracking-[0.15em] md:tracking-widest">Share</p>
              
              <div className="flex flex-wrap items-center justify-center gap-1.5 sm:gap-2">
                <button 
                    onClick={copyShareLink}
                    onMouseEnter={() => audio.playHover()}
                    className="flex items-center gap-1 px-3 sm:px-4 py-1.5 sm:py-2 bg-white/5 hover:bg-white/10 text-white rounded-full transition-all border border-white/10 hover:border-white/20 group text-[8px] sm:text-xs"
                >
                    {copied ? <Check size={12} className="sm:w-[14px] sm:h-[14px] text-green-400" /> : <LinkIcon size={12} className="sm:w-[14px] sm:h-[14px] group-hover:scale-110 transition-transform" />}
                    <span className="font-sans tracking-[0.05em]">{copied ? "COPIED" : "COPY"}</span>
                </button>

                <button 
                    onClick={shortenAndCopyLink}
                    onMouseEnter={() => audio.playHover()}
                    disabled={shorteningLoading}
                    className="flex items-center gap-1 px-3 sm:px-4 py-1.5 sm:py-2 bg-white/5 hover:bg-white/10 text-white rounded-full transition-all border border-white/10 hover:border-white/20 group text-[8px] sm:text-xs disabled:opacity-50 disabled:cursor-not-allowed"
                >
                    {shortened ? <Check size={12} className="sm:w-[14px] sm:h-[14px] text-green-400" /> : <LinkIcon size={12} className="sm:w-[14px] sm:h-[14px] group-hover:scale-110 transition-transform" />}
                    <span className="font-sans tracking-[0.05em]">{shorteningLoading ? "SHORT..." : shortened ? "SHORT COPIED" : "SHORTEN"}</span>
                </button>

                <div className="w-px h-4 sm:h-5 bg-white/10 hidden sm:block"></div>

                <div className="flex gap-1">
                    <button 
                    onClick={() => shareToSocial('whatsapp')}
                    onMouseEnter={() => audio.playHover()}
                    className="p-1.5 sm:p-2 text-slate-400 hover:text-white transition-colors active:scale-90"
                    title="Share via WhatsApp"
                    >
                    <MessageCircle size={12} className="sm:w-[16px] sm:h-[16px]" />
                    </button>

                    <button 
                    onClick={() => shareToSocial('twitter')}
                    onMouseEnter={() => audio.playHover()}
                    className="p-1.5 sm:p-2 text-slate-400 hover:text-white transition-colors active:scale-90"
                    title="Share on Twitter"
                    >
                    <Twitter size={12} className="sm:w-[16px] sm:h-[16px]" />
                    </button>

                    <button 
                    onClick={() => shareToSocial('facebook')}
                    onMouseEnter={() => audio.playHover()}
                    className="p-1.5 sm:p-2 text-slate-400 hover:text-white transition-colors active:scale-90"
                    title="Share on Facebook"
                    >
                    <Facebook size={12} className="sm:w-[16px] sm:h-[16px]" />
                    </button>
                </div>
              </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ProposalCard;