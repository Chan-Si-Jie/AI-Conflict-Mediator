import { GoogleGenAI, Type } from '@google/genai';
import { ChatMessage } from '../data/chatLog';

export interface MediatorDecision {
  intervene: boolean;
  severity: 'none' | 'low' | 'medium' | 'high';
  reasoning: string;
  response: string | null;
  planB_triggered: boolean;
}

const SYSTEM_PROMPT = `You are an AI Conflict Mediator for a chat room called "Chill Vibes".
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
Plan B Response: Do not argue. Issue a final, strict warning and state that human admins have been alerted or a temporary mute will be applied.`;

export async function analyzeChatContext(chatHistory: ChatMessage[]): Promise<MediatorDecision> {
  try {
    const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
    
    const formattedHistory = chatHistory.map(msg => {
      if (msg.type === 'system') {
        return `[${msg.timestamp}] ** ${msg.content} **`;
      }
      return `[${msg.timestamp}] ${msg.user}: ${msg.content}`;
    }).join('\n');

    const prompt = `Current Chat Log:\n${formattedHistory}\n\nAnalyze the log and provide your decision.`;

    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: prompt,
      config: {
        systemInstruction: SYSTEM_PROMPT,
        responseMimeType: 'application/json',
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            intervene: { type: Type.BOOLEAN },
            severity: { type: Type.STRING, enum: ['none', 'low', 'medium', 'high'] },
            reasoning: { type: Type.STRING },
            response: { type: Type.STRING },
            planB_triggered: { type: Type.BOOLEAN },
          },
          required: ['intervene', 'severity', 'reasoning', 'planB_triggered'],
        },
      },
    });

    const text = response.text;
    if (!text) throw new Error("Empty response");
    return JSON.parse(text) as MediatorDecision;
  } catch (e) {
    console.error("Failed to parse AI response", e);
    return {
      intervene: false,
      severity: 'none',
      reasoning: `Error analyzing context: ${e instanceof Error ? e.message : String(e)}`,
      response: null,
      planB_triggered: false,
    };
  }
}

