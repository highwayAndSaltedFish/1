import { defineAgent } from "@grok/agent-sdk";

export default defineAgent({
  name: "triage-intake",
  description: "中文分诊问诊：收集主诉并建议就诊科室与紧急程度，不做诊断。",
  model: {
    id: "grok-4.7",
    params: [
      { id: "reasoning_effort", value: "high" },
      { id: "fast", value: "true" },
    ],
  },
  // Intake chat: allow reading the routing skill, no shell or editors.
  tools: ["read"],
});
