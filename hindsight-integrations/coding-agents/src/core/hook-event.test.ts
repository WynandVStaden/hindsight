import { describe, expect, it } from "vitest";
import { parseHookEvent } from "./hook-event";

const EVENT = '{"conversation_id":"c1","prompt":"hi"}';
const PARSED = { conversation_id: "c1", prompt: "hi" };

describe("parseHookEvent", () => {
  it("parses a plain event", () => {
    expect(parseHookEvent(EVENT)).toEqual(PARSED);
  });

  // What a hook reads when Cursor on Windows pipes the event through PowerShell.
  it("ignores a UTF-8 byte order mark in front of the event", () => {
    expect(parseHookEvent(`﻿${EVENT}`)).toEqual(PARSED);
  });

  it("ignores a doubled byte order mark", () => {
    expect(parseHookEvent(`﻿﻿${EVENT}`)).toEqual(PARSED);
  });

  it("ignores a byte order mark that was decoded as Windows-1252", () => {
    expect(parseHookEvent(`ï»¿${EVENT}`)).toEqual(PARSED);
  });

  it("leaves the same characters alone inside the event", () => {
    expect(parseHookEvent('{"prompt":"ï»¿ ﻿"}')).toEqual({
      prompt: "ï»¿ ﻿",
    });
  });

  it("still throws on input that is not JSON", () => {
    expect(() => parseHookEvent("")).toThrow();
    expect(() => parseHookEvent("not json")).toThrow();
    expect(() => parseHookEvent(`x${EVENT}`)).toThrow();
  });
});
