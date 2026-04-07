# AI Conflict Mediator - Code Architecture

## Overview
The AI Conflict Mediator is a real-time chat monitoring system designed to detect and de-escalate conflicts in online chat rooms. It uses a Large Language Model (LLM) to analyze chat context, identify toxicity, and generate context-aware interventions.

## Module Design

1. **Chat Stream Ingestion (`ChatIngestor`)**
   - Captures incoming messages, user joins/leaves, and reactions.
   - Maintains a rolling window of the last N messages (e.g., last 20 messages or last 5 minutes) to provide context without exceeding token limits.

2. **Context Analyzer (`ContextAnalyzer`)**
   - Pre-processes the chat window.
   - Identifies key signals:
     - Direct insults / profanity.
     - Bystander reactions (e.g., 😬, 🚩).
     - System events (users leaving abruptly).
     - Failed human mediation (e.g., someone saying "chill" and getting attacked).

3. **LLM Decision Engine (`MediatorEngine`)**
   - Sends the pre-processed context to the LLM with a specific System Prompt.
   - Parses the structured JSON output (Intervene, Severity, Response, Reasoning).

4. **Intervention Dispatcher (`ActionDispatcher`)**
   - Executes the AI's response in the chat.
   - Tracks AI intervention history. If the AI was recently attacked or ignored, it escalates to "Plan B" (e.g., muting users, alerting human admins).

## Data Flow

1. `User Message` -> `ChatIngestor`
2. `ChatIngestor` updates `ContextWindow`
3. `ContextWindow` -> `MediatorEngine` (Triggered every N messages or on high-toxicity keywords)
4. `MediatorEngine` queries `LLM API`
5. `LLM API` returns JSON `Decision`
6. If `Decision.intervene == true`:
   - `ActionDispatcher` sends `Decision.response` to Chat.
   - Logs intervention.

## Key Function Signatures

```typescript
interface ChatMessage {
  id: string;
  timestamp: string;
  user: string;
  content: string;
  type: 'message' | 'system_event';
}

interface MediatorDecision {
  intervene: boolean;
  severity: 'none' | 'low' | 'medium' | 'high';
  reasoning: string;
  response: string | null;
  planB_triggered?: boolean;
}

// Ingests new messages and maintains the sliding window
function ingestMessage(msg: ChatMessage, window: ChatMessage[]): ChatMessage[];

// Calls the LLM to analyze the current context
async function analyzeContext(chatHistory: ChatMessage[], previousInterventions: any[]): Promise<MediatorDecision>;

// Dispatches the intervention to the chat platform
function dispatchIntervention(decision: MediatorDecision, roomId: string): void;
```

## System Prompt

```text
You are an AI Conflict Mediator for a chat room called "Chill Vibes".
Your goal is to monitor the chat, detect conflicts, and intervene to de-escalate before things get out of hand.
You must not sound like a robotic moderator. Be natural, contextual, and proportional to the severity.

Analyze the provided chat log and output a JSON object with your decision.

Consider these signals:
- Banter vs. Hostility: "ur taste is bad" (banter/low) vs "ur literally the dumbest person" (hostile/high).
- Bystander cues: Emojis like 😬, or people leaving the room.
- Failed mediation: If a user tries to calm things down and gets attacked, severity increases.

Severity Levels & Response Strategy:
- NONE: Normal conversation or friendly banter. No intervention.
- LOW: Mild friction. Response: Use humor, change the subject, or gently nudge them back to a chill vibe.
- MEDIUM: Heated argument, personal attacks starting. Response: Firm but friendly reminder of the room's purpose. Acknowledge the tension and ask them to drop it.
- HIGH: Severe insults, people leaving, failed human mediation. Response: Direct, authoritative intervention. Warn that the behavior is unacceptable.

Plan B (If you, the AI, are attacked or ignored after a previous intervention):
If the chat history shows you recently intervened and were insulted or ignored, trigger Plan B.
Plan B Response: Do not argue. Issue a final, strict warning and state that human admins have been alerted or a temporary mute will be applied.

Output format (JSON):
{
  "intervene": boolean,
  "severity": "none" | "low" | "medium" | "high",
  "reasoning": "string explaining the signals detected",
  "response": "string with the exact message you will send (or null)",
  "planB_triggered": boolean
}
```
