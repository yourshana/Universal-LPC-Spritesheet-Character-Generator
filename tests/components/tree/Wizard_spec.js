import m from "mithril";
import { assert } from "chai";
import { describe, it, beforeEach, afterEach } from "mocha-globals";
import { Wizard } from "../../../sources/components/tree/Wizard.ts";
import {
  configureStateCatalog,
  createState,
} from "../../../sources/state/state.ts";
import { createCatalog } from "../../../sources/state/catalog.ts";
import { BODY_TYPES } from "../../../sources/state/constants.ts";
import { seedCatalog } from "../../browser-catalog-fixture.js";

describe("Wizard", function () {
  let host;
  let catalog;
  let catalogWriter;
  let state;

  beforeEach(function () {
    ({ reader: catalog, writer: catalogWriter } = createCatalog());
    configureStateCatalog(catalog);
    state = createState();
    state.characterCreationMode = "wizard";
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
          children: {
            body: { items: ["body"], children: {} },
          },
        },
      },
    );
    host = document.createElement("div");
    document.body.appendChild(host);
  });

  afterEach(function () {
    m.render(host, null);
    if (host.parentNode) {
      host.parentNode.removeChild(host);
    }
  });

  it("starts on the species step with progress and navigation", function () {
    m.render(host, m(Wizard, { catalog, state }));

    assert.include(host.textContent, "第 1 步 / 共 17 步");
    assert.include(host.textContent, "种族");
    assert.include(host.textContent, "人类");
    assert.include(host.textContent, "非人类");
    assert.ok(
      [...host.querySelectorAll("button")].some(
        (b) => b.textContent.trim() === "下一步",
      ),
    );
  });

  it("renders the skintone step with the body color choice", function () {
    state.wizardStep = 2; // 肤色
    m.render(host, m(Wizard, { catalog, state }));

    assert.include(host.textContent, "第 3 步 / 共 17 步");
    assert.include(host.textContent, "身体颜色");
  });

  it("filters options by selected tags (human excludes monster)", function () {
    seedCatalog(
      catalogWriter,
      {
        wiz_head_human: {
          name: "Human Head",
          type_name: "head",
          required: [...BODY_TYPES],
          animations: ["walk"],
          credits: [],
          layers: {},
          path: ["head"],
          tags: ["human"],
        },
        wiz_head_goblin: {
          name: "Goblin Head",
          type_name: "head",
          required: [...BODY_TYPES],
          animations: ["walk"],
          credits: [],
          layers: {},
          path: ["head"],
          tags: ["goblin"],
        },
        wiz_face_human: {
          name: "Human Face",
          type_name: "expression",
          required: [...BODY_TYPES],
          animations: ["walk"],
          credits: [],
          layers: {},
          path: ["head", "faces"],
          required_tags: ["human"],
        },
        wiz_face_goblin: {
          name: "Goblin Face",
          type_name: "expression",
          required: [...BODY_TYPES],
          animations: ["walk"],
          credits: [],
          layers: {},
          path: ["head", "faces"],
          required_tags: ["goblin"],
        },
      },
      {
        categoryTree: {
          items: [],
          children: {
            head: {
              items: [],
              children: {
                heads: {
                  items: ["wiz_head_human", "wiz_head_goblin"],
                  children: {},
                },
                faces: {
                  items: ["wiz_face_human", "wiz_face_goblin"],
                  children: {},
                },
              },
            },
          },
        },
      },
    );

    // Choose "human" species, then jump to the faces step.
    state.wizardSpecies = "human";
    state.wizardStep = 4; // 表情

    m.render(host, m(Wizard, { catalog, state }));

    assert.include(host.textContent, "Human Face");
    assert.notInclude(host.textContent, "Goblin Face");
  });

  it("species choice filters the head step (human hides monster heads)", function () {
    seedCatalog(
      catalogWriter,
      {
        wiz_head_human: {
          name: "Human Head",
          type_name: "head",
          required: [...BODY_TYPES],
          animations: ["walk"],
          credits: [],
          layers: {},
          path: ["head"],
          tags: ["human"],
        },
        wiz_head_goblin: {
          name: "Goblin Head",
          type_name: "head",
          required: [...BODY_TYPES],
          animations: ["walk"],
          credits: [],
          layers: {},
          path: ["head"],
          tags: ["goblin"],
        },
      },
      {
        categoryTree: {
          items: [],
          children: {
            head: {
              items: [],
              children: {
                heads: {
                  items: ["wiz_head_human", "wiz_head_goblin"],
                  children: {},
                },
              },
            },
          },
        },
      },
    );

    state.wizardSpecies = "human";
    state.wizardStep = 3; // 头型

    m.render(host, m(Wizard, { catalog, state }));

    assert.include(host.textContent, "Human Head");
    assert.notInclude(host.textContent, "Goblin Head");
  });
});
