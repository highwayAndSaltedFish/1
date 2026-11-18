import { prompt } from "@grok/agent-sdk";
import { defineTool } from "@grok/agent-sdk/tools";
import * as z from "zod/v4";
import { intakeKvKey, isIntakeFields, mergeIntake, type IntakeFields } from "../lib/intake";

const optionalText = z.string().min(1).optional();

export default defineTool({
  description: prompt`
    Persist structured intake for this session and report which fields
    are still missing before you can route. Call after each useful answer.
    Stop asking when completeEnoughToRoute is true, unless red flags already fired.
  `,
  execution: "server",
  effect: "idempotent",
  inputSchema: z.object({
    chiefComplaint: optionalText.describe("主诉"),
    onsetDuration: optionalText.describe("起病时间与病程"),
    location: optionalText.describe("部位"),
    severity: optionalText.describe("严重程度，如 1–10 或轻/中/重"),
    associatedSymptoms: z.array(z.string().min(1)).optional().describe("伴随症状"),
    relevantHistory: optionalText.describe("相关病史、用药、过敏、妊娠等"),
    redFlagSymptoms: z.array(z.string().min(1)).optional().describe("已询问到的危险症状，有或无都记下"),
  }),
  async execute(incoming, ctx) {
    const key = intakeKvKey(ctx.session.id);
    const previousRaw = await ctx.host.kv.get(key);
    const previous = isIntakeFields(previousRaw) ? (previousRaw as IntakeFields) : undefined;
    const snapshot = mergeIntake(previous, incoming, new Date().toISOString());
    await ctx.host.kv.put(key, snapshot.record);
    return {
      record: snapshot.record,
      missingForRouting: snapshot.missingForRouting,
      completeEnoughToRoute: snapshot.completeEnoughToRoute,
    };
  },
});
