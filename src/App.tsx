import React, { useState, useEffect, useRef, useMemo } from 'react';
import { 
  Radio, 
  Sparkles, 
  Play, 
  Pause, 
  RotateCcw, 
  RotateCw,
  Volume2, 
  VolumeX, 
  FileText, 
  Download, 
  Music, 
  Cpu, 
  Layers, 
  Share2, 
  Globe, 
  Skull, 
  Zap, 
  MessageSquare, 
  CheckCircle2, 
  AlertTriangle,
  Terminal,
  Laugh,
  Disc,
  Check,
  Trash2,
  Loader2,
  FolderOpen,
  UploadCloud,
  Paperclip,
  X,
  Eye,
  EyeOff,
  Brain,
  Scale,
  PhoneCall,
  Search,
  Sliders,
  ChevronRight,
  BookOpen
} from 'lucide-react';
import { ALL_SHOWS, transformShow } from './data';

// Resolve the episode named by ?ep=<slug>, if any.
function episodeFromUrl(): RadioShow | null {
  try {
    const slug = new URLSearchParams(window.location.search).get('ep');
    if (slug) return ALL_SHOWS.find(ep => ep.slug === slug) || null;
  } catch { /* non-browser or malformed URL */ }
  return null;
}
import { RadioShow } from './types';
import { saveUserShow, getUserShows, deleteUserShow } from './lib/clientDb';

const PIPELINE_STEPS = [
  { id: 1, name: 'Source Research & Ingestion', desc: 'Gathers primary facts, documents, HN threads, or GitHub repos', icon: Globe },
  { id: 2, name: 'Editorial Thought & Deconstruction', desc: 'Builds fact matrix, incentive map, and 5-beat conflict arc', icon: Brain },
  { id: 3, name: 'Script Synthesis', desc: 'Writes dialogue with Feste (the heat) and Ledger (the receipts)', icon: MessageSquare },
  { id: 4, name: 'Voice Synthesis (TTS)', desc: 'Clean Puck for Feste, Charon for Ledger, telephone filter for callers', icon: Volume2 },
  { id: 5, name: 'Music Composition', desc: 'Composes dynamic background bed using Lyria model', icon: Music },
  { id: 6, name: 'Master Audio Mix', desc: 'Combines speech and music bed with studio ducking via FFmpeg', icon: Layers },
  { id: 7, name: 'Packaging & Thematic Art', desc: 'Generates timecoded alignment, show notes, and 1:1 cover art', icon: Sparkles }
];

const PRESET_TOPICS = [
  {
    title: "Vibe Coding vs. Engineering Standards",
    desc: "Does AI velocity increase productivity or simply manufacture catastrophic technical debt on margin?",
    topic: "Vibe coding vs software engineering standards & tech debt",
    directive: "Interrogate whether 'speed' is masking the disappearance of human code comprehension."
  },
  {
    title: "Valve's Open Windows & Non-Commercial CAD",
    desc: "Valve releases 3D files for Steam Controller under CC-BY-NC. Freedom or walled garden?",
    topic: "Valve open-sources Steam Controller CAD files & hardware repair rights",
    directive: "Compare user repair autonomy with corporate copyright enforcement when someone monetizes it."
  },
  {
    title: "SQLite 2050 Longevity vs. Enterprise Leakage",
    desc: "Library of Congress archival endorsement vs. security panic over unencrypted keychains.",
    topic: "SQLite endorsed by Library of Congress for archival longevity",
    directive: "Spar over zero-dependency simplicity versus corporate perimeter compliance."
  },
  {
    title: "Silicon Valley Term Sheets & 8x Preferences",
    desc: "The myth of founder equity when downside liquidation mechanics trigger.",
    topic: "Startup liquidation preferences, down rounds, and burn rate realities",
    directive: "Translate investor legal gloss into what actually happens to employee stock options."
  }
];

interface AttachedFile {
  name: string;
  size: number;
  content: string;
  preview: string;
  type: string;
  wordCount: number;
}

function formatTime(seconds: number): string {
  if (isNaN(seconds) || seconds < 0) return '00:00';
  const mins = Math.floor(seconds / 60);
  const secs = Math.floor(seconds % 60);
  return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
}

function formatFileSize(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

// Safely extract text from text files or PDF chunks
async function extractFileText(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();

    reader.onload = (e) => {
      const result = e.target?.result;
      if (typeof result === 'string') {
        resolve(result);
      } else if (result instanceof ArrayBuffer) {
        const uint8 = new Uint8Array(result);
        const decoder = new TextDecoder('utf-8', { fatal: false });
        let text = decoder.decode(uint8);

        // Improved plain extraction for PDF streams and text blocks
        if (file.name.toLowerCase().endsWith('.pdf')) {
          const stringChunks = text.match(/\(([^()]{2,})\)/g);
          if (stringChunks && stringChunks.length > 5) {
            text = stringChunks
              .map(m => m.slice(1, -1))
              .filter(chunk => !chunk.includes('Font') && !chunk.includes('Obj'))
              .join(' ');
          }
        }
        resolve(text);
      } else {
        resolve('');
      }
    };

    reader.onerror = () => reject(reader.error || new Error("Failed to read file"));

    const isText = /\.(txt|md|json|csv|xml|html|log|yaml|yml|js|ts|py|sh|sql|tex|env|rst|jsonld)$/i.test(file.name);
    if (isText) {
      reader.readAsText(file);
    } else {
      reader.readAsArrayBuffer(file);
    }
  });
}

