// Filters Panel - combines Controls, LicenseFilters, AnimationFilters, CurrentSelections, and CategoryTree
import m from "mithril";
import { SearchControl } from "./filters/SearchControl.ts";
import { LicenseFilters } from "./filters/LicenseFilters.ts";
import { AnimationFilters } from "./filters/AnimationFilters.ts";
import { CurrentSelections } from "./selections/CurrentSelections.ts";
import { CategoryTree } from "./tree/CategoryTree.ts";
import { Wizard } from "./tree/Wizard.ts";
import { CollapsibleSection } from "./CollapsibleSection.ts";
import type { CurrentSelectionsModel } from "../models/current-selections.ts";
import type { SearchControlModel } from "../models/search-control.ts";
import type { LicenseFiltersModel } from "../models/license-filters.ts";
import type { AnimationFiltersModel } from "../models/animation-filters.ts";
import type { CategoryTreeModel } from "../models/category-tree.ts";
import type { CatalogReader } from "../state/catalog.ts";
import type { State } from "../state/state.ts";

type FiltersPanelAttrs = {
  catalog: CatalogReader;
  state: State;
  createSearchControlModel: () => SearchControlModel;
  createLicenseFiltersModel: () => LicenseFiltersModel;
  createAnimationFiltersModel: () => AnimationFiltersModel;
  createCurrentSelectionsModel: () => CurrentSelectionsModel;
  createCategoryTreeModel: () => CategoryTreeModel;
};

function renderModeToggle(state: State): m.Vnode {
  const setMode = (mode: "browse" | "wizard") => {
    state.characterCreationMode = mode;
  };

  return m("div.field.has-addons.mb-3", [
    m(
      "p.control",
      m(
        "button.button.is-small",
        {
          class: state.characterCreationMode === "browse" ? "is-primary" : "",
          onclick: () => setMode("browse"),
        },
        "浏览模式",
      ),
    ),
    m(
      "p.control",
      m(
        "button.button.is-small",
        {
          class: state.characterCreationMode === "wizard" ? "is-primary" : "",
          onclick: () => setMode("wizard"),
        },
        "引导模式",
      ),
    ),
  ]);
}

export const FiltersPanel: m.Component<FiltersPanelAttrs> = {
  view(vnode) {
    const {
      catalog,
      state,
      createSearchControlModel,
      createLicenseFiltersModel,
      createAnimationFiltersModel,
      createCurrentSelectionsModel,
      createCategoryTreeModel,
    } = vnode.attrs;

    const browseContent = [
      m(
        "div.mb-4",
        m(SearchControl, { createModel: createSearchControlModel }),
      ),
      m("div.columns.is-multiline.m-0", [
        m(
          "div.column.is-half-desktop.is-12-mobile",
          { class: "filters-column" },
          m(LicenseFilters, { createModel: createLicenseFiltersModel }),
        ),
        m(
          "div.column.is-half-desktop.is-12-mobile",
          { class: "filters-column" },
          m(AnimationFilters, { createModel: createAnimationFiltersModel }),
        ),
      ]),
      m(
        "div.mb-4",
        m(CurrentSelections, {
          createModel: createCurrentSelectionsModel,
        }),
      ),
      m(CategoryTree, {
        createModel: createCategoryTreeModel,
      }),
    ];

    const wizardContent = [
      m(Wizard, { catalog, state }),
      m(
        "div.mt-4",
        m(CurrentSelections, {
          createModel: createCurrentSelectionsModel,
        }),
      ),
    ];

    return m(
      CollapsibleSection,
      {
        title: "筛选器",
        defaultOpen: true,
      },
      [
        renderModeToggle(state),
        ...(state.characterCreationMode === "wizard"
          ? wizardContent
          : browseContent),
      ],
    );
  },
};
