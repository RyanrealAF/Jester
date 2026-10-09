---
name: script-writing
description: Deep pre-show editorial analysis, fact deconstruction, and radio script generation for Ring My Bell hosted by the Jester using the Interactions API.
---

# Script Writing & Editorial Deconstruction

Generate a high-substance, multi-character radio show script with profound depth of thought. Before drafting any dialogue, the skill runs an extensive **pre-show editorial deconstruction** of the research material to build a verifiable fact matrix, map orthodoxies vs. counter-narratives, and design authentic caller foils.

## Embedded Script

```bash
python3 skills/script-writing/scripts/generate_script.py --workspace ./workspace --style debate
```

### Arguments

| Argument | Default | Description |
|----------|---------|-------------|
| `--workspace` | `workspace` | Root workspace directory |
| `--style` | `default` | Show format (see styles below) |
| `--context` | `""` | Additional tone/style notes inferred from user prompts. Applies to ALL styles. Keep brief. Do NOT use to specify stories/topics. |
| `--duration` | `3` | Target duration in minutes |

### Two-Phase Execution Workflow

1. **Phase 1: Deep Editorial Deconstruction & Material Thought**
   - Synthesizes the raw research files in `{workspace}/data/research/*.md`.
   - Produces `{workspace}/data/editorial_analysis.md` containing:
     - **Fact Matrix & Verifiable Mechanics**: Key numbers, quotes, benchmarks, and architectural details separated from hype.
     - **Conflict Map**: The orthodox narrative vs. failure modes, trade-offs, and systemic costs.
     - **The Jester's Subversive Lens**: Exposing the central irony with theatrical bounce without losing factual nuance.
     - **Caller Dossier & Counterpoints**: Dedicated profiles of 2-3 callers with distinct motivations and stubborn intellectual pushback.
     - **Dramaturgical Arc**: Structured crescendo toward the sign-off.

2. **Phase 2: Dialogue Script Synthesis**
   - Ingests both the primary research and `{workspace}/data/editorial_analysis.md`.
   - Drafts the script with the Jester's anapestic cadence and opposing callers using `gemini-3-flash-preview` via the **Interactions API**.
   - Outputs the final script to `{workspace}/data/script.md`.

### Styles

| Style | Callers | Format | Use when user says... |
|-------|---------|--------|----------------------|
| `debate` | 2 per topic, opposing views | Structured back-and-forth, Jester spars and referees | "opposing views", "debate", "both sides" |
| `roundtable` | 3-4, different angles | Collaborative discussion, callers build on each other | "roundtable", "panel", "discussion" |
| `interview` | 1-2 with direct experience | Q&A format, Jester probes with sharp wit | "interview", "deep dive", "expert" |
| `explainer` | 2-3, each explains an aspect | Break down complexities, Jester cuts through the jargon | "explain", "break it down", "what is" |
| `default` | Same as `debate` | Default when no style specified | *(anything else)* |

### Dependencies

- `google-genai` (>= 2.0.0)

## Outputs

- **Editorial Analysis**: `{workspace}/data/editorial_analysis.md`
- **Script File**: `{workspace}/data/script.md`
- **Format**: Plain text, each line starting with `Speaker: dialogue`

## Cast

| Speaker | Role | Personality |
|---------|------|-------------|
| **Feste** (The Jester) | Host | Mischievous American licensed fool. Puck voice (clean studio). Carnival-barker bounce, anapestic meter, razor wit. |
| **Ledger** | Co-Host | Calm institutionalist, keeper of the receipts. Charon voice (clean studio). Insists on facts, numbers, and fair analysis. |
| **Callers** | Outside Foils | Authentic call-ins with real skin in the game (telephone audio filter). Provide ground-level resistance. |

## Script Format Rules

- Host line: `Feste: [audio tag] Dialogue text` (or legacy `Jester:`)
- Co-Host line: `Ledger: [audio tag] Dialogue text`
- Caller line: `CallerName: [Male/Female] [Accent: <Region>] [audio tag] Dialogue text`
- Must include audio tags in square brackets (e.g., `[grins]`, `[dryly]`, `[scoffs]`, `[chuckles]`).
- The Five-Beat Exchange: Ledger establishes receipts -> Feste translates ("Let me translate...") -> Ledger challenges -> Feste exposes contradiction -> One concedes.
- Spoken word with anapestic rhythm. No fake data.
- Signature sign-off to close every broadcast verbatim: **"The truth never needed your permission."**
