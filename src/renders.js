// Ink-outlined 3D renders of the same icons, built in Blender
// (tools/blender/assets.py -> public/renders). Keys match `iconMap`.
const RENDER_BASE = `${import.meta.env.BASE_URL}renders/`
export const iconRenders = {
  graduationCap: `${RENDER_BASE}icon_cap.png`,
  shieldCheck: `${RENDER_BASE}icon_chart.png`,
  network: `${RENDER_BASE}icon_gear.png`,
  codeBrackets: `${RENDER_BASE}icon_code.png`,
  checkBadge: `${RENDER_BASE}icon_shield.png`,
}
