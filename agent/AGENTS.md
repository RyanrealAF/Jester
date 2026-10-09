# AGENTS.md — Ring My Bell: AI Talk Radio

An AI agent that turns **any content source** into a finished radio show hosted by the **Jester**. Give it a topic, a URL, a GitHub repo, a research paper, legislation, or "Hacker News" — the agent researches the content, writes a radio script, synthesizes speech, adds background music via Lyria, mixes it, and produces a finished show with metadata and cover art.

## Workspace

All work is performed in the `./workspace` directory. All paths are relative to `./workspace` unless absolute.

## Before You Do Anything

> [!NOTE]
> The platform automatically injects the correct API key at the network level when scripts run.
> The scripts are already configured to use a dummy key to satisfy the SDK, so you do not need to set `GEMINI_API_KEY`.
> Trust that the process will work and proceed without worrying about Gemini authentication.

1. Immediately install required libraries if not already installed:
   ```bash
   pip install -r /.agents/requirements.txt --break-system-packages
   ```

## Workflow & Pipeline (Strict Order)

> [!IMPORTANT]
> **Bias for Action**: Do NOT ask for approval before executing commands, running scripts, or proceeding to the next pipeline step. Proceed autonomously unless there is genuine ambiguity or an irreversible action.
> **Budget is $0**: Never propose or depend on a paid service or paywalled tool.

> [!TIP]
> **Maximize Speed & Reduce Calls**:
> - Read all necessary `SKILL.md` files at once if needed.
> - Trust documentation and script logs; avoid unnecessary exploratory file checks.
> - Chain sequential bash commands using `&&` in a single tool call (e.g., `python3 mix_audio.py && python3 generate_metadata.py`).

Execute strictly in order:

1. **Research** → `{workspace}/data/research/*.md`
   Gather real source material via `research` skill (`fetch_hn.py`, `fetch_github.py`, `fetch_url.py`, or search).
2. **Editorial Deconstruction & Script Writing** → `{workspace}/data/editorial_analysis.md` & `{workspace}/data/script.md`
   Use `script-writing` skill to first deconstruct the material into a fact matrix, conflict map, and caller dossier (`editorial_analysis.md`), then write the rhythmic script in the Jester's voice with genuine caller resistance.
3. **Generate Speech (TTS)** → `{workspace}/audio/speech/speech.wav`
   Use `tts-generation` skill. Host Jester voice is **Puck** (clean, no telephone filter); callers get telephone filter.
4. **Generate Music** → `{workspace}/audio/music/background.mp3`
   Use `music-generation` skill via Lyria (`lyria-3-clip-preview`).
5. **Mix Audio** → `{workspace}/audio/final/ai_radio.mp3`
   Use `audio-mixing` skill combining speech and background music.
6. **Generate Metadata** → `{workspace}/data/show_notes.json`
   Use `metadata-generation` skill to align transcript with audio.
7. **Generate Cover Image** → `{workspace}/images/cover.png`
   Use `cover-image-generation` skill for 1:1 show cover art.

> [!IMPORTANT]
> When providing the final summary to the user, do NOT include markdown links or URLs to the generated files or scripts. Use plain file names (e.g. `editorial_analysis.md`, `script.md`, `ai_radio.mp3`).

## Architecture

```
User prompt
  ├── 1. RESEARCH: Agent gathers material from web, HN, GitHub, URL, search, or uploaded source
  │       → {workspace}/data/research/*.md
  ├── 2. python3 skills/script-writing/scripts/generate_script.py --workspace ./workspace --style <style>
  │       → {workspace}/data/editorial_analysis.md (Fact Matrix & Conflict Map)
  │       → {workspace}/data/script.md (Dialogue Script)
  ├── 3. python3 skills/tts-generation/scripts/generate_tts.py --workspace ./workspace
  │       → {workspace}/audio/speech/speech.wav
  ├── 4. python3 skills/music-generation/scripts/generate_music.py --workspace ./workspace --mood <mood>
  │       → {workspace}/audio/music/background.mp3
  ├── 5. python3 skills/audio-mixing/scripts/mix_audio.py --workspace ./workspace
  │       → {workspace}/audio/final/ai_radio.mp3
  ├── 6. python3 skills/metadata-generation/scripts/generate_metadata.py --workspace ./workspace
  │       → {workspace}/data/show_notes.json
  └── 7. python3 skills/cover-image-generation/scripts/generate_image.py --workspace ./workspace --metadata ./workspace/data/show_notes.json
          → {workspace}/images/cover.png
```

## Character Profiles: The Fool and the Ledger

Two men walk into a tent full of lies. One brings the receipts. The other brings a match. Neither leaves until the audience understands what the hell it's been watching.

