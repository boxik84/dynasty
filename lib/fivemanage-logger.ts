'use server'

import { inspect } from "util"

const FIVEMANAGE_API_URL =
  process.env.FIVEMANAGE_API_URL ?? "https://api.fivemanage.com/api/logs"
const FIVEMANAGE_API_KEY =
  process.env.FIVEMANAGE_API_KEY_LOGS ?? process.env.FIVEMANAGE_API_KEY
const DEFAULT_DATASET = process.env.FIVEMANAGE_DATASET ?? "default"
const SECURITY_DATASET = process.env.FIVEMANAGE_SECURITY_DATASET ?? "security"
const APP_IDENTIFIER = process.env.FIVEMANAGE_APP ?? "dynasty-web"

let hasWarnedAboutMissingKey = false

export type LogLevel = "debug" | "info" | "warn" | "error" | "critical"

export type LogContext = {
  method?: string
  path?: string
  search?: string
  ip?: string | null
  userAgent?: string | null
  host?: string | null
  requestId?: string | null
  redirectTo?: string | null
}

export type LogOptions = {
  dataset?: string
  tags?: string[]
  metadata?: Record<string, unknown>
  context?: LogContext
  error?: unknown
}

type DispatchPayload = {
  level: LogLevel
  message: string
  metadata?: Record<string, unknown>
  tags?: string[]
  dataset: string
}

function normalizeError(error: unknown) {
  if (!error) {
    return undefined
  }

  if (error instanceof Error) {
    return {
      name: error.name,
      message: error.message,
      stack: error.stack,
    }
  }

  if (typeof error === "string") {
    return { message: error }
  }

  return { value: inspect(error, { depth: 3 }) }
}

function sanitizeMetadata(
  metadata: Record<string, unknown> | undefined,
  context: LogContext | undefined,
  error: unknown
) {
  const baseMetadata: Record<string, unknown> = {
    app: APP_IDENTIFIER,
    environment: process.env.VERCEL_ENV ?? process.env.NODE_ENV ?? "unknown",
    runtime: process.env.NEXT_RUNTIME ?? "node",
  }

  if (metadata) {
    for (const [key, value] of Object.entries(metadata)) {
      if (value === undefined) {
        continue
      }
      baseMetadata[key] = value
    }
  }

  if (context) {
    const filteredContext = Object.fromEntries(
      Object.entries(context).filter(([, value]) => value !== undefined)
    )

    if (Object.keys(filteredContext).length > 0) {
      baseMetadata.context = filteredContext
    }
  }

  const normalizedError = normalizeError(error)
  if (normalizedError) {
    baseMetadata.error = normalizedError
  }

  return baseMetadata
}

async function dispatchLog({
  level,
  message,
  metadata,
  tags,
  dataset,
}: DispatchPayload) {
  if (!FIVEMANAGE_API_KEY) {
    if (!hasWarnedAboutMissingKey && process.env.NODE_ENV !== "production") {
      console.warn(
        "[fivemanage-logger] Missing FIVEMANAGE_API_KEY; skipping remote logging."
      )
      hasWarnedAboutMissingKey = true
    }
    return
  }

  try {
    const response = await fetch(FIVEMANAGE_API_URL, {
      method: "POST",
      headers: {
        Authorization: FIVEMANAGE_API_KEY,
        "Content-Type": "application/json",
        "X-Fivemanage-Dataset": dataset,
      },
      body: JSON.stringify({
        level,
        message,
        metadata,
        tags,
      }),
    })

    if (!response.ok) {
      const responseText = await response.text()
      if (process.env.NODE_ENV !== "production") {
        console.error(
          "[fivemanage-logger] Failed to deliver log:",
          response.status,
          response.statusText,
          responseText
        )
      }
    }
  } catch (error) {
    if (process.env.NODE_ENV !== "production") {
      console.error("[fivemanage-logger] Unexpected error while logging", error)
    }
  }
}

function queueLog(
  level: LogLevel,
  message: string,
  options?: LogOptions
): Promise<void> {
  const { dataset = DEFAULT_DATASET, tags, metadata, context, error } =
    options ?? {}

  const mergedMetadata = sanitizeMetadata(metadata, context, error)

  return dispatchLog({
    level,
    message,
    metadata: mergedMetadata,
    tags,
    dataset,
  })
}

export async function logDebug(message: string, options?: LogOptions) {
  await queueLog("debug", message, options)
}

export async function logInfo(message: string, options?: LogOptions) {
  await queueLog("info", message, options)
}

export async function logWarn(message: string, options?: LogOptions) {
  await queueLog("warn", message, options)
}

export async function logError(message: string, options?: LogOptions) {
  await queueLog("error", message, options)
}

export async function logCritical(message: string, options?: LogOptions) {
  await queueLog("critical", message, options)
}

export async function logSecurityEvent(message: string, options?: LogOptions) {
  await queueLog("warn", message, {
    ...options,
    dataset: SECURITY_DATASET,
    tags: [...(options?.tags ?? []), "security"],
  })
}