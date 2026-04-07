# AI Usage Log

## Overview
This document outlines how AI tools were utilized during the development of the AI Conflict Mediator prototype. The goal was to leverage AI for brainstorming, boilerplate generation, and refining the LLM prompt, while maintaining human control over the architecture and core logic.

## Tools Used
- **Google Gemini (via AI Studio / API)**: Used as the core engine for the mediator, and as a coding assistant during development.

## Development Process

### 1. Conceptualization & Architecture
**Prompt to AI:** "I need to design an architecture for an AI chat moderator that doesn't just ban people, but tries to de-escalate arguments naturally. What are the key components needed?"
**AI Response:** Suggested a standard pipeline (Ingestion -> NLP Analysis -> Action).
**What I kept:** The modular pipeline concept.
**What I changed:** The AI suggested complex sentiment analysis models (like BERT). I threw that away in favor of a single LLM call with a well-crafted system prompt, as modern LLMs are capable of zero-shot conflict resolution and it simplifies the architecture. I added the "Plan B" tracking mechanism manually, as the AI didn't initially account for the mediator itself being attacked.

### 2. Crafting the System Prompt
**Prompt to AI:** "Write a system prompt for an AI mediator. It needs to output JSON with intervene (bool), severity (low/med/high), and response. It should look for signals like people leaving or emojis."
**AI Response:** Provided a decent starting prompt, but the tone of the suggested responses was very robotic (e.g., "Greetings users, please cease this altercation.").
**What I kept:** The JSON schema structure.
**What I changed:** I heavily rewrote the instructions regarding *tone*. I explicitly added the "Banter vs. Hostility" examples and the "Plan B" instructions. I realized through testing that without strict instructions, the AI would intervene too early (on mild banter). I added the "NONE" severity level to prevent over-triggering.

### 3. UI Boilerplate Generation
**Prompt to AI:** "Create a React component using Tailwind CSS that looks like a chat room. It should have a dark mode theme and show system messages differently from user messages."
**AI Response:** Generated a functional React component with standard chat bubbles.
**What I kept:** The basic layout, flexbox structures, and Tailwind classes for the chat bubbles.
**What I changed:** I integrated it with my custom simulation logic. I added the "Next Message" stepping mechanism so the user can see the AI's real-time thought process as the chat unfolds, rather than just dumping the whole log at once.

### 4. Where I Chose NOT to Use AI
I did not use AI to write the state management logic for the simulator (the `useEffect` hooks triggering the Gemini API). AI often hallucinates or creates overly complex state machines for simple step-through simulations. I wrote the simulation controller manually to ensure precise control over when the API is called and how the chat history is fed to the model.

## Conclusion
AI was invaluable for generating the initial JSON schema and UI boilerplate, saving hours of typing. However, the core "soul" of the application—the nuanced system prompt that dictates *how* the AI behaves, and the architectural decision to include a "Plan B"—required human intuition and iteration based on the specific constraints of the prompt.
