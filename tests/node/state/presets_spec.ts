import { test } from "node:test";
import assert from "node:assert/strict";
import {
  PRESETS_STORAGE_KEY,
  beginRename,
  cancelRename,
  commitRename,
  createPreset,
  loadPreset,
  loadPresets,
  nextPresetName,
  parsePresets,
  persistPresets,
  removePreset,
  saveCurrentPreset,
  serializePresets,
  updateActivePreset,
} from "../../../sources/state/presets.ts";
import type { CharacterPreset } from "../../../sources/state/presets.ts";
import type { State } from "../../../sources/state/state.ts";

function createMemoryStorage(initial: Record<string, string> = {}) {
  const data = new Map(Object.entries(initial));
  return {
    data,
    getItem: (key: string): string | null => data.get(key) ?? null,
    setItem: (key: string, value: string): void => {
      data.set(key, value);
    },
  };
}

/** Only the preset-relevant slice of State is populated; the rest is unused. */
function makeState(overrides: Partial<State> = {}): State {
  return {
    selections: {
      body: { itemId: "body", name: "Body color (light)", recolor: "light" },
      heads: { itemId: "heads_human_male", name: "Human Male (light)" },
    },
    bodyType: "male",
    wizardSpecies: "human",
    presets: [],
    activePresetId: null,
    presetEditor: { editingId: null, draftName: "" },
    ...overrides,
  } as State;
}

function preset(overrides: Partial<CharacterPreset> = {}): CharacterPreset {
  return {
    id: "p1",
    name: "角色1",
    createdAt: 1,
    updatedAt: 1,
    bodyType: "male",
    wizardSpecies: "human",
    selections: { body: { itemId: "body", name: "Body color (light)" } },
    ...overrides,
  };
}

test("parsePresets tolerates corrupt and malformed storage", () => {
  assert.deepEqual(parsePresets(null), []);
  assert.deepEqual(parsePresets("not json"), []);
  assert.deepEqual(parsePresets("{}"), []);
  assert.deepEqual(parsePresets('{"id":"p1"}'), []);

  const [kept] = parsePresets(
    JSON.stringify([
      { nonsense: true },
      {
        id: "p1",
        name: "角色1",
        bodyType: "female",
        wizardSpecies: "nonhuman",
        selections: { body: { itemId: "body", name: "Body" } },
      },
    ]),
  );
  assert.equal(kept.id, "p1");
  assert.equal(kept.bodyType, "female");
  assert.equal(kept.wizardSpecies, "nonhuman");
  assert.equal(kept.createdAt, 0);
  assert.equal(kept.updatedAt, 0);
});

test("parsePresets drops selections without an itemId", () => {
  const [entry] = parsePresets(
    JSON.stringify([
      {
        id: "p1",
        name: "角色1",
        bodyType: "male",
        selections: {
          body: { itemId: "body", name: "Body" },
          broken: { name: "no id" },
        },
      },
    ]),
  );
  assert.deepEqual(Object.keys(entry.selections), ["body"]);
});

test("nextPresetName fills the first free 角色N slot", () => {
  assert.equal(nextPresetName([]), "角色1");
  assert.equal(nextPresetName([preset({ name: "角色1" })]), "角色2");
  assert.equal(
    nextPresetName([preset({ id: "a", name: "角色2" })]),
    "角色1",
    "frees a gap rather than counting entries",
  );
  assert.equal(
    nextPresetName([preset({ name: "游侠" })]),
    "角色1",
    "custom names do not occupy the numbered sequence",
  );
});

test("saveCurrentPreset stores a snapshot, persists it, and starts renaming", () => {
  const storage = createMemoryStorage();
  const state = makeState();

  const saved = saveCurrentPreset(state, storage);

  assert.equal(saved.name, "角色1");
  assert.equal(state.presets.length, 1);
  assert.equal(state.activePresetId, saved.id);
  assert.deepEqual(state.presetEditor, {
    editingId: saved.id,
    draftName: "角色1",
  });

  const stored = JSON.parse(storage.data.get(PRESETS_STORAGE_KEY) ?? "[]");
  assert.equal(stored.length, 1);
  assert.equal(stored[0].name, "角色1");
});

test("saveCurrentPreset snapshots selections instead of aliasing them", () => {
  const storage = createMemoryStorage();
  const state = makeState();

  const saved = saveCurrentPreset(state, storage);
  state.selections.body = { itemId: "body", name: "Changed" };

  assert.equal(saved.selections.body.name, "Body color (light)");
});

test("loadPreset restores the character and marks the preset active", () => {
  const storage = createMemoryStorage();
  const state = makeState({
    presets: [
      preset({
        bodyType: "female",
        wizardSpecies: "nonhuman",
        selections: { body: { itemId: "body", name: "Saved body" } },
      }),
    ],
  });

  loadPreset(state, "p1");

  assert.equal(state.bodyType, "female");
  assert.equal(state.wizardSpecies, "nonhuman");
  assert.deepEqual(state.selections.body, {
    itemId: "body",
    name: "Saved body",
  });
  assert.equal(state.activePresetId, "p1");
  assert.equal(state.presetEditor.editingId, null);
  assert.equal(storage.data.size, 0, "loading must not write storage");
});

