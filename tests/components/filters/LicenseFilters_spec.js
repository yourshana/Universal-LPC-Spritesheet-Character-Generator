import { LicenseFilters } from "../../../sources/components/filters/LicenseFilters.ts";
import { licenseFiltersModelFactory } from "../../../sources/models/license-filters.ts";
import { createCatalog } from "../../../sources/state/catalog.ts";
import { createState } from "../../../sources/state/state.ts";
import { seedCatalog } from "../../browser-catalog-fixture.js";
import { assert } from "chai";
import sinon from "sinon";
import { describe, it, beforeEach, afterEach } from "mocha-globals";

describe("LicenseFilters Component", function () {
  let host;
  let alertStub;

  beforeEach(function () {
    host = document.createElement("div");
    document.body.appendChild(host);
    alertStub = sinon.stub(window, "alert");
  });

  afterEach(function () {
    m.mount(host, null);
    host.remove();
    alertStub.restore();
  });

  function render(model) {
    m.mount(host, {
      view: () => m(LicenseFilters, { createModel: () => model }),
    });
  }

  function expand() {
    host.querySelector("span.tree-arrow").click();
    m.redraw.sync();
  }

  it("renders its summary, loading states, and supplied options", function () {
    let enabled;
    render({
      liteReady: false,
      creditsReady: false,
      summary: "(1/2 enabled)",
      incompatibleCount: 0,
      options: [
        {
          key: "CC0",
          label: "CC0",
          enabled: true,
          setEnabled(value) {
            enabled = value;
          },
        },
      ],
      removeIncompatible: () => 0,
    });

    assert.include(host.textContent, "(1/2 enabled)");
    expand();
    assert.include(host.textContent, "正在加载部件列表…");
    assert.include(host.textContent, "正在加载部件许可证数据…");

    const checkbox = host.querySelector("input[type=checkbox]");
    assert.isTrue(checkbox.checked);
    assert.isTrue(checkbox.disabled);
    checkbox.checked = false;
    checkbox.dispatchEvent(new Event("change", { bubbles: true }));
    assert.isFalse(enabled);
  });

  it("renders a warning and reports removals through the UI", function () {
    render({
      liteReady: true,
      creditsReady: true,
      summary: "(1/1 enabled)",
      incompatibleCount: 2,
      options: [],
      removeIncompatible: () => 2,
    });
    expand();

    assert.include(host.textContent, "2 个已选部件不兼容");
    host.querySelector("button.is-warning").click();
    assert.isTrue(alertStub.calledOnceWith("已移除 2 个不兼容部件"));
  });

  it("reports when a rendered incompatibility is gone before removal", function () {
    render({
      liteReady: true,
      creditsReady: true,
      summary: "(1/1 enabled)",
      incompatibleCount: 1,
      options: [],
      removeIncompatible: () => 0,
    });
    expand();

    host.querySelector("button.is-warning").click();
    assert.isTrue(alertStub.calledOnceWith("未找到不兼容的部件"));
  });

  it("derives compatibility and commands from catalog and state", function () {
    const { reader: catalog, writer } = createCatalog();
    const state = createState();
    seedCatalog(writer, {
      compatible: {
        name: "Compatible",
        credits: [{ licenses: ["CC0"] }],
      },
      incompatible: {
        name: "Incompatible",
        credits: [{ licenses: ["CC-BY 4.0"] }],
      },
    });
    state.enabledLicenses = { CC0: true };
    state.selections = {
      first: { itemId: "compatible", name: "Compatible" },
      second: { itemId: "incompatible", name: "Incompatible" },
    };

    const model = licenseFiltersModelFactory.create(catalog, state);
    assert.strictEqual(model.summary, "(1/5 enabled)");
    assert.strictEqual(model.incompatibleCount, 1);
    model.options.find((option) => option.key === "CC0").setEnabled(false);
    assert.isFalse(state.enabledLicenses.CC0);

    state.enabledLicenses.CC0 = true;
    assert.strictEqual(model.removeIncompatible(), 1);
    assert.deepEqual(Object.keys(state.selections), ["first"]);
  });

  it("does not report incompatibilities before credits are ready", function () {
    const { reader: catalog } = createCatalog();
    const state = createState();
    state.selections.item = { itemId: "item", name: "Item" };

    const model = licenseFiltersModelFactory.create(catalog, state);
    assert.isFalse(model.liteReady);
    assert.isFalse(model.creditsReady);
    assert.strictEqual(model.incompatibleCount, 0);
  });
});
