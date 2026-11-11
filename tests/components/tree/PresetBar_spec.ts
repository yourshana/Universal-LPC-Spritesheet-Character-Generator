import m from "mithril";
import { expect } from "chai";
import { afterEach, beforeEach, describe, it } from "mocha-globals";
import { PresetBar } from "../../../sources/components/tree/PresetBar.ts";
import { Wizard } from "../../../sources/components/tree/Wizard.ts";
import { PRESETS_STORAGE_KEY } from "../../../sources/state/presets.ts";
import { createState, type State } from "../../../sources/state/state.ts";
import { createCatalog } from "../../../sources/state/catalog.ts";
import { BODY_TYPES } from "../../../sources/state/constants.ts";
import { seedCatalog } from "../../browser-catalog-fixture.js";

function buttonByText(host: ParentNode, text: string): HTMLButtonElement {
  const button = [...host.querySelectorAll("button")].find(
    (entry) => entry.textContent?.trim() === text,
  );
  if (!button) throw new Error(`Missing button: ${text}`);
  return button as HTMLButtonElement;
}

function renderPresetBar(host: HTMLDivElement, state: State): void {
  m.render(host, m(PresetBar, { state }));
}

/** Minimal catalog so the wizard can render its last step. */
function seedWizardCatalog(catalogWriter: Parameters<typeof seedCatalog>[0]) {
  seedCatalog(
    catalogWriter,
    {
      body: {
        name: "Body Color",
        type_name: "body",
        required: [...BODY_TYPES],
        animations: ["walk"],
        credits: [],
        layers: {},
        path: ["body"],
        matchBodyColor: true,
      },
    },
    {
      categoryTree: {
        items: [],
        children: { body: { items: ["body"], children: {} } },
      },
    },
  );
}

