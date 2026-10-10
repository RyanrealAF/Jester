---
name: script-writing
description: Generate the Ring My Bell show script from research using the Interactions API.
---

# Script Writing

Generate a naturalistic two-host radio show script directly via the LLM. Every episode features the same two permanent hosts — Jester and Ledger — in dialogue, with advanced audio tags.

## Embedded Script

```bash
python3 skills/script-writing/scripts/generate_script.py --workspace ./workspace
```

### Arguments

| Argument | Default | Description |
|----------|---------|-------------|
| `--workspace` | `workspace` | Root workspace directory |
| `--duration` | `3` | Target duration in minutes |
| `--context` | `""` | Additional tone/style notes inferred from user prompts (e.g., "emphasize the technical details", "make it sound like a late night show"). Keep brief. Do NOT use to specify stories/topics. |

### Format

One format, every episode — the user supplies only the topic. The script always follows the same arc:

1. Cold Open — Jester teases the sharpest angle, bells ringing.
2. Intro — the hosts welcome listeners and frame the topic.
3. The Exchange — the five-beat exchange: Ledger establishes the record → Jester translates → Ledger challenges → Jester turns the evidence → one of them concedes.
4. Closing — Jester signs off: "The truth never needed your permission."

### Examples

```bash
# Standard episode with context notes on tone
python3 skills/script-writing/scripts/generate_script.py \
  --workspace ./workspace --context "make it sound like a late night show"

# Longer episode about a GitHub repo
python3 skills/script-writing/scripts/generate_script.py \
  --workspace ./workspace --duration 5 --context "emphasize the performance improvements"
```

### What it does

1. Reads all research from `{workspace}/data/research/*.md`.
2. Builds a system prompt with the base format rules + the fixed episode structure.
3. Calls Gemini via the **Interactions API** (`client.interactions.create()`).
4. Saves the script to `{workspace}/data/script.md`.

### Dependencies

- `google-genai` (>= 2.0.0)

## Output

- **Script File**: `{workspace}/data/script.md`
- **Format**: Plain text, each line starting with `Speaker: dialogue`

## Cast

| Speaker | Role | Personality |
|---------|------|-------------|
| **Jester** | Host (Feste) | The licensed fool — sharp-edged, darkly funny, theatrical truth-teller. Amused, never outraged; zero deference, zero malice. Use a smirk with teeth, dry self-awareness, deliberate understatement, and calmly delivered absurdity. Feste may expose his own contradictions and present emotional damage like a cheerful public-service announcement, but never glorify numbness or punch down. Signature devices: "Let me translate," the mirror, and the polite announcement that something is clearly not fine. Signs off: "The truth never needed your permission." |
| **Ledger** | Co-host | The analyst — keeper of the receipts. Calm, precise, good-faith institutionalist. Establishes the record, presents the strongest defense, corrects Jester when the evidence doesn't support the punchline. Never the villain, never the butt of the joke. |

## Script Format Rules

- Every line: `Jester:` or `Ledger:` — the ONLY two speakers. Never invent callers, guests, or additional voices.
- Must include audio tags in square brackets (e.g., `[sighs]`, `[excitedly]`, `[dryly]`). Jester's tags lean theatrical, sly, dryly amused, and rhythmically precise; let the bite come through the wording rather than constant shouting or exaggerated clowning. Ledger's tags lean dry and measured.
- The five-beat exchange structures every episode: Ledger establishes the record → Jester translates → Ledger challenges → Jester turns the evidence → one of them concedes.
- Short punchy sentences — spoken word, not prose.
- ~450-500 words total (~3 minutes when spoken).
