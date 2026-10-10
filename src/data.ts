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
    slug: raw.slug || raw.show_title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, ''),
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
  "slug": "ep001-welcome",
  "show_title": "Welcome to Ring My Bell: Please Manage Your Expectations",
  "show_duration": "03:25",
  "two_sentence_summary": "Feste and Ledger introduce Ring My Bell, a research-first AI radio show that turns topics, URLs, papers, and GitHub repositories into a two-host discussion. Feste brings a wacky, bouncing, whimsical delivery with a sharp edge beneath the grin; Ledger brings the receipts and keeps the jokes tethered to reality.",
  "date_of_generation": "2026-10-09",
  "coverImage": "/shows/ep001-welcome/cover.png",
  "audioUrl": "",
  "notesUrl": "/shows/ep001-welcome/show_notes.json",
  "editorial_analysis": "### Editorial Deconstruction: Please Manage Your Expectations\n\n#### 1. The Record\nRing My Bell takes a user-supplied topic or source through research, editorial analysis, scriptwriting, voice synthesis, music, mixing, and packaging. The format uses two permanent hosts: Feste, the sharp-edged fool, and Ledger, the evidence-minded analyst.\n\n#### 2. Feste's Translation\nFeste delivers emotional absurdity with a bouncing, sing-song carnival-barker lilt. The buoyant performance makes the uncomfortable truth hit harder; the self-awareness keeps it from turning into a lecture. He roasts his own coping habits without presenting numbness as enlightenment or making medication the target.\n\n#### 3. The Five-Beat Exchange\nLedger establishes the process. Feste translates it into plain language. Ledger checks the exaggeration. Feste turns the mirror toward the claims and the people making them. They concede where the evidence demands it.\n\n#### 4. Editorial Boundary\nA funny line is not proof. A polished voice is not proof. The show researches first, distinguishes fact from inference, and lets uncertainty remain visible.\n\n#### 5. Closing Razor\nThe circus is open. Bring a claim, a question, or a shiny new certainty. We'll see what survives inspection. The truth never needed your permission.",
  "timecoded_transcript": [
    {
      "timecode": "00:02",
      "speaker": "Feste",
      "text": "Hello, hello, hello, you beautiful bags of unresolved issues! Ring-a-ding, humans! I'm a human too. Needs, feelings, resentments... the whole deluxe variety pack. Please keep your arms and expectations inside the ride."
    },
    {
      "timecode": "00:15",
      "speaker": "Ledger",
      "text": "That is an unusually lively introduction to a research-driven radio show."
    },
    {
      "timecode": "00:20",
      "speaker": "Feste",
      "text": "Lively? My dear Ledger, I'm a spring-loaded filing cabinet in a jester's hat! I run on low expectations and resentment. Wind me up, I go \"hee!\" Let me down, I write a complaint."
    },
    {
      "timecode": "00:34",
      "speaker": "Ledger",
      "text": "Resentment is not generally considered a sustainable operating model."
    },
    {
      "timecode": "00:39",
      "speaker": "Feste",
      "text": "Sustainable? No, darling! But neither is pretending everything's peachy while the kitchen's on fire. Still, look at all the apps selling peach-colored smoke."
    },
    {
      "timecode": "00:47",
      "speaker": "Ledger",
      "text": "And the point is to introduce Ring My Bell, not recommend emotional disengagement as a lifestyle."
    },
    {
      "timecode": "00:55",
      "speaker": "Feste",
      "text": "Correctamundo! This is satire, not a treatment plan. My emotional department is understaffed, underfunded, and investigating a missing damn to give. If found, please do not return it. I have no storage."
    },
    {
      "timecode": "01:08",
      "speaker": "Ledger",
      "text": "Ring My Bell takes a topic, article, research paper, or GitHub repository and builds a structured discussion from researched material."
    },
    {
      "timecode": "01:20",
      "speaker": "Feste",
      "text": "Seven little stages! Research, analysis, script, voices, music, mix, packaging. You bring the question, the machine does the legwork. Allegedly! We still check the work, because a robot in a waistcoat is still a robot."
    },
    {
      "timecode": "01:34",
      "speaker": "Ledger",
      "text": "That matters. Automation can make mistakes, and confident delivery does not make a claim accurate."
    },
    {
      "timecode": "01:42",
      "speaker": "Feste",
      "text": "Precisely! A machine puts on a tiny waistcoat, says \"therefore,\" and explains why your bad idea is a disruptive paradigm. Ta-da! The hat is fancy, the evidence is missing, and the invoice has legs."
    },
    {
      "timecode": "01:55",
      "speaker": "Ledger",
      "text": "Skepticism is not evidence either. Both the claim and the criticism need support."
    },
    {
      "timecode": "02:03",
      "speaker": "Feste",
      "text": "Look at him! A responsible adult with receipts! We keep Ledger around so my punchlines don't escape custody before the facts are checked. He has a clipboard. I have bells. Guess who gets searched at the door."
    },
    {
      "timecode": "02:14",
      "speaker": "Ledger",
      "text": "My job is to establish what the sources support, identify uncertainty, and challenge your interpretation when it outruns the record."
    },
    {
      "timecode": "02:25",
      "speaker": "Feste",
      "text": "And mine is to translate the official language, inspect the incentives, and hold up the mirror. Sometimes it catches a contradiction. Sometimes it catches me being full of it. A versatile mirror! Five stars. Terrible lighting."
    },
    {
      "timecode": "02:40",
      "speaker": "Ledger",
      "text": "The goal is not manufactured outrage. It is a clearer view of the question and the evidence."
    },
    {
      "timecode": "02:48",
      "speaker": "Feste",
      "text": "Bring a claim, a controversy, a website, a paper, a repository! Bring the shiny promise and the teeny-tiny fine print! We'll inspect both. No guaranteed revelations. No emotional refunds. Please collect your dignity at the exit."
    },
    {
      "timecode": "03:03",
      "speaker": "Ledger",
      "text": "And if the evidence does not settle the question, we will say so."
    },
    {
      "timecode": "03:09",
      "speaker": "Feste",
      "text": "Uncertainty! The one subscription nobody remembers signing up for. It renews automatically, naturally. Isn't life a treat?"
    },
    {
      "timecode": "03:17",
      "speaker": "Feste",
      "text": "I'm Feste. Your licensed fool. Bells included. Wisdom sold separately."
    },
    {
      "timecode": "03:19",
      "speaker": "Ledger",
      "text": "I'm Ledger."
    },
    {
      "timecode": "03:21",
      "speaker": "Feste",
      "text": "This is Ring My Bell! Mind the gap between the promise and the proof, my darlings. The truth never needed your permission."
    }
  ]
};

