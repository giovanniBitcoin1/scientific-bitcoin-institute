// Base path of every lab, keyed by lab id. This is the one line to edit to
// move a lab to another URL: the routes in App.jsx and every link inside the
// labs are built from it. It is kept apart from registry.js so that App.jsx
// can register the routes without pulling the labs' texts into the main bundle.
export const LAB_PATHS = {
  complexity: '/lab',
  network: '/network-lab', // provisional
}
