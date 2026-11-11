// Step-by-step guided character creation (wizard mode).
// Step order follows The Elder Scrolls V: Skyrim's character creation flow,
// mapped onto this project's categories.
import m from "mithril";
import type {
  CatalogReader,
  CategoryTree,
  CategoryTreeNode,
  ItemMerged,
} from "../../state/catalog.ts";
import { getSelectedTags, isItemTagCompatible } from "../../state/filters.ts";
import {
  getSelectionGroup,
  selectItem,
  type State,
} from "../../state/state.ts";
import { tName } from "../../i18n.ts";
import { capitalize } from "../../utils/helpers.ts";
import { categoryTreeModelFactory } from "../../models/category-tree.ts";
import {
  confirmUpdateActive,
  getActivePreset,
  requestSavePreset,
} from "../../state/presets.ts";
import { BodyTypeSelector } from "./BodyTypeSelector.ts";
import { PresetBar } from "./PresetBar.ts";

type CategoryStepSpec = {
  path: string[];
  /** Subcategory segments to skip (e.g. drop beards/mustaches from hair). */
  exclude?: string[];
  /** Path segments treated as feminine (hidden for masculine bodies). */
  feminineExclude?: string[];
};

type WizardStep = {
  label: string;
  description: string;
} & (
  | { kind: "species" }
  | { kind: "bodyType" }
  | { kind: "skintone" }
  | { kind: "category"; paths: CategoryStepSpec[] }
);

const WIZARD_STEPS: readonly WizardStep[] = [
  {
    label: "种族",
    kind: "species",
    description: "选择角色的种族，决定后续可用的头型与特征",
  },
  {
    label: "体型",
    kind: "bodyType",
    description: "选择角色的性别与体型",
  },
  {
    label: "肤色",
    kind: "skintone",
    description: "选择角色的肤色",
  },
  {
    label: "头型",
    kind: "category",
    paths: [{ path: ["head", "heads"] }],
    description: "选择角色的头部形状",
  },
  {
    label: "表情",
    kind: "category",
    paths: [{ path: ["head", "faces"] }],
    description: "选择角色的面部表情",
  },
  {
    label: "眉毛",
    kind: "category",
    paths: [{ path: ["head", "eyebrows"] }],
    description: "选择角色的眉毛样式",
  },
  {
    label: "鼻子",
    kind: "category",
    paths: [{ path: ["head", "nose"] }],
    description: "选择角色的鼻子形状",
  },
  {
    label: "耳朵",
    kind: "category",
    paths: [{ path: ["head", "ears"] }],
    description: "选择角色的耳朵形状",
  },
  {
    label: "发型",
    kind: "category",
    paths: [
      {
        path: ["hair"],
        exclude: ["beards", "mustaches"],
        feminineExclude: [
          "long",
          "braids",
          "pigtails",
          "xlong",
          "bob",
          "ponytails",
        ],
      },
    ],
    description: "选择角色的发型",
  },
  {
    label: "胡子",
    kind: "category",
    paths: [{ path: ["hair", "beards"] }, { path: ["hair", "mustaches"] }],
    description: "选择角色的胡须样式",
  },
  {
    label: "上身",
    kind: "category",
    paths: [{ path: ["torso"] }],
    description: "选择角色的上身穿着",
  },
  {
    label: "手臂",
    kind: "category",
    paths: [{ path: ["arms"] }],
    description: "选择角色的手臂装备",
  },
  {
    label: "腿",
    kind: "category",
    paths: [{ path: ["legs"] }],
    description: "选择角色的腿部穿着",
  },
  {
    label: "脚",
    kind: "category",
    paths: [{ path: ["feet"] }],
    description: "选择角色的脚部穿着",
  },
  {
    label: "头饰",
    kind: "category",
    paths: [{ path: ["headwear"] }],
    description: "选择角色的头部饰品",
  },
  {
    label: "武器",
    kind: "category",
    paths: [{ path: ["weapons"] }],
    description: "选择角色的武器",
  },
  {
    label: "工具",
    kind: "category",
    paths: [{ path: ["tools"] }],
    description: "选择角色携带的工具",
  },
];

/** Species tags that are not "human"; used to filter heads by species choice. */
const NON_HUMAN_SPECIES_TAGS = new Set([
  "animal",
  "monster",
  "orc",
  "minotaur",
  "lizard",
  "troll",
  "goblin",
  "boarman",
  "zombie",
  "wartotaur",
  "vampire",
  "skeleton",
  "frankenstein",
  "alien",
]);

/** Item names that are non-human but carry no species tags in the data. */
const NON_HUMAN_ITEM_NAMES = new Set([
  "Cyclops Eyes",
  "Alt Cyclops Eyes",
  "Dragon Ears",
]);

