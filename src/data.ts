import { RadioShow, RawRadioShow } from './types';

function parseTimecode(time: string): number {
  const [mins, secs] = time.split(':').map(Number);
  return mins * 60 + secs;
}

export function transformShow(raw: RawRadioShow): RadioShow {
  const transcript = raw.timecoded_transcript.map((line, i, arr) => {
    const start = parseTimecode(line.timecode);
    const nextLine = arr[i + 1];
    const end = nextLine ? parseTimecode(nextLine.timecode) : parseTimecode(raw.show_duration);
    
    return {
      start,
      end,
      speaker: line.speaker,
      text: line.text,
    };
  });

  return {
    title: raw.show_title,
    duration: parseTimecode(raw.show_duration),
    summary: raw.two_sentence_summary,
    date: raw.date_of_generation,
    host: raw.timecoded_transcript[0]?.speaker || "Feste",
    coverImage: raw.coverImage || "https://images.unsplash.com/photo-1550745165-9bc0b252726f?q=80&w=2070&auto=format&fit=crop",
    // Generated episodes must provide their real audio URL. Never silently substitute demo audio.
    audioUrl: raw.audioUrl || "",
    notesUrl: raw.notesUrl,
    transcript,
    editorialAnalysis: raw.editorial_analysis || (raw as any).editorialAnalysis || `### Editorial Deconstruction: Vibe Coding, Valve CAD, & SQLite

#### 1. The Record & Ledger's Facts (Receipts)
- **Simon Willison's 'Vibe Coding' Thesis**: AI-assisted software generation increases initial code emission by ~40% across developer trials, but shifts effort entirely from drafting to triage, prompt steering, and downstream integration.
- **Valve Hardware Release**: Valve released raw 3D geometry CAD files for the Steam Controller under CC-BY-NC-SA 4.0 (Creative Commons Non-Commercial ShareAlike).
- **SQLite Archival Status**: Formally recommended by the US Library of Congress for digital long-term storage due to strict backward-compatibility guarantees through the year 2050.

#### 2. The Jester's Translation (Incentive Topology)
- **Vibe Coding**: 'Writing software without looking at the code' is simply taking out technical debt on margin. When the code breaks at 2:00 AM, the vibe disappears and the bill comes due.
- **Valve's Open Windows**: You can 3D-print a replacement foot at home, but try starting a third-party repair parts shop and the corporate lawyers appear instantly. An open window in a walled garden.
- **SQLite**: The ultimate tool for individual autonomy that terrifies compliance officers because five million records fit neatly onto an unencrypted keychain.

#### 3. The Five-Beat Exchange Arc
- **Beat 1**: Ledger opens with empirical speed gains from development telemetry.
- **Beat 2**: Feste translates 'increased velocity' into unreviewed slop landing in production repositories.
- **Beat 3**: Ledger defends institutional standards and corporate license boundaries.
- **Beat 4**: Feste reveals the economic asymmetry between the vendor and the user.
- **Beat 5**: Ledger concedes on the fundamental tension between zero-friction portability and data perimeter defense.

#### 4. Caller Dossier
- **Marcus (San Francisco)**: Enthusiastic vibe-coder making personal tools; argues that pragmatism trumps architectural purity.
- **Chloe (Seattle)**: Hardware tinkerer with a 3D printer; praises repairability while navigating the non-commercial license cliff.
- **Sam (Chicago)**: Database pragmatist praising SQLite's self-contained file format for permanent data sovereignty.

#### 5. The Closing Razor
- *"Was the system failing, or were we measuring its success by the wrong damn thing? The truth never needed your permission."*`
  };
}

