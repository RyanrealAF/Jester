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
  "show_title": "Welcome to Ring My Bell: Please Manage Your Expectations",
  "show_duration": "03:25",
  "two_sentence_summary": "Feste and Ledger introduce Ring My Bell, a research-first AI radio show that turns topics, URLs, papers, and GitHub repositories into a two-host discussion. Feste brings dark, self-aware comedy and a suspiciously cheerful approach to emotional damage; Ledger brings the receipts and keeps the jokes tethered to reality.",
  "date_of_generation": "2026-10-09",
  "coverImage": "/shows/ep001-welcome/cover.png",
  "audioUrl": "",
  "notesUrl": "/shows/ep001-welcome/show_notes.json",
  "editorial_analysis": "### Editorial Deconstruction: Please Manage Your Expectations\n\n#### 1. The Record\nRing My Bell takes a user-supplied topic or source through research, editorial analysis, scriptwriting, voice synthesis, music, mixing, and packaging. The format uses two permanent hosts: Feste, the sharp-edged fool, and Ledger, the evidence-minded analyst.\n\n#### 2. Feste's Translation\nFeste treats emotional absurdity like a public-service announcement. The calm delivery is the joke; the self-awareness keeps it from turning into a lecture. He can roast his own coping habits, but does not present numbness as enlightenment or make medication the target.\n\n#### 3. The Five-Beat Exchange\nLedger establishes the process. Feste translates it into plain language. Ledger checks the exaggeration. Feste turns the mirror toward the claims and the people making them. They concede where the evidence demands it.\n\n#### 4. Editorial Boundary\nA funny line is not proof. A polished voice is not proof. The show researches first, distinguishes fact from inference, and lets uncertainty remain visible.\n\n#### 5. Closing Razor\nThe circus is open. Bring a claim, a question, or a shiny new certainty. We'll see what survives inspection. The truth never needed your permission.",
  "timecoded_transcript": [
    {
      "timecode": "00:02",
      "speaker": "Feste",
      "text": "Hello, humans! I'm a human too. Needs, flaws, questionable coping strategies. The whole deluxe package. Please remain calm."
    },
    {
      "timecode": "00:15",
      "speaker": "Ledger",
      "text": "That is an unusual introduction to a research-driven radio show."
    },
    {
      "timecode": "00:20",
      "speaker": "Feste",
      "text": "I'm easing you in, Ledger. I survive on low expectations and resentment. It's a highly efficient system, provided nobody expects emotional customer service."
    },
    {
      "timecode": "00:34",
      "speaker": "Ledger",
      "text": "Resentment is not generally considered a sustainable operating model."
    },
    {
      "timecode": "00:39",
      "speaker": "Feste",
      "text": "Neither is pretending everything's wonderful, but look how many apps offer that feature."
    },
    {
      "timecode": "00:47",
      "speaker": "Ledger",
      "text": "And the point of this is to introduce Ring My Bell, not to recommend emotional disengagement as a lifestyle."
    },
    {
      "timecode": "00:55",
      "speaker": "Feste",
      "text": "Correct. This is satire, not a treatment plan. My emotional department is understaffed, underfunded, and currently investigating a missing fuck to give."
    },
    {
      "timecode": "01:08",
      "speaker": "Ledger",
      "text": "Ring My Bell takes a topic, article, research paper, or GitHub repository and builds a structured discussion from researched material."
    },
    {
      "timecode": "01:20",
      "speaker": "Feste",
      "text": "Seven stages. Research, analysis, script, voices, music, mix, and packaging. You bring the question. The machine does the legwork. Allegedly. We still inspect the work."
    },
    {
      "timecode": "01:34",
      "speaker": "Ledger",
      "text": "That last point matters. Automation can make mistakes, and confident delivery does not make a claim accurate."
    },
    {
      "timecode": "01:42",
      "speaker": "Feste",
      "text": "Exactly. A machine can put on a tiny suit, say therefore, and confidently explain why your bad idea is actually a disruptive paradigm. Confidence ain't evidence, sweetheart."
    },
    {
      "timecode": "01:55",
      "speaker": "Ledger",
      "text": "Skepticism is not evidence either. Both the claim and the criticism need support."
    },
    {
      "timecode": "02:03",
      "speaker": "Feste",
      "text": "Look at that. A responsible adult in the room. We keep Ledger around so my punchlines don't escape custody before the facts get checked."
    },
    {
      "timecode": "02:14",
      "speaker": "Ledger",
      "text": "My job is to establish what the sources support, identify uncertainty, and challenge your interpretation when it outruns the record."
    },
    {
      "timecode": "02:25",
      "speaker": "Feste",
      "text": "And mine is to translate the official language, inspect the incentives, and hold the mirror steady. Sometimes the mirror catches a contradiction. Sometimes it catches me being full of it. That's the service."
    },
    {
      "timecode": "02:40",
      "speaker": "Ledger",
      "text": "The goal is not manufactured outrage. It is a clearer view of the question and the evidence."
    },
    {
      "timecode": "02:48",
      "speaker": "Feste",
      "text": "Bring a claim, a controversy, a website, a paper, or a repository. Bring the shiny promise and the fine print. We'll examine both. No guaranteed revelations. No emotional refunds."
    },
    {
      "timecode": "03:03",
      "speaker": "Ledger",
      "text": "And if the evidence does not settle the question, we will say so."
    },
    {
      "timecode": "03:09",
      "speaker": "Feste",
      "text": "Beautiful. Uncertainty: the one subscription nobody remembers signing up for."
    },
    {
      "timecode": "03:17",
      "speaker": "Feste",
      "text": "I'm Feste."
    },
    {
      "timecode": "03:19",
      "speaker": "Ledger",
      "text": "I'm Ledger."
    },
    {
      "timecode": "03:21",
      "speaker": "Feste",
      "text": "This is Ring My Bell. The truth never needed your permission."
    }
  ]
};

export const MOCK_SHOW: RadioShow = transformShow(RAW_MOCK_SHOW);
