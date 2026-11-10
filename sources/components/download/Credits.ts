import m from "mithril";
import type { CreditsModel } from "../../models/credits.ts";
import { CollapsibleSection } from "../CollapsibleSection.ts";

const CreditsContent: m.Component<{
  createModel: () => CreditsModel;
}> = {
  view(vnode) {
    const model = vnode.attrs.createModel();
    if (model.kind === "loading") {
      return m(
        "div.loading-shell-credits",
        m("p.has-text-grey", "正在加载选择…"),
      );
    }
    if (model.kind === "empty") {
      return m("p.has-text-grey", "未选择任何部件");
    }

    return [
      m(
        "div.content.has-background-light.p-3",
        model.credits.map((credit) =>
          m("div.mb-3", { key: credit.key }, [
            m("strong.is-size-6", credit.fileName),
            credit.notes ? m("p.is-size-7", credit.notes) : null,
            m("p.is-size-7", [
              m("strong", "许可证: "),
              credit.licenses.join(", "),
            ]),
            m("p.is-size-7", [
              m("strong", "作者: "),
              credit.authors.join(", "),
            ]),
          ]),
        ),
      ),
      m("div.buttons.mt-3", [
        m("button.button.is-small", { onclick: model.downloadTxt }, "下载 TXT"),
        m("button.button.is-small", { onclick: model.downloadCsv }, "下载 CSV"),
      ]),
    ];
  },
};

export const Credits: m.Component<{
  createModel: () => CreditsModel;
}> = {
  view(vnode) {
    return m(
      CollapsibleSection,
      {
        title: "署名与致谢",
        defaultOpen: true,
        boxClass: "box",
        id: "credits-section",
      },
      [
        m("p.is-size-7.mb-2", [
          "你必须致谢这些美术作品的作者。 ",
          m(
            "a",
            {
              href: "https://github.com/liberatedpixelcup/Universal-LPC-Spritesheet-Character-Generator/blob/master/README.md",
              target: "_blank",
            },
            "详细的署名说明",
          ),
        ]),
        m("p.is-size-7.mb-3", [
          "本生成器中所有精灵表的许可证信息可在此获取 ",
          m(
            "a",
            {
              href: "https://github.com/liberatedpixelcup/Universal-LPC-Spritesheet-Character-Generator/raw/refs/heads/master/CREDITS.csv",
              target: "_blank",
            },
            "这里",
          ),
        ]),
        m(CreditsContent, { createModel: vnode.attrs.createModel }),
      ],
    );
  },
};
