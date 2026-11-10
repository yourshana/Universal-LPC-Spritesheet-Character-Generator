import { FiltersPanel } from "../../sources/components/FiltersPanel.ts";
import { CollapsibleSection } from "../../sources/components/CollapsibleSection.ts";
import { SearchControl } from "../../sources/components/filters/SearchControl.ts";
import { LicenseFilters } from "../../sources/components/filters/LicenseFilters.ts";
import { AnimationFilters } from "../../sources/components/filters/AnimationFilters.ts";
import { CurrentSelections } from "../../sources/components/selections/CurrentSelections.ts";
import { CategoryTree } from "../../sources/components/tree/CategoryTree.ts";
import { Wizard } from "../../sources/components/tree/Wizard.ts";
import { expect } from "chai";
import { describe, it, beforeEach } from "mocha-globals";

function modelCreators() {
  return {
    createSearchControlModel: () => ({ value: "", disabled: false }),
    createLicenseFiltersModel: () => ({ summary: "licenses" }),
    createAnimationFiltersModel: () => ({ summary: "animations" }),
    createCurrentSelectionsModel: () => ({ kind: "empty" }),
    createCategoryTreeModel: () => ({ isLoading: true }),
  };
}

function render(characterCreationMode) {
  return FiltersPanel.view({
    attrs: {
      catalog: {},
      state: { characterCreationMode },
      ...modelCreators(),
    },
  });
}

describe("FiltersPanel", () => {
  let vnode;

  beforeEach(() => {
    vnode = render("browse");
  });

  it("should render the CollapsibleSection component with correct attributes", () => {
    expect(vnode.tag).to.equal(CollapsibleSection);
    expect(vnode.attrs).to.deep.include({
      title: "筛选器",
      defaultOpen: true,
    });
  });

  it("renders a browse/wizard mode toggle as the first child", () => {
    const toggle = vnode.children[0];
    expect(toggle.tag).to.equal("div");
    expect(toggle.attrs.class).to.include("has-addons");
    expect(toggle.children).to.have.lengthOf(2);
  });

  it("should render the SearchControl component", () => {
    const searchControl = vnode.children[1].children[0];
    expect(searchControl.tag).to.equal(SearchControl);
    expect(searchControl.attrs.createModel()).to.deep.equal({
      value: "",
      disabled: false,
    });
  });

  it("should render LicenseFilters and AnimationFilters in a responsive wrapper", () => {
    const columns = vnode.children[2].children;
    expect(columns).to.have.lengthOf(2);

    const licenseFilters = columns[0].children[0];
    const animationFilters = columns[1].children[0];

    expect(licenseFilters.tag).to.equal(LicenseFilters);
    expect(animationFilters.tag).to.equal(AnimationFilters);
    expect(licenseFilters.attrs.createModel()).to.deep.equal({
      summary: "licenses",
    });
    expect(animationFilters.attrs.createModel()).to.deep.equal({
      summary: "animations",
    });
  });

  it("should render the CurrentSelections component", () => {
    const currentSelections = vnode.children[3].children[0];
    expect(currentSelections.tag).to.equal(CurrentSelections);
    expect(currentSelections.attrs.createModel()).to.deep.equal({
      kind: "empty",
    });
  });

  it("should render the CategoryTree component", () => {
    const categoryTree = vnode.children[4];
    expect(categoryTree.tag).to.equal(CategoryTree);
    expect(categoryTree.attrs.createModel()).to.deep.equal({ isLoading: true });
  });

  it("renders the Wizard instead of search/filters/tree in wizard mode", () => {
    const wizardVnode = render("wizard");
    expect(wizardVnode.children[1].tag).to.equal(Wizard);
    expect(wizardVnode.children[2].children[0].tag).to.equal(CurrentSelections);
  });
});
