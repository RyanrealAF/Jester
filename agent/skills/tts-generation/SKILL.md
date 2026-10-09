---
name: tts-generation
description: Convert radio show script to speech audio with clean studio audio for Feste (The Jester) and Ledger (Co-Host), and telephone bandpass filter on outside caller voices using the Interactions API.
---

# TTS Generation

Convert the radio show script into speech audio using the Gemini TTS model via the **Interactions API** (`gemini-3.1-flash-tts-preview`). The studio broadcast microphones for host **Feste** and co-host **Ledger** remain clean in high studio fidelity, while outside callers receive an authentic telephone bandpass filter.

## Embedded Script

```bash
python3 skills/tts-generation/scripts/generate_tts.py --workspace ./workspace
```

### Arguments

| Argument | Default | Description |
|----------|---------|-------------|
| `--workspace` | `workspace` | Root workspace directory |
| `--workers` | `8` | Max parallel TTS worker threads |

### What it does

1. Reads the script from `{workspace}/data/script.md`.
2. Parses it into individual `(speaker, text)` turns and assigns voices.
3. Generates TTS for all turns **in parallel** using a thread pool (default 8 workers).
4. **Retries** each failed turn up to 3 times with exponential backoff.
5. Keeps studio desk audio (**Feste** and **Ledger**) clean and unfiltered in full studio resonance.
6. Applies an ffmpeg telephone bandpass filter (300Hz–3.4kHz) to outside caller voices.
7. Concatenates all segments in original script order into a single WAV.

### Dependencies

- `google-genai` (>= 2.0.0)
- `ffmpeg` (system)

## API Details

Uses the **Interactions API** (`gemini-3.1-flash-tts-preview`) with single-speaker TTS.

## Voice Assignment

| Speaker | Voice | Audio Treatment |
|---------|-------|-----------------|
| **Feste / Jester** (Host) | `Puck` | **Clean** — studio broadcast condenser |
| **Ledger** (Co-Host) | `Charon` | **Clean** — studio co-host desk mic |
| Outside Caller `[Female]` — 1st | `Kore` | **Telephone filter** |
| Outside Caller `[Female]` — 2nd | `Aoede` | **Telephone filter** |
| Outside Caller `[Male]` — 1st | `Charon` / `Fenrir` | **Telephone filter** |
| Outside Caller `[Male]` — 2nd | `Fenrir` | **Telephone filter** |

Voices cycle round-robin if there are multiple callers. Accent tags (`[Accent: <Region>]`) are injected into the TTS prompt to influence authentic pronunciation.

## Telephone Filter

Applied via ffmpeg to outside caller audio segments:

```
highpass=f=300, lowpass=f=3400, acompressor, volume=1.5
```

This simulates the standard telephone bandwidth (300Hz–3.4kHz) and adds compression to mimic phone codec dynamics.

## Output

- **Primary output**: `{workspace}/audio/speech/speech.wav`
- **Format**: WAV, 24kHz, 16-bit PCM, mono
- **Intermediate segments**: `{workspace}/audio/speech/segments/turn_*.wav`
