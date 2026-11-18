import { prompt } from "@grok/agent-sdk";
import { defineTool } from "@grok/agent-sdk/tools";
import * as z from "zod/v4";
import { catalogSize, checkRedFlags } from "../lib/red-flags";

export default defineTool({
  description: prompt`
    Screen the current complaint and symptoms for emergency red flags.
    Call this as soon as the user describes symptoms, and again when new
    danger signs appear. This is a safety gate, not a diagnosis.
  `,
  execution: "server",
  effect: "read",
  inputSchema: z.object({
    text: z
      .string()
      .min(1)
      .describe("Chief complaint plus associated symptoms, history, and red-flag answers, in the user's words."),
  }),
  async execute({ text }) {
    const result = checkRedFlags(text);
    return {
      seekEmergencyCare: result.seekEmergencyCare,
      matched: result.matched,
      catalogSize: catalogSize(),
      disclaimerZh: "本筛查不能替代医生诊断。若提示需急诊，请立即前往急诊或呼叫急救。",
    };
  },
});
