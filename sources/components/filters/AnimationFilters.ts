// Animation Filters component
import m from "mithril";
import type { AnimationFiltersModel } from "../../models/animation-filters.ts";

type AnimationFiltersState = { isExpanded: boolean };

export const AnimationFilters: m.Component<
  { createModel: () => AnimationFiltersModel },
  AnimationFiltersState
> = {
  oninit(vnode) {
    vnode.state.isExpanded = false;
  },
  view(vnode) {
    const model = vnode.attrs.createModel();

    const removeIncompatibleItems = () => {
      const removedCount = model.removeIncompatible();
      if (removedCount > 0) {
        alert(`已移除 ${removedCount} 个不兼容部件`);
      } else {
        alert("未找到不兼容的部件");
      }
    };

    const hasIncompatibleItems = model.incompatibleCount > 0;

    return m("div.box.mb-4.has-background-light", [
      m(
        "div.tree-label",
        {
          onclick: () => {
            vnode.state.isExpanded = !vnode.state.isExpanded;
          },
        },
        [
          m("span.tree-arrow", {
            class: vnode.state.isExpanded ? "expanded" : "collapsed",
          }),
          m("span.title.is-inline.is-6", "动画筛选"),
          m("span.is-size-7.has-text-grey.ml-2", model.summary),
        ],
      ),
      vnode.state.isExpanded
        ? m("div.content.mt-3", [
            !model.liteReady
              ? m("p.is-size-7.has-text-grey.mb-3", "正在加载部件列表…")
              : null,
            m(
              "ul.tree-list",
              model.options.map((anim) =>
                m("li", { key: anim.value, class: "mb-2" }, [
                  m("label.checkbox", [
                    m("input[type=checkbox]", {
                      checked: anim.enabled,
                      disabled: !model.liteReady,
                      onchange: (e: Event) => {
                        const target = e.target as HTMLInputElement;
                        anim.setEnabled(target.checked);
                      },
                    }),
                    ` ${anim.label}`,
                  ]),
                ]),
              ),
            ),
            hasIncompatibleItems
              ? [
                  m("div.notification.is-warning.is-light.p-3.mt-2", [
                    m("p.is-size-7", [
                      m(
                        "strong",
                        `${model.incompatibleCount} 个已选部件不兼容`,
                      ),
                      "，与当前动画筛选冲突。 ",
                      m("span.has-text-grey", "（上面标有 ⚠️ 的）"),
                    ]),
                  ]),
                  m(
                    "button.button.is-small.is-warning.mt-2",
                    {
                      onclick: removeIncompatibleItems,
                      title: `移除 ${model.incompatibleCount} 个不兼容部件`,
                    },
                    `移除 ${model.incompatibleCount} 个不兼容部件`,
                  ),
                ]
              : null,
          ])
        : null,
    ]);
  },
};
