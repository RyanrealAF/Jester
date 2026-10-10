export interface RawTranscriptLine {
  timecode: string; // "MM:SS"
  speaker: string;
  text: string;
}

export interface RawRadioShow {
  slug?: string; // URL slug for deep-linking, e.g. "ep001-welcome"
  show_title: string;
  show_duration: string; // "MM:SS"
  two_sentence_summary: string;
  date_of_generation: string;
  timecoded_transcript: RawTranscriptLine[];
  coverImage?: string; // Added for UI
  audioUrl?: string;   // Added for playback
  notesUrl?: string;   // Added for downloading show notes
  editorial_analysis?: string; // Pre-show thought & deconstruction dossier
}

export interface TranscriptLine {
  start: number;
  end: number;
  text: string;
  speaker: string;
}

export interface RadioShow {
  title: string;
  slug: string; // URL slug for deep-linking, e.g. "ep001-welcome"
  duration: number;
  summary: string;
  date: string;
  host: string;
  coverImage: string;
  audioUrl: string;
  notesUrl?: string;
  transcript: TranscriptLine[];
  editorialAnalysis?: string;
  shareId?: string;
  shareUrl?: string;
  isUserGenerated?: boolean;
}
