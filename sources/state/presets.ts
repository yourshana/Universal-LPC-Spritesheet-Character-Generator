// Saved character presets ("人物方案"): a named snapshot of the current
// selections plus the body type, persisted in localStorage so a character can
// be reloaded and re-equipped later.
//
// Everything here is UI-framework free; the PresetBar component renders it and
// the wizard's 完成 button reuses `saveCurrentPreset`.
import { debugWarn } from "../utils/debug.ts";
import type { Selection, Selections, State } from "./state.ts";

/** localStorage key; bump the suffix if the stored shape ever changes. */
export const PRESETS_STORAGE_KEY = "lpc:character-presets:v1";

/** A named snapshot the wizard can save, load, rename, update, or delete. */
export type CharacterPreset = {
  id: string;
  name: string;
  createdAt: number;
  updatedAt: number;
  bodyType: string;
  wizardSpecies: State["wizardSpecies"];
  selections: Selections;
};

/** The subset of the Web Storage API presets need; injectable for tests. */
export type PresetStorage = {
  getItem(key: string): string | null;
  setItem(key: string, value: string): void;
};

/** Which preset name is currently being edited inline. */
export type PresetEditor = {
  editingId: string | null;
  draftName: string;
};

export const EMPTY_PRESET_EDITOR: PresetEditor = {
  editingId: null,
  draftName: "",
};

function defaultPresetStorage(): PresetStorage | null {
  try {
    return typeof globalThis.localStorage === "undefined"
      ? null
      : globalThis.localStorage;
  } catch {
    // Access throws when storage is disabled (privacy mode, sandboxed frame).
    return null;
  }
}

function resolveStorage(
  storage: PresetStorage | null | undefined,
): PresetStorage | null {
  return storage === undefined ? defaultPresetStorage() : storage;
}

let presetIdCounter = 0;

