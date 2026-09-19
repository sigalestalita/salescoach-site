/* Poeira de estrelas do hero do site, com semente fixa: o mesmo HTML tem
   que gerar sempre o mesmo PNG, senão cada render muda o post. */
(function () {
  var c = document.querySelector('canvas.stars');
  if (!c) return;
  var W = 1080, H = 1350;
  c.width = W; c.height = H;
  var g = c.getContext('2d');
  var seed = 20240917;
  function rnd() { seed = (seed * 1664525 + 1013904223) % 4294967296; return seed / 4294967296; }
  for (var i = 0; i < 260; i++) {
    var x = rnd() * W, y = rnd() * H, r = rnd() * 1.6 + 0.4;
    g.globalAlpha = rnd() * 0.5 + 0.08;
    g.fillStyle = rnd() > 0.72 ? '#8FC1FF' : '#FFFFFF';
    g.beginPath(); g.arc(x, y, r, 0, 6.2832); g.fill();
  }
})();