export default function App() {
  const [activeTab, setActiveTab] = useState<'generator' | 'pipeline' | 'player'>('generator');
  
  // Topic input & focus directive
  const [topicInput, setTopicInput] = useState('');
  const [directiveInput, setDirectiveInput] = useState('');
  
  // File upload state for topics
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const [attachedFile, setAttachedFile] = useState<AttachedFile | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [isReadingFile, setIsReadingFile] = useState(false);
  const [showFilePreview, setShowFilePreview] = useState(false);

  // Pipeline & generation state
  const [isGenerating, setIsGenerating] = useState(false);
  const [currentStep, setCurrentStep] = useState(0);
  const [logs, setLogs] = useState<string[]>([]);
  const [generationError, setGenerationError] = useState<string | null>(null);
  const abortControllerRef = useRef<AbortController | null>(null);
  const generationIdRef = useRef<string | null>(null);

  // Library & selected episode
  const [episodes, setEpisodes] = useState<RadioShow[]>(ALL_SHOWS);
  const [currentEpisode, setCurrentEpisode] = useState<RadioShow>(() => episodeFromUrl() || ALL_SHOWS[0]);
  const [showArchiveModal, setShowArchiveModal] = useState(false);

  // Player state & views
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState((episodeFromUrl() || ALL_SHOWS[0]).duration || 285);
  const [volume, setVolume] = useState(0.85);
  const [isMuted, setIsMuted] = useState(false);
  const [playbackSpeed, setPlaybackSpeed] = useState<number>(1.0);
  const [copiedShare, setCopiedShare] = useState(false);
  const [playerSubView, setPlayerSubView] = useState<'transcript' | 'editorial'>('transcript');
  const [transcriptSearch, setTranscriptSearch] = useState('');

  // Load saved shows from IndexedDB on mount
  useEffect(() => {
    async function loadSavedShows() {
      try {
        const saved = await getUserShows();
        if (saved && saved.length > 0) {
          const allShows = [...saved, ...ALL_SHOWS];
          const unique = allShows.filter((s, idx, arr) => arr.findIndex(x => x.title === s.title) === idx);
          setEpisodes(unique);
        }
      } catch (err) {
        console.error("Failed to load saved shows:", err);
      }
    }
    loadSavedShows();
  }, []);

  // Sync audio element time & metadata
  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;

    audio.volume = isMuted ? 0 : volume;
    audio.playbackRate = playbackSpeed;

    const handleTimeUpdate = () => {
      setCurrentTime(audio.currentTime);
      if (audio.duration && !isNaN(audio.duration)) {
        setDuration(audio.duration);
      }
    };

    const handleEnded = () => {
      setIsPlaying(false);
      setCurrentTime(0);
    };

    const handleLoadedMetadata = () => {
      if (audio.duration && !isNaN(audio.duration)) {
        setDuration(audio.duration);
      }
    };

    audio.addEventListener('timeupdate', handleTimeUpdate);
    audio.addEventListener('ended', handleEnded);
    audio.addEventListener('loadedmetadata', handleLoadedMetadata);

    return () => {
      audio.removeEventListener('timeupdate', handleTimeUpdate);
      audio.removeEventListener('ended', handleEnded);
      audio.removeEventListener('loadedmetadata', handleLoadedMetadata);
    };
  }, [currentEpisode, isMuted, volume, playbackSpeed]);

  // Audio play/pause controls
  const togglePlay = () => {
    const audio = audioRef.current;
    if (!audio) return;

    if (isPlaying) {
      audio.pause();
      setIsPlaying(false);
    } else {
      audio.play().then(() => {
        setIsPlaying(true);
      }).catch(err => {
        console.error("Playback failed:", err);
      });
    }
  };

  const handleSeek = (newTime: number) => {
    const audio = audioRef.current;
    if (!audio) return;
    audio.currentTime = newTime;
    setCurrentTime(newTime);
  };

  const handleSkip = (seconds: number) => {
    const newTime = Math.max(0, Math.min(duration, currentTime + seconds));
    handleSeek(newTime);
  };

  const toggleMute = () => {
    const audio = audioRef.current;
    if (!audio) return;
    if (isMuted) {
      audio.muted = false;
      setIsMuted(false);
    } else {
      audio.muted = true;
      setIsMuted(true);
    }
  };

  const cyclePlaybackSpeed = () => {
    const speeds = [1.0, 1.25, 1.5, 0.8];
    const nextIdx = (speeds.indexOf(playbackSpeed) + 1) % speeds.length;
    const nextSpeed = speeds[nextIdx];
    setPlaybackSpeed(nextSpeed);
    if (audioRef.current) {
      audioRef.current.playbackRate = nextSpeed;
    }
  };

  const selectEpisode = (ep: RadioShow) => {
    const audio = audioRef.current;
    if (audio) {
      audio.pause();
    }
    setCurrentEpisode(ep);
    setIsPlaying(false);
    setCurrentTime(0);
    setDuration(ep.duration || 285);
    setShowArchiveModal(false);
    setActiveTab('player');
    // Give every episode its own link — the share button copies this URL.
    try {
      window.history.replaceState(null, '', `?ep=${encodeURIComponent(ep.slug)}`);
    } catch { /* ignore */ }
  };

  const handleDeleteEpisode = async (title: string, e: React.MouseEvent) => {
    e.stopPropagation();
    try {
      await deleteUserShow(title);
      const remaining = episodes.filter(ep => ep.title !== title);
      setEpisodes(remaining.length > 0 ? remaining : ALL_SHOWS);
      if (currentEpisode.title === title) {
        setCurrentEpisode(remaining.length > 0 ? remaining[0] : ALL_SHOWS[0]);
      }
    } catch (err) {
      console.error("Failed to delete episode:", err);
    }
  };

  // Handle file uploads for topics
  const handleProcessFile = async (file: File) => {
    setIsReadingFile(true);
    setGenerationError(null);
    try {
      const text = await extractFileText(file);
      const cleanText = text.trim();
      if (!cleanText) {
        throw new Error("The selected file is empty or could not be read as text.");
      }
      const words = cleanText.split(/\s+/).filter(Boolean).length;
      const preview = cleanText.slice(0, 400);
      const ext = file.name.split('.').pop()?.toUpperCase() || 'DOC';

      setAttachedFile({
        name: file.name,
        size: file.size,
        content: cleanText,
        preview,
        type: ext,
        wordCount: words
      });

      // Auto-suggest topic title if currently blank
      if (!topicInput.trim()) {
        const cleanBase = file.name.replace(/\.[^/.]+$/, "").replace(/[-_]/g, " ");
        setTopicInput(`Deconstruction of ${cleanBase}`);
      }
    } catch (err: any) {
      console.error("Error reading file:", err);
      setGenerationError(`File upload error: ${err.message || 'Could not process file'}`);
    } finally {
      setIsReadingFile(false);
    }
  };

  const handleFileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      handleProcessFile(file);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    const file = e.dataTransfer.files?.[0];
    if (file) {
      handleProcessFile(file);
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => {
    setIsDragging(false);
  };

  const removeAttachedFile = (e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    setAttachedFile(null);
    setShowFilePreview(false);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  // Start generation via server /api/generate-show
  const startPipelineRun = async () => {
    const hasTopic = topicInput.trim().length > 0;
    const hasFile = !!attachedFile;

    if ((!hasTopic && !hasFile) || isGenerating) return;

    setIsGenerating(true);
    setCurrentStep(1);
    setGenerationError(null);
    const genId = 'gen_' + Date.now();
    generationIdRef.current = genId;
    abortControllerRef.current = new AbortController();

    const baseTopic = topicInput.trim() || (attachedFile ? `Deconstruction of ${attachedFile.name}` : "Technology & policy debate");
    const effectiveTopic = directiveInput.trim() 
      ? `${baseTopic} — Critical Angle: ${directiveInput.trim()}`
      : baseTopic;

    const initialLogs = [
      `[${new Date().toLocaleTimeString()}] 🃏 Ring My Bell initialized. Topic: "${effectiveTopic}"`,
      ...(attachedFile ? [`[${new Date().toLocaleTimeString()}] 📄 Source file attached: "${attachedFile.name}" (${formatFileSize(attachedFile.size)}, ${attachedFile.wordCount} words)`] : []),
      `[${new Date().toLocaleTimeString()}] Step 1 (Source Research) executing...`
    ];
    setLogs(initialLogs);
    setActiveTab('pipeline');

    let generatedShow: RadioShow | null = null;

    try {
      // Submit the generation as an async job — the server queues it and returns immediately.
      // Progress is polled below; this keeps generation working on static hosting.
      const submitRes = await fetch('/api/generate-show', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          topic: effectiveTopic,
          fileName: attachedFile?.name,
          fileContent: attachedFile?.content,
          duration: "3",
          mood: "Mischievous & Rigorous"
        }),
        signal: abortControllerRef.current.signal
      });

      if (!submitRes.ok) {
        const errorText = await submitRes.text();
        throw new Error(`Server returned HTTP ${submitRes.status}: ${errorText}`);
      }

      const { jobId } = await submitRes.json();
      if (!jobId) throw new Error("Server did not return a job ID.");
      generationIdRef.current = jobId;
      setLogs(prev => [...prev, `[${new Date().toLocaleTimeString()}] \uD83D\uDEF0\uFE0F Job ${jobId} queued. Polling for progress...`]);

      const handleJobEvent = (event: any) => {
        const timeStr = new Date().toLocaleTimeString();

        if (event.type === "info") {
          setLogs(prev => [...prev, `[${timeStr}] \u2139\uFE0F ${event.message}`]);
        } else if (event.type === "tool_call") {
          const cmd = String(event.arguments?.command || event.arguments?.code || event.arguments?.path || event.name || "");
          setLogs(prev => [...prev, `[${timeStr}] \u26A1 Tool: ${event.name} -> ${cmd.slice(0, 80)}`]);

          if (cmd.includes('research') || cmd.includes('fetch_hn') || cmd.includes('fetch_url') || cmd.includes('fetch_github')) {
            setCurrentStep(1);
          } else if (cmd.includes('editorial') || cmd.includes('deconstruction')) {
            setCurrentStep(2);
          } else if (cmd.includes('script-writing') || cmd.includes('generate_script')) {
            setCurrentStep(3);
          } else if (cmd.includes('tts-generation') || cmd.includes('generate_tts')) {
            setCurrentStep(4);
          } else if (cmd.includes('music-generation') || cmd.includes('generate_music')) {
            setCurrentStep(5);
          } else if (cmd.includes('audio-mixing') || cmd.includes('mix_audio')) {
            setCurrentStep(6);
          } else if (cmd.includes('metadata-generation') || cmd.includes('generate_metadata') || cmd.includes('cover-image') || cmd.includes('generate_image')) {
            setCurrentStep(7);
          }
        } else if (event.type === "tool_result") {
          const preview = typeof event.result === 'string' ? event.result.slice(0, 100) : 'Done';
          setLogs(prev => [...prev, `[${timeStr}] \u2713 Tool Result: ${preview}`]);
          if (typeof event.result === 'string') {
            if (event.result.includes('Phase 1') || event.result.includes('editorial analysis')) {
              setCurrentStep(2);
            } else if (event.result.includes('Phase 2') || event.result.includes('Script saved') || event.result.includes('script.md')) {
              setCurrentStep(3);
            }
          }
        } else if (event.type === "text" && event.text) {
          setLogs(prev => [...prev, `[${timeStr}] \uD83C\uCCF5 Feste: ${event.text.slice(0, 140)}`]);
        } else if (event.type === "show_data" && event.data) {
          const audioUrl = typeof event.data.audioUrl === "string" ? event.data.audioUrl : "";
          const hasPlayableAudio =
            audioUrl.startsWith("data:audio/") ||
            audioUrl.startsWith("/shows/") ||
            audioUrl.startsWith("/api/jobs/");

          if (hasPlayableAudio) {
            try {
              generatedShow = transformShow(event.data);
              setLogs(prev => [...prev, `[${timeStr}] \uD83D\uDCE6 Received finalized show metadata and playable audio package.`]);
            } catch (showErr) {
              console.error("Could not parse finalized show package:", showErr);
              setLogs(prev => [...prev, `[${timeStr}] \u26A0\uFE0F Received show metadata, but it could not be parsed.`]);
            }
          } else {
            // The agent can emit metadata before the server has packaged the real MP3.
            // Never treat that early metadata as a finished episode or fall back to demo audio.
            setLogs(prev => [...prev, `[${timeStr}] \u23F3 Show metadata received; waiting for the final audio package.`]);
          }
        } else if (event.type === "error") {
          setLogs(prev => [...prev, `[${timeStr}] \u274C Error: ${event.message}`]);
        }
      };

      // Poll the job until it completes, fails, or is cancelled.
      let lastIndex = 0;
      for (;;) {
        await new Promise(r => setTimeout(r, 3000));
        if (abortControllerRef.current.signal.aborted) break;

        const pollRes = await fetch(`/api/jobs/${jobId}?since=${lastIndex}`, {
          signal: abortControllerRef.current.signal
        });
        if (!pollRes.ok) {
          throw new Error(`Job poll failed: HTTP ${pollRes.status}`);
        }
        const job = await pollRes.json();
        for (const event of (job.events || [])) handleJobEvent(event);
        lastIndex = typeof job.total === "number" ? job.total : lastIndex;

        if (job.status === "complete") break;
        if (job.status === "failed" || job.status === "cancelled") {
          throw new Error(job.error || "Generation failed.");
        }
      }

      if (!generatedShow) {
        throw new Error("The pipeline ended without returning the final playable audio package. The demo podcast was not loaded. Check the server log for the audio archive download or show_notes.json errors, then retry.");
      }

      setCurrentStep(7);
      setLogs(prev => [...prev, `[${new Date().toLocaleTimeString()}] 🎉 Broadcast complete! Final audio package received.`]);

      const fullShow = { ...generatedShow, isUserGenerated: true };
      await saveUserShow(fullShow);
      setEpisodes(prev => [fullShow, ...prev.filter(ep => ep.title !== fullShow.title)]);
      setCurrentEpisode(fullShow);
      setActiveTab('player');

    } catch (err: any) {
      if (err.name === 'AbortError') {
        setLogs(prev => [...prev, `[${new Date().toLocaleTimeString()}] ⏹️ Generation cancelled by user.`]);
      } else {
        console.error("Pipeline run failed:", err);
        setGenerationError(err.message || "Failed to generate show.");
        setLogs(prev => [...prev, `[${new Date().toLocaleTimeString()}] ❌ Failed: ${err.message || 'Unknown error'}`]);
      }
    } finally {
      setIsGenerating(false);
    }
  };

  const handleCancelGeneration = async () => {
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }
    if (generationIdRef.current) {
      const gid = generationIdRef.current;
      try {
        // New async-job cancel endpoint; falls back to the legacy Express endpoint.
        const r = await fetch(`/api/jobs/${gid}/cancel`, { method: 'POST' });
        if (!r.ok) {
          await fetch('/api/cancel-show', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ generationId: gid })
          });
        }
      } catch (e) {
        // ignore
      }
    }
    setIsGenerating(false);
  };

  const handleDownloadShow = () => {
    if (!currentEpisode.audioUrl) return;
    const a = document.createElement('a');
    a.href = currentEpisode.audioUrl;
    a.download = `${currentEpisode.title.replace(/[^a-zA-Z0-9]/g, '_')}.mp3`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  };

  const handleDownloadNotes = () => {
    const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(currentEpisode, null, 2));
    const a = document.createElement('a');
    a.href = dataStr;
    a.download = `${currentEpisode.title.replace(/[^a-zA-Z0-9]/g, '_')}_notes.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  };

  const handleShare = () => {
    navigator.clipboard.writeText(window.location.href);
    setCopiedShare(true);
    setTimeout(() => setCopiedShare(false), 2500);
  };

  // Filtered transcript lines for search
  const filteredTranscript = useMemo(() => {
    if (!transcriptSearch.trim()) return currentEpisode.transcript;
    const q = transcriptSearch.toLowerCase();
    return currentEpisode.transcript.filter(
      line => line.text.toLowerCase().includes(q) || line.speaker.toLowerCase().includes(q)
    );
  }, [currentEpisode.transcript, transcriptSearch]);

  return (
    <div className="min-h-screen bg-[#07020d] text-slate-100 font-sans selection:bg-emerald-500 selection:text-slate-950 flex flex-col justify-between overflow-x-hidden">
      {/* Hidden real audio element */}
      <audio 
        ref={audioRef}
        src={currentEpisode.audioUrl}
        preload="metadata"
      />

      {/* Atmospheric Studio Lighting */}
      <div className="fixed inset-0 pointer-events-none opacity-20 z-0">
        <div className="absolute top-0 -left-40 w-96 h-96 bg-purple-700 rounded-full blur-[140px]" />
        <div className="absolute top-1/2 -right-40 w-96 h-96 bg-emerald-500 rounded-full blur-[140px]" />
        <div className="absolute bottom-0 left-1/3 w-96 h-96 bg-amber-500 rounded-full blur-[160px]" />
      </div>

      {/* Studio Header */}
      <header className="relative z-20 border-b border-white/10 bg-[#0d0519]/90 backdrop-blur-xl px-6 py-3.5 flex flex-col md:flex-row items-center justify-between gap-4">
        <div className="flex items-center space-x-3.5 cursor-pointer" onClick={() => setActiveTab('generator')}>
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-purple-700 via-emerald-400 to-amber-300 p-0.5 shadow-lg shadow-purple-950">
            <div className="w-full h-full bg-[#090214] rounded-[10px] flex items-center justify-center text-emerald-400">
              <Radio className="w-5 h-5 text-emerald-400" />
            </div>
          </div>
          <div>
            <div className="flex items-center space-x-2">
              <h1 className="text-lg font-black tracking-wider text-white uppercase italic">
                RING MY BELL
              </h1>
              <span className="text-[11px] font-mono text-emerald-400 font-bold tracking-widest">
                98.5 FM
              </span>
            </div>
            <div className="flex items-center space-x-2 text-[10px] font-mono text-slate-400">
              <span>Feste & Ledger</span>
              <span aria-hidden="true">·</span>
              <span>The Fool & The Receipts</span>
              <span aria-hidden="true">·</span>
              <a
                href="https://buildwhilebleeding.com"
                target="_blank"
                rel="noopener noreferrer"
                className="hover:text-emerald-300 transition-colors underline decoration-dotted underline-offset-2"
                title="A Build While Bleeding project">
                A Build While Bleeding project
              </a>
              <span aria-hidden="true">·</span>
              <span className="flex items-center text-emerald-400 font-semibold">
                <span className={`w-1.5 h-1.5 rounded-full mr-1 ${isPlaying || isGenerating ? 'bg-red-500 animate-ping' : 'bg-emerald-400'}`} />
                {isPlaying ? 'ON AIR' : isGenerating ? 'TRANSMITTING' : 'STUDIO READY'}
              </span>
            </div>
          </div>
        </div>

        {/* Clean Segmented Navigation (Zero-Pill Discipline) */}
        <div className="flex items-center space-x-4">
          <nav className="flex items-center bg-[#150a26] border border-white/10 rounded-xl p-1 text-xs font-mono">
            <button 
              onClick={() => setActiveTab('generator')}
              className={`px-3.5 py-1.5 rounded-lg transition-colors cursor-pointer ${
                activeTab === 'generator' 
                  ? 'bg-white/10 text-emerald-300 font-bold shadow-sm' 
                  : 'text-slate-400 hover:text-white'
              }`}>
              01 Generator
            </button>
            <button 
              onClick={() => setActiveTab('pipeline')}
              className={`px-3.5 py-1.5 rounded-lg transition-colors cursor-pointer flex items-center space-x-1.5 ${
                activeTab === 'pipeline' 
                  ? 'bg-white/10 text-emerald-300 font-bold shadow-sm' 
                  : 'text-slate-400 hover:text-white'
              }`}>
              <span>02 Pipeline Monitor</span>
              {isGenerating && <span className="w-1.5 h-1.5 rounded-full bg-amber-400 animate-ping" />}
            </button>
            <button 
              onClick={() => setActiveTab('player')}
              className={`px-3.5 py-1.5 rounded-lg transition-colors cursor-pointer ${
                activeTab === 'player' 
                  ? 'bg-white/10 text-emerald-300 font-bold shadow-sm' 
                  : 'text-slate-400 hover:text-white'
              }`}>
              03 Studio Deck
            </button>
          </nav>

          <button
            onClick={() => setShowArchiveModal(true)}
            className="flex items-center space-x-2 px-3.5 py-1.5 bg-[#150a26] hover:bg-white/10 border border-white/10 rounded-xl text-xs font-mono text-slate-300 hover:text-white transition-colors cursor-pointer"
            title="Browse Episode Archives">
            <FolderOpen className="w-4 h-4 text-emerald-400" />
            <span className="hidden sm:inline">Archives ({episodes.length})</span>
          </button>
        </div>
      </header>

      {/* Main Studio Deck */}
      <main className="flex-1 relative z-10 pb-28">
        
        {/* ========================================================================= */}
        {/* TAB 1: GENERATOR (Tactile Studio Transmission Console)                    */}
        {/* ========================================================================= */}
        {activeTab === 'generator' && (
          <div className="max-w-4xl mx-auto px-4 py-10 lg:py-14 space-y-8">
            
            {/* Studio Masthead Statement */}
            <div className="text-center space-y-3 max-w-2xl mx-auto">
              <div className="text-xs font-mono uppercase tracking-widest text-emerald-400 font-semibold flex items-center justify-center space-x-2">
                <Skull className="w-4 h-4 text-emerald-400" />
                <span>Two men walk into a tent full of lies</span>
              </div>
              <h2 className="text-3xl lg:text-5xl font-black tracking-tight text-white italic uppercase">
                One brings the receipts. <span className="bg-gradient-to-r from-emerald-400 via-amber-300 to-purple-400 bg-clip-text text-transparent">One brings the match.</span>
              </h2>
              <p className="text-slate-300 text-sm leading-relaxed">
                Provide a prompt, URL, or upload your own research paper, policy draft, or technical data. The pipeline conducts deep pre-show editorial deconstruction before synthesizing the broadcast.
              </p>
            </div>

            {/* Master Transmission Deck Card */}
            <div className="bg-[#120721]/90 border border-white/10 rounded-2xl p-6 lg:p-8 shadow-2xl relative overflow-hidden backdrop-blur-xl space-y-6">
              
              {/* Field 1: Topic / Subject */}
              <div className="space-y-2">
                <div className="flex items-center justify-between text-xs font-mono">
                  <label className="text-emerald-400 uppercase tracking-wider font-bold flex items-center space-x-1.5">
                    <Globe className="w-4 h-4 text-emerald-400" />
                    <span>Topic, Source URL, or Subject</span>
                  </label>
                  <span className="text-slate-400">
                    Grounded research · 0% fake data
                  </span>
                </div>
                <input 
                  type="text" 
                  value={topicInput}
                  onChange={(e) => setTopicInput(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') startPipelineRun();
                  }}
                  placeholder="e.g. Valve CAD open-source release, Vibe coding technical debt, or SQLite preservation..." 
                  className="w-full px-4 py-3.5 bg-[#090312] border border-white/15 rounded-xl text-slate-100 placeholder-slate-500 focus:outline-none focus:border-emerald-400 focus:ring-1 focus:ring-emerald-400 transition-all font-mono text-sm"
                />
              </div>

              {/* Field 2: Topic File Upload (Requirement 2) */}
              <div className="space-y-2.5">
                <div className="flex items-center justify-between text-xs font-mono">
                  <label className="text-emerald-400 uppercase tracking-wider font-bold flex items-center space-x-1.5">
                    <Paperclip className="w-3.5 h-3.5 text-emerald-400" />
                    <span>Topic Source Material Document (Optional Upload)</span>
                  </label>
                  <span className="text-slate-400">
                    PDF · Markdown · TXT · JSON · CSV · Code
                  </span>
                </div>

                {/* Hidden File Input */}
                <input 
                  type="file" 
                  ref={fileInputRef}
                  onChange={handleFileInputChange}
                  accept=".txt,.md,.pdf,.json,.csv,.log,.xml,.html,.py,.js,.ts,.yaml,.yml,.jsonld,.rst"
                  className="hidden"
                />

                {!attachedFile ? (
                  /* Dropzone when empty */
                  <div 
                    onDragOver={handleDragOver}
                    onDragLeave={handleDragLeave}
                    onDrop={handleDrop}
                    onClick={() => fileInputRef.current?.click()}
                    className={`border-2 border-dashed rounded-xl p-6 text-center cursor-pointer transition-all duration-200 ${
                      isDragging 
                        ? 'border-emerald-400 bg-emerald-500/10' 
                        : 'border-white/15 hover:border-emerald-400/60 bg-[#090312]/60 hover:bg-[#0e041d]'
                    }`}>
                    <div className="flex flex-col items-center justify-center space-y-2">
                      <div className="w-10 h-10 rounded-xl bg-purple-950/60 border border-purple-800/50 flex items-center justify-center text-emerald-400">
                        {isReadingFile ? (
                          <Loader2 className="w-5 h-5 animate-spin" />
                        ) : (
                          <UploadCloud className="w-5 h-5" />
                        )}
                      </div>
                      <div className="text-xs font-mono text-slate-200">
                        <span className="font-bold text-emerald-400 underline underline-offset-2">Click to browse file</span> or drag & drop research doc
                      </div>
                      <p className="text-[11px] text-slate-400 font-sans max-w-md">
                        Feeds raw articles, whitepapers, legislation drafts, or code directly to the Jester & Ledger as primary evidence for deep deconstruction.
                      </p>
                    </div>
                  </div>
                ) : (
                  /* Attached File Card */
                  <div className="bg-[#090312] border border-emerald-500/40 rounded-xl p-4 space-y-3">
                    <div className="flex items-center justify-between gap-3">
                      <div className="flex items-center space-x-3 overflow-hidden">
                        <div className="w-9 h-9 rounded-lg bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-emerald-400 shrink-0 font-mono text-xs font-bold">
                          {attachedFile.type}
                        </div>
                        <div className="truncate">
                          <div className="flex items-center space-x-2">
                            <span className="text-xs font-bold text-white truncate font-mono">{attachedFile.name}</span>
                            <span className="text-[10px] font-mono text-emerald-300">
                              {formatFileSize(attachedFile.size)} · {attachedFile.wordCount} words
                            </span>
                          </div>
                          <p className="text-[10px] font-mono text-emerald-400/90 mt-0.5">
                            ✓ Document attached to research pipeline
                          </p>
                        </div>
                      </div>

                      <div className="flex items-center space-x-2 shrink-0">
                        <button
                          type="button"
                          onClick={() => setShowFilePreview(!showFilePreview)}
                          className="px-2.5 py-1.5 text-slate-300 hover:text-white bg-[#150a26] hover:bg-white/10 border border-white/10 rounded-lg text-xs font-mono transition-colors flex items-center space-x-1 cursor-pointer"
                          title={showFilePreview ? "Hide Preview" : "Preview Content"}>
                          {showFilePreview ? <EyeOff className="w-3.5 h-3.5 text-slate-300" /> : <Eye className="w-3.5 h-3.5 text-emerald-400" />}
                          <span className="text-[11px] hidden sm:inline">{showFilePreview ? 'Hide' : 'Preview'}</span>
                        </button>

                        <button
                          type="button"
                          onClick={removeAttachedFile}
                          className="p-1.5 text-slate-400 hover:text-red-400 bg-[#150a26] hover:bg-red-950/40 border border-white/10 hover:border-red-500/40 rounded-lg transition-colors cursor-pointer"
                          title="Remove attached file">
                          <X className="w-4 h-4" />
                        </button>
                      </div>
                    </div>

                    {/* Expandable Monospace Preview Drawer */}
                    {showFilePreview && (
                      <div className="pt-2 border-t border-white/10 space-y-1">
                        <div className="flex items-center justify-between text-[10px] font-mono text-slate-400">
                          <span>Primary Source Excerpt:</span>
                          <span>{attachedFile.content.length} characters</span>
                        </div>
                        <pre className="text-[11px] font-mono text-slate-300 bg-black/60 p-3 rounded-lg border border-white/10 overflow-x-auto max-h-36 whitespace-pre-wrap leading-relaxed">
                          {attachedFile.preview}
                          {attachedFile.content.length > 400 && '...'}
                        </pre>
                      </div>
                    )}
                  </div>
                )}
              </div>

              {/* Field 3: Specific Focus / Interrogation Angle */}
              <div className="space-y-2">
                <div className="flex items-center justify-between text-xs font-mono">
                  <label className="text-slate-300 uppercase tracking-wider font-semibold flex items-center space-x-1.5">
                    <Sliders className="w-3.5 h-3.5 text-amber-400" />
                    <span>Editorial Directive / Interrogation Angle (Optional)</span>
                  </label>
                  <span className="text-slate-400">
                    Instructs the pre-show deconstruction
                  </span>
                </div>
                <input 
                  type="text" 
                  value={directiveInput}
                  onChange={(e) => setDirectiveInput(e.target.value)}
                  placeholder="e.g. 'Target the hidden licensing clause', 'Challenge Simon's conclusion', or 'Focus on downstream maintenance costs'..." 
                  className="w-full px-4 py-2.5 bg-[#090312] border border-white/15 rounded-xl text-slate-100 placeholder-slate-500 focus:outline-none focus:border-amber-400 focus:ring-1 focus:ring-amber-400 transition-all font-mono text-xs"
                />
              </div>

              {/* Quick Inspiration Dispatches */}
              <div className="space-y-2 pt-2">
                <span className="text-[11px] font-mono uppercase tracking-wider text-slate-400 font-bold">
                  Curated Dispatch Disputations:
                </span>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-2.5">
                  {PRESET_TOPICS.map((preset, idx) => (
                    <div
                      key={idx}
                      onClick={() => {
                        setTopicInput(preset.topic);
                        setDirectiveInput(preset.directive);
                      }}
                      className="p-3 bg-[#0a0314] hover:bg-[#150a26] border border-white/10 hover:border-emerald-400/50 rounded-xl cursor-pointer transition-all space-y-1">
                      <div className="text-xs font-mono font-bold text-slate-200 hover:text-emerald-300 flex items-center justify-between">
                        <span>{preset.title}</span>
                        <ChevronRight className="w-3.5 h-3.5 text-slate-500" />
                      </div>
                      <p className="text-[11px] text-slate-400 line-clamp-1">{preset.desc}</p>
                    </div>
                  ))}
                </div>
              </div>

              {/* Error Banner */}
              {generationError && (
                <div className="p-3.5 rounded-xl bg-red-950/60 border border-red-500/50 text-red-200 text-xs font-mono flex items-center space-x-2">
                  <AlertTriangle className="w-4 h-4 text-red-400 shrink-0" />
                  <span>{generationError}</span>
                </div>
              )}

              {/* Bottom Action Deck */}
              <div className="pt-4 flex flex-col sm:flex-row items-center justify-between gap-4 border-t border-white/10">
                <div className="text-xs text-slate-400 font-mono flex items-center space-x-2">
                  <Brain className="w-4 h-4 text-emerald-400 shrink-0" />
                  <span>
                    {attachedFile 
                      ? `Source attached: ${attachedFile.name.slice(0, 22)}... · Pre-show analysis enabled` 
                      : 'Workflow: Research · Editorial Thought · Script · TTS · Lyria · Master Mix'}
                  </span>
                </div>

                <button
                  onClick={startPipelineRun}
                  disabled={isGenerating || (!topicInput.trim() && !attachedFile)}
                  className="w-full sm:w-auto px-7 py-3.5 bg-gradient-to-r from-emerald-400 via-emerald-500 to-amber-300 text-slate-950 font-black rounded-xl hover:brightness-110 transition-all shadow-lg shadow-emerald-500/20 flex items-center justify-center space-x-2.5 cursor-pointer uppercase tracking-wider text-xs font-mono disabled:opacity-40 disabled:cursor-not-allowed">
                  {isGenerating ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      <span>TRANSMITTING BROADCAST...</span>
                    </>
                  ) : (
                    <>
                      <Radio className="w-4 h-4" />
                      <span>TRANSMIT BROADCAST</span>
                    </>
                  )}
                </button>
              </div>

            </div>
          </div>
        )}

        {/* ========================================================================= */}
        {/* TAB 2: PIPELINE MONITOR                                                   */}
        {/* ========================================================================= */}
        {activeTab === 'pipeline' && (
          <div className="max-w-5xl mx-auto px-4 py-10 space-y-8">
            <div className="border-b border-white/10 pb-4 flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div>
                <h2 className="text-xl font-black italic uppercase text-white tracking-wider flex items-center space-x-2">
                  <Cpu className="w-5 h-5 text-emerald-400" />
                  <span>Jester Broadcast Pipeline Monitor</span>
                </h2>
                <div className="flex items-center space-x-2 text-xs font-mono text-slate-400 mt-1">
                  <span>Target: "{topicInput || (attachedFile ? attachedFile.name : currentEpisode.title)}"</span>
                </div>
              </div>

              <div className="flex items-center space-x-3 font-mono text-xs">
                {isGenerating && (
                  <button
                    onClick={handleCancelGeneration}
                    className="px-3 py-1.5 rounded-lg border border-red-500/40 bg-red-500/10 text-red-300 hover:bg-red-500/20 cursor-pointer">
                    ABORT
                  </button>
                )}
                <span className={`px-3 py-1.5 rounded-lg border ${
                  isGenerating 
                    ? 'bg-amber-500/10 border-amber-500/40 text-amber-300 animate-pulse' 
                    : 'bg-emerald-500/10 border-emerald-500/40 text-emerald-400'
                }`}>
                  {isGenerating ? '● AGENT REASONING & SYNTHESIZING' : '✓ IDLE / COMPLETED'}
                </span>
              </div>
            </div>

            {/* Pipeline Stage Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3.5">
              {PIPELINE_STEPS.map((step) => {
                const Icon = step.icon;
                const isCurrent = isGenerating && currentStep === step.id;
                const isPassed = currentStep > step.id || (!isGenerating && currentStep === PIPELINE_STEPS.length);

                return (
                  <div 
                    key={step.id} 
                    className={`p-4 rounded-xl border transition-all relative overflow-hidden ${
                      isCurrent 
                        ? 'bg-purple-900/30 border-emerald-400 shadow-lg shadow-emerald-500/10' 
                        : isPassed 
                        ? 'bg-[#120721] border-white/10 text-slate-200' 
                        : 'bg-[#090312] border-white/5 opacity-40'
                    }`}>
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-[10px] font-mono text-slate-400 font-bold">STEP 0{step.id}</span>
                      {isPassed ? (
                        <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                      ) : isCurrent ? (
                        <Zap className="w-4 h-4 text-amber-400 animate-bounce" />
                      ) : (
                        <div className="w-1.5 h-1.5 rounded-full bg-slate-700" />
                      )}
                    </div>
                    <div className="flex items-center space-x-2.5 mb-1.5">
                      <Icon className={`w-4 h-4 ${isCurrent ? 'text-emerald-400' : 'text-slate-300'}`} />
                      <h3 className="font-bold text-xs text-white truncate">{step.name}</h3>
                    </div>
                    <p className="text-[11px] text-slate-400 leading-relaxed font-sans line-clamp-2">{step.desc}</p>
                  </div>
                );
              })}
            </div>

            {/* Terminal Console Output */}
            <div className="bg-[#05010b] border border-white/10 rounded-xl p-4 font-mono text-xs space-y-2 shadow-2xl">
              <div className="flex items-center justify-between pb-2 border-b border-white/10 text-slate-400">
                <div className="flex items-center space-x-2">
                  <Terminal className="w-4 h-4 text-emerald-400" />
                  <span>agent_pipeline_execution.log</span>
                </div>
                <span className="text-[10px] text-slate-500">python agent/skills/run_pipeline.py</span>
              </div>
              <div className="h-64 overflow-y-auto space-y-1.5 text-emerald-400/90 font-mono p-3 bg-black/50 rounded-lg">
                {logs.length === 0 ? (
                  <span className="text-slate-600 italic">No active logs. Click "TRANSMIT BROADCAST" on the Generator tab to initiate execution.</span>
                ) : (
                  logs.map((log, idx) => <div key={idx} className="leading-relaxed">{log}</div>)
                )}
              </div>
            </div>

            {!isGenerating && currentStep === PIPELINE_STEPS.length && (
              <div className="flex justify-end">
                <button
                  onClick={() => setActiveTab('player')}
                  className="px-5 py-2.5 bg-emerald-400 hover:bg-emerald-300 text-slate-950 font-bold rounded-xl text-xs font-mono uppercase tracking-wider flex items-center space-x-2 transition-all cursor-pointer">
                  <span>Open in Studio Deck</span>
                  <Play className="w-3.5 h-3.5 fill-current" />
                </button>
              </div>
            )}
          </div>
        )}

        {/* ========================================================================= */}
        {/* TAB 3: STUDIO DECK & EDITORIAL THOUGHT                                     */}
        {/* ========================================================================= */}
        {activeTab === 'player' && (
          <div className="max-w-6xl mx-auto px-4 py-8 space-y-8">
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
              
              {/* Left Column: Artwork & Episode Metadata */}
              <div className="lg:col-span-5 space-y-4">
                <div className="relative group rounded-2xl overflow-hidden border border-white/15 shadow-2xl bg-black">
                  <img 
                    src={currentEpisode.coverImage || "https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?q=80&w=800&auto=format&fit=crop"} 
                    alt={currentEpisode.title} 
                    className="w-full aspect-square object-cover"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-[#07020d] via-transparent to-transparent opacity-80" />
                  
                  {/* Subtle Vinyl Disc in Background when playing */}
                  {isPlaying && (
                    <div className="absolute top-4 right-4 animate-spin opacity-80" style={{ animationDuration: '6s' }}>
                      <Disc className="w-8 h-8 text-amber-400" />
                    </div>
                  )}

                  <div className="absolute bottom-5 left-5 right-5 space-y-1.5">
                    <div className="flex items-center space-x-2 text-[10px] font-mono text-emerald-400 font-bold uppercase tracking-wider">
                      <span>98.5 FM</span>
                      <span aria-hidden="true">·</span>
                      <span>RING MY BELL</span>
                    </div>
                    <h3 className="text-xl font-black text-white italic drop-shadow-md leading-tight">{currentEpisode.title}</h3>
                  </div>
                </div>

                {/* Synopsis Card (Zero-Pill Discipline) */}
                <div className="bg-[#120721] border border-white/10 rounded-xl p-4 space-y-2">
                  <div className="flex items-center justify-between text-[11px] font-mono text-slate-400">
                    <span className="text-emerald-400 font-bold uppercase">Broadcast Overview</span>
                    <span>{currentEpisode.date} · {formatTime(currentEpisode.duration)}</span>
                  </div>
                  <p className="text-xs text-slate-300 leading-relaxed font-sans">{currentEpisode.summary}</p>
                </div>

                {/* Action Buttons */}
                <div className="flex items-center gap-2.5">
                  <button
                    onClick={handleDownloadShow}
                    className="flex-1 py-2.5 px-3 bg-[#150a26] hover:bg-white/10 border border-white/10 rounded-xl text-xs font-mono font-bold text-white flex items-center justify-center space-x-2 transition-colors cursor-pointer">
                    <Download className="w-4 h-4 text-emerald-400" />
                    <span>Download MP3</span>
                  </button>

                  <button
                    onClick={handleDownloadNotes}
                    className="py-2.5 px-3 bg-[#150a26] hover:bg-white/10 border border-white/10 rounded-xl text-xs font-mono font-bold text-white flex items-center justify-center space-x-2 transition-colors cursor-pointer"
                    title="Export show_notes.json">
                    <FileText className="w-4 h-4 text-amber-400" />
                    <span>JSON Notes</span>
                  </button>

                  <button
                    onClick={handleShare}
                    className="py-2.5 px-3 bg-[#150a26] hover:bg-white/10 border border-white/10 rounded-xl text-xs font-mono font-bold text-white flex items-center justify-center space-x-2 transition-colors cursor-pointer"
                    title="Copy Share Link">
                    {copiedShare ? <Check className="w-4 h-4 text-emerald-400" /> : <Share2 className="w-4 h-4 text-slate-300" />}
                  </button>
                </div>
              </div>

              {/* Right Column: Audio Console & Thought / Transcript Inspector */}
              <div className="lg:col-span-7 space-y-6">
                
                {/* Master Audio Console */}
                <div className="bg-[#120721] border border-white/15 rounded-2xl p-5 space-y-4 shadow-xl">
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="flex items-center space-x-2 text-[11px] font-mono text-slate-400">
                        <span>Host: {currentEpisode.host || 'Feste'}</span>
                        <span aria-hidden="true">·</span>
                        <span>Co-Host: Ledger</span>
                      </div>
                      <h2 className="text-base font-bold text-white mt-0.5 truncate">{currentEpisode.title}</h2>
                    </div>

                    {/* Animated Frequency Visualizer Bars */}
                    <div className="flex items-end space-x-1 h-6 px-2">
                      {[40, 75, 55, 90, 60, 80, 45, 95, 70, 65, 85, 50].map((h, i) => (
                        <div 
                          key={i} 
                          className={`w-1 rounded-full transition-all duration-150 ${
                            isPlaying ? 'bg-emerald-400' : 'bg-slate-700'
                          }`}
                          style={{
                            height: isPlaying ? `${Math.max(15, (h * ((i % 3) + 1)) % 100)}%` : '20%',
                            transitionDelay: `${i * 30}ms`
                          }}
                        />
                      ))}
                    </div>
                  </div>

                  {/* Scrubber Slider */}
                  <div className="space-y-1.5">
                    <input 
                      type="range" 
                      min="0" 
                      max={duration || 100} 
                      value={currentTime}
                      onChange={(e) => handleSeek(Number(e.target.value))}
                      className="w-full accent-emerald-400 bg-black/60 h-2 rounded-lg cursor-pointer"
                    />
                    <div className="flex justify-between text-[11px] font-mono text-slate-400">
                      <span>{formatTime(currentTime)}</span>
                      <span>{formatTime(duration)}</span>
                    </div>
                  </div>

                  {/* Transport Controls */}
                  <div className="flex items-center justify-between pt-1">
                    <div className="flex items-center space-x-2">
                      <button 
                        onClick={toggleMute}
                        className="p-2 text-slate-300 hover:text-emerald-400 transition-colors cursor-pointer"
                        title={isMuted ? "Unmute" : "Mute"}>
                        {isMuted ? <VolumeX className="w-4 h-4 text-red-400" /> : <Volume2 className="w-4 h-4" />}
                      </button>

                      <button 
                        onClick={cyclePlaybackSpeed}
                        className="px-2 py-1 text-[11px] font-mono text-slate-300 hover:text-amber-400 bg-black/40 border border-white/10 rounded-md transition-colors cursor-pointer"
                        title="Change playback speed">
                        {playbackSpeed}x
                      </button>
                    </div>

                    <div className="flex items-center space-x-3">
                      <button 
                        onClick={() => handleSkip(-10)}
                        className="p-2 text-slate-300 hover:text-white transition-colors cursor-pointer"
                        title="Skip back 10s">
                        <RotateCcw className="w-4 h-4" />
                      </button>

                      <button 
                        onClick={togglePlay}
                        className="p-4 bg-gradient-to-tr from-emerald-400 to-emerald-500 text-slate-950 rounded-full hover:scale-105 transition-all shadow-md shadow-emerald-500/20 cursor-pointer">
                        {isPlaying ? <Pause className="w-5 h-5 fill-current" /> : <Play className="w-5 h-5 fill-current ml-0.5" />}
                      </button>

                      <button 
                        onClick={() => handleSkip(10)}
                        className="p-2 text-slate-300 hover:text-white transition-colors cursor-pointer"
                        title="Skip forward 10s">
                        <RotateCw className="w-4 h-4" />
                      </button>
                    </div>

                    <div className="text-right">
                      <span className="text-[10px] font-mono text-emerald-400">
                        {isPlaying ? 'STREAMING' : 'PAUSED'}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Dual Sub-View Switcher: Transcript vs Editorial Thought (Requirement 3) */}
                <div className="bg-[#120721] border border-white/10 rounded-2xl p-5 space-y-4">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-3 border-b border-white/10 gap-3">
                    
                    {/* View Switcher (Zero-Pill Discipline) */}
                    <div className="flex items-center bg-[#090312] border border-white/10 rounded-xl p-1 text-xs font-mono">
                      <button 
                        onClick={() => setPlayerSubView('transcript')}
                        className={`px-3 py-1.5 rounded-lg transition-colors cursor-pointer flex items-center space-x-1.5 ${
                          playerSubView === 'transcript' 
                            ? 'bg-white/10 text-emerald-300 font-bold' 
                            : 'text-slate-400 hover:text-white'
                        }`}>
                        <FileText className="w-3.5 h-3.5 text-emerald-400" />
                        <span>Interactive Transcript</span>
                      </button>

                      <button 
                        onClick={() => setPlayerSubView('editorial')}
                        className={`px-3 py-1.5 rounded-lg transition-colors cursor-pointer flex items-center space-x-1.5 ${
                          playerSubView === 'editorial' 
                            ? 'bg-white/10 text-amber-300 font-bold' 
                            : 'text-slate-400 hover:text-white'
                        }`}>
                        <Brain className="w-3.5 h-3.5 text-amber-400" />
                        <span>Pre-Show Editorial Thought</span>
                      </button>
                    </div>

                    {playerSubView === 'transcript' ? (
                      /* Quick transcript search filter */
                      <div className="relative">
                        <input 
                          type="text" 
                          value={transcriptSearch}
                          onChange={(e) => setTranscriptSearch(e.target.value)}
                          placeholder="Search lines..."
                          className="pl-7 pr-3 py-1 bg-[#090312] border border-white/15 rounded-lg text-xs font-mono text-slate-200 placeholder-slate-500 focus:outline-none focus:border-emerald-400"
                        />
                        <Search className="w-3.5 h-3.5 text-slate-500 absolute left-2 top-2" />
                      </div>
                    ) : (
                      <span className="text-[11px] font-mono text-slate-400">
                        Fact Matrix · Incentive Map · 5-Beat Conflict Arc
                      </span>
                    )}
                  </div>

                  {/* VIEW A: INTERACTIVE TIMECODED TRANSCRIPT */}
                  {playerSubView === 'transcript' && (
                    <div className="space-y-2.5 max-h-[460px] overflow-y-auto pr-1">
                      {filteredTranscript.map((item, idx) => {
                        const isLineActive = currentTime >= item.start && currentTime < item.end;
                        const isFeste = item.speaker.toLowerCase().includes('feste') || item.speaker.toLowerCase().includes('jester');
                        const isLedger = item.speaker.toLowerCase().includes('ledger');
                        const isCaller = !isFeste && !isLedger;

                        return (
                          <div 
                            key={idx} 
                            onClick={() => handleSeek(item.start)}
                            className={`p-3.5 rounded-xl border transition-all cursor-pointer ${
                              isLineActive 
                                ? 'bg-purple-950/50 border-emerald-400 shadow-md shadow-emerald-500/10' 
                                : 'bg-[#090312]/80 border-white/5 hover:border-white/15'
                            }`}>
                            <div className="flex items-center justify-between text-[11px] font-mono mb-1">
                              <span className={`font-bold flex items-center space-x-1.5 ${
                                isFeste ? 'text-emerald-400' : isLedger ? 'text-amber-400' : 'text-purple-300'
                              }`}>
                                {isFeste ? (
                                  <Laugh className="w-3.5 h-3.5" />
                                ) : isLedger ? (
                                  <Scale className="w-3.5 h-3.5" />
                                ) : (
                                  <PhoneCall className="w-3.5 h-3.5" />
                                )}
                                <span>{item.speaker}</span>
                                {isFeste && <span className="text-[9px] text-emerald-500/70 font-normal">[Host / Puck]</span>}
                                {isLedger && <span className="text-[9px] text-amber-500/70 font-normal">[Receipts / Charon]</span>}
                                {isCaller && <span className="text-[9px] text-purple-400/70 font-normal">[Caller / Filter]</span>}
                              </span>

                              <span className="text-slate-400 font-bold">{formatTime(item.start)}</span>
                            </div>

                            <p className={`text-xs leading-relaxed font-sans ${isLineActive ? 'text-white font-medium' : 'text-slate-300'}`}>
                              {item.text}
                            </p>
                          </div>
                        );
                      })}
                    </div>
                  )}

                  {/* VIEW B: PRE-SHOW EDITORIAL THOUGHT & CONFLICT MAP (Requirement 3) */}
                  {playerSubView === 'editorial' && (
                    <div className="space-y-4 max-h-[460px] overflow-y-auto pr-2 text-xs leading-relaxed">
                      {currentEpisode.editorialAnalysis ? (
                        <div className="bg-[#090312] border border-white/10 rounded-xl p-4 font-mono text-slate-300 whitespace-pre-wrap leading-relaxed space-y-3">
                          {currentEpisode.editorialAnalysis}
                        </div>
                      ) : (
                        <div className="p-6 text-center text-slate-400 font-mono space-y-2">
                          <Brain className="w-8 h-8 text-amber-400 mx-auto" />
                          <p>Pre-show thought analysis dossier for this episode:</p>
                          <p className="text-xs text-slate-500 max-w-md mx-auto">
                            The show deconstructs the claims via Ledger's cold receipts, Feste's heat, and caller resistance with zero deference and zero fake data.
                          </p>
                        </div>
                      )}
                    </div>
                  )}

                </div>
              </div>

            </div>
          </div>
        )}

      </main>

      {/* Broadcast Archive Modal */}
      {showArchiveModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md">
          <div className="bg-[#120721] border border-white/15 rounded-2xl max-w-lg w-full p-6 space-y-5 shadow-2xl">
            <div className="flex items-center justify-between pb-3 border-b border-white/10">
              <div className="flex items-center space-x-2">
                <FolderOpen className="w-5 h-5 text-emerald-400" />
                <h3 className="text-base font-bold text-white font-mono">Broadcast Archive</h3>
              </div>
              <button 
                onClick={() => setShowArchiveModal(false)}
                className="text-slate-400 hover:text-white text-xs font-mono px-2.5 py-1 rounded bg-[#090312] border border-white/10 cursor-pointer">
                CLOSE
              </button>
            </div>

            <div className="space-y-2.5 max-h-80 overflow-y-auto pr-1">
              {episodes.map((ep, idx) => (
                <div 
                  key={idx}
                  onClick={() => selectEpisode(ep)}
                  className={`p-3 rounded-xl border flex items-center justify-between gap-3 cursor-pointer transition-all ${
                    currentEpisode.title === ep.title 
                      ? 'bg-purple-950/60 border-emerald-400' 
                      : 'bg-[#090312] border-white/10 hover:border-white/20'
                  }`}>
                  <div className="flex items-center space-x-3 overflow-hidden">
                    <img 
                      src={ep.coverImage || "https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?q=80&w=800&auto=format&fit=crop"} 
                      alt="" 
                      className="w-10 h-10 rounded-lg object-cover shrink-0"
                    />
                    <div className="truncate">
                      <p className="text-xs font-bold text-white truncate">{ep.title}</p>
                      <p className="text-[10px] font-mono text-slate-400">{ep.date} · {formatTime(ep.duration)}</p>
                    </div>
                  </div>

                  <div className="flex items-center space-x-2 shrink-0">
                    {ep.isUserGenerated && (
                      <button 
                        onClick={(e) => handleDeleteEpisode(ep.title, e)}
                        className="p-1.5 text-slate-400 hover:text-red-400 transition-colors cursor-pointer"
                        title="Delete Show">
                        <Trash2 className="w-4 h-4" />
                      </button>
                    )}
                    <Play className="w-4 h-4 text-emerald-400 fill-current" />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Sticky Bottom Studio Audio Bar */}
      <footer className="fixed bottom-0 left-0 right-0 border-t border-white/10 bg-[#090312]/95 backdrop-blur-xl px-6 py-3 flex items-center justify-between z-40">
        <div 
          onClick={() => setActiveTab('player')} 
          className="flex items-center space-x-3.5 cursor-pointer hover:opacity-90 transition-opacity">
          <img 
            src={currentEpisode.coverImage || "https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?q=80&w=800&auto=format&fit=crop"} 
            alt="Thumbnail" 
            className="w-10 h-10 rounded-lg object-cover border border-white/15"
          />
          <div className="max-w-xs md:max-w-md">
            <p className="text-xs font-bold text-white truncate">{currentEpisode.title}</p>
            <p className="text-[10px] font-mono text-emerald-400">
              {formatTime(currentTime)} / {formatTime(duration)} · Feste & Ledger · 98.5 FM
            </p>
          </div>
        </div>

        <div className="flex items-center space-x-3">
          <button 
            onClick={togglePlay}
            className="p-2.5 bg-emerald-400 text-slate-950 rounded-full hover:scale-105 transition-all shadow-md shadow-emerald-500/20 cursor-pointer">
            {isPlaying ? <Pause className="w-4 h-4 fill-current" /> : <Play className="w-4 h-4 fill-current ml-0.5" />}
          </button>
        </div>
      </footer>
    </div>
  );
}