export const RAW_MOCK_SHOW: RawRadioShow = {
  "show_title": "The Jagged Frontier: Vibe Coding and Valve's Open Windows",
  "show_duration": "04:45",
  "two_sentence_summary": "Two men walk into a tent full of lies: Feste brings the match while Ledger brings the receipts. The duo spars with callers over the reality of AI vibe coding, Valve's restrictive open hardware license, and whether SQLite's portability is a preservation triumph or a security nightmare.",
  "date_of_generation": "2026-10-09",
  "coverImage": "https://www.gstatic.com/aistudio/starter-apps/assets/ai_radio/cover.jpg",
  "audioUrl": "https://www.gstatic.com/aistudio/starter-apps/assets/ai_radio/ai_radio.mp3",
  "notesUrl": "/shows/default/show_notes.json",
  "editorial_analysis": `### Editorial Deconstruction: Vibe Coding, Valve CAD, & SQLite

#### 1. The Record & Ledger's Facts (Receipts)
- **Simon Willison's 'Vibe Coding' Thesis**: AI-assisted software generation increases initial code emission by ~40% across developer trials, but shifts effort entirely from drafting to triage, prompt steering, and downstream integration.
- **Valve Hardware Release**: Valve released raw 3D geometry CAD files for the Steam Controller under CC-BY-NC-SA 4.0 (Creative Commons Non-Commercial ShareAlike).
- **SQLite Archival Status**: Formally recommended by the US Library of Congress for digital long-term storage due to strict backward-compatibility guarantees through the year 2050.

#### 2. The Jester's Translation (Incentive Topology)
- **Vibe Coding**: 'Writing software without looking at the code' is simply taking out technical debt on margin. When the code breaks at 2:00 AM, the vibe disappears and the bill comes due.
- **Valve's Open Windows**: You can 3D-print a replacement foot at home, but try starting a third-party repair parts shop and the corporate lawyers appear instantly. An open window in a walled garden.
- **SQLite**: The ultimate tool for individual autonomy that terrifies compliance officers because five million records fit neatly onto an unencrypted keychain.

#### 3. The Five-Beat Exchange Arc
- **Beat 1**: Ledger opens with empirical speed gains from development telemetry.
- **Beat 2**: Feste translates 'increased velocity' into unreviewed slop landing in production repositories.
- **Beat 3**: Ledger defends institutional standards and corporate license boundaries.
- **Beat 4**: Feste reveals the economic asymmetry between the vendor and the user.
- **Beat 5**: Ledger concedes on the fundamental tension between zero-friction portability and data perimeter defense.

#### 4. Caller Dossier
- **Marcus (San Francisco)**: Enthusiastic vibe-coder making personal tools; argues that pragmatism trumps architectural purity.
- **Chloe (Seattle)**: Hardware tinkerer with a 3D printer; praises repairability while navigating the non-commercial license cliff.
- **Sam (Chicago)**: Database pragmatist praising SQLite's self-contained file format for permanent data sovereignty.

#### 5. The Closing Razor
- *"Was the system failing, or were we measuring its success by the wrong damn thing? The truth never needed your permission."*`,
  "timecoded_transcript": [
    {
      "timecode": "00:00",
      "speaker": "Feste",
      "text": "If you can go from writing two hundred lines of code a day to two thousand with an agent, did you become a better engineer, or did you just build a faster way to drown in your own mess?"
    },
    {
      "timecode": "00:13",
      "speaker": "Ledger",
      "text": "The documented metrics indicate development velocity increased by forty percent across surveyed engineering teams. That is not trivial output."
    },
    {
      "timecode": "00:25",
      "speaker": "Feste",
      "text": "Step right up, welcome to Ring My Bell! I'm Feste, he's Ledger—he brought the receipts, I brought the match. Let me translate what Ledger just said: 'Velocity increased' means the machine generates two thousand lines, human beings review none of it, and we push it to main because nobody wants to look stupid in standup. First on the line: Marcus from San Francisco."
    },
    {
      "timecode": "00:50",
      "speaker": "Marcus",
      "text": "Hey Feste, hey Ledger! Simon Willison’s point about vibe coding is spot on. If I just want to whip up a little app for my wife, who cares if the internal design is perfect? It’s about the result, not the ritual."
    },
    {
      "timecode": "01:15",
      "speaker": "Ledger",
      "text": "Marcus is describing utility for disposable software. But in enterprise codebases, Simon himself noted that unreviewed code creates silent operational debt."
    },
    {
      "timecode": "01:28",
      "speaker": "Feste",
      "text": "Elena from Berlin calls it disasters on layaway! Speaking of things that break in your hands: Valve released the CAD files for the Steam Controller under Creative Commons. Chloe from Seattle, what's cooking on your 3D printer?"
    },
    {
      "timecode": "01:45",
      "speaker": "Chloe",
      "text": "This is a massive win! My battery door broke—now I can just 3D print a replacement. And for accessibility, people can print custom controller grips."
    },
    {
      "timecode": "02:05",
      "speaker": "Ledger",
      "text": "It is an admirable release, but note the license: Creative Commons Non-Commercial. You cannot build a third-party repair business with these files without Valve's explicit consent."
    },
    {
      "timecode": "02:20",
      "speaker": "Feste",
      "text": "Let me translate: You can print a plastic foot for your living room, but the second you try to make a living off it, the steam valve shuts right on your fingers. A walled garden with open windows."
    },
    {
      "timecode": "02:35",
      "speaker": "Ledger",
      "text": "Valve owns the proprietary design. Due process and intellectual property protection exist for a reason."
    },
    {
      "timecode": "02:46",
      "speaker": "Feste",
      "text": "And did the license protect the player, or did it make sure Valve keeps the keys? Fair correction on the legal status, counselor, but the incentive remains airtight. Now, SQLite endorsed by the Library of Congress for digital preservation. Sam from Chicago, ring the bell."
    },
    {
      "timecode": "03:05",
      "speaker": "Sam",
      "text": "It’s about time! SQLite is the gold standard for 'it just works.' No server, no cloud subscriptions. Readable in fifty years."
    },
    {
      "timecode": "03:22",
      "speaker": "Ledger",
      "text": "The Library of Congress recognizes standard formats for archival longevity. However, corporate data governance teams report significant data leakage when SQLite databases are copied onto laptops without access controls."
    },
    {
      "timecode": "03:40",
      "speaker": "Feste",
      "text": "You heard the man! The spreadsheet loves the archive until an intern leaves five million customer records on a thumb drive at an airport bar. That's the distinction that defines the show."
    },
    {
      "timecode": "04:00",
      "speaker": "Ledger",
      "text": "I concede that portability and perimeter security are in direct friction here."
    },
    {
      "timecode": "04:15",
      "speaker": "Feste",
      "text": "Look at that—the Ledger conceded! Write it down in the books. From the longevity of our archives to the vibes in your IDE, the tools mutate while human nature stays right where we left it. Was the system failing, or were we measuring its success by the wrong damn thing? I'm Feste. The truth never needed your permission."
    }
  ]
};

export const MOCK_SHOW: RadioShow = transformShow(RAW_MOCK_SHOW);
