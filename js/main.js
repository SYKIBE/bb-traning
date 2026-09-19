import { startRouter } from './router.js';
import { createNavbar } from './components/navbar.js';
import { homeView } from './views/home.js';
import { categoryView } from './views/category.js';
import { exerciseView } from './views/exercise.js';
import { trainingView } from './views/training.js';
import { aboutView } from './views/about.js';
import { settingsView } from './views/settings.js';
import { initUpdates } from './updates.js';

// `nav` anger vilken ikon i bottennavigeringen som markeras på sidan.
const routes = [
  { pattern: /^\/$/, nav: 'home', view: homeView },
  { pattern: /^\/kategori\/([\w-]+)$/, nav: 'training', view: categoryView },
  // /start = starta övningen direkt (används av "Kör senaste övningen igen")
  { pattern: /^\/ovning\/([\w-]+)(?:\/(start))?$/, nav: 'training', view: exerciseView },
  { pattern: /^\/traning$/, nav: 'training', view: trainingView },
  { pattern: /^\/om$/, nav: 'about', view: aboutView },
  { pattern: /^\/installningar$/, nav: 'settings', view: settingsView },
];

const navbar = createNavbar(document.getElementById('navbar'));
startRouter(document.getElementById('app'), routes, (nav) => navbar.setActive(nav));

// Registrerar servicearbetaren (offline) och visar en banner när en ny version finns.
initUpdates();
