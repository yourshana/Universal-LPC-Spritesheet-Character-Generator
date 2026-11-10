import type { CatalogReader } from "../state/catalog.ts";
import {
  isItemAnimationCompatible,
  isItemLicenseCompatible,
} from "../state/filters.ts";
import type { State } from "../state/state.ts";

export type CurrentSelectionItemModel = {
  readonly key: string;
  readonly name: string;
  readonly isCompatible: boolean;
  readonly tooltip: string;
  remove(): void;
};

export type CurrentSelectionsModel =
  | { readonly kind: "loading" }
  | { readonly kind: "empty" }
  | {
      readonly kind: "ready";
      readonly items: readonly CurrentSelectionItemModel[];
    };

export const currentSelectionsModelFactory = {
  create(catalog: CatalogReader, state: State): CurrentSelectionsModel {
    if (!catalog.isLiteReady()) return { kind: "loading" };

    const selections = Object.entries(state.selections);
    if (selections.length === 0) return { kind: "empty" };

    const creditsReady = catalog.isCreditsReady();
    return {
      kind: "ready",
      items: selections.map(([key, selection]) => {
        const licenseCompatible = isItemLicenseCompatible(
          catalog,
          state,
          selection.itemId,
        );
        const animationCompatible = isItemAnimationCompatible(
          catalog,
          state,
          selection.itemId,
        );
        const isCompatible = licenseCompatible && animationCompatible;
        const meta = catalog.getItemMerged(selection.itemId).unwrapOr(null);
        const licenses = new Set<string>();
        for (const credit of meta?.credits ?? []) {
          for (const license of credit.licenses) licenses.add(license.trim());
        }

        const licensesText = !creditsReady
          ? "正在加载许可证信息…"
          : licenses.size > 0
            ? `许可证: ${Array.from(licenses).join(", ")}`
            : "无许可证信息";
        const supportedAnimations = meta?.animations ?? [];
        const animationsText =
          supportedAnimations.length > 0
            ? `动画: ${supportedAnimations.join(", ")}`
            : "无动画信息";
        const incompatibility = !isCompatible
          ? `⚠️ 与所选${[
              !licenseCompatible ? "许可证" : null,
              !animationCompatible ? "动画" : null,
            ]
              .filter(Boolean)
              .join("和")}不兼容\n`
          : "";

        return {
          key,
          name: selection.name,
          isCompatible,
          tooltip: `${incompatibility}${licensesText}\n${animationsText}`,
          remove: () => {
            delete state.selections[key];
          },
        };
      }),
    };
  },
};
