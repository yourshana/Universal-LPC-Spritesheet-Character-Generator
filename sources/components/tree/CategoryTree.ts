import m from "mithril";
import type { CategoryTreeModel } from "../../models/category-tree.ts";
import { BodyTypeSelector } from "./BodyTypeSelector.ts";
import { TreeNode } from "./TreeNode.ts";

function renderLoadingHost() {
  return m("div.box.has-background-light.category-tree-panel", [
    m("div.category-tree-loading-host", [
      m(
        "div.category-tree-loading-overlay",
        { "aria-busy": "true", "aria-live": "polite" },
        m("span.loading", { "aria-label": "正在加载分类索引" }),
      ),
      m("h3.title.is-5.mb-3", "可用部件"),
      m("p.has-text-grey.is-size-7", "正在加载分类索引…"),
    ]),
  ]);
}

export const CategoryTree: m.Component<{
  createModel: () => CategoryTreeModel;
}> = {
  view(vnode) {
    const model = vnode.attrs.createModel();
    if (model.isLoading) return renderLoadingHost();

    return m("div.box.has-background-light.category-tree-panel", [
      m(
        "div.is-flex.is-justify-content-space-between.is-align-items-center.mb-3",
        [
          m("h3.title.is-5.mb-0", "可用部件"),
          m("div.buttons.mb-0", [
            m(
              "button.button.is-danger.is-small",
              { onclick: model.reset },
              "全部重置",
            ),
            m(
              "button.button.is-small",
              { onclick: model.collapseAll },
              "全部折叠",
            ),
            m(
              "button.button.is-small",
              {
                disabled: !model.liteReady,
                title: model.liteReady ? undefined : "正在加载部件列表…",
                onclick: model.expandSelected,
              },
              "展开已选",
            ),
            m(
              "button.button.is-small",
              {
                class: model.compactDisplay ? "is-link" : "",
                onclick: model.toggleCompactDisplay,
              },
              "紧凑显示",
            ),
          ]),
        ],
      ),
      m("div.mb-3", [
        m(
          "label.checkbox",
          {
            title:
              "启用后，更改身体颜色会自动将所有兼容部件（头部、耳朵、鼻子等）更新为相同颜色变体",
          },
          [
            m("input[type=checkbox]", {
              id: "match-body-color-checkbox",
              "aria-describedby": "match-body-color-label",
              checked: model.matchBodyColorEnabled,
              onchange: (event: Event) => {
                model.setMatchBodyColor(
                  (event.target as HTMLInputElement).checked,
                );
              },
            }),
            " 匹配身体颜色",
          ],
        ),
        m(
          "p.is-size-7.has-text-grey.mt-1.ml-4",
          { id: "match-body-color-label" },
          "身体颜色变化时自动更新头部、耳朵等部件",
        ),
      ]),
      m("div", [
        m(BodyTypeSelector, { model: model.bodyTypes }),
        model.roots.map((root) =>
          m(TreeNode, {
            key: root.key,
            createModel: root.createModel,
          }),
        ),
      ]),
    ]);
  },
};
