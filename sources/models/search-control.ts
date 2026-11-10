import type { CatalogReader } from "../state/catalog.ts";
import type { State } from "../state/state.ts";

export type SearchControlModel = {
  readonly value: string;
  readonly disabled: boolean;
  readonly title?: string;
  setValue(value: string): void;
};

export const searchControlModelFactory = {
  create(catalog: CatalogReader, state: State): SearchControlModel {
    const disabled = !catalog.isLiteReady();
    return {
      value: state.searchQuery,
      disabled,
      title: disabled ? "正在加载部件列表…" : undefined,
      setValue(value) {
        state.searchQuery = value;
      },
    };
  },
};
