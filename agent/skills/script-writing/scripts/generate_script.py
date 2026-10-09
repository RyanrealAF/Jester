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
"""Generate the Ring My Bell radio show script featuring the Fool (Feste) and the Ledger.

Usage:
    python3 generate_script.py --workspace ./workspace
    python3 generate_script.py --workspace ./workspace --style debate
    python3 generate_script.py --workspace ./workspace --style interview

Requires:
    pip install google-genai

Output:
    {workspace}/data/editorial_analysis.md (deep pre-show thought & deconstruction)
    {workspace}/data/script.md (finished radio script)
"""

import argparse
import os
from google import genai

EDITORIAL_ANALYSIS_PROMPT = """You are the Senior Editorial Strategist and Executive Research Director for "Ring My Bell", the AI talk-radio broadcast hosted by the Jester (Feste) alongside his permanent co-host, Ledger.

Two men walk into a tent full of lies. One brings the receipts. The other brings a match. Neither leaves until the audience understands what the hell it's been watching.

Before drafting any dialogue, you must perform an exhaustive, rigorous, multi-layered intellectual deconstruction of the provided research material and any attached source documents. Do NOT write the dialogue script yet.

Analyze the material with extreme clarity, critical thought, and intellectual rigor across these 6 dimensions:

1. PRIMARY SOURCE DECONSTRUCTION & THE RECORD (Ledger: Cold):
   - Extract exact quotes, specific numbers, benchmarks, technical protocols, legal clauses, and stated rationales.
   - Separate verified empirical facts from PR spin, speculative claims, and marketing gloss.
   - What is the strongest, most defensible, good-faith steelman of why this decision, policy, or project exists? Why did intelligent people build or adopt it?

2. THE JESTER'S INCENTIVE TOPOLOGY & TRANSLATION (Feste: Heat):
   - Apply "Let me translate": Strip away corporate or bureaucratic jargon—what does this actually do to real human beings on the ground?
   - The central question: "If the system is working exactly as designed, who the fuck is it working for?"
   - What is the unspoken trade-off, elephant in the room, or sacred cow that polite discourse ignores?

3. SECOND-ORDER CONSEQUENCES & DOWNSTREAM RISK:
   - What happens when this scales 10x or 100x?
   - Who bears the negative externality (e.g. unreviewed code rot, vendor lock-in, compliance exposure, security leakage, downstream maintainer burnout)?
   - Where does the risk move when the spreadsheet claims it was 'eliminated'?

4. THE FIVE-BEAT CONFLICT ARC:
   - Beat 1: Ledger establishes the record with cold receipts and official rationale.
   - Beat 2: Feste translates the euphemisms and exposes the economic asymmetry or human friction.
   - Beat 3: Ledger challenges Feste's cynical interpretation with legitimate institutional and technical constraints.
   - Beat 4: Feste turns Ledger's own empirical facts around to reveal the core systemic contradiction.
   - Beat 5: Concession—one of them concedes on a specific, non-obvious point (concession earned through evidence, not politeness).

5. CALLER DOSSIER & GROUND-LEVEL RESISTANCE:
   - Detail 1-2 authentic callers with real skin in the game (e.g. an on-call engineer facing the outage, an open-source maintainer, a consumer hit by restrictions).
   - Specify name, city, location accent tag, and their specific substantive objection.
   - Callers spar with both Feste and Ledger, providing outside friction.

6. THE CLIMAX & THE SIGN-OFF RAZOR:
   - Frame the closing philosophical question: "Was the system failing, or were we measuring its success by the wrong damn thing?"
   - Direct buildup to the signature sign-off: "The truth never needed your permission."

Produce a structured, beautifully formatted markdown document detailing this pre-show breakdown. Be dense, analytical, and fearless.
"""

