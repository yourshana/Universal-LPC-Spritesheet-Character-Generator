import m from "mithril";
import type {
  ClipboardCommandResult,
  DownloadModel,
} from "../../models/download.ts";
import { CollapsibleSection } from "../CollapsibleSection.ts";

function reportClipboardResult(
  result: ClipboardCommandResult,
  successMessage: string,
  errorLogMessage: string,
  failureMessage: string,
): void {
  if (result.kind === "success") {
    alert(successMessage);
  } else if (result.kind === "failure") {
    console.error(errorLogMessage, result.error);
    alert(failureMessage);
  }
}

const DownloadContent: m.Component<{
  createModel: () => DownloadModel;
}> = {
  view(vnode) {
    const model = vnode.attrs.createModel();
    return m(
      "div.buttons.is-flex.is-flex-wrap-wrap",
      { id: "download-buttons" },
      [
        m(
          "button.button.is-small.is-primary",
          { onclick: model.saveSpritesheet },
          "精灵表 (PNG)",
        ),
        m(
          "button.button.is-small",
          { onclick: model.downloadCreditsTxt },
          "署名 (TXT)",
        ),
        m(
          "button.button.is-small",
          { onclick: model.downloadCreditsCsv },
          "署名 (CSV)",
        ),
        m(
          "button.button.is-small.is-info",
          {
            disabled: model.zipDisabled,
            title: model.zipTitle,
            onclick: model.exportZipByAnimation,
          },
          "ZIP: 按动画拆分",
        ),
        model.zipByAnimationRunning ? m("span.loading") : null,
        m(
          "button.button.is-small.is-info",
          {
            disabled: model.zipDisabled,
            title: model.zipTitle,
            onclick: model.exportZipByItem,
          },
          "ZIP: 按部件拆分",
        ),
        model.zipByItemRunning ? m("span.loading") : null,
        m(
          "button.button.is-small.is-info",
          {
            disabled: model.zipDisabled,
            title: model.zipTitle,
            onclick: model.exportZipByAnimationAndItem,
          },
          "ZIP: 按动画和部件拆分",
        ),
        model.zipByAnimationAndItemRunning ? m("span.loading") : null,
        m(
          "button.button.is-small.is-info",
          {
            disabled: model.zipDisabled,
            title: model.zipTitle,
            onclick: model.exportZipByAnimationAndFrame,
          },
          "ZIP: 按动画和帧拆分",
        ),
        model.zipIndividualFramesRunning ? m("span.loading") : null,
        m(
          "button.button.is-small.is-link",
          {
            onclick: async () =>
              reportClipboardResult(
                await model.exportJsonToClipboard(),
                "已导出到剪贴板！",
                "复制到剪贴板失败：",
                "复制到剪贴板失败。请检查浏览器权限。",
              ),
          },
          "导出到剪贴板 (JSON)",
        ),
        m(
          "button.button.is-small.is-link",
          {
            onclick: async () =>
              reportClipboardResult(
                await model.importJsonFromClipboard(),
                "导入成功！",
                "从剪贴板导入失败：",
                "导入失败。请检查剪贴板内容和浏览器权限。",
              ),
          },
          "从剪贴板导入 (JSON)",
        ),
      ],
    );
  },
};

export const Download: m.Component<{
  createModel: () => DownloadModel;
}> = {
  view(vnode) {
    return m(
      CollapsibleSection,
      { title: "下载", defaultOpen: true },
      m(DownloadContent, { createModel: vnode.attrs.createModel }),
    );
  },
};
