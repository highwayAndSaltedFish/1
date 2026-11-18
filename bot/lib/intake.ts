export type IntakeFields = {
  chiefComplaint?: string;
  onsetDuration?: string;
  location?: string;
  severity?: string;
  associatedSymptoms?: string[];
  relevantHistory?: string;
  redFlagSymptoms?: string[];
};

export type IntakeRecord = IntakeFields & {
  updatedAt: string;
};

const REQUIRED_TO_ROUTE = ["chiefComplaint", "onsetDuration"] as const;

export type IntakeSnapshot = {
  record: IntakeRecord;
  missingForRouting: string[];
  completeEnoughToRoute: boolean;
};

export function mergeIntake(
  previous: IntakeFields | undefined,
  incoming: IntakeFields,
  updatedAt: string,
): IntakeSnapshot {
  const associatedSymptoms = uniqueStrings([
    ...(previous?.associatedSymptoms ?? []),
    ...(incoming.associatedSymptoms ?? []),
  ]);
  const redFlagSymptoms = uniqueStrings([
    ...(previous?.redFlagSymptoms ?? []),
    ...(incoming.redFlagSymptoms ?? []),
  ]);
  const record: IntakeRecord = {
    chiefComplaint: incoming.chiefComplaint ?? previous?.chiefComplaint,
    onsetDuration: incoming.onsetDuration ?? previous?.onsetDuration,
    location: incoming.location ?? previous?.location,
    severity: incoming.severity ?? previous?.severity,
    associatedSymptoms: associatedSymptoms.length > 0 ? associatedSymptoms : undefined,
    relevantHistory: incoming.relevantHistory ?? previous?.relevantHistory,
    redFlagSymptoms: redFlagSymptoms.length > 0 ? redFlagSymptoms : undefined,
    updatedAt,
  };
  const missingForRouting = REQUIRED_TO_ROUTE.filter((key) => !hasText(record[key]));
  return {
    record,
    missingForRouting,
    completeEnoughToRoute: missingForRouting.length === 0,
  };
}

export function intakeKvKey(sessionId: string): string {
  return `intake:${sessionId}`;
}

function hasText(value: string | undefined): boolean {
  return typeof value === "string" && value.trim().length > 0;
}

function uniqueStrings(values: string[]): string[] {
  const seen = new Set<string>();
  const out: string[] = [];
  for (const value of values) {
    const trimmed = value.trim();
    if (!trimmed) continue;
    const key = trimmed.toLowerCase();
    if (seen.has(key)) continue;
    seen.add(key);
    out.push(trimmed);
  }
  return out;
}

export function isIntakeFields(value: unknown): value is IntakeFields {
  if (value === null || typeof value !== "object") return false;
  return true;
}
