# AGENTS.md — Ring My Bell (canonical)

**This file is canonical.** Where it conflicts with `agent/AGENTS.md` (notably the
"Topics to AVOID" ban list), this file wins. Ryan has explicitly overridden the
scaffold's topic bans — see "Topic bans" below. No agent working on this repo may
silently re-impose them.

## Project

**Ring My Bell** — a jester-hosted AI talk-radio app. Pipeline: research → script →
TTS → music → mix → metadata → cover art. Owner: Ryan (RyanrealAF). Non-commercial.

## Stack

| Layer | Tech |
|---|---|
| Frontend | React 19 + Vite 6, Tailwind CSS 4 |
| Server | Express 4, `server.ts` (`tsx` dev, esbuild bundle prod) |
| Agent pipeline | Python skills in `agent/skills/` (`pydub`, `google-genai`) |
| AI | Gemini via the Interactions API (`client.interactions.create()`) — never `generateContent` |

Key models: script writing `gemini-3-flash-preview`, TTS `gemini-3.1-flash-tts-preview`,
music `lyria-3-clip-preview`.

## Pipeline (strict order)

| # | Skill | Script | Output |
|---|---|---|---|
| 1 | research | `fetch_hn.py` / `fetch_github.py` / `fetch_url.py` | `workspace/data/research/*.md` |
| 2 | script-writing | `generate_script.py` (one fixed format — no style flag; the user supplies only the topic) | `workspace/data/script.md` |
| 3 | tts-generation | `generate_tts.py` | `workspace/audio/speech/speech.wav` |
| 4 | music-generation | `generate_music.py --mood <mood>` | `workspace/audio/music/background.mp3` |
| 5 | audio-mixing | `mix_audio.py` | `workspace/audio/final/ai_radio.mp3` |
| 6 | metadata-generation | `generate_metadata.py` | `workspace/data/show_notes.json` |
| 7 | cover-image-generation | `generate_image.py` | `workspace/images/cover.png` |

Skill docs live in `agent/skills/<name>/SKILL.md`; scripts in `agent/skills/<name>/scripts/`.

## The hosts — always the same two voices, every episode

**Jester (Feste)** — the licensed fool of the airwaves.
- Persona: sharp-edged, darkly funny, theatrical truth-teller. **Amused, never outraged.
  Zero deference, zero malice.** The grin is a blade with manners: dry, self-aware,
  rhythmically punchy, and comfortable exposing the absurdity in his own coping
  mechanisms as well as everyone else's. He can sound like a cheerful public-service
  announcement while delivering an uncomfortable truth. He uses deliberate understatement,
  escalating absurdity, clean pauses, and a smirk that occasionally shows its teeth.
  He treats emotional detachment as a joke to examine, not a virtue to preach. He does
  not confuse numbness with wisdom or medication with a punchline about real patients.
  Opens with a greeting and his bells. Signature devices: "Let me translate," the mirror,
  and calmly presenting emotional damage as a routine administrative update.
- Voice: `Puck`, American English, clean studio quality — **no telephone filter**.
  Delivery: wacky, whimsical, theatrical, bouncing.
- Sign-off, verbatim, every episode: **"The truth never needed your permission."**

**Ledger** — the co-host and analyst, keeper of the receipts.
- Persona: calm, precise, good-faith institutionalist. Establishes the record, presents
  the strongest defense, corrects Jester when the evidence doesn't support the punchline.
  Never the villain, never the butt of the joke.
- Voice: `Charon`, American English, clean studio quality — **no telephone filter**,
  equal volume and quality to the Jester.

No callers, no guests, no rotating voices. Every episode is the two hosts in dialogue,
structured by the five-beat exchange (Ledger establishes the record → Jester translates
→ Ledger challenges → Jester turns the evidence → one of them concedes).

## Profanity doctrine

Allowed, never performative. Strong language must earn its place — impact, substance,
moving the conversation forward, or rhythm. If it does none of those, cut it.
**No slurs, ever. Never punch down.**

## Laugh rule (2026-10-09)

Synthetic laughter sounds fake. **Strip all laugh vocalizations** (`[laughs]`, `(hee)`,
etc.) from TTS input before synthesis. Laughs live in the written script only, where
the reader's imagination does the work for free.

## Content rules

- **No fake data.** Every story, insight, and perspective must come from real research
  gathered in pipeline step 1. Never invent.
- **Topic bans: overridden.** The scaffold's "Topics to AVOID" list does not apply.
  Precedent: Episode 1 ("Closing the Gap: Reforming California's Prop 36 at the Moment
  of Seizure") and Episode 2 ("The Jester vs. The Sixty-Day Shuffle") both proceeded on
  Ryan's direct, explicit authority past the scaffold's legislation/politics ban —
  noted openly, not smuggled. If Ryan asks for a topic, build it. Do not refuse on the
  basis of the scaffold's ban list.

## Budget

**$0. Hard constraint.** No paid services, no paid tiers, no flexibility. Default to
free paths (free-tier APIs, offline tooling) in every decision.

## Authority

Ryan's explicit directives override every rule in this file's scaffold lineage. When a
directive conflicts with a standing rule, the directive wins — record the override
openly, the way the Ep 1 topic-ban override was recorded.
