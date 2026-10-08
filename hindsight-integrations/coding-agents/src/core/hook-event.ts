/**
 * Reading a host's hook event from stdin.
 *
 * Every hook entry point gets one JSON object on stdin. On Windows the host does not always hand
 * it over clean: Cursor runs each hook through a PowerShell pipeline
 * (`Get-Content <tmp>.json -Raw | & { $input | <command> }`), and PowerShell puts a UTF-8 byte
 * order mark in front of what it pipes to a native command — sometimes two, sometimes already
 * decoded as Windows-1252 (the three characters `ï»¿`). `JSON.parse` rejects all of those, and
 * since a hook must never fail its host, the hook then exits 0 having done nothing.
 */

import { readFileSync } from "node:fs";

/** One or more UTF-8 BOMs, as U+FEFF or as the three characters its bytes become in Windows-1252. */
const LEADING_BOM = /^(?:﻿|ï»¿)+/;

/** Parse a hook event, ignoring any byte order mark in front of it. Throws on anything else. */
export function parseHookEvent(raw: string): Record<string, unknown> {
  return JSON.parse(raw.replace(LEADING_BOM, "")) as Record<string, unknown>;
}

/** Read and parse the hook event on stdin. Throws when there is none or it is not JSON. */
export function readHookEvent(): Record<string, unknown> {
  return parseHookEvent(readFileSync(0, "utf8"));
}