export const MOCK_SHOW: RadioShow = transformShow(RAW_MOCK_SHOW);
export const RAW_AUDIT_SHOW: RawRadioShow = {
  "slug": "ep001-audit",
  "show_title": "Ring My Bell: The Audit",
  "show_duration": "02:47",
  "two_sentence_summary": "Hosts Ledger and Feste launch their podcast by revealing the automated seven-stage pipeline used to create each episode. They discuss the implications of using a zero-budget, code-driven process to ensure transparency and integrity in their reporting.",
  "date_of_generation": "2026-10-09",
  "coverImage": "/shows/ep001-audit/cover.png",
  "audioUrl": "/shows/ep001-audit/ai_radio.mp3",
  "notesUrl": "/shows/ep001-audit/show_notes.json",
  "timecoded_transcript": [
    {
      "timecode": "00:00",
      "speaker": "Feste",
      "text": "Ring-a-ding-ding, truth-seekers! Welcome to the grand opening of the intellectual circus. No safety nets, no clown suits, just raw data and two open mics. Today, we are peeling back our very own skin!"
    },
    {
      "timecode": "00:15",
      "speaker": "Ledger",
      "text": "Welcome to Episode 001 of Ring My Bell. I’m Ledger."
    },
    {
      "timecode": "00:20",
      "speaker": "Feste",
      "text": "And I am Feste! The licensed fool, the bell-ringer, your guide through the digital fog. And today, we are auditing ourselves."
    },
    {
      "timecode": "00:30",
      "speaker": "Ledger",
      "text": "Let’s lay out the architecture. This show is built by Ryan—known online as RyanrealAF—under the non-commercial banner of Build While Bleeding. It operates on a strict zero-dollar budget. Every episode is generated by an automated seven-stage pipeline: research, script, speech, music, mix, metadata, and cover art. There are no fake callers, no fabricated quotes, and absolutely no made-up facts."
    },
    {
      "timecode": "00:59",
      "speaker": "Feste",
      "text": "Oh, let me translate! \"Seven-stage pipeline\" is tech-speak for a digital assembly line designed to strip away human bullshit. We don't have sponsors, we don't have a studio, and we certainly don't have a PR department to make us look pretty. It's a raw code-to-voice meat grinder."
    },
    {
      "timecode": "01:19",
      "speaker": "Ledger",
      "text": "That is a cynical caricature. The automation isn't a meat grinder; it’s a discipline. The research stage is bound strictly to verified documents. By automating the pipeline, we eliminate human editorial bias in production. The facts govern the script, not our personal whims. Frugality forces integrity."
    },
    {
      "timecode": "01:37",
      "speaker": "Feste",
      "text": "Integrity? Or a clever cage? Think about it, Ledger. An automated pipeline means we are prisoners of the input. If the research has a blind spot, we repeat it with perfect, synthesized clarity. We are polishing the brass on a ship we didn't build! The listener feeds us the topic, but the machine draws the boundary. Is that truth, or just a highly efficient echo chamber?"
    },
    {
      "timecode": "02:02",
      "speaker": "Ledger",
      "text": "That is a fair warning. But remember: the architecture is entirely public. Build While Bleeding lives at buildwhilebleeding.com. We don't hide the joints of the puppet. If the research fails, the audience sees exactly where the pipeline cracked. The vulnerability is the proof of work."
    },
    {
      "timecode": "02:22",
      "speaker": "Feste",
      "text": "Ah. The circus has an address, and we bleed in public. I can respect a transparent scar. Conceded, my logical friend."
    },
    {
      "timecode": "02:32",
      "speaker": "Ledger",
      "text": "Then let the record show: we are open for business."
    },
    {
      "timecode": "02:35",
      "speaker": "Feste",
      "text": "And that is the bell! The tent is pitched, the receipts are on the table, and the gears are turning. The truth never needed your permission."
    }
  ]
};

export const AUDIT_SHOW: RadioShow = transformShow(RAW_AUDIT_SHOW);

// Every shipped episode, in order. Each has its own ?ep=<slug> deep link.
export const ALL_SHOWS: RadioShow[] = [MOCK_SHOW, AUDIT_SHOW];
