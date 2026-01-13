import { useState, useRef } from "react";
import { Volume2, Pause, Play, Loader2, VolumeX } from "lucide-react";
import { Button } from "@/components/ui/button";
import { motion, AnimatePresence } from "framer-motion";

interface ArticleAudioPlayerProps {
  articleContent: string;
  articleTitle: string;
}

// Voice ID for "advogado de joao santaroza" - custom cloned voice
const CUSTOM_VOICE_ID = "advogado_joao_santaroza"; // Will be replaced with actual Voice ID

export const ArticleAudioPlayer = ({ articleContent, articleTitle }: ArticleAudioPlayerProps) => {
  const [isLoading, setIsLoading] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const audioUrlRef = useRef<string | null>(null);

  const cleanTextForTTS = (html: string): string => {
    // Remove HTML tags
    let text = html.replace(/<[^>]*>/g, ' ');
    // Decode HTML entities
    text = text.replace(/&nbsp;/g, ' ');
    text = text.replace(/&amp;/g, '&');
    text = text.replace(/&lt;/g, '<');
    text = text.replace(/&gt;/g, '>');
    text = text.replace(/&quot;/g, '"');
    // Normalize whitespace
    text = text.replace(/\s+/g, ' ').trim();
    return text;
  };

  const handlePlayPause = async () => {
    setError(null);

    // If audio is loaded, toggle play/pause
    if (audioRef.current && audioUrlRef.current) {
      if (isPlaying) {
        audioRef.current.pause();
        setIsPlaying(false);
      } else {
        await audioRef.current.play();
        setIsPlaying(true);
      }
      return;
    }

    // Generate audio for the first time
    setIsLoading(true);

    try {
      const textToSpeak = `${articleTitle}. ${cleanTextForTTS(articleContent)}`;
      
      const response = await fetch(
        `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/elevenlabs-tts`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            apikey: import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY,
            Authorization: `Bearer ${import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY}`,
          },
          body: JSON.stringify({
            text: textToSpeak,
            voiceId: CUSTOM_VOICE_ID,
          }),
        }
      );

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error || `Erro ao gerar áudio: ${response.status}`);
      }

      const audioBlob = await response.blob();
      const audioUrl = URL.createObjectURL(audioBlob);
      audioUrlRef.current = audioUrl;

      const audio = new Audio(audioUrl);
      audioRef.current = audio;

      audio.onended = () => {
        setIsPlaying(false);
      };

      audio.onerror = () => {
        setError("Erro ao reproduzir o áudio");
        setIsPlaying(false);
      };

      await audio.play();
      setIsPlaying(true);
    } catch (err) {
      console.error("TTS Error:", err);
      setError(err instanceof Error ? err.message : "Erro ao gerar áudio");
    } finally {
      setIsLoading(false);
    }
  };

  const handleStop = () => {
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current.currentTime = 0;
      setIsPlaying(false);
    }
  };

  return (
    <motion.div 
      className="flex items-center gap-3 p-4 bg-secondary/50 rounded-xl border border-border"
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
    >
      <div className="flex items-center gap-2">
        <Button
          onClick={handlePlayPause}
          disabled={isLoading}
          variant="default"
          size="sm"
          className="gap-2"
        >
          {isLoading ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin" />
              Gerando...
            </>
          ) : isPlaying ? (
            <>
              <Pause className="w-4 h-4" />
              Pausar
            </>
          ) : (
            <>
              <Play className="w-4 h-4" />
              Ouvir Artigo
            </>
          )}
        </Button>

        {isPlaying && (
          <Button
            onClick={handleStop}
            variant="outline"
            size="sm"
            className="gap-2"
          >
            <VolumeX className="w-4 h-4" />
            Parar
          </Button>
        )}
      </div>

      <div className="flex items-center gap-2 text-sm text-muted-foreground">
        <Volume2 className="w-4 h-4" />
        <span>Narrado por Dr. João Santaroza</span>
      </div>

      <AnimatePresence>
        {error && (
          <motion.p 
            className="text-sm text-destructive ml-auto"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            {error}
          </motion.p>
        )}
      </AnimatePresence>

      {isPlaying && (
        <motion.div 
          className="flex items-center gap-1 ml-auto"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
        >
          {[...Array(4)].map((_, i) => (
            <motion.div
              key={i}
              className="w-1 bg-accent rounded-full"
              animate={{
                height: [8, 16, 8],
              }}
              transition={{
                duration: 0.5,
                repeat: Infinity,
                delay: i * 0.1,
              }}
            />
          ))}
        </motion.div>
      )}
    </motion.div>
  );
};
