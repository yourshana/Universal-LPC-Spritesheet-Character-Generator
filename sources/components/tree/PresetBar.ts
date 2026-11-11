// Saved character presets ("人物方案") shown in wizard mode: save the current
// character, reload one later, rename it, overwrite it, or delete it.
import m from "mithril";
import type { State } from "../../state/state.ts";
import type { CharacterPreset } from "../../state/presets.ts";
import {
  beginRename,
  cancelRename,
  cancelSavePrompt,
  commitRename,
  confirmSaveAsNew,
  confirmUpdateActive,
  getActivePreset,
  loadPreset,
  removePreset,
  requestSavePreset,
} from "../../state/presets.ts";

type PresetBarState = { pendingDeleteId: string | null };

function renderRenameEditor(state: State): m.Children {
  return m("div.field.has-addons", [
    m(
      "div.control",
      m("input.input.is-small", {
        value: state.presetEditor.draftName,
        "aria-label": "方案名称",
        oncreate: (inputVnode) => {
          const input = inputVnode.dom as HTMLInputElement;
          input.focus();
          input.select();
        },
        oninput: (event: Event) => {
          state.presetEditor.draftName = (
            event.target as HTMLInputElement
          ).value;
        },
        onkeydown: (event: KeyboardEvent) => {
          if (event.key === "Enter") commitRename(state);
          else if (event.key === "Escape") cancelRename(state);
        },
      }),
    ),
    m(
      "div.control",
      m(
        "button.button.is-small.is-primary",
        { onclick: () => commitRename(state) },
        "确定",
      ),
    ),
    m(
      "div.control",
      m(
        "button.button.is-small",
        { onclick: () => cancelRename(state) },
        "取消",
      ),
    ),
  ]);
}

function renderPresetRow(
  state: State,
  preset: CharacterPreset,
  isPendingDelete: boolean,
  onDeleteClick: () => void,
): m.Children {
  if (state.presetEditor.editingId === preset.id) {
    return renderRenameEditor(state);
  }

  const isActive = state.activePresetId === preset.id;
  return m("div.field.has-addons", [
    m(
      "div.control",
      m(
        "button.button.is-small",
        {
          class: isActive ? "is-primary" : "",
          onclick: () => loadPreset(state, preset.id),
        },
        preset.name,
      ),
    ),
    m(
      "div.control",
      m(
        "button.button.is-small",
        { onclick: () => beginRename(state, preset) },
        "重命名",
      ),
    ),
    m(
      "div.control",
      m(
        "button.button.is-small",
        {
          class: isPendingDelete ? "is-danger" : "",
          onclick: onDeleteClick,
        },
        isPendingDelete ? "确认删除" : "删除",
      ),
    ),
  ]);
}

export const PresetBar: m.Component<{ state: State }, PresetBarState> = {
  oninit(vnode) {
    vnode.state.pendingDeleteId = null;
  },
  view(vnode) {
    const { state } = vnode.attrs;
    const activePreset = getActivePreset(state);
    return m("div.wizard-presets.mb-3", [
      m(
        "div.is-flex.is-flex-wrap-wrap.is-align-items-center.is-justify-content-space-between.mb-1",
        [
          m(
            "span.has-text-weight-semibold.is-size-7",
            `人物方案（${state.presets.length}）`,
          ),
          m("div.buttons", [
            m(
              "button.button.is-small",
              {
                disabled: !activePreset,
                onclick: () => confirmUpdateActive(state),
              },
              "更新方案",
            ),
            m(
              "button.button.is-small.is-primary",
              { onclick: () => requestSavePreset(state) },
              "保存方案",
            ),
          ]),
        ],
      ),
      state.presetSavePrompt && activePreset
        ? m("div.is-flex.is-flex-wrap-wrap.is-align-items-center.mb-2", [
            m(
              "span.is-size-7.mr-2",
              `已有方案「${activePreset.name}」，要更新它吗？`,
            ),
            m("div.buttons", [
              m(
                "button.button.is-small.is-primary",
                { onclick: () => confirmUpdateActive(state) },
                "更新",
              ),
              m(
                "button.button.is-small",
                { onclick: () => confirmSaveAsNew(state) },
                "另存为新方案",
              ),
              m(
                "button.button.is-small.is-text",
                { onclick: () => cancelSavePrompt(state) },
                "取消",
              ),
            ]),
          ])
        : null,
      state.presets.length === 0
        ? m(
            "p.is-size-7.has-text-grey",
            "还没有保存的方案。保存后可以随时载入，接着修改。",
          )
        : m(
            "div.is-flex.is-flex-wrap-wrap",
            state.presets.map((preset) =>
              renderPresetRow(
                state,
                preset,
                vnode.state.pendingDeleteId === preset.id,
                () => {
                  if (vnode.state.pendingDeleteId === preset.id) {
                    removePreset(state, preset.id);
                    vnode.state.pendingDeleteId = null;
                  } else {
                    vnode.state.pendingDeleteId = preset.id;
                  }
                },
              ),
            ),
          ),
    ]);
  },
};
