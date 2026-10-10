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
  slug: "ep001-under-the-umbrella",
  show_title: "Under the Umbrella",
  show_duration: "13:46",
  two_sentence_summary: "Feste and Ledger introduce Build While Bleeding as the umbrella for four distinct projects: Hardwire, Seuss, The Leak Report, and Cartography. They explain each project briefly and place Ring My Bell within the larger body of work as a research-driven audio show.",
  date_of_generation: "2026-10-09",
  coverImage: "/shows/ep001-under-the-umbrella/cover.png",
  audioUrl: "",
  notesUrl: "/shows/ep001-under-the-umbrella/show_notes.json",
  editorial_analysis: `### Editorial Deconstruction: Under the Umbrella

#### The umbrella
Build While Bleeding is the larger home for distinct projects. The umbrella is not a claim that every project is finished or that all projects should be merged into one application.

#### The four projects
- **Hardwire:** Practical music theory for rappers, beatmakers, and self-taught producers. Method: FEEL, MAP, CONTROL.
- **Seuss:** Rhythm, meter, cadence, syncopation, rhyme patterns, and language in hip-hop.
- **The Leak Report:** Examines communication, assumptions, claims, context, and evidence.
- **Cartography:** Preserves music, lyrics, writing, and documents as a creative and narrative archive.

#### Ring My Bell's place
Ring My Bell turns topics and source material into researched, two-host talk-radio episodes. Feste challenges and translates; Ledger establishes what the evidence supports and identifies uncertainty.

#### Editorial boundary
A difficult origin or polished presentation is not proof of quality. Each project must stand on its own merits. The common thread is useful work, careful examination, and preservation.`,
  timecoded_transcript: [
    { timecode: "00:01", speaker: "Feste", text: "Ring-a-ding-DING, you curious creatures! Step right up! Come one, come all! Bring your questions, bring your doubts, bring that suspicious little eyebrow you've been saving for a special occasion!" },
    { timecode: "00:18", speaker: "Feste", text: "Welcome to Ring My Bell, where curiosity gets a front-row seat, assumptions get their pockets checked, and the fool has somehow been trusted with the microphone!" },
    { timecode: "00:30", speaker: "Feste", text: "I'm Feste! Your licensed fool, your unofficial tour guide, and the only man alive who can lose his train of thought while standing on the platform!" },
    { timecode: "00:40", speaker: "Ledger", text: "And I'm Ledger." },
    { timecode: "00:44", speaker: "Ledger", text: "Today, we're introducing the larger project behind this show: Build While Bleeding." },
    { timecode: "00:53", speaker: "Feste", text: "Build While Bleeding! Not Build While Comfortable. The work can happen while life is difficult, uncertain, and unfinished." },
    { timecode: "01:40", speaker: "Ledger", text: "First, Hardwire. Hardwire focuses on making music theory practical for rappers, beatmakers, and self-taught producers. Its teaching method is simple: FEEL, MAP, CONTROL." },
    { timecode: "03:00", speaker: "Ledger", text: "Next is Seuss. Seuss explores the deeper structures of rhythm and language in hip-hop, including meter, cadence, syncopation, rhyme patterns, and the mechanics that make words work rhythmically." },
    { timecode: "04:25", speaker: "Ledger", text: "The Leak Report examines communication, looking at messages, assumptions, and the dynamics that influence how people interpret what they hear." },
    { timecode: "05:45", speaker: "Ledger", text: "Cartography is a creative and narrative archive. It preserves music, lyrics, writing, and documents connected to the development of the wider body of work." },
    { timecode: "07:10", speaker: "Ledger", text: "The projects don't need to perform the same function to belong together. Their connection is the larger body of work they're part of, along with a shared intention to develop ideas, make them useful, examine them carefully, and preserve what gets created." },
    { timecode: "08:30", speaker: "Feste", text: "A good name doesn't make a bad idea good. A website doesn't automatically make a tool useful. And a beautifully organized archive can still contain a terrible song." },
    { timecode: "09:35", speaker: "Ledger", text: "Build While Bleeding describes an approach to the work, not a claim that the work is complete or that difficult circumstances automatically make an idea valuable." },
    { timecode: "10:45", speaker: "Ledger", text: "Ring My Bell is another project within the wider picture. It uses research, analysis, dialogue, synthetic voices, music, and audio production to turn subjects into finished talk-radio episodes." },
    { timecode: "11:40", speaker: "Feste", text: "Ledger establishes what the evidence supports. I poke at the gaps, translate the jargon, and challenge the conclusions. Sometimes he catches me reaching too far. Sometimes I find a question the first explanation forgot to answer." },
    { timecode: "12:45", speaker: "Feste", text: "Build while bleeding. Think while building. And never confuse the roof with the things you're building beneath it. Come curious. Leave a little harder to fool. Follow the noise. It's probably me." }
  ]
};;

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
