// Lightweight static four-direction preview (wizard mode) — no rAF loop.
import m from "mithril";
import type { State } from "../../state/state.ts";
import { FRAME_SIZE } from "../../state/constants.ts";
import { paintStaticFourView } from "../../canvas/preview-animation.ts";
import { initPreviewCanvas } from "../../canvas/preview-canvas.ts";

export const FourViewPreview: m.Component<{ state: State }> = {
  oncreate(vnode) {
    if (!window.canvasRenderer) return;
    initPreviewCanvas(vnode.dom as HTMLCanvasElement);
    paintStaticFourView(
      vnode.attrs.state,
      vnode.attrs.state.selectedAnimation || "walk",
    );
  },
  onupdate(vnode) {
    if (!window.canvasRenderer) return;
    paintStaticFourView(
      vnode.attrs.state,
      vnode.attrs.state.selectedAnimation || "walk",
    );
  },
  view() {
    return m("canvas.four-view-preview", {
      width: 4 * FRAME_SIZE,
      height: FRAME_SIZE,
    });
  },
};
