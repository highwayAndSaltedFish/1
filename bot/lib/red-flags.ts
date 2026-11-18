export type RedFlagMatch = {
  id: string;
  labelZh: string;
};

export type RedFlagResult = {
  seekEmergencyCare: boolean;
  matched: RedFlagMatch[];
};

type RedFlagRule = {
  id: string;
  labelZh: string;
  anyOf: string[];
  plusAnyOf?: string[];
};

const RULES: RedFlagRule[] = [
  {
    id: "acs",
    labelZh: "急性胸痛伴危险伴随症状（出汗、气促、放射痛等）",
    anyOf: ["胸痛", "胸口", "心口", "胸部痛", "压榨样", "chest pain"],
    plusAnyOf: ["冷汗", "出汗", "气促", "喘", "放射", "左臂", "左肩", "濒死", "恶心"],
  },
  {
    id: "dyspnea",
    labelZh: "明显呼吸困难或发绀",
    anyOf: ["喘不上气", "呼吸困难", "口唇发紫", "不能平卧", "说话说不成句"],
  },
  {
    id: "stroke",
    labelZh: "疑似卒中（口齿不清、偏瘫、面瘫、突发最剧烈头痛）",
    anyOf: [
      "口齿不清",
      "说话不清",
      "一侧无力",
      "偏瘫",
      "脸歪",
      "口角歪",
      "突发剧烈头痛",
      "最剧烈头痛",
      "脖子发硬",
      "颈项强直",
    ],
  },
  {
    id: "neuro_acute",
    labelZh: "意识障碍、抽搐或昏厥后未完全恢复",
    anyOf: ["昏迷", "不省人事", "抽搐", "癫痫大发作", "晕倒不醒", "意识不清"],
  },
  {
    id: "bleed",
    labelZh: "活动性大出血、呕血、咯血或黑便伴头晕",
    anyOf: ["吐血", "呕血", "咯血", "血流不止", "大出血", "黑便", "柏油样便"],
  },
  {
    id: "abdomen_acute",
    labelZh: "急腹症危象（板状腹、剧痛伴休克表现）",
    anyOf: ["肚子硬", "板状腹", "腹痛"],
    plusAnyOf: ["冷汗", "晕", "脸色苍白", "血压低", "反复呕吐"],
  },
  {
    id: "anaphylaxis",
    labelZh: "严重过敏（呼吸困难、喉头肿胀、全身皮疹伴循环差）",
    anyOf: ["过敏"],
    plusAnyOf: ["呼吸困难", "喉", "喉咙肿", "喘鸣", "全身皮疹", "血压低"],
  },
  {
    id: "pregnancy",
    labelZh: "妊娠相关阴道出血或剧烈腹痛",
    anyOf: ["怀孕", "妊娠", "孕妇"],
    plusAnyOf: ["阴道出血", "见红", "腹痛剧烈", "肚子剧痛", "抽筋样腹痛"],
  },
  {
    id: "psych_crisis",
    labelZh: "自伤、自杀意图或伤害他人风险",
    anyOf: ["自杀", "不想活", "结束生命", "自残", "割腕", "伤害别人"],
  },
  {
    id: "pediatric_danger",
    labelZh: "婴幼儿精神差、反复惊厥或拒吃拒喝",
    anyOf: ["小孩", "婴儿", "幼儿", "宝宝"],
    plusAnyOf: ["惊厥", "抽风", "精神很差", "叫不醒", "拒奶", "皮肤花斑"],
  },
  {
    id: "trauma",
    labelZh: "严重外伤、头伤后意识改变或疑似骨折伴畸形",
    anyOf: ["车祸", "高处坠落", "头打了", "头被撞"],
    plusAnyOf: ["昏迷", "呕吐", "记忆空白", "畸形", "骨头戳出来"],
  },
];

function normalize(text: string): string {
  return text.toLowerCase().replace(/\s+/g, "");
}

function matchesRule(haystack: string, rule: RedFlagRule): boolean {
  const hit = rule.anyOf.some((needle) => haystack.includes(normalize(needle)));
  if (!hit) return false;
  if (!rule.plusAnyOf || rule.plusAnyOf.length === 0) return true;
  return rule.plusAnyOf.some((needle) => haystack.includes(normalize(needle)));
}

/** Deterministic red-flag screen. Not a diagnosis. */
export function checkRedFlags(text: string): RedFlagResult {
  const haystack = normalize(text);
  const matched: RedFlagMatch[] = [];
  for (const rule of RULES) {
    if (matchesRule(haystack, rule)) {
      matched.push({ id: rule.id, labelZh: rule.labelZh });
    }
  }
  return {
    seekEmergencyCare: matched.length > 0,
    matched,
  };
}

export function catalogSize(): number {
  return RULES.length;
}
