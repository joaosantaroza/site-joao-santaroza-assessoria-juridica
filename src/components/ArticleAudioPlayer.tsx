import { useState, useRef, useEffect } from "react";
import { Volume2, Pause, Play, Loader2, VolumeX, Bug, Gauge } from "lucide-react";
import { Button } from "@/components/ui/button";
import { motion, AnimatePresence } from "framer-motion";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

interface ArticleAudioPlayerProps {
  articleContent: string;
  articleTitle: string;
}

// Voice ID for "advogado de joao santaroza" - custom cloned voice
const CUSTOM_VOICE_ID = "yfy5M61ODLwWnWbM7u5R";

// Dev mode detection
const IS_DEV = import.meta.env.DEV || window.location.hostname.includes("lovable");

// Available playback speeds
const PLAYBACK_SPEEDS = [0.75, 1, 1.25, 1.5, 1.75, 2] as const;

interface DiagnosticInfo {
  requestUrl: string;
  requestHeaders: Record<string, string>;
  responseStatus: number | null;
  responseHeaders: Record<string, string>;
  responseBody: string | null;
  origin: string;
  timestamp: string;
}

export const ArticleAudioPlayer = ({ articleContent, articleTitle }: ArticleAudioPlayerProps) => {
  const [isLoading, setIsLoading] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showDiagnostics, setShowDiagnostics] = useState(false);
  const [diagnosticInfo, setDiagnosticInfo] = useState<DiagnosticInfo | null>(null);
  const [playbackSpeed, setPlaybackSpeed] = useState(1);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const audioUrlRef = useRef<string | null>(null);
  const progressBarRef = useRef<HTMLDivElement | null>(null);

  // Format time in MM:SS
  const formatTime = (seconds: number): string => {
    if (!isFinite(seconds) || isNaN(seconds)) return "0:00";
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  // Update playback rate when speed changes
  useEffect(() => {
    if (audioRef.current) {
      audioRef.current.playbackRate = playbackSpeed;
    }
  }, [playbackSpeed]);

  // Setup audio event listeners for progress tracking
  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;

    const handleTimeUpdate = () => setCurrentTime(audio.currentTime);
    const handleDurationChange = () => setDuration(audio.duration);
    const handleLoadedMetadata = () => setDuration(audio.duration);

    audio.addEventListener('timeupdate', handleTimeUpdate);
    audio.addEventListener('durationchange', handleDurationChange);
    audio.addEventListener('loadedmetadata', handleLoadedMetadata);

    return () => {
      audio.removeEventListener('timeupdate', handleTimeUpdate);
      audio.removeEventListener('durationchange', handleDurationChange);
      audio.removeEventListener('loadedmetadata', handleLoadedMetadata);
    };
  }, [audioRef.current]);

  // Handle seeking via progress bar click
  const handleProgressClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!audioRef.current || !duration) return;
    
    const rect = e.currentTarget.getBoundingClientRect();
    const clickX = e.clientX - rect.left;
    const percentage = clickX / rect.width;
    const newTime = percentage * duration;
    
    audioRef.current.currentTime = newTime;
    setCurrentTime(newTime);
  };

  const progressPercentage = duration > 0 ? (currentTime / duration) * 100 : 0;

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

    const requestUrl = `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/elevenlabs-tts`;
    const requestHeaders: Record<string, string> = {
      "Content-Type": "application/json",
      "apikey": import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY || "(undefined)",
      "Authorization": `Bearer ${import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY || "(undefined)"}`,
    };

    // Initialize diagnostic info
    const diagInfo: DiagnosticInfo = {
      requestUrl,
      requestHeaders,
      responseStatus: null,
      responseHeaders: {},
      responseBody: null,
      origin: window.location.origin,
      timestamp: new Date().toISOString(),
    };

    try {
      const textToSpeak = `${articleTitle}. ${cleanTextForTTS(articleContent)}`;
      
      const response = await fetch(requestUrl, {
        method: "POST",
        headers: requestHeaders,
        body: JSON.stringify({
          text: textToSpeak,
          voiceId: CUSTOM_VOICE_ID,
        }),
      });

      // Capture response info for diagnostics
      diagInfo.responseStatus = response.status;
      response.headers.forEach((value, key) => {
        diagInfo.responseHeaders[key] = value;
      });

      if (!response.ok) {
        const errorText = await response.text();
        diagInfo.responseBody = errorText;
        setDiagnosticInfo(diagInfo);
        
        let errorMessage: string;
        try {
          const errorData = JSON.parse(errorText);
          errorMessage = errorData.error || `Erro ${response.status}`;
        } catch {
          errorMessage = `Erro ao gerar áudio: ${response.status}`;
        }
        throw new Error(errorMessage);
      }

      let audioUrl: string;
      const contentType = response.headers.get("content-type");
      
      // Check if response is JSON (cached URL) or audio blob
      if (contentType?.includes("application/json")) {
        const jsonData = await response.json();
        
        if (jsonData.cached && jsonData.url) {
          diagInfo.responseBody = `(cached) ${jsonData.url}`;
          audioUrl = jsonData.url;
          console.log("TTS: Using cached audio from storage");
        } else {
          throw new Error("Formato de resposta inválido");
        }
      } else {
        // Direct audio response (new generation)
        diagInfo.responseBody = "(audio/mpeg blob)";
        const audioBlob = await response.blob();
        audioUrl = URL.createObjectURL(audioBlob);
        console.log("TTS: Generated new audio");
      }
      
      setDiagnosticInfo(diagInfo);
      audioUrlRef.current = audioUrl;

      const audio = new Audio(audioUrl);
      audioRef.current = audio;

      audio.onended = () => {
        setIsPlaying(false);
        setCurrentTime(0);
      };

      audio.onerror = () => {
        setError("Erro ao reproduzir o áudio");
        setIsPlaying(false);
      };

      // Setup duration when audio loads
      audio.onloadedmetadata = () => {
        setDuration(audio.duration);
      };

      // Apply current playback speed
      audio.playbackRate = playbackSpeed;
      
      await audio.play();
      setIsPlaying(true);
    } catch (err) {
      console.error("TTS Error:", err);
      setDiagnosticInfo(diagInfo);
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
      setCurrentTime(0);
    }
  };

  return (
    <div className="space-y-3">
      <motion.div 
        className="flex flex-col gap-3 p-4 bg-secondary/50 rounded-xl border border-border"
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
      >
        {/* Progress bar - shown when audio is loaded */}
        {audioUrlRef.current && (
          <div className="w-full space-y-1">
            <div 
              ref={progressBarRef}
              onClick={handleProgressClick}
              className="w-full h-2 bg-muted rounded-full cursor-pointer overflow-hidden group"
            >
              <motion.div 
                className="h-full bg-primary rounded-full relative"
                style={{ width: `${progressPercentage}%` }}
                transition={{ duration: 0.1 }}
              >
                <div className="absolute right-0 top-1/2 -translate-y-1/2 w-3 h-3 bg-primary rounded-full opacity-0 group-hover:opacity-100 transition-opacity shadow-md" />
              </motion.div>
            </div>
            <div className="flex justify-between text-xs text-muted-foreground">
              <span>{formatTime(currentTime)}</span>
              <span>{formatTime(duration)}</span>
            </div>
          </div>
        )}

        <div className="flex flex-wrap items-center gap-3">
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

          {/* Playback speed control */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="outline"
                size="sm"
                className="gap-2 min-w-[70px]"
                disabled={isLoading}
              >
                <Gauge className="w-4 h-4" />
                {playbackSpeed}x
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="start">
              {PLAYBACK_SPEEDS.map((speed) => (
                <DropdownMenuItem
                  key={speed}
                  onClick={() => setPlaybackSpeed(speed)}
                  className={playbackSpeed === speed ? "bg-accent" : ""}
                >
                  {speed}x {speed === 1 && "(Normal)"}
                </DropdownMenuItem>
              ))}
            </DropdownMenuContent>
          </DropdownMenu>

          {/* Dev-only diagnostic toggle */}
          {IS_DEV && (
            <Button
              onClick={() => setShowDiagnostics(!showDiagnostics)}
              variant="ghost"
              size="sm"
              className="gap-1 text-muted-foreground"
              title="Mostrar diagnóstico (dev)"
            >
              <Bug className="w-4 h-4" />
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
        </div>
      </motion.div>

      {/* Diagnostic Panel (dev-only) */}
      {IS_DEV && showDiagnostics && (
        <motion.div
          className="p-4 bg-card border border-border rounded-lg text-xs font-mono overflow-auto max-h-80"
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: "auto" }}
          exit={{ opacity: 0, height: 0 }}
        >
          <h4 className="font-bold text-foreground mb-2">🔧 Diagnóstico TTS</h4>
          
          <div className="space-y-2 text-muted-foreground">
            <div>
              <span className="text-foreground font-semibold">Origin:</span>{" "}
              {diagnosticInfo?.origin || window.location.origin}
            </div>
            
            <div>
              <span className="text-foreground font-semibold">VITE_SUPABASE_URL:</span>{" "}
              {import.meta.env.VITE_SUPABASE_URL || "(undefined)"}
            </div>
            
            <div>
              <span className="text-foreground font-semibold">VITE_SUPABASE_PUBLISHABLE_KEY:</span>{" "}
              {import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY 
                ? `${import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY.slice(0, 20)}...` 
                : "(undefined)"}
            </div>

            {diagnosticInfo && (
              <>
                <hr className="border-border my-2" />
                
                <div>
                  <span className="text-foreground font-semibold">Request URL:</span>{" "}
                  {diagnosticInfo.requestUrl}
                </div>
                
                <div>
                  <span className="text-foreground font-semibold">Request Headers:</span>
                  <pre className="bg-muted p-2 rounded mt-1 overflow-x-auto">
                    {JSON.stringify(diagnosticInfo.requestHeaders, null, 2)}
                  </pre>
                </div>
                
                <div>
                  <span className="text-foreground font-semibold">Response Status:</span>{" "}
                  <span className={diagnosticInfo.responseStatus === 200 ? "text-green-500" : "text-destructive"}>
                    {diagnosticInfo.responseStatus ?? "(pending)"}
                  </span>
                </div>
                
                <div>
                  <span className="text-foreground font-semibold">Response Headers:</span>
                  <pre className="bg-muted p-2 rounded mt-1 overflow-x-auto">
                    {JSON.stringify(diagnosticInfo.responseHeaders, null, 2)}
                  </pre>
                </div>
                
                {diagnosticInfo.responseBody && diagnosticInfo.responseStatus !== 200 && (
                  <div>
                    <span className="text-foreground font-semibold">Response Body:</span>
                    <pre className="bg-muted p-2 rounded mt-1 overflow-x-auto text-destructive">
                      {diagnosticInfo.responseBody}
                    </pre>
                  </div>
                )}
                
                <div>
                  <span className="text-foreground font-semibold">Timestamp:</span>{" "}
                  {diagnosticInfo.timestamp}
                </div>
              </>
            )}

            {!diagnosticInfo && (
              <p className="italic">Clique em "Ouvir Artigo" para capturar informações da requisição.</p>
            )}
          </div>
        </motion.div>
      )}
    </div>
  );
};
