// Minimala DOM-hjälpare. Text sätts alltid som textnoder (aldrig innerHTML).
const SVG_NS = 'http://www.w3.org/2000/svg';

function build(el, props, children) {
  for (const [key, value] of Object.entries(props ?? {})) {
    if (value == null || value === false) continue;
    if (key === 'class') {
      el.setAttribute('class', value);
    } else if (key === 'dataset') {
      Object.assign(el.dataset, value);
    } else if (key === 'style' && typeof value === 'object') {
      for (const [prop, val] of Object.entries(value)) el.style.setProperty(prop, val);
    } else if (key.startsWith('on') && typeof value === 'function') {
      el.addEventListener(key.slice(2).toLowerCase(), value);
    } else {
      el.setAttribute(key, value === true ? '' : value);
    }
  }
  for (const child of children.flat(Infinity)) {
    if (child == null || child === false) continue;
    el.append(child instanceof Node ? child : document.createTextNode(String(child)));
  }
  return el;
}

export const h = (tag, props, ...children) => build(document.createElement(tag), props, children);
export const s = (tag, props, ...children) =>
  build(document.createElementNS(SVG_NS, tag), props, children);
