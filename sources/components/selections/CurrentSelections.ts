// Current selections component
import m from "mithril";
import { tName } from "../../i18n.ts";
import type { CurrentSelectionsModel } from "../../models/current-selections.ts";

export const CurrentSelections: m.Component<{
  createModel: () => CurrentSelectionsModel;
}> = {
  view(vnode) {
    // Only called when the node is actually rendered
    // Currently it is shown by default, so it is called in each redraw
    const model = vnode.attrs.createModel();
    if (model.kind === "loading") {
      return m("div", [
        m("h3.title.is-5", "当前选择"),
        m("p.is-size-7.has-text-grey", "正在加载部件列表…"),
      ]);
    }

    if (model.kind === "empty") {
      return m("div", [
        m("h3.title.is-5", "当前选择"),
        m("p.has-text-grey", "尚未选择任何部件"),
      ]);
    }

    return m("div", [
      m("h3.title.is-5", "当前选择"),
      m(
        "div.tags",
        model.items.map((item) => {
          return m(
            "span.tag.is-medium",
            {
              key: item.key,
              class: item.isCompatible ? "is-info" : "is-warning",
              title: item.tooltip,
            },
            [
              m("span", tName(item.name)),
              !item.isCompatible ? m("span.ml-1", "⚠️") : null,
              m("button.delete.is-small", {
                onclick: item.remove,
              }),
            ],
          );
        }),
      ),
    ]);
  },
};