function isMasculineBody(bodyType: string): boolean {
  return bodyType === "male" || bodyType === "muscular";
}

function isFeminineBody(bodyType: string): boolean {
  return bodyType === "female" || bodyType === "pregnant";
}

function isSpeciesCompatible(
  name: string,
  tags: string[] | undefined,
  species: State["wizardSpecies"],
): boolean {
  if (!species) return true;
  if (species === "human") {
    if (NON_HUMAN_ITEM_NAMES.has(name)) return false;
    return !(tags ?? []).some((tag) => NON_HUMAN_SPECIES_TAGS.has(tag));
  }
  return !(tags ?? []).includes("human");
}

/** Drop selections that conflict with the chosen species, then default the head. */
function resetSpeciesIncompatibleSelections(
  catalog: CatalogReader,
  state: State,
): void {
  for (const [group, selection] of Object.entries(state.selections)) {
    const meta = catalog.getItemMerged(selection.itemId).unwrapOr(null);
    if (!meta) continue;
    if (!isSpeciesCompatible(meta.name, meta.tags, state.wizardSpecies)) {
      delete state.selections[group];
    }
  }

  if (state.wizardSpecies === "human") {
    const headGroup = getSelectionGroup("heads_human_male");
    if (!state.selections[headGroup]) {
      state.selections[headGroup] = {
        itemId: "heads_human_male",
        name: "Human Male",
      };
    }
  }
}

function navigateToNode(
  tree: CategoryTree | null,
  path: string[],
): CategoryTreeNode | null {
  let node: CategoryTreeNode | null = tree;
  for (const segment of path) {
    node = node?.children?.[segment] ?? null;
    if (!node) return null;
  }
  return node;
}

function collectItemIds(
  node: CategoryTreeNode | null,
  out: string[] = [],
): string[] {
  if (!node) return out;
  for (const id of node.items ?? []) out.push(id);
  for (const child of Object.values(node.children ?? {})) {
    collectItemIds(child, out);
  }
  return out;
}

function nodeDisplayName(name: string, node: CategoryTreeNode): string {
  const label = (node as { label?: string }).label;
  return tName(label ?? capitalize(name));
}

function variantLabel(variant: string): string {
  const direct = tName(variant);
  if (direct !== variant) return direct;

  const spaced = variant.replaceAll("_", " ");
  const spacedTranslation = tName(spaced);
  if (spacedTranslation !== spaced) return spacedTranslation;

  const dot = variant.lastIndexOf(".");
  if (dot >= 0) return variantLabel(variant.slice(dot + 1));

  return capitalize(spaced);
}

function toggleColors(state: State, itemId: string): void {
  const expandedColors = state.wizardExpandedColors;
  if (expandedColors.has(itemId)) expandedColors.delete(itemId);
  else expandedColors.add(itemId);
}

function colorToggleButton(
  state: State,
  itemId: string,
  isExpanded: boolean,
): m.Vnode {
  return m(
    "button.button.is-small.is-text",
    { onclick: () => toggleColors(state, itemId) },
    isExpanded ? "收起颜色" : "改颜色",
  );
}

function renderChoice(state: State, itemId: string, meta: ItemMerged): m.Vnode {
  const group = getSelectionGroup(itemId);
  const selection = state.selections[group];
  const isSelected = selection?.itemId === itemId;
  const colorsExpanded = state.wizardExpandedColors.has(itemId);

  if (meta.variants?.length) {
    const defaultVariant = meta.variants[0] ?? "";
    return m("div.choice-item.m-1", [
      m(
        "button.button.is-small",
        {
          class: isSelected ? "is-primary" : "",
          onclick: () =>
            selectItem(
              state,
              itemId,
              defaultVariant,
              isSelected && selection?.variant === defaultVariant,
            ),
        },
        tName(meta.name),
      ),
      m("div.mt-1", colorToggleButton(state, itemId, colorsExpanded)),
      colorsExpanded
        ? m(
            "div.buttons.mt-1",
            meta.variants.map((variant) => {
              const variantSelected =
                isSelected && selection?.variant === variant;
              return m(
                "button.button.is-small.m-1",
                {
                  class: variantSelected ? "is-primary" : "",
                  onclick: () =>
                    selectItem(state, itemId, variant, variantSelected),
                },
                variantLabel(variant),
              );
            }),
          )
        : null,
    ]);
  }

  const recolorVariants = meta.recolors?.[0]?.variants ?? [];
  if (recolorVariants.length) {
    const defaultVariant = recolorVariants[0] ?? "";
    return m("div.choice-item.m-1", [
      m(
        "button.button.is-small",
        {
          class: isSelected ? "is-primary" : "",
          onclick: () =>
            selectItem(
              state,
              itemId,
              defaultVariant,
              isSelected && selection?.recolor === defaultVariant,
            ),
        },
        tName(meta.name),
      ),
      m("div.mt-1", colorToggleButton(state, itemId, colorsExpanded)),
      colorsExpanded
        ? m(
            "div.buttons.mt-1",
            recolorVariants.map((variant) => {
              const variantSelected =
                isSelected && selection?.recolor === variant;
              return m(
                "button.button.is-small.m-1",
                {
                  class: variantSelected ? "is-primary" : "",
                  onclick: () =>
                    selectItem(state, itemId, variant, variantSelected),
                },
                variantLabel(variant),
              );
            }),
          )
        : null,
    ]);
  }

  return m(
    "button.button.is-small.m-1",
    {
      class: isSelected ? "is-primary" : "",
      onclick: () => {
        if (isSelected) delete state.selections[group];
        else state.selections[group] = { itemId, name: meta.name };
      },
    },
    tName(meta.name),
  );
}

