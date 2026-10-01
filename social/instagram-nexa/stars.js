/* Poeira de estrelas do hero do site, com semente fixa: o mesmo HTML tem
   que gerar sempre o mesmo PNG, senão cada render muda o post. */
(function () {
  var c = document.querySelector('canvas.stars');
  if (!c) return;
  var r = c.getBoundingClientRect();
  var W = Math.round(r.width) || 1080, H = Math.round(r.height) || 1350;
  c.width = W; c.height = H;
  var g = c.getContext('2d');
  var seed = 20240917;
  function rnd() { seed = (seed * 1664525 + 1013904223) % 4294967296; return seed / 4294967296; }
  var n = Math.round(260 * (W * H) / (1080 * 1350));
  for (var i = 0; i < n; i++) {
    var x = rnd() * W, y = rnd() * H, r = rnd() * 1.6 + 0.4;
    g.globalAlpha = rnd() * 0.38 + 0.06;
    g.fillStyle = rnd() > 0.72 ? '#d4f969' : '#FFFFFF';
    g.beginPath(); g.arc(x, y, r, 0, 6.2832); g.fill();
  }
})();