test("loadPreset ignores an unknown id", () => {
  const state = makeState({ presets: [preset()], activePresetId: "p1" });

  loadPreset(state, "missing");

  assert.equal(state.activePresetId, "p1");
});

test("updateActivePreset overwrites only the active preset", () => {
  const storage = createMemoryStorage();
  const state = makeState({
    activePresetId: "p1",
    bodyType: "muscular",
    presets: [preset(), preset({ id: "p2", name: "角色2" })],
  });

  updateActivePreset(state, storage);

  const [first, second] = state.presets;
  assert.equal(first.bodyType, "muscular");
  assert.equal(first.selections.body.name, "Body color (light)");
  assert.equal(second.bodyType, "male");
  assert.ok(first.updatedAt >= first.createdAt);

  const stored = JSON.parse(storage.data.get(PRESETS_STORAGE_KEY) ?? "[]");
  assert.equal(stored[0].bodyType, "muscular");
});

test("updateActivePreset is a no-op without an active preset", () => {
  const storage = createMemoryStorage();
  const state = makeState({ presets: [preset()] });

  updateActivePreset(state, storage);

  assert.equal(storage.data.size, 0);
  assert.equal(state.presets[0].bodyType, "male");
});

test("commitRename trims the draft and persists it", () => {
  const storage = createMemoryStorage();
  const state = makeState({
    presets: [preset()],
    presetEditor: { editingId: "p1", draftName: "  游侠  " },
  });

  commitRename(state, storage);

  assert.equal(state.presets[0].name, "游侠");
  assert.equal(state.presetEditor.editingId, null);
  assert.equal(
    JSON.parse(storage.data.get(PRESETS_STORAGE_KEY) ?? "[]")[0].name,
    "游侠",
  );
});

test("commitRename with a blank draft cancels without renaming", () => {
  const storage = createMemoryStorage();
  const state = makeState({
    presets: [preset()],
    presetEditor: { editingId: "p1", draftName: "   " },
  });

  commitRename(state, storage);

  assert.equal(state.presets[0].name, "角色1");
  assert.equal(state.presetEditor.editingId, null);
  assert.equal(storage.data.size, 0);
});

test("removePreset clears the active id and the editor", () => {
  const storage = createMemoryStorage();
  const state = makeState({
    presets: [preset()],
    activePresetId: "p1",
    presetEditor: { editingId: "p1", draftName: "角色1" },
  });

  removePreset(state, "p1", storage);

  assert.deepEqual(state.presets, []);
  assert.equal(state.activePresetId, null);
  assert.equal(state.presetEditor.editingId, null);
  assert.equal(storage.data.get(PRESETS_STORAGE_KEY), "[]");
});

test("loadPresets and persistPresets round-trip through storage", () => {
  const storage = createMemoryStorage();

  assert.deepEqual(loadPresets(storage), []);
  assert.equal(persistPresets([preset()], storage), true);
  assert.deepEqual(loadPresets(storage), [preset()]);
});

test("storage failures degrade to empty and unsaved", () => {
  const throwing = {
    getItem(): string | null {
      throw new Error("blocked");
    },
    setItem(): void {
      throw new Error("blocked");
    },
  };

  assert.deepEqual(loadPresets(throwing), []);
  assert.equal(persistPresets([preset()], throwing), false);
  assert.equal(persistPresets([preset()], null), false);
  assert.deepEqual(loadPresets(null), []);
});

test("createPreset captures species, body type, and a cloned selection set", () => {
  const state = makeState({ bodyType: "female", wizardSpecies: "nonhuman" });

  const created = createPreset(state, "游侠", 42, "fixed-id");

  assert.deepEqual(
    {
      id: created.id,
      name: created.name,
      createdAt: created.createdAt,
      updatedAt: created.updatedAt,
      bodyType: created.bodyType,
      wizardSpecies: created.wizardSpecies,
    },
    {
      id: "fixed-id",
      name: "游侠",
      createdAt: 42,
      updatedAt: 42,
      bodyType: "female",
      wizardSpecies: "nonhuman",
    },
  );

  state.selections.body.name = "Changed";
  assert.equal(created.selections.body.name, "Body color (light)");
});

test("beginRename and cancelRename move the editor without touching storage", () => {
  const state = makeState({ presets: [preset()] });

  beginRename(state, state.presets[0]);
  assert.deepEqual(state.presetEditor, {
    editingId: "p1",
    draftName: "角色1",
  });

  cancelRename(state);
  assert.deepEqual(state.presetEditor, { editingId: null, draftName: "" });
  assert.equal(serializePresets(state.presets), JSON.stringify([preset()]));
});
