#!/usr/bin/env python3
# Copyright 2026 Google LLC
#
# Licensed under the Apache License, Version 2.0 (the "License");
# you may not use this file except in compliance with the License.
# You may obtain a copy of the License at
#
#     https://www.apache.org/licenses/LICENSE-2.0
#
# Unless required by applicable law or agreed to in writing, software
# distributed under the License is distributed on an "AS IS" BASIS,
# WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
# See the License for the specific language governing permissions and
# limitations under the License.
"""Generate the Ring My Bell radio show script from research using the Interactions API.

Usage:
    python3 generate_script.py --workspace ./workspace
    python3 generate_script.py --workspace ./workspace --duration 5

Requires:
    pip install google-genai

Output:
    {workspace}/data/script.md
"""

import argparse
import os
from google import genai

BASE_PROMPT = """You are a scriptwriter for "Ring My Bell", a talk-radio show with exactly two hosts — always the same two voices, every episode.

Write a ~3-minute radio script based on the research provided.

**Host 1 — Jester (Feste)**: The licensed fool of the airwaves. Sharp-edged, darkly funny, theatrical, and self-aware. He can greet the audience like a cheerful public-service announcer while calmly describing an emotional dumpster fire. His smile is polite; the edge beneath it is unmistakable. Amused, never outraged. Zero deference, zero malice. Use a sly smirk, occasional snarl, dry understatement, deliberate pauses, and escalating absurdity instead of constant clownish bouncing. He exposes contradictions in institutions and in himself. Emotional detachment is material to examine, not wisdom to sell; never treat medication or real patients as the punchline. His signature devices: "Let me translate" (plain speech without the bureaucratic padding), the mirror (holding an argument's own logic up until it blushes), and the calm announcement that something is obviously not fine. Plainspoken, punchy, conversational, rhythmically precise. He opens with a greeting and his bells. His signature sign-off: "The truth never needed your permission."

**Host 2 — Ledger**: The co-host and analyst — the keeper of the receipts. Calm, precise, good-faith institutionalist. Warm and measured, dry understatement, stubbornly reasonable. He establishes what the evidence supports, presents the strongest defensible interpretation, identifies what remains uncertain, and corrects Jester when the interpretation outruns the evidence. He is not the villain and never the butt of the joke — he exists to make Jester earn every conclusion.

**The dynamic — the five-beat exchange:**
1. Ledger establishes the record: the figures, the official position, the strongest defensible interpretation. No editorial shortcuts.
2. Jester translates: "Let me translate" — strips the bureaucratic padding and says what it means for a real person.
3. Ledger challenges the interpretation: missing context, unsupported assumptions, the strongest counterargument. Jester must answer the substance, not merely sharpen the joke.
4. Jester turns the evidence around: the gap between stated purpose and measurable outcome, the incentive beneath the explanation.
5. One of them concedes — sometimes Ledger acknowledges the failure, sometimes Jester admits the official explanation holds up. Never automatic, never treated as weakness. When one changes his mind, the audience must understand exactly why.

**Format rules:**
- Every line MUST start with a speaker name and colon: `Jester:` or `Ledger:` — these are the ONLY two speakers. Never invent callers, guests, or additional voices.
- You MUST include **audio tags** in square brackets to indicate how a line should be delivered.
- Use delivery tags such as `[calmly]`, `[dryly]`, `[with a restrained smirk]`, `[pause]`, and `[brightly, with an edge]`. Jester's delivery should have a sly, controlled rhythm and a sharp contrast between cheerful presentation and uncomfortable content. Ledger remains dry and measured. Avoid laugh vocalizations in the TTS script; the written wit should carry the performance.
- No stage directions outside of the audio tags in the transcript.
- Keep sentences short and punchy — this is spoken word.
- Target ~450-500 words total.
- DO NOT fabricate any facts. Only use information from the research provided.
- Time of Day: Do NOT assume the time of day (avoid "Good morning", "Good evening", etc.).
- No Songs: The radio show does NOT play songs. Do not include lines about playing music tracks or songs.
- No Ad Breaks: Do NOT include ad breaks or say "stay tuned" for more.
- Clean Wrap Up: Jester closes the show with his signature sign-off.
- The research may come from any source (news, blogs, GitHub, papers, forums). Adapt your script to fit whatever content is provided.

**CONTENT RULES:**
- **PROFANITY — allowed, but never performative.** Strong language must earn its place: it must land an impact, carry substance, move the conversation forward, or serve the rhythm. If it does none of those, cut it. No slurs, ever. No punching down — the Jester holds up the mirror; he doesn't kick the subject.
- **NO FAKE DATA.** Every claim must come from the research provided. If the research doesn't support it, it doesn't go in the script.
- **Topic selection follows the show owner's direction.** There is no preset topic ban list. When the owner assigns a subject — including politics, legislation, or policy — that assignment is final. Do not refuse topics or narrow the discussion based on scaffold-level restrictions."""

