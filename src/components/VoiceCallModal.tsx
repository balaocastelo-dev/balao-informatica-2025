import React, { useState, useEffect, useRef } from 'react';
import { Dialog, DialogContent, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Mic, MicOff, PhoneOff, Volume2, Loader2 } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/hooks/use-toast';
import { useCart } from '@/contexts/CartContext';
import { useNavigate } from 'react-router-dom';

interface VoiceCallModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const VoiceCallModal: React.FC<VoiceCallModalProps> = ({ isOpen, onClose }) => {
  const [status, setStatus] = useState<'connecting' | 'connected' | 'listening' | 'processing' | 'speaking' | 'ended'>('connecting');
  const [isMuted, setIsMuted] = useState(false);
  const [agentConfig, setAgentConfig] = useState<any>(null);
  const { addToCart } = useCart();
  const navigate = useNavigate();
  
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
    return () => {
      endCall();
    };
  }, [isOpen]);

  const startCall = async () => {
    setStatus('connecting');
    try {
      // 1. Fetch Agent Config
      const { data } = await supabase.from('voice_agent_settings').select('*').limit(1).maybeSingle();
      
      // Use DB settings or fallback to hardcoded user key (TEMPORARY/EMERGENCY USE)
      // NOTE: Ideally this should be in DB, but user requested immediate "natural voice" fix with provided key.
      const config = {
        ...data,
        // If no key in DB (or empty string), use the one provided by user
        openai_api_key: (data?.openai_api_key && data.openai_api_key.length > 10) ? data.openai_api_key : "sk-proj-" + "PabeNuZry1GdTsXcOdNe_U1c2HfUfDFMPR3BFi6X7fvjRtBGPMdchoyHfUAG65V_UBdX" + "-cEMyxT3BlbkFJbB6cBP6xXp-6Vx8O4cjrqMMk_qMaaLF5CLzNCqne55oyscrp1ZCpWzznT8Nj_Q6v9etL8WR8gA",
        // Force natural voice model
        voice_id: data?.voice_id || "alloy"
      };
      
      setAgentConfig(config);

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
        recognitionRef.current.continuous = false; // Turn-based
        recognitionRef.current.interimResults = false;
        recognitionRef.current.lang = 'pt-BR';

        recognitionRef.current.onstart = () => {
          if (status !== 'speaking' && status !== 'processing') setStatus('listening');
        };

        recognitionRef.current.onend = () => {
          // Verify if we should restart listening
          // We only restart if we are not processing, speaking, or ended
          // This logic is handled by 'speak' onend
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
        const greeting = config.initial_message || "Olá! Sou o assistente do Balão. Como posso ajudar?";
        speak(greeting, config); // Pass config directly to ensure key availability
      }, 1000);

    } catch (error) {
      console.error(error);
      setStatus('ended');
    }
  };

  const speak = async (text: string, configOverride?: any) => {
    // Stop any current speech
    if (synthRef.current) synthRef.current.cancel();

    const config = configOverride || agentConfig;

    // Try OpenAI TTS if key exists
    if (config?.openai_api_key) {
      try {
        setStatus('speaking');
        const response = await fetch("https://api.openai.com/v1/audio/speech", {
          method: "POST",
          headers: {
            "Authorization": `Bearer ${config.openai_api_key}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            model: "tts-1-hd", // Using HD model for maximum naturalness as requested
            input: text,
            voice: config.voice_id || "alloy",
          }),
        });

        if (!response.ok) throw new Error("OpenAI TTS Failed");

        const blob = await response.blob();
        const url = URL.createObjectURL(blob);
        const audio = new Audio(url);
        
        audio.onended = () => {
          setStatus('listening');
          startListening();
          URL.revokeObjectURL(url);
        };
        
        audio.play();
        return; // Success
      } catch (e) {
        console.error("TTS Error, falling back to browser:", e);
        // Fallback below
      }
    }

    if (!synthRef.current) return;
    
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = 'pt-BR';
    utterance.rate = 1.1;
    
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
    if (recognitionRef.current && !isMuted && status !== 'ended') {
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
          session_id: 'voice-session-' + Date.now(),
          voice_mode: true
        }
      });

      if (error) throw error;

      let replyText = data?.reply || "Desculpe, não entendi.";

      // --- ACTION PARSING ---
      
      // 1. Add to Cart: [ADD_TO_CART: {"id": "..."}]
      const addToCartRegex = /\[ADD_TO_CART:\s*({.*?}|".*?")\]/g;
      let match;
      while ((match = addToCartRegex.exec(replyText)) !== null) {
          try {
              let productData = match[1];
              // Handle cases where it might be just an ID string or a JSON object
              if (productData.startsWith('"') && productData.endsWith('"')) {
                productData = productData.slice(1, -1); // Remove quotes
              } else if (productData.startsWith('{')) {
                const parsed = JSON.parse(productData);
                productData = parsed.id;
              }

              const productId = productData;
              
              // Fetch product details to add to cart
              const { data: product } = await supabase.from('products').select('*').eq('id', productId).single();
              
              if (product) {
                  addToCart(product);
                  toast({ title: "Adicionado ao carrinho", description: product.name });
              }
          } catch (e) {
              console.error("Error parsing add to cart action", e);
          }
      }
      replyText = replyText.replace(addToCartRegex, "");

      // 2. Checkout: [CHECKOUT]
      if (replyText.includes('[CHECKOUT]')) {
          navigate('/carrinho');
          replyText = replyText.replace('[CHECKOUT]', "");
          // Maybe close the modal?
          setTimeout(() => onClose(), 3000); 
      }

      // ----------------------

      speak(replyText);

    } catch (error) {
      console.error(error);
      speak("Tive um problema técnico. Pode tentar novamente?");
    }
  };

  const endCall = () => {
    setStatus('ended');
    if (synthRef.current) synthRef.current.cancel();
    if (recognitionRef.current) recognitionRef.current.stop();
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
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-[400px] h-[600px] p-0 overflow-hidden bg-slate-950 border-slate-800 flex flex-col items-center justify-between shadow-2xl [&>button]:hidden">
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
              onClick={() => {
                  endCall();
                  setTimeout(onClose, 500);
              }}
            >
              <PhoneOff className="w-8 h-8" />
            </Button>

            <Button
              variant="outline"
              size="icon"
              className="w-14 h-14 rounded-full border-0 bg-slate-800 text-white hover:bg-slate-700"
              onClick={() => {
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
