import { h, s } from '../dom.js';

const svgProps = {
  viewBox: '0 0 24 24',
  fill: 'none',
  stroke: 'currentColor',
  'stroke-width': '2',
  'stroke-linecap': 'round',
  'stroke-linejoin': 'round',
  'aria-hidden': 'true',
  focusable: 'false',
};

const icons = {
  // Hus
  home: () =>
    s('svg', svgProps, s('path', { d: 'M3 10.5 12 3l9 7.5' }), s('path', { d: 'M5 9.5V21h5v-6h4v6h5V9.5' })),
  // Bok
  about: () =>
    s(
      'svg',
      svgProps,
      s('path', { d: 'M4 19.5V5a2 2 0 0 1 2-2h14v15H6a2 2 0 0 0-2 2Z' }),
      s('path', { d: 'M4 19.5A2 2 0 0 0 6 21.5h14V18' }),
      s('path', { d: 'M9 7.5h7' }),
    ),
  // Hantel
  training: () =>
    s(
      'svg',
      svgProps,
      s('path', { d: 'M6.5 6.5v11M17.5 6.5v11M3.5 9v6M20.5 9v6M6.5 12h11' }),
    ),
  // Tre prickar
  settings: () =>
    s(
      'svg',
      { ...svgProps, fill: 'currentColor', stroke: 'none' },
      s('circle', { cx: '5', cy: '12', r: '2' }),
      s('circle', { cx: '12', cy: '12', r: '2' }),
      s('circle', { cx: '19', cy: '12', r: '2' }),
    ),
};

const items = [
  { key: 'home', label: 'Hem', href: '#/' },
  { key: 'about', label: 'Om', href: '#/om' },
  { key: 'training', label: 'Träning', href: '#/traning' },
  { key: 'settings', label: 'Inställningar', href: '#/installningar' },
];

export function createNavbar(container) {
  const links = new Map();
  const list = h(
    'ul',
    { class: 'navbar-list' },
    items.map((item) => {
      const link = h('a', { class: 'nav-link', href: item.href }, icons[item.key](), h('span', null, item.label));
      links.set(item.key, link);
      return h('li', null, link);
    }),
  );
  container.append(list);

  return {
    setActive(key) {
      for (const [k, link] of links) {
        if (k === key) link.setAttribute('aria-current', 'page');
        else link.removeAttribute('aria-current');
      }
    },
  };
}
