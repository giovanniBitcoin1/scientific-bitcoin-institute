// Colours for groups in module 09's drawings. The first two are the figure's
// two sides; beyond the list, colours repeat (Panel B colours a ring of up to
// 60 groups, where neighbours still differ because groups are numbered in
// order around the ring).
export const GROUP_COLORS = [
  '#ea580c', // orange-600
  '#0284c7', // sky-600
  '#0f172a', // slate-900
  '#16a34a', // green-600
  '#a855f7', // purple-500
  '#ca8a04', // yellow-600
  '#db2777', // pink-600
  '#64748b', // slate-500
  '#0d9488', // teal-600
  '#7c2d12', // orange-900
]
export const groupColor = (c) => GROUP_COLORS[c % GROUP_COLORS.length]
