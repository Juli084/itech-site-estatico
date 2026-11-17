/**
 * Auditoria de contraste para colar no console do navegador. Usa
 * elementsFromPoint para descobrir o fundo realmente pintado sob cada
 * texto, o que enxerga sobreposição, irmão posicionado e z-index.
 * Não enxerga imagem de fundo, gradiente nem translucidez composta.
 */
(() => {
  const lum = (c) => {
    const f = (v) => { v /= 255; return v <= 0.03928 ? v / 12.92 : Math.pow((v + 0.055) / 1.055, 2.4); };
    return 0.2126 * f(c[0]) + 0.7152 * f(c[1]) + 0.0722 * f(c[2]);
  };
  const cor = (s) => {
    const m = String(s).match(/rgba?\(([^)]+)\)/);
    if (!m) return null;
    const p = m[1].split(/[,\s/]+/).filter(Boolean).map(Number);
    return { rgb: [p[0], p[1], p[2]], a: p.length > 3 ? p[3] : 1 };
  };
  const razao = (a, b) => {
    const [x, y] = [lum(a), lum(b)].sort((m, n) => n - m);
    return (x + 0.05) / (y + 0.05);
  };

  const fundoPintado = (el, x, y) => {
    const propria = cor(getComputedStyle(el).backgroundColor);
    if (propria && propria.a >= 0.95) return propria.rgb;
    const pilha = document.elementsFromPoint(x, y);
    const i = pilha.indexOf(el);
    const abaixo = i >= 0 ? pilha.slice(i + 1) : pilha;
    for (const n of abaixo) {
      const c = cor(getComputedStyle(n).backgroundColor);
      if (c && c.a >= 0.95) return c.rgb;
    }
    return [255, 255, 255];
  };

  const achados = [];
  for (const el of document.querySelectorAll('body *')) {
    const temTexto = [...el.childNodes].some(
      (n) => n.nodeType === 3 && n.textContent.trim().length > 1
    );
    if (!temTexto) continue;
    const cs = getComputedStyle(el);
    if (cs.visibility === 'hidden' || cs.display === 'none' || +cs.opacity === 0) continue;
    const r = el.getBoundingClientRect();
    if (r.width < 2 || r.height < 2) continue;
    if (r.bottom < 0 || r.top > innerHeight || r.right < 0 || r.left > innerWidth) continue;

    const fg = cor(cs.color);
    if (!fg || fg.a < 0.95) continue;

    const x = Math.min(innerWidth - 1, Math.max(1, r.left + Math.min(8, r.width / 2)));
    const y = Math.min(innerHeight - 1, Math.max(1, r.top + r.height / 2));
    const bg = fundoPintado(el, x, y);
    const ra = razao(fg.rgb, bg);

    const px = parseFloat(cs.fontSize);
    const peso = parseInt(cs.fontWeight, 10) || 400;
    const grande = px >= 24 || (px >= 18.66 && peso >= 700);
    const minimo = grande ? 3 : 4.5;

    if (ra < minimo) {
      achados.push({
        sel: el.tagName.toLowerCase() + (typeof el.className === 'string' && el.className
          ? '.' + el.className.trim().split(/\s+/).join('.') : ''),
        txt: el.textContent.trim().slice(0, 40),
        razao: +ra.toFixed(2),
        minimo,
        cor: cs.color,
        fundo: 'rgb(' + bg.join(',') + ')',
      });
    }
  }
  return { url: location.pathname, rolagem: Math.round(scrollY), reprovados: achados.length, achados };
})()
