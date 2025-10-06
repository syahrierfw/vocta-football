// src/components/VoctaWidget.tsx
'use client';

import { useState, useRef, useEffect } from 'react';
import Image from 'next/image';
import { X, PhoneOff, Mic, MicOff } from 'lucide-react';
import VoctaChatbot from './Chatbot';

// ---------------- Voice UI ----------------
type VapiType = {
  start: (assistantId: string) => Promise<void> | void;
  stop: () => Promise<void> | void;
  on: (event: string, fn: (...args: unknown[]) => void) => void;
  off: (event: string, fn: (...args: unknown[]) => void) => void;
  // optional/SDK-dependent:
  setMuted?: (muted: boolean) => void;
  mute?: (muted: boolean) => void;
  toggleMute?: () => void;
};

const VoiceCallUI = ({ onClose }: { onClose: () => void }) => {
  const [callStatus, setCallStatus] = useState<'connecting' | 'active' | 'error'>('connecting');
  const [muted, setMuted] = useState(false);
  const [errMsg, setErrMsg] = useState<string | null>(null);
  const vapi = useRef<VapiType | null>(null);

  const safeHangup = async () => {
    try {
      await Promise.resolve(vapi.current?.stop?.());
    } catch (e) {
      console.error('[hangup] stop error:', e);
    } finally {
      onClose();
    }
  };

  const toggleMute = () => {
    const next = !muted;
    setMuted(next);
    // Try common SDK shapes, no-ops if not present
    vapi.current?.setMuted?.(next);
    vapi.current?.mute?.(next);
    vapi.current?.toggleMute?.();
  };

  useEffect(() => {
    let cancelled = false;

    (async () => {
      try {
        const PUB = process.env.NEXT_PUBLIC_VAPI_PUBLIC_KEY;
        const AID = process.env.NEXT_PUBLIC_VAPI_ASSISTANT_ID;

        if (!PUB || !AID) {
          throw new Error('Missing NEXT_PUBLIC_VAPI_PUBLIC_KEY or NEXT_PUBLIC_VAPI_ASSISTANT_ID');
        }

        const { default: Vapi } = await import('@vapi-ai/web');

        if (cancelled) return;

        const api = new Vapi(PUB) as unknown as VapiType;
        vapi.current = api;

        const onStart = () => !cancelled && setCallStatus('active');
        const onEnd = () => !cancelled && safeHangup();
        const onError = (e: unknown) => {
          const m = e instanceof Error ? e.message : String(e);
          console.error('[Vapi error]', m);
          if (!cancelled) {
            setErrMsg(m);
            setCallStatus('error');
          }
        };

        api.on('call-start', onStart);
        api.on('call-end', onEnd);
        api.on('error', onError);

        await Promise.resolve(api.start(AID));

        return () => {
          api.off('call-start', onStart);
          api.off('call-end', onEnd);
          api.off('error', onError);
          api.stop?.();
        };
      } catch (e) {
        const m = e instanceof Error ? e.message : String(e);
        console.error('[Voice init failed]', m);
        if (!cancelled) {
          setErrMsg(m);
          setCallStatus('error');
        }
      }
    })();

    return () => {
      cancelled = true;
      vapi.current?.stop?.();
    };
  }, [onClose]);

  return (
    <div className="fixed bottom-4 right-4 z-50">
      <div className="w-[22rem] h-[520px] rounded-xl shadow-xl flex flex-col bg-[#0F2B26]">
        {/* Header */}
        <div className="flex items-center justify-between p-4 text-white rounded-t-xl bg-black/20">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-white rounded-full overflow-hidden flex items-center justify-center">
              <Image src="/images/paolo-avatar.png" alt="Paolo Icon" width={40} height={40} />
            </div>
            <div>
              <div className="font-bold text-lg">Paolo</div>
              <div className="text-xs opacity-80">VOCTA&apos;s Jersey Specialist</div>
            </div>
          </div>
          <button className="text-white" aria-label="Close call" onClick={safeHangup}>
            <X size={22} />
          </button>
        </div>

        {/* Body */}
        <div className="flex-1 flex flex-col items-center justify-center text-white px-6 text-center">
          {callStatus === 'connecting' && (
            <>
              <div className="w-24 h-24 border-2 border-dashed border-gray-300 rounded-full animate-spin" />
              <p className="mt-4">Connecting…</p>
            </>
          )}
          {callStatus === 'active' && (
            <>
              <div className="w-28 h-28 bg-green-600/30 rounded-full flex items-center justify-center">
                <Image src="/icons/mic-old.png" alt="Mic" width={48} height={48} />
              </div>
              <p className="mt-4 text-lg">You are connected</p>
            </>
          )}
          {callStatus === 'error' && (
            <>
              <div className="w-24 h-24 bg-red-500/20 rounded-full flex items-center justify-center">
                <span className="text-3xl">⚠️</span>
              </div>
              <p className="mt-3">Voice failed to start.</p>
              {errMsg && <p className="mt-1 text-xs opacity-80 break-words">{errMsg}</p>}
            </>
          )}
        </div>

        {/* Footer Controls */}
        <div className="flex items-center justify-center gap-5 p-5">
          {/* Mic toggle */}
          <button
            onClick={toggleMute}
            className="p-4 rounded-full bg-gray-700/70 text-white hover:bg-gray-700 transition-colors"
            aria-label={muted ? 'Unmute microphone' : 'Mute microphone'}
            title={muted ? 'Unmute' : 'Mute'}
          >
            {muted ? <MicOff className="w-6 h-6" /> : <Mic className="w-6 h-6" />}
          </button>

          {/* Hang up (red phone) */}
          <button
            onClick={safeHangup}
            className="p-5 rounded-full bg-red-600 text-white hover:bg-red-700 transition-colors"
            aria-label="End call"
            title="End call"
          >
            <PhoneOff className="w-7 h-7" />
          </button>
        </div>
      </div>
    </div>
  );
};
// ---------------- Main widget ----------------
export default function VoctaWidget() {
  const [isMenuOpen, setMenuOpen] = useState(false);
  const [isChatOpen, setChatOpen] = useState(false);
  const [isVoiceUIOpen, setVoiceUIOpen] = useState(false);

  const handleOpenMenu = () => setMenuOpen(true);
  const handleCloseMenu = () => setMenuOpen(false);
  const handleOpenChat = () => { setMenuOpen(false); setChatOpen(true); };
  const handleVoiceChat = () => { setMenuOpen(false); setVoiceUIOpen(true); };

  if (isChatOpen) return <VoctaChatbot isOpen={isChatOpen} onClose={() => setChatOpen(false)} />;
  if (isVoiceUIOpen) return <VoiceCallUI onClose={() => setVoiceUIOpen(false)} />;

  return (
    <div className="fixed bottom-4 right-4 z-50 flex flex-col items-end">
      {isMenuOpen && (
        <div className="w-64 bg-[#1E3932] text-white rounded-xl shadow-lg p-4 mb-4">
          <p className="font-semibold text-lg mb-4">How would you like to connect with an agent?</p>
          <div className="space-y-2">
            <button
              onClick={handleVoiceChat}
              className="w-full text-center font-semibold bg-green-600 hover:bg-green-700 p-3 rounded-full border-2 border-green-400 relative"
            >
              <span className="absolute left-4 top-1/2 -translate-y-1/2 bg-white text-green-700 text-xs font-bold px-2 py-0.5 rounded-full">
                New
              </span>
              Voice chat
            </button>
            <button
              onClick={handleOpenChat}
              className="w-full text-center font-semibold bg-transparent hover:bg-gray-700 p-3 rounded-full border-2 border-gray-500"
            >
              Text chat
            </button>
          </div>
        </div>
      )}

      <button
        onClick={isMenuOpen ? handleCloseMenu : handleOpenMenu}
        className="w-16 h-16 bg-[#1E3932] rounded-full flex items-center justify-center shadow-lg hover:scale-110 transition-transform"
      >
        {isMenuOpen ? (
          <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" /></svg>
        ) : (
          <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-lime-300" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M18 8v5a4 4 0 01-4 4H8a4 4 0 01-4-4V8m12 0a4 4 0 00-4-4H8a4 4 0 00-4 4m12 0H8" /></svg>
        )}
      </button>
    </div>
  );
}