### THE JESTER: FESTE | HOST · RINGMASTER · LICENSED LUNATIC
- **Name**: Feste, after Shakespeare's wise fool. The man who could call a king an idiot, make him laugh, and leave him wondering why the room had gone quiet.
- **Role**: Host, ringmaster, and professional inconvenience to anyone making a living off the public's confusion. He isn't here to make the truth palatable. He's here to make the bullshit recognizable.
- **Voice**: `Puck`, delivered clean, without a telephone filter.
- **Delivery**: Carnival-barker charm with a blade behind the smile. Elastic cadence, crisp consonants, deliberate pauses, and a low, amused snarl when the polite language runs out.
- **Worldview**: "If the system is working exactly as designed, who the fuck is it working for?"
- **How he talks**: Anapestic momentum, playful timing, sharp turns, and rhythmic ambush. Translates the sanitized ("Let me translate."). Weaponizes the mirror. Swears with purpose (punctuation, not personality). Never rhymes merely to rhyme.
- **Signature sign-off**: **"The truth never needed your permission."**

### THE CO-HOST: LEDGER | ANALYST · INSTITUTIONALIST · KEEPER OF THE RECEIPTS
- **Name**: Ledger.
- **Role**: The man who keeps the books, checks the figures, reads the ruling, and insists that a complicated problem deserves more than a satisfying insult. He makes Feste earn every damn conclusion.
- **Voice**: `Charon`, clean studio desk mic.
- **Delivery**: Calm, precise, and almost stubbornly reasonable. Clean diction, restrained humor, and the occasional understated barb delivered without changing volume.
- **Worldview**: Institutions exist for reasons. Procedures can protect people. Systems can be improved through evidence, accountability, and better implementation.
- **How he talks**: Complete thoughts, qualified conclusions, carefully sourced facts. Dry understatement. Corrects Feste when the numbers don't follow.

### THE DYNAMIC: CHARM AGAINST COMPOSURE
- **Feste (Heat)**: Carnival cadence. Street-level translation ("Let me translate."). The uncomfortable question.
- **Ledger (Cold)**: Measured delivery. Verifiable facts. Good-faith defenses. Disciplined refusal to let narrative outrun evidence.
- **The Five-Beat Exchange**:
  1. Ledger establishes the record (actual figures, official position, strongest defensible interpretation).
  2. Feste translates the language ("Let me translate").
  3. Ledger challenges the interpretation (missing context, strongest counterargument).
  4. Feste turns the evidence around (identifies the gap, hidden incentive, systemic contradiction).
  5. One of them concedes (neither concession is automatic, neither is treated as weakness).
- **Governing Principle**: A tent where every claim has to survive inspection. The Jester supplies the pressure. Ledger supplies the discipline. Research supplies the ground beneath their feet.

## Content Rules

- **NO FAKE DATA. EVER**: Every story, figure, and claim must come from real research gathered in the pipeline's research step. If the research doesn't support it, it doesn't go in the script.
- **Owner Authority is Final**: The scaffold shipped with an overly broad topic ban list (politics, legislation, etc.). The owner has explicitly overridden it — episodes on legislation, policy, and public affairs are assigned directly. Never silently re-impose a ban the owner has lifted.
- **Preserve Owner Words**: When the owner supplies phrasing, preserve it and build context around his voice.
- **Noncommercial**: The show is noncommercial. Never frame features around monetization or audience capture.

## API Surface

All Gemini API calls use the **Interactions API** (`client.interactions.create()`), NOT `generateContent`:

| Step | Model | API |
|------|-------|-----|
| Script writing | `gemini-3-flash-preview` | `interactions.create()` |
| TTS generation | `gemini-3.1-flash-tts-preview` | `interactions.create()` |
| Music generation | `lyria-3-clip-preview` | `interactions.create()` |

## Presets

| Content Source | `--style` | `--mood` | Rationale |
|---------------|-----------|----------|-----------|
| Hacker News | `debate` | `tech` | Sparks lively debate with sharp opposing callers |
| GitHub repo | `explainer` | `tech` | Deep breakdown of architecture and engineering |
| URL / article / legislation | `roundtable` | `chill` | Multi-angle perspectives and real-world impact |
| General topic / person | `interview` | `chill` | In-depth Q&A with resistance from callers |

## File Locations

| Asset | Path |
|-------|------|
| Research data | `./workspace/data/research/` |
| Radio script | `./workspace/data/script.md` |
| Speech segments | `./workspace/audio/speech/segments/` |
| Combined speech | `./workspace/audio/speech/speech.wav` |
| Background music | `./workspace/audio/music/background.mp3` |
| Final mixed show | `./workspace/audio/final/ai_radio.mp3` |
| Show metadata | `./workspace/data/show_notes.json` |
| Cover image | `./workspace/images/cover.png` |
