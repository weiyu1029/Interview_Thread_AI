export type SpeechQuotaStatement = {
  bind: (...values: unknown[]) => SpeechQuotaStatement;
  run: () => Promise<unknown>;
  first: <T>() => Promise<T | null>;
};

export type SpeechQuotaDatabase = {
  prepare: (query: string) => SpeechQuotaStatement;
};

const CREATE_SPEECH_USAGE_WINDOWS_TABLE = `
  CREATE TABLE IF NOT EXISTS speech_usage_windows (
    window_start integer PRIMARY KEY NOT NULL,
    request_count integer DEFAULT 0 NOT NULL,
    updated_at text NOT NULL
  )
`;

const CREATE_SPEECH_CHARACTER_USAGE_WINDOWS_TABLE = `
  CREATE TABLE IF NOT EXISTS speech_character_usage_windows (
    window_start integer PRIMARY KEY NOT NULL,
    character_count integer DEFAULT 0 NOT NULL,
    updated_at text NOT NULL
  )
`;

const CREATE_SPEECH_AUDIO_USAGE_WINDOWS_TABLE = `
  CREATE TABLE IF NOT EXISTS speech_audio_usage_windows (
    operation text NOT NULL,
    window_start integer NOT NULL,
    byte_count integer DEFAULT 0 NOT NULL,
    updated_at text NOT NULL,
    PRIMARY KEY (operation, window_start)
  )
`;

const storageReadiness = new WeakMap<object, Promise<void>>();
const characterStorageReadiness = new WeakMap<object, Promise<void>>();
const audioStorageReadiness = new WeakMap<object, Promise<void>>();

async function ensureSpeechUsageStorage(db: SpeechQuotaDatabase) {
  let ready = storageReadiness.get(db as object);
  if (!ready) {
    ready = db
      .prepare(CREATE_SPEECH_USAGE_WINDOWS_TABLE)
      .run()
      .then(() => undefined)
      .catch((error) => {
        storageReadiness.delete(db as object);
        throw error;
      });
    storageReadiness.set(db as object, ready);
  }
  return ready;
}

async function ensureSpeechCharacterUsageStorage(db: SpeechQuotaDatabase) {
  let ready = characterStorageReadiness.get(db as object);
  if (!ready) {
    ready = db
      .prepare(CREATE_SPEECH_CHARACTER_USAGE_WINDOWS_TABLE)
      .run()
      .then(() => undefined)
      .catch((error) => {
        characterStorageReadiness.delete(db as object);
        throw error;
      });
    characterStorageReadiness.set(db as object, ready);
  }
  return ready;
}

async function ensureSpeechAudioUsageStorage(db: SpeechQuotaDatabase) {
  let ready = audioStorageReadiness.get(db as object);
  if (!ready) {
    ready = db
      .prepare(CREATE_SPEECH_AUDIO_USAGE_WINDOWS_TABLE)
      .run()
      .then(() => undefined)
      .catch((error) => {
        audioStorageReadiness.delete(db as object);
        throw error;
      });
    audioStorageReadiness.set(db as object, ready);
  }
  return ready;
}

export async function consumeGlobalSpeechQuota(
  db: SpeechQuotaDatabase,
  {
    windowStart,
    windowMilliseconds,
    limit,
  }: {
    windowStart: number;
    windowMilliseconds: number;
    limit: number;
  },
) {
  await ensureSpeechUsageStorage(db);
  const updatedAt = new Date().toISOString();
  const row = await db
    .prepare(
      `INSERT INTO speech_usage_windows (window_start, request_count, updated_at)
       VALUES (?, 1, ?)
       ON CONFLICT(window_start) DO UPDATE SET
         request_count = speech_usage_windows.request_count + 1,
         updated_at = excluded.updated_at
       RETURNING request_count`,
    )
    .bind(windowStart, updatedAt)
    .first<{ request_count: number }>();

  const count = Number(row?.request_count || 0);
  if (count === 1) {
    await db
      .prepare("DELETE FROM speech_usage_windows WHERE window_start < ?")
      .bind(windowStart - 6 * windowMilliseconds)
      .run();
  }
  return count > limit;
}

export async function consumeGlobalSpeechCharacterQuota(
  db: SpeechQuotaDatabase,
  {
    windowStart,
    windowMilliseconds,
    characters,
    limit,
  }: {
    windowStart: number;
    windowMilliseconds: number;
    characters: number;
    limit: number;
  },
) {
  await ensureSpeechCharacterUsageStorage(db);
  const boundedCharacters = Math.max(0, Math.floor(characters));
  if (!boundedCharacters) return false;
  const updatedAt = new Date().toISOString();
  const row = await db
    .prepare(
      `INSERT INTO speech_character_usage_windows (window_start, character_count, updated_at)
       VALUES (?, ?, ?)
       ON CONFLICT(window_start) DO UPDATE SET
         character_count = speech_character_usage_windows.character_count + excluded.character_count,
         updated_at = excluded.updated_at
       RETURNING character_count`,
    )
    .bind(windowStart, boundedCharacters, updatedAt)
    .first<{ character_count: number }>();

  const count = Number(row?.character_count || 0);
  if (count === boundedCharacters) {
    await db
      .prepare(
        "DELETE FROM speech_character_usage_windows WHERE window_start < ?",
      )
      .bind(windowStart - 6 * windowMilliseconds)
      .run();
  }
  return count > limit;
}

export async function consumeGlobalSpeechAudioQuota(
  db: SpeechQuotaDatabase,
  {
    operation,
    windowStart,
    windowMilliseconds,
    bytes,
    limit,
  }: {
    operation: "stt" | "s2s";
    windowStart: number;
    windowMilliseconds: number;
    bytes: number;
    limit: number;
  },
) {
  await ensureSpeechAudioUsageStorage(db);
  const boundedBytes = Math.max(0, Math.floor(bytes));
  if (!boundedBytes) return false;
  const updatedAt = new Date().toISOString();
  const row = await db
    .prepare(
      `INSERT INTO speech_audio_usage_windows
         (operation, window_start, byte_count, updated_at)
       VALUES (?, ?, ?, ?)
       ON CONFLICT(operation, window_start) DO UPDATE SET
         byte_count = speech_audio_usage_windows.byte_count + excluded.byte_count,
         updated_at = excluded.updated_at
       RETURNING byte_count`,
    )
    .bind(operation, windowStart, boundedBytes, updatedAt)
    .first<{ byte_count: number }>();

  const count = Number(row?.byte_count || 0);
  if (count === boundedBytes) {
    await db
      .prepare(
        "DELETE FROM speech_audio_usage_windows WHERE operation = ? AND window_start < ?",
      )
      .bind(operation, windowStart - 6 * windowMilliseconds)
      .run();
  }
  return count > limit;
}
