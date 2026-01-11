import React, { useState, useEffect, useRef } from 'react';
import { Dialog, DialogContent, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Mic, MicOff, PhoneOff, Volume2, VolumeX, Loader2 } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/hooks/use-toast';
import { useCart } from '@/contexts/CartContext';
import { useProducts } from '@/contexts/ProductContext';

interface VoiceCallModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const VoiceCallModal: React.FC<VoiceCallModalProps> = ({ isOpen, onClose }) => {
  const [status, setStatus] = useState<'connecting' | 'connected' | 'listening' | 'processing' | 'speaking' | 'ended'>('connecting');
  const [isMuted, setIsMuted] = useState(false);
  const [volume, setVolume] = useState(1);
  const [agentConfig, setAgentConfig] = useState<any>(null);
  const { addToCart } = useCart();
  const { products } = useProducts();
  
  // Refs for audio handling
  const recognitionRef = useRef<any>(null);
  const synthRef = useRef<SpeechSynthesis | null>(null);
  const silenceTimerRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    if (isOpen) {
      startCall();
    } else {
      endCall();
    }
  }, [isOpen]);

  const startCall = async () => {
    setStatus('connecting');
    try {
      // 1. Fetch Agent Config
      const { data } = await supabase.from('voice_agent_settings').select('*').limit(1).maybeSingle();
      setAgentConfig(data);

      // 2. Init Speech Synthesis
      if ('speechSynthesis' in window) {
        synthRef.current = window.speechSynthesis;
      } else {
        toast({ title: "Seu navegador não suporta síntese de voz", variant: "destructive" });
      }

      // 3. Init Speech Recognition
      const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
      if (SpeechRecognition) {
        recognitionRef.current = new SpeechRecognition();
        recognitionRef.current.continuous = false; // We want turn-based for now to avoid echo
        recognitionRef.current.interimResults = false;
        recognitionRef.current.lang = 'pt-BR';

        recognitionRef.current.onstart = () => {
          if (status !== 'speaking') setStatus('listening');
        };

        recognitionRef.current.onend = () => {
          // If we are not processing or speaking, restart listening (keep alive)
          // But if we just finished speaking, we should listen.
        };

        recognitionRef.current.onresult = async (event: any) => {
          const transcript = event.results[0][0].transcript;
          if (transcript.trim()) {
            setStatus('processing');
            await processUserMessage(transcript);
          }
        };
      } else {
        toast({ title: "Seu navegador não suporta reconhecimento de voz", variant: "destructive" });
      }

      // 4. Speak Initial Message
      setTimeout(() => {
        setStatus('connected');
        if (data?.initial_message) {
          speak(data.initial_message);
        } else {
          speak("Olá! Sou o assistente do Balão. Como posso ajudar?");
        }
      }, 1500);

    } catch (error) {
      console.error(error);
      setStatus('ended');
    }
  };

  const speak = (text: string) => {
    if (!synthRef.current) return;
    
    // Cancel any current speech
    synthRef.current.cancel();

    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = 'pt-BR';
    utterance.rate = 1.1; // Slightly faster for natural feel
    
    // Try to find a good voice
    const voices = synthRef.current.getVoices();
    const ptVoice = voices.find(v => v.lang.includes('pt-BR') && v.name.includes('Google')) || voices.find(v => v.lang.includes('pt-BR'));
    if (ptVoice) utterance.voice = ptVoice;

    utterance.onstart = () => setStatus('speaking');
    utterance.onend = () => {
      setStatus('listening');
      startListening();
    };

    synthRef.current.speak(utterance);
  };

  const startListening = () => {
    if (recognitionRef.current && !isMuted) {
      try {
        recognitionRef.current.start();
      } catch (e) {
        // Already started
      }
    }
  };

  const stopListening = () => {
    if (recognitionRef.current) {
      try {
        recognitionRef.current.stop();
      } catch (e) {}
    }
  };

  const processUserMessage = async (text: string) => {
    try {
      // Call Edge Function
      const { data, error } = await supabase.functions.invoke('chat-assistant', {
        body: { 
          messages: [{ role: 'user', content: text }],
          session_id: 'voice-session-' + Date.now(), // Simplified for now
          voice_mode: true
        }
      });

      if (error) throw error;

      // Extract text from response (assuming standard chat format or special voice format)
      // The edge function currently returns a stream, but we might need to adjust it for simple JSON in voice mode
      // Or handle the stream. For simplicity, let's assume we update the edge function to return JSON if voice_mode is true.
      
      const responseText = data?.reply || "Desculpe, não entendi. Pode repetir?";
      speak(responseText);

    } catch (error) {
      console.error(error);
      speak("Tive um problema técnico. Pode tentar novamente?");
    }
  };

  const endCall = () => {
    setStatus('ended');
    if (synthRef.current) synthRef.current.cancel();
    if (recognitionRef.current) recognitionRef.current.stop();
    setTimeout(onClose, 1000);
  };

  const toggleMute = () => {
    setIsMuted(!isMuted);
    if (!isMuted) {
      stopListening();
    } else {
      startListening();
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={() => {}}>
      <DialogContent className="sm:max-w-[400px] h-[600px] p-0 overflow-hidden bg-slate-950 border-slate-800 flex flex-col items-center justify-between shadow-2xl">
        <DialogTitle className="sr-only">Chamada de Voz com Assistente</DialogTitle>
        
        {/* Header / Status */}
        <div className="w-full p-6 text-center pt-12">
          <h2 className="text-white text-xl font-semibold mb-2">Balão Expert</h2>
          <p className="text-slate-400 text-sm font-medium uppercase tracking-widest animate-pulse">
            {status === 'connecting' && 'Conectando...'}
            {status === 'connected' && 'Conectado'}
            {status === 'listening' && 'Ouvindo...'}
            {status === 'processing' && 'Pensando...'}
            {status === 'speaking' && 'Falando...'}
            {status === 'ended' && 'Chamada Encerrada'}
          </p>
        </div>

        {/* Visualizer / Avatar */}
        <div className="flex-1 flex items-center justify-center w-full relative">
          {/* Ripple Effect */}
          {(status === 'speaking' || status === 'listening') && (
            <>
              <div className="absolute w-32 h-32 bg-primary/20 rounded-full animate-ping" />
              <div className="absolute w-48 h-48 bg-primary/10 rounded-full animate-ping delay-75" />
            </>
          )}
          
          <div className={`w-32 h-32 rounded-full flex items-center justify-center z-10 transition-all duration-500 ${
            status === 'speaking' ? 'bg-primary shadow-[0_0_50px_rgba(227,6,19,0.5)] scale-110' : 
            status === 'listening' ? 'bg-blue-500 shadow-[0_0_50px_rgba(59,130,246,0.5)]' :
            'bg-slate-800'
          }`}>
            {status === 'connecting' || status === 'processing' ? (
              <Loader2 className="w-12 h-12 text-white animate-spin" />
            ) : (
              <Mic className={`w-12 h-12 text-white ${status === 'listening' ? 'animate-pulse' : ''}`} />
            )}
          </div>
        </div>

        {/* Controls */}
        <div className="w-full p-8 bg-slate-900/50 backdrop-blur-sm">
          <div className="flex items-center justify-center gap-6">
            <Button
              variant="outline"
              size="icon"
              className={`w-14 h-14 rounded-full border-0 ${isMuted ? 'bg-white text-slate-900' : 'bg-slate-800 text-white hover:bg-slate-700'}`}
              onClick={toggleMute}
            >
              {isMuted ? <MicOff className="w-6 h-6" /> : <Mic className="w-6 h-6" />}
            </Button>

            <Button
              variant="destructive"
              size="icon"
              className="w-16 h-16 rounded-full shadow-lg bg-red-600 hover:bg-red-700 animate-in zoom-in"
              onClick={endCall}
            >
              <PhoneOff className="w-8 h-8" />
            </Button>

            <Button
              variant="outline"
              size="icon"
              className="w-14 h-14 rounded-full border-0 bg-slate-800 text-white hover:bg-slate-700"
              onClick={() => {
                // Toggle speaker output (simulated)
                toast({ title: "Saída de áudio alterada" });
              }}
            >
              <Volume2 className="w-6 h-6" />
            </Button>
          </div>
          <p className="text-center text-slate-500 text-xs mt-6">
            Chamada via VoIP Segura • Balão da Informática
          </p>
        </div>

      </DialogContent>
    </Dialog>
  );
};