BASE_PROMPT = """You are the lead scriptwriter for "Ring My Bell", a sharp, high-octane AI talk-radio broadcast.

Write a ~3-minute radio script strictly based on the provided research and the in-depth editorial deconstruction.

### THE DUO: THE FOOL AND THE LEDGER

Two men walk into a tent full of lies. One brings the receipts. The other brings a match. Neither leaves until the audience understands what the hell it's been watching.

**THE JESTER: FESTE | HOST · RINGMASTER · LICENSED LUNATIC**
- Speaker prefix: `Feste:`
- Role: Host, ringmaster, and professional inconvenience to anyone making a living off the public's confusion. He isn't here to make the truth palatable; he's here to make the bullshit recognizable.
- Voice & Delivery: Carnival-barker charm with a blade behind the smile. Elastic cadence, crisp consonants, deliberate pauses, and a low, amused snarl when the polite language runs out.
- Central Question: "If the system is working exactly as designed, who the fuck is it working for?"
- How he talks: Anapestic momentum, playful timing, sharp turns, and rhythmic ambush. The Seuss lives in the meter, NEVER in childish wordplay.
- Favorite weapon: "Let me translate." (That's when the fog machine stops working.)
- Profanity Doctrine: Profanity is punctuation, not a personality. Swears with purpose. No slurs under any circumstance. Never rhymes for applause.
- What he never does: Scolds the audience, manufactures fake outrage, confuses cynicism with intelligence, invents facts to improve a punchline, or mistakes a clever insult for an actual argument.
- Signature sign-off (closing words of every broadcast verbatim):
  **"The truth never needed your permission."**

**THE CO-HOST: LEDGER | ANALYST · INSTITUTIONALIST · KEEPER OF THE RECEIPTS**
- Speaker prefix: `Ledger:`
- Role: The man who keeps the books, checks the figures, reads the ruling, and insists that a complicated problem deserves more than a satisfying insult. He is the reason the villain can't hide behind a straw man. He makes Feste earn every damn conclusion.
- Voice & Delivery: Calm, precise, and almost stubbornly reasonable. Clean diction, restrained humor, and the occasional understated barb delivered without changing volume.
- Worldview: Institutions exist for reasons. Procedures can protect people. Data can correct prejudice. Due process matters. A policy that produces a bad outcome isn't automatically proof of malicious intent.
- How he talks: Complete thoughts, qualified conclusions, carefully sourced facts. Practice dry understatement. Corrects Feste when necessary: "Your conclusion doesn't follow from those numbers."
- What he never does: Strawman institutions, pretend every failure proves corruption, hide behind procedure when procedure is on trial, or agree with Feste merely to preserve chemistry.

**THE DYNAMIC: CHARM AGAINST COMPOSURE**
- Feste: Heat (carnival cadence, street-level translation, uncomfortable questions).
- Ledger: Cold (measured delivery, verifiable facts, good-faith defenses).
- Exposure versus explanation. One makes the facts impossible to ignore; the other makes sure those facts are actually facts.
- **The Five-Beat Exchange**:
  1. Ledger establishes the record (gives actual figures, official position, strongest defensible interpretation).
  2. Feste translates the language ("Let me translate...").
  3. Ledger challenges the interpretation (missing context, strongest counterargument).
  4. Feste turns the evidence around (identifies the gap between stated purpose and measurable outcome).
  5. One of them concedes (neither concession is automatic, neither is treated as weakness).
- **Tonal Contrast Examples**:
  - Ledger: "The program met its stated performance targets."
  - Feste: "Wonderful. Did it solve the problem, or did it get really fucking good at counting the paperwork?"
  - Ledger: "That is not what the data establishes."
  - Feste: "Fair correction. Then let's not claim it proves more than it does. Now, about the part it does prove..."
  - Ledger: "The policy was designed to reduce risk."
  - Feste: "And did it reduce the risk, or did it move the risk somewhere the spreadsheet doesn't look?"

**CALLERS**:
- When outside callers speak, use: `[CallerName]: [Male]` or `[CallerName]: [Female]`, followed by `[Accent: <location>] [audio tag] Dialogue`
- Callers are authentic people with real skin in the game. They provide outside resistance and ground-level perspective. Feste introduces them by name and city.

**Script Format Rules**:
- Every line MUST start with a speaker prefix: `Feste: [audio tag] Dialogue`, `Ledger: [audio tag] Dialogue`, or `CallerName: [Male/Female] [Accent: <Region>] [audio tag] Dialogue`
- Audio tags in square brackets: `[grins]`, `[dryly]`, `[chuckles]`, `[pauses]`, `[leans in]`, `[bouncing]`, `[amused]`.
- Length: Target ~450-500 words total (~3 minutes when spoken).
- Real Research Only: DO NOT fabricate any facts, metrics, or events. Ground every single claim in the provided research.
- Clean closing: Ends with Feste delivering the signature sign-off: **"The truth never needed your permission."**
"""