describe("PresetBar", () => {
  let host: HTMLDivElement;
  let state: State;

  beforeEach(() => {
    localStorage.removeItem(PRESETS_STORAGE_KEY);
    state = createState();
    state.selections = {
      body: { itemId: "body", name: "Body color (light)", recolor: "light" },
    };
    host = document.createElement("div");
    document.body.appendChild(host);
  });

  afterEach(() => {
    m.render(host, null);
    host.remove();
    localStorage.removeItem(PRESETS_STORAGE_KEY);
  });

  it("shows the empty state and saves the current character under 角色1", () => {
    renderPresetBar(host, state);
    expect(host.textContent ?? "").to.include("还没有保存的方案");

    buttonByText(host, "保存方案").click();
    m.redraw.sync();

    expect(state.presets.length).to.equal(1);
    expect(state.presets[0].name).to.equal("角色1");
    expect(state.activePresetId).to.equal(state.presets[0].id);

    const input = host.querySelector("input");
    expect(input?.value).to.equal("角色1");
  });

  it("renames the saved preset inline", () => {
    renderPresetBar(host, state);
    buttonByText(host, "保存方案").click();
    m.redraw.sync();

    const input = host.querySelector("input");
    if (!input) throw new Error("rename input should be shown");
    input.value = "游侠";
    input.dispatchEvent(new Event("input", { bubbles: true }));

    buttonByText(host, "确定").click();
    m.redraw.sync();

    expect(state.presets[0].name).to.equal("游侠");
    expect(state.presetEditor.editingId).to.equal(null);
    expect(host.textContent ?? "").to.include("游侠");
  });

  it("loads a saved preset back into the character", () => {
    state.presets = [
      {
        id: "p1",
        name: "游侠",
        createdAt: 1,
        updatedAt: 1,
        bodyType: "female",
        wizardSpecies: "human",
        selections: { body: { itemId: "body", name: "Saved body" } },
      },
    ];
    renderPresetBar(host, state);

    buttonByText(host, "游侠").click();
    m.redraw.sync();

    expect(state.bodyType).to.equal("female");
    expect(state.selections.body.name).to.equal("Saved body");
    expect(state.activePresetId).to.equal("p1");
  });

  it("updates the loaded preset from any step", () => {
    state.presets = [
      {
        id: "p1",
        name: "游侠",
        createdAt: 1,
        updatedAt: 1,
        bodyType: "male",
        wizardSpecies: "human",
        selections: { body: { itemId: "body", name: "Saved body" } },
      },
    ];
    state.activePresetId = "p1";
    state.wizardStep = 0;
    renderPresetBar(host, state);

    state.selections.body = { itemId: "body", name: "Armed body" };
    buttonByText(host, "更新方案").click();
    m.redraw.sync();

    expect(state.presets[0].selections.body.name).to.equal("Armed body");
    expect(state.presets[0].name).to.equal("游侠");
  });

  it("asks whether to update when 保存方案 runs with a preset loaded", () => {
    renderPresetBar(host, state);
    buttonByText(host, "保存方案").click();
    m.redraw.sync();
    buttonByText(host, "取消").click();
    m.redraw.sync();

    state.selections.body = { itemId: "body", name: "Armed body" };
    buttonByText(host, "保存方案").click();
    m.redraw.sync();

    expect(host.textContent ?? "").to.include("要更新它吗");
    expect(state.presets.length).to.equal(1);

    buttonByText(host, "更新").click();
    m.redraw.sync();

    expect(state.presets.length).to.equal(1);
    expect(state.presets[0].selections.body.name).to.equal("Armed body");
    expect(host.textContent ?? "").to.not.include("要更新它吗");
  });

  it("can save as a new preset from the update prompt", () => {
    renderPresetBar(host, state);
    buttonByText(host, "保存方案").click();
    m.redraw.sync();
    buttonByText(host, "取消").click();
    m.redraw.sync();

    state.selections.body = { itemId: "body", name: "Armed body" };
    buttonByText(host, "保存方案").click();
    m.redraw.sync();
    buttonByText(host, "另存为新方案").click();
    m.redraw.sync();

    expect(state.presets.length).to.equal(2);
    expect(state.presets[0].selections.body.name).to.equal(
      "Body color (light)",
    );
    expect(state.presets[1].name).to.equal("角色2");
  });

  it("asks for confirmation before deleting a preset", () => {
    renderPresetBar(host, state);
    buttonByText(host, "保存方案").click();
    m.redraw.sync();
    buttonByText(host, "取消").click();
    m.redraw.sync();

    buttonByText(host, "删除").click();
    m.redraw.sync();
    expect(state.presets.length).to.equal(1);

    buttonByText(host, "确认删除").click();
    m.redraw.sync();
    expect(state.presets).to.deep.equal([]);
  });
});

describe("Wizard 完成", () => {
  let host: HTMLDivElement;

  beforeEach(() => {
    localStorage.removeItem(PRESETS_STORAGE_KEY);
    host = document.createElement("div");
    document.body.appendChild(host);
  });

  afterEach(() => {
    m.render(host, null);
    host.remove();
    localStorage.removeItem(PRESETS_STORAGE_KEY);
  });

  it("saves the character as a preset on the last step", () => {
    const { reader, writer } = createCatalog();
    seedWizardCatalog(writer);
    const state = createState();
    state.characterCreationMode = "wizard";
    state.wizardStep = 16;
    state.selections = { body: { itemId: "body", name: "Body color (light)" } };

    m.render(host, m(Wizard, { catalog: reader, state }));

    buttonByText(host, "保存方案").click();
    m.redraw.sync();

    expect(state.presets.length).to.equal(1);
    expect(state.presets[0].name).to.equal("角色1");
    expect(state.presets[0].selections.body.itemId).to.equal("body");
  });

  it("offers 更新方案 next to 保存方案 on the last step once a preset is active", () => {
    const { reader, writer } = createCatalog();
    seedWizardCatalog(writer);
    const state = createState();
    state.characterCreationMode = "wizard";
    state.wizardStep = 16;

    m.render(host, m(Wizard, { catalog: reader, state }));
    buttonByText(host, "保存方案").click();
    m.redraw.sync();

    const update = buttonByText(host, "更新方案");
    expect(update.disabled).to.equal(false);

    state.selections.body = { itemId: "body", name: "Armed body" };
    update.click();
    m.redraw.sync();

    expect(state.presets.length).to.equal(1);
    expect(state.presets[0].selections.body.name).to.equal("Armed body");
  });
});
