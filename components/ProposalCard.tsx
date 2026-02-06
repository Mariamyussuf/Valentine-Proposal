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
    <div className="relative w-full max-w-2xl z-20 flex flex-col items-center">
      
      {/* Floating Heart Badge - Responsive positioning */}
      <div className="absolute -top-8 md:-top-10 left-1/2 transform -translate-x-1/2 z-30 pointer-events-none">
        <div className="relative hover:scale-105 transition-transform duration-500 scale-75 md:scale-100">
            <div className="absolute inset-0 bg-rose-500/40 blur-2xl opacity-50 rounded-full"></div>
            <Heart className="text-rose-600 relative z-10 drop-shadow-xl" size={70} fill="#e11d48" strokeWidth={1} />
        </div>
      </div>

      <div 
        ref={containerRef} 
        onClick={handleInteraction} 
        className="w-full p-6 pt-14 md:p-10 md:pt-16 glass-panel rounded-lg border border-white/10 text-center flex flex-col items-center shadow-2xl max-h-[85vh] overflow-y-auto custom-scrollbar bg-black/40 relative group"
      >
        {/* Download Button */}
        <button 
            onClick={handleDownload}
            className="absolute top-4 right-4 p-2 text-white/20 hover:text-white/80 hover:bg-white/10 rounded-full transition-all opacity-100 md:opacity-0 md:group-hover:opacity-100"
            title="Save as Image"
        >
            <Camera size={18} />
        </button>

        <h2 className="text-3xl md:text-5xl font-serif italic text-white mb-6 md:mb-8 leading-tight">
          {content.headline}
        </h2>

        {/* AI Generated Poem */}
        <div className="mb-8 md:mb-10 w-full px-2 md:px-4">
          <p className="text-base md:text-xl text-slate-200 leading-loose font-serif font-light">
            {content.poem}
          </p>
        </div>

        {/* Manual Love Note */}
        {content.personalNote && (
          <div className="relative w-full mb-8 md:mb-10 transform -rotate-1 hover:rotate-0 transition-transform duration-500">
              <div className="bg-[#fff1f2] p-4 md:p-6 rounded-sm shadow-xl text-slate-800 text-left relative overflow-hidden">
                  <div className="absolute top-0 left-0 w-full h-1 bg-rose-900/10"></div>
                  <p className="font-serif italic text-lg md:text-xl leading-relaxed text-slate-800">
                      "{content.personalNote}"
                  </p>
              </div>
          </div>
        )}

        <div className="w-16 h-px bg-white/20 mb-6 md:mb-8"></div>

        <h3 className="text-xs md:text-sm font-sans tracking-[0.3em] uppercase text-slate-400 mb-6 md:mb-8">
          The Question
        </h3>

        <div className="flex flex-col md:flex-row gap-4 md:gap-6 items-center justify-center w-full relative min-h-[5rem] mb-6 shrink-0">
          <button
            onClick={handleYesClick}
            onMouseEnter={() => audio.playHover()}
            className="bg-white text-black hover:bg-rose-50 font-serif italic text-lg md:text-xl px-8 md:px-12 py-3 rounded-full shadow-[0_0_30px_rgba(255,255,255,0.2)] transition-all transform hover:scale-105 active:scale-95 z-10 border border-transparent hover:border-rose-200 w-full md:w-auto"
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
            className="text-slate-500 font-sans uppercase tracking-widest text-xs py-3 px-6 md:py-4 md:px-8 rounded-full border border-white/5 hover:bg-white/5 transition-colors whitespace-nowrap"
          >
            {isHoveringNo ? "Not an option" : "No"}
          </button>
        </div>

        {/* Share Section - Only visible to Creator */}
        {!isRecipient && (
          <div className="mt-8 pt-8 border-t border-white/5 w-full flex flex-col items-center gap-4 shrink-0">
              <p className="text-[10px] text-slate-500 uppercase tracking-widest">Share this with them</p>
              
              <div className="flex flex-wrap items-center justify-center gap-3">
                <button 
                    onClick={copyShareLink}
                    onMouseEnter={() => audio.playHover()}
                    className="flex items-center gap-2 px-6 py-2 bg-white/5 hover:bg-white/10 text-white rounded-full transition-all border border-white/10 hover:border-white/20 group"
                >
                    {copied ? <Check size={14} className="text-green-400" /> : <LinkIcon size={14} className="group-hover:scale-110 transition-transform" />}
                    <span className="font-sans text-xs tracking-wide">{copied ? "COPIED" : "COPY LINK"}</span>
                </button>

                <div className="w-px h-6 bg-white/10 mx-2 hidden md:block"></div>

                <div className="flex gap-2">
                    <button 
                    onClick={() => shareToSocial('whatsapp')}
                    onMouseEnter={() => audio.playHover()}
                    className="p-2 text-slate-400 hover:text-white transition-colors"
                    title="Share via WhatsApp"
                    >
                    <MessageCircle size={18} />
                    </button>

                    <button 
                    onClick={() => shareToSocial('twitter')}
                    onMouseEnter={() => audio.playHover()}
                    className="p-2 text-slate-400 hover:text-white transition-colors"
                    title="Share on Twitter"
                    >
                    <Twitter size={18} />
                    </button>

                    <button 
                    onClick={() => shareToSocial('facebook')}
                    onMouseEnter={() => audio.playHover()}
                    className="p-2 text-slate-400 hover:text-white transition-colors"
                    title="Share on Facebook"
                    >
                    <Facebook size={18} />
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