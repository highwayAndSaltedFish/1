# 分诊问诊（triage-intake）

Agent SDK 中文分诊问诊助手：收集主诉并建议就诊科室与紧急程度，**不做诊断**。

## 本地运行

需要 Node 22.13+ 和 Cursor 登录（`CURSOR_API_KEY` 或 `npx @grok/agent-sdk login`）。

```bash
npm install
npx @grok/agent-sdk validate --dir .
npx tsc --noEmit
npx @grok/agent-sdk tool call check_red_flags --dir . --input '{"text":"胸口剧痛，出冷汗，喘不上气"}' --json
npx @grok/agent-sdk run --dir . --message "我胸口剧痛，出冷汗，喘不上气。"
npx @grok/agent-sdk dev --dir .
```

Playground: 打开 `dev` 打印的 playground 地址（通常是 `http://127.0.0.1:3000/playground`）。

```bash
npx @grok/agent-sdk eval --dir . --tag smoke
```

## 行为

- 一次只问一个短问题，够分流就停。
- 红旗症状命中时，要求立即急诊或呼叫急救。
- 输出：建议科室、紧急程度（急诊 / 当天就诊 / 常规门诊）、摘要、医生仍需了解的信息。