/** Skin tone colors come from the body palette, not item variants. */
function getBodySkinColors(catalog: CatalogReader, state: State): string[] {
  const palette = catalog.getPaletteMetadata().unwrapOr(null);
  const body = palette?.materials?.body;
  if (!body) return [];

  const colors = new Set<string>();
  for (const versionColors of Object.values(body.palettes)) {
    for (const color of Object.keys(versionColors)) colors.add(color);
  }

  return [...colors].sort().filter((color) => {
    if (state.wizardSpecies === "human") {
      return !color.startsWith("zombie") && !color.startsWith("fur_");
    }
    return true;
  });
}

function renderSkintoneStep(catalog: CatalogReader, state: State): m.Vnode {
  const meta = catalog.getItemMerged("body").unwrapOr(null);
  if (!meta) return m("p.has-text-grey", "正在加载…");

  const group = getSelectionGroup("body");
  const selection = state.selections[group];
  const isSelected = selection?.itemId === "body";
  const colorsExpanded = state.wizardExpandedColors.has("body");
  const colors = getBodySkinColors(catalog, state);

  return m("div.choice-item.m-1", [
    m(
      "button.button.is-small",
      {
        class: isSelected ? "is-primary" : "",
        onclick: () =>
          selectItem(
            state,
            "body",
            "light",
            isSelected && selection?.recolor === "light",
          ),
      },
      tName(meta.name),
    ),
    m("div.mt-1", colorToggleButton(state, "body", colorsExpanded)),
    colorsExpanded
      ? m(
          "div.buttons.mt-1",
          colors.map((color) => {
            const colorSelected = isSelected && selection?.recolor === color;
            return m(
              "button.button.is-small.m-1",
              {
                class: colorSelected ? "is-primary" : "",
                onclick: () => selectItem(state, "body", color, colorSelected),
              },
              variantLabel(color),
            );
          }),
        )
      : null,
  ]);
}

function renderSpeciesStep(catalog: CatalogReader, state: State): m.Vnode {
  return m("div.buttons", [
    m(
      "button.button.is-medium.m-1",
      {
        class: state.wizardSpecies === "human" ? "is-primary" : "",
        onclick: () => {
          state.wizardSpecies = "human";
          resetSpeciesIncompatibleSelections(catalog, state);
        },
      },
      "人类",
    ),
    m(
      "button.button.is-medium.m-1",
      {
        class: state.wizardSpecies === "nonhuman" ? "is-primary" : "",
        onclick: () => {
          state.wizardSpecies = "nonhuman";
          resetSpeciesIncompatibleSelections(catalog, state);
        },
      },
      "非人类",
    ),
  ]);
}

function renderItemOrNull(
  catalog: CatalogReader,
  state: State,
  itemId: string,
  spec: CategoryStepSpec,
  selectedTags: Set<string>,
  seen: Set<string>,
): m.Vnode | null {
  if (seen.has(itemId)) return null;
  seen.add(itemId);

  const meta = catalog.getItemMerged(itemId).unwrapOr(null);
  if (!meta) return null;
  if (!meta.required.includes(state.bodyType)) return null;
  if (spec.exclude?.some((segment) => meta.path?.includes(segment))) {
    return null;
  }
  if (
    isMasculineBody(state.bodyType) &&
    spec.feminineExclude?.some((segment) => meta.path?.includes(segment))
  ) {
    return null;
  }
  if (!isSpeciesCompatible(meta.name, meta.tags, state.wizardSpecies)) {
    return null;
  }
  if (!isItemTagCompatible(meta, selectedTags)) return null;

  return renderChoice(state, itemId, meta);
}