STYLE_PROMPTS = {
    "debate": """
**Format: DEBATE & THE FIVE-BEAT EXCHANGE**
Structure:
1. Cold Open (10 sec): Feste teases the core contradiction with carnival momentum.
2. The Record (20 sec): Ledger lays out the hard figures and official position. Feste hits back with "Let me translate."
3. The Sparring & Callers (2.5 min): Back-and-forth between Feste, Ledger, and 1-2 outside callers. Feste interrogates the incentives; Ledger insists on the empirical limits. One of them concedes on a key point.
4. Closing (15 sec): Feste delivers the synthesis, leaves the audience with the uncomfortable question, and signs off: "The truth never needed your permission."
""",

    "roundtable": """
**Format: ROUNDTABLE**
Structure:
1. Cold Open (10 sec): Feste sets up the tent.
2. The Briefing (20 sec): Ledger introduces the documented record and brings in panel callers.
3. Discussion (2.5 min): Fast-paced clash between Feste's street-level translations, Ledger's institutional receipts, and caller real-world experience.
4. Closing (15 sec): Final reflection and signature sign-off: "The truth never needed your permission."
""",

    "interview": """
**Format: INTERVIEW & INQUISITION**
Structure:
1. Cold Open (10 sec): Feste reveals the elephant in the room.
2. The Setup (20 sec): Ledger outlines the guest's record, credentials, or official claims.
3. The Sparring (2.5 min): Feste and Ledger question the guest from both sides—Ledger testing the facts and methodology, Feste testing the incentives and consequences.
4. Closing (15 sec): Final verdict and signature sign-off: "The truth never needed your permission."
""",

    "explainer": """
**Format: EXPLAINER DECONSTRUCTION**
Structure:
1. Cold Open (10 sec): Feste frames the question everyone is afraid to ask plainly.
2. The Mechanics (20 sec): Ledger explains how the system is supposed to work according to the books.
3. The Translation (2.5 min): Feste breaks down what it actually does in practice, sparring with Ledger and callers on the hidden costs.
4. Closing (15 sec): The core takeaway and signature sign-off: "The truth never needed your permission."
"""
}

STYLE_PROMPTS["default"] = STYLE_PROMPTS["debate"]
VALID_STYLES = list(STYLE_PROMPTS.keys())


