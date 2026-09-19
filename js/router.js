// Hash-router. Varje route har ett `pattern` (RegExp mot sökvägen efter #), en
// `nav`-nyckel (vilken flik i navbaren som ska vara aktiv) och en `view` som
// returnerar en DOM-nod. Noden kan ha en `destroy()` som körs när man lämnar vyn.
export function startRouter(outlet, routes, onNavigate) {
  let current = null;

  function render() {
    current?.destroy?.();
    current = null;

    const path = location.hash.slice(1) || '/';
    for (const route of routes) {
      const match = path.match(route.pattern);
      if (!match) continue;
      const node = route.view(...match.slice(1));
      if (!node) break; // vyn sa nej (t.ex. okänt id) – gå till hem
      outlet.replaceChildren(node);
      current = node;
      window.scrollTo(0, 0);
      outlet.focus({ preventScroll: true });
      onNavigate?.(route.nav);
      return;
    }
    location.replace('#/');
  }

  window.addEventListener('hashchange', render);
  render();
}