function createPresetId(): string {
  const cryptoApi = globalThis.crypto;
  if (typeof cryptoApi?.randomUUID === "function")
    return cryptoApi.randomUUID();
  presetIdCounter += 1;
  return `preset-${Date.now().toString(36)}-${presetIdCounter}`;
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function toSelection(value: unknown): Selection | null {
  if (!isRecord(value)) return null;
  const { itemId, name } = value;
  if (typeof itemId !== "string" || typeof name !== "string") return null;

  const selection: Selection = { itemId, name };
  if (typeof value.subId === "number" || value.subId === null) {
    selection.subId = value.subId;
  }
  if (typeof value.variant === "string" || value.variant === null) {
    selection.variant = value.variant;
  }
  if (typeof value.recolor === "string" || value.recolor === null) {
    selection.recolor = value.recolor;
  }
  return selection;
}

function toSelections(value: unknown): Selections | null {
  if (!isRecord(value)) return null;
  const selections: Selections = {};
  for (const [group, entry] of Object.entries(value)) {
    const selection = toSelection(entry);
    if (selection) selections[group] = selection;
  }
  return selections;
}

function toSpecies(value: unknown): State["wizardSpecies"] {
  return value === "human" || value === "nonhuman" ? value : null;
}

function toPreset(value: unknown): CharacterPreset | null {
  if (!isRecord(value)) return null;
  const { id, name, bodyType } = value;
  if (typeof id !== "string" || typeof name !== "string") return null;
  if (typeof bodyType !== "string") return null;

  const selections = toSelections(value.selections);
  if (!selections) return null;

  const createdAt = typeof value.createdAt === "number" ? value.createdAt : 0;
  const updatedAt =
    typeof value.updatedAt === "number" ? value.updatedAt : createdAt;
  return {
    id,
    name,
    createdAt,
    updatedAt,
    bodyType,
    wizardSpecies: toSpecies(value.wizardSpecies),
    selections,
  };
}

/** Parse the stored JSON, dropping entries that do not match the shape. */
export function parsePresets(raw: string | null): CharacterPreset[] {
  if (!raw) return [];
  let parsed: unknown;
  try {
    parsed = JSON.parse(raw);
  } catch {
    return [];
  }
  if (!Array.isArray(parsed)) return [];

  const presets: CharacterPreset[] = [];
  for (const entry of parsed) {
    const preset = toPreset(entry);
    if (preset) presets.push(preset);
  }
  return presets;
}

export function serializePresets(presets: readonly CharacterPreset[]): string {
  return JSON.stringify(presets);
}

/** Read saved presets; returns `[]` when storage is unavailable or corrupt. */
export function loadPresets(storage?: PresetStorage | null): CharacterPreset[] {
  const target = resolveStorage(storage);
  if (!target) return [];
  try {
    return parsePresets(target.getItem(PRESETS_STORAGE_KEY));
  } catch (error) {
    debugWarn("Failed to read character presets", error);
    return [];
  }
}

/** Persist presets; returns false when storage is unavailable or rejects. */
export function persistPresets(
  presets: readonly CharacterPreset[],
  storage?: PresetStorage | null,
): boolean {
  const target = resolveStorage(storage);
  if (!target) return false;
  try {
    target.setItem(PRESETS_STORAGE_KEY, serializePresets(presets));
    return true;
  } catch (error) {
    debugWarn("Failed to save character presets", error);
    return false;
  }
}

/** `角色1`, `角色2`, … skipping names already taken by saved presets. */
export function nextPresetName(presets: readonly CharacterPreset[]): string {
  const taken = new Set(presets.map((preset) => preset.name));
  let index = 1;
  while (taken.has(`角色${index}`)) index += 1;
  return `角色${index}`;
}

function cloneSelections(selections: Selections): Selections {
  return JSON.parse(JSON.stringify(selections)) as Selections;
}

/** Snapshot the current character under `name`. */
export function createPreset(
  state: State,
  name: string,
  now: number = Date.now(),
  id: string = createPresetId(),
): CharacterPreset {
  return {
    id,
    name,
    createdAt: now,
    updatedAt: now,
    bodyType: state.bodyType,
    wizardSpecies: state.wizardSpecies,
    selections: cloneSelections(state.selections),
  };
}

export function beginRename(state: State, preset: CharacterPreset): void {
  state.presetEditor = { editingId: preset.id, draftName: preset.name };
}

export function cancelRename(state: State): void {
  state.presetEditor = { ...EMPTY_PRESET_EDITOR };
}

/** Save a snapshot of the current character as a new preset and start renaming it. */
export function saveCurrentPreset(
  state: State,
  storage?: PresetStorage | null,
): CharacterPreset {
  const preset = createPreset(state, nextPresetName(state.presets));
  state.presets = [...state.presets, preset];
  state.activePresetId = preset.id;
  persistPresets(state.presets, storage);
  beginRename(state, preset);
  return preset;
}

/** The active preset, or null when nothing is loaded. */
export function getActivePreset(state: State): CharacterPreset | null {
  return (
    state.presets.find((preset) => preset.id === state.activePresetId) ?? null
  );
}

/**
 * 保存方案: save straight away, or — when a preset is already loaded — open the
 * "update it instead?" prompt so the big finish button cannot silently
 * duplicate the character.
 */
export function requestSavePreset(
  state: State,
  storage?: PresetStorage | null,
): void {
  if (getActivePreset(state)) {
    state.presetSavePrompt = true;
    return;
  }
  saveCurrentPreset(state, storage);
}

/** Confirm "更新" in the save prompt. */
export function confirmUpdateActive(
  state: State,
  storage?: PresetStorage | null,
): void {
  state.presetSavePrompt = false;
  updateActivePreset(state, storage);
}

/** Confirm "另存为新方案" in the save prompt. */
export function confirmSaveAsNew(
  state: State,
  storage?: PresetStorage | null,
): void {
  state.presetSavePrompt = false;
  saveCurrentPreset(state, storage);
}

export function cancelSavePrompt(state: State): void {
  state.presetSavePrompt = false;
}

/** Replace the current selections with a saved preset. */
export function loadPreset(state: State, id: string): void {
  const preset = state.presets.find((entry) => entry.id === id);
  if (!preset) return;
  state.selections = cloneSelections(preset.selections);
  state.bodyType = preset.bodyType;
  state.wizardSpecies = preset.wizardSpecies;
  state.activePresetId = preset.id;
  state.presetSavePrompt = false;
  cancelRename(state);
}

/** Overwrite the active preset with the current character. */
export function updateActivePreset(
  state: State,
  storage?: PresetStorage | null,
): void {
  const activeId = state.activePresetId;
  if (!activeId) return;
  const now = Date.now();
  state.presets = state.presets.map((preset) =>
    preset.id === activeId
      ? {
          ...preset,
          bodyType: state.bodyType,
          wizardSpecies: state.wizardSpecies,
          selections: cloneSelections(state.selections),
          updatedAt: now,
        }
      : preset,
  );
  persistPresets(state.presets, storage);
}

/** Apply the inline draft name; a blank draft cancels the edit. */
export function commitRename(
  state: State,
  storage?: PresetStorage | null,
): void {
  const { editingId, draftName } = state.presetEditor;
  const name = draftName.trim();
  if (!editingId || !name) {
    cancelRename(state);
    return;
  }
  const now = Date.now();
  state.presets = state.presets.map((preset) =>
    preset.id === editingId ? { ...preset, name, updatedAt: now } : preset,
  );
  persistPresets(state.presets, storage);
  cancelRename(state);
}

export function removePreset(
  state: State,
  id: string,
  storage?: PresetStorage | null,
): void {
  state.presets = state.presets.filter((preset) => preset.id !== id);
  if (state.activePresetId === id) state.activePresetId = null;
  if (state.presetEditor.editingId === id) cancelRename(state);
  state.presetSavePrompt = false;
  persistPresets(state.presets, storage);
}