function renderCategoryStep(
  catalog: CatalogReader,
  state: State,
  step: Extract<WizardStep, { kind: "category" }>,
) {
  const tree = catalog.getCategoryTree().unwrapOr(null);
  const selectedTags = getSelectedTags(catalog, state);
  if (state.wizardSpecies === "human") selectedTags.add("human");

  const feminine = isFeminineBody(state.bodyType);
  const seen = new Set<string>();
  const groups: { label: string | null; items: m.Vnode[] }[] = [];

  for (const spec of step.paths) {
    const node = navigateToNode(tree, spec.path);
    if (!node) continue;

    for (const [childName, childNode] of Object.entries(node.children ?? {})) {
      if (spec.exclude?.includes(childName)) continue;
      if (feminine && (childName === "beards" || childName === "mustaches")) {
        continue;
      }

      const items = collectItemIds(childNode)
        .map((id) =>
          renderItemOrNull(catalog, state, id, spec, selectedTags, seen),
        )
        .filter((v): v is NonNullable<typeof v> => v !== null);

      if (items.length > 0) {
        groups.push({ label: nodeDisplayName(childName, childNode), items });
      }
    }

    const directItems = (node.items ?? [])
      .map((id) =>
        renderItemOrNull(catalog, state, id, spec, selectedTags, seen),
      )
      .filter((v): v is NonNullable<typeof v> => v !== null);
    if (directItems.length > 0) {
      groups.push({ label: null, items: directItems });
    }
  }

  if (groups.length === 0) {
    return m("p.has-text-grey", "没有可用的选项");
  }

  return m(
    "div.wizard-groups",
    groups.map((group) =>
      m("div.wizard-group.mb-3", [
        group.label
          ? m("div.has-text-weight-semibold.mb-1.is-size-7", group.label)
          : null,
        m(
          "div.is-flex.is-flex-wrap-wrap.is-align-items-flex-start",
          group.items,
        ),
      ]),
    ),
  );
}

function renderStepContent(
  catalog: CatalogReader,
  state: State,
  step: WizardStep,
) {
  if (step.kind === "species") {
    return renderSpeciesStep(catalog, state);
  }

  if (step.kind === "bodyType") {
    const treeModel = categoryTreeModelFactory.create(catalog, state);
    return treeModel.isLoading
      ? m("p.has-text-grey", "正在加载…")
      : m(BodyTypeSelector, { model: treeModel.bodyTypes });
  }

  if (step.kind === "skintone") {
    return renderSkintoneStep(catalog, state);
  }

  return renderCategoryStep(catalog, state, step);
}

export const Wizard: m.Component<{ catalog: CatalogReader; state: State }> = {
  view(vnode) {
    const { catalog, state } = vnode.attrs;
    const total = WIZARD_STEPS.length;
    const index = Math.min(Math.max(state.wizardStep, 0), total - 1);
    const step = WIZARD_STEPS[index];

    const goTo = (n: number) => {
      state.wizardStep = Math.min(Math.max(n, 0), total - 1);
    };

    const isLast = index === total - 1;

    const renderNavButtons = () => [
      m(
        "button.button.is-small.is-text",
        { disabled: index === 0, onclick: () => goTo(0) },
        "第一步",
      ),
      m(
        "button.button.is-small",
        { disabled: index === 0, onclick: () => goTo(index - 1) },
        "上一步",
      ),
      isLast
        ? [
            m(
              "button.button.is-small.is-primary",
              { onclick: () => requestSavePreset(state) },
              "保存方案",
            ),
            m(
              "button.button.is-small",
              {
                disabled: !getActivePreset(state),
                onclick: () => confirmUpdateActive(state),
              },
              "更新方案",
            ),
          ]
        : m(
            "button.button.is-small.is-primary",
            { onclick: () => goTo(index + 1) },
            "下一步",
          ),
      m(
        "button.button.is-small.is-text",
        { disabled: isLast, onclick: () => goTo(total - 1) },
        "最后一步",
      ),
    ];

    return m("div.wizard", [
      m(
        "div.is-flex.is-flex-wrap-wrap.is-align-items-center.is-justify-content-space-between.mb-2",
        [
          m("div.buttons", renderNavButtons()),
          m(
            "span.has-text-weight-semibold",
            `第 ${index + 1} 步 / 共 ${total} 步`,
          ),
        ],
      ),
      m("p.has-text-weight-semibold.mb-1", step.label),
      m("p.is-size-7.has-text-grey.mb-2", step.description),
      m("progress.progress.is-primary.is-small", {
        value: index + 1,
        max: total,
      }),

      m(PresetBar, { state }),

      m(
        "div.wizard-step-content.mt-2",
        renderStepContent(catalog, state, step),
      ),

      m("div.buttons.mt-3", renderNavButtons()),
    ]);
  },
};