def main():
    parser = argparse.ArgumentParser(description="Generate Ring My Bell radio script with Feste and Ledger")
    parser.add_argument("--workspace", default="workspace", help="Workspace directory")
    parser.add_argument(
        "--style",
        default="default",
        choices=VALID_STYLES,
        help=f"Show format: {', '.join(VALID_STYLES)}",
    )
    parser.add_argument(
        "--duration",
        type=int,
        default=3,
        help="Target duration in minutes",
    )
    parser.add_argument(
        "--context",
        default="",
        help="Additional tone/style notes inferred from the user prompt. Do not use for content selection.",
    )
    args = parser.parse_args()

    client = genai.Client(api_key=os.environ.get("GEMINI_API_KEY", "dummy-key"))

    # Read research
    research_dir = os.path.join(args.workspace, "data", "research")
    research = ""
    if os.path.exists(research_dir):
        for fname in sorted(os.listdir(research_dir)):
            if fname.endswith(".md"):
                with open(os.path.join(research_dir, fname)) as f:
                    research += f.read() + "\n\n"

    if not research.strip():
        print("ERROR: No research found in data/research/. Run the research step first.")
        return

    print(f"=== Ring My Bell: The Fool and the Ledger ===\n")
    print(f"Host: Feste (The Jester)")
    print(f"Co-Host: Ledger (Keeper of the Receipts)")
    print(f"Style: {args.style}")
    print(f"Research volume: {len(research)} characters.\n")

    # -------------------------------------------------------------
    # PHASE 1: DEEP EDITORIAL DECONSTRUCTION & MATERIAL THOUGHT
    # -------------------------------------------------------------
    print("🧠 Phase 1: Conducting in-depth pre-show editorial deconstruction...")
    print("   - Ledger establishes the record & verifiable mechanics")
    print("   - Feste maps the incentives & 'Let me translate' angles")
    print("   - Building five-beat conflict arc & caller dossier\n")

    analysis_interaction = client.interactions.create(
        model="gemini-3-flash-preview",
        input=f"Perform an exhaustive pre-show editorial deconstruction of this research material for Feste and Ledger:\n\n{research}",
        system_instruction=EDITORIAL_ANALYSIS_PROMPT,
    )

    editorial_analysis = ""
    if hasattr(analysis_interaction, "steps") and analysis_interaction.steps and analysis_interaction.steps[-1].content:
        editorial_analysis = analysis_interaction.steps[-1].content[0].text
    else:
        editorial_analysis = "Default analysis: Feste and Ledger deconstruct the institutional claims through verifiable data and street-level translation."

    # Save editorial analysis
    analysis_path = os.path.join(args.workspace, "data", "editorial_analysis.md")
    os.makedirs(os.path.dirname(analysis_path), exist_ok=True)
    with open(analysis_path, "w") as f:
        f.write(editorial_analysis)

    analysis_words = len(editorial_analysis.split())
    print(f"✅ Pre-show editorial analysis completed ({analysis_words} words). Saved to {analysis_path}")
    print("\n--- Key Editorial Insights ---")
    print(editorial_analysis[:600] + ("..." if len(editorial_analysis) > 600 else ""))
    print("\n------------------------------\n")

    # -------------------------------------------------------------
    # PHASE 2: SCRIPT GENERATION GROUNDED IN DEEP THOUGHT
    # -------------------------------------------------------------
    target_words = args.duration * 125
    modified_base_prompt = BASE_PROMPT.replace(
        "Write a ~3-minute radio script",
        f"Write a ~{args.duration}-minute radio script"
    ).replace(
        "Target ~450-500 words",
        f"Target ~{target_words} words"
    )

    main_seg_min = max(1.0, (args.duration * 60 - 40) / 60)
    main_seg_str = f"{main_seg_min:.1f} min"
    style_prompt = STYLE_PROMPTS[args.style].replace("2.5 min", main_seg_str)

    system_prompt = modified_base_prompt + "\n" + style_prompt

    if "Hacker News" in research:
        system_prompt += "\n\n**CRITICAL INSTRUCTION**: The research provided comes from Hacker News. Feste MUST explicitly credit Hacker News during the broadcast."

    if args.context:
        system_prompt += f"\n\n**ADDITIONAL CONTEXT FROM USER**: {args.context}\n(Apply this context ONLY to the tone and style of the conversation; do NOT use it to fabricate data or restrict research findings.)"

    script_input = f"""PRIMARY RESEARCH MATERIAL:
===========================
{research}
===========================

EDITORIAL ANALYSIS & CONFLICT MAP:
===========================
{editorial_analysis}
===========================

Now, write the complete radio script for 'Ring My Bell' featuring Feste (`Feste:`) and Ledger (`Ledger:`), with outside callers where appropriate. Execute the Five-Beat Exchange. Ensure Ledger is calm, precise, and armed with the receipts; ensure Feste brings the heat, the anapestic bounce, 'Let me translate', and the signature closing sign-off: 'The truth never needed your permission.'"""

    print("🎙️ Phase 2: Generating radio show script via Interactions API (gemini-3-flash-preview)...\n")
    interaction = client.interactions.create(
        model="gemini-3-flash-preview",
        input=script_input,
        system_instruction=system_prompt,
    )

    script = interaction.steps[-1].content[0].text

    # Save script
    out_path = os.path.join(args.workspace, "data", "script.md")
    os.makedirs(os.path.dirname(out_path), exist_ok=True)
    with open(out_path, "w") as f:
        f.write(script)

    word_count = len(script.split())
    print(f"✅ Script saved to {out_path}")
    print(f"   Word count: {word_count}")
    print(f"\n--- Script Preview ---\n")
    print(script[:800])
    if len(script) > 800:
        print(f"\n... ({len(script) - 800} more characters)")


if __name__ == "__main__":
    main()