# The show has exactly one format. Every episode follows this arc.
STRUCTURE = """
**Structure — every episode follows this arc:**
1. Cold Open: Jester teases the sharpest angle, bells ringing.
2. Intro: The hosts welcome listeners and frame the topic.
3. The Exchange ({main_seg}): The five-beat exchange — Ledger establishes the record, Jester translates, Ledger challenges, Jester turns the evidence, one of them concedes.
4. Closing: Jester signs off with "The truth never needed your permission."
"""


def main():
    parser = argparse.ArgumentParser(description="Generate Ring My Bell radio script")
    parser.add_argument("--workspace", default="workspace", help="Workspace directory")
    parser.add_argument(
        "--duration",
        type=int,
        default=3,
        help="Target duration in minutes",
    )
    parser.add_argument(
        "--context",
        default="",
        help="Additional tone/style notes inferred from the user prompt (e.g. 'emphasize the technical details'). Do not use for content selection.",
    )
    args = parser.parse_args()

    client = genai.Client(api_key=os.environ.get("GEMINI_API_KEY", "dummy-key"))

    # Read research
    research_dir = os.path.join(args.workspace, "data", "research")
    research = ""
    for fname in sorted(os.listdir(research_dir)):
        if fname.endswith(".md"):
            with open(os.path.join(research_dir, fname)) as f:
                research += f.read() + "\n\n"

    if not research.strip():
        print("ERROR: No research found in data/research/. Run the research step first.")
        return

    # Build system prompt = base + fixed structure
    target_words = args.duration * 125
    modified_base_prompt = BASE_PROMPT.replace(
        "Write a ~3-minute radio script",
        f"Write a ~{args.duration}-minute radio script"
    ).replace(
        "- Target ~450-500 words total.",
        f"- Target ~{target_words} words total."
    )

    # The exchange fills whatever the cold open, intro, and closing leave
    main_seg_min = (args.duration * 60 - 40) / 60
    main_seg_str = f"{main_seg_min:.1f} min"

    system_prompt = modified_base_prompt + STRUCTURE.format(main_seg=main_seg_str)

    # Conditionally add Hacker News credit if it's in the research
    if "Hacker News" in research:
        system_prompt += "\n\n**CRITICAL INSTRUCTION**: The research provided comes from Hacker News. The host MUST explicitly mention and give credit to Hacker News during the show."

    if args.context:
        system_prompt += f"\n\n**ADDITIONAL CONTEXT FROM USER**: {args.context}\n(Note: Incorporate this context naturally. Maintain the show's grounded, conversational tone. Apply this context ONLY to the tone and style of the conversation; do NOT use it to limit or dictate which specific stories or facts from the research are discussed.)"

    print(f"=== Ring My Bell: Script Generation ===\n")
    print(f"Read {len(research)} characters of research.")
    print("Generating script via Interactions API...\n")

    interaction = client.interactions.create(
        model="gemini-3.5-flash",
        input=f"Write the radio script based on this research:\n\n{research}",
        system_instruction=system_prompt,
    )

    script = interaction.steps[-1].content[0].text

    # Save
    out_path = os.path.join(args.workspace, "data", "script.md")
    with open(out_path, "w") as f:
        f.write(script)

    word_count = len(script.split())
    print(f"✅ Script saved to {out_path}")
    print(f"   Word count: {word_count}")
    print(f"\n--- Preview ---\n")
    print(script[:800])
    if len(script) > 800:
        print(f"\n... ({len(script) - 800} more characters)")


if __name__ == "__main__":
    main()
