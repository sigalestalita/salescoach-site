// Cards do carrossel. quad = cantos da tela na foto já recortada em 1080×1350
// (sup-esq, sup-dir, inf-dir, inf-esq), medidos na foto original 2048×1152:
// recorte 4:5 centralizado (x 563,2 a 1484,8) e escala 1350/1152.
const S = 1350 / 1152, X0 = (2048 - 1152 * 0.8) / 2;
const q = pts => pts.map(([x, y]) => [(x - X0) * S, y * S]);
const MESA = q([[614, 299], [1443, 300], [1450, 826], [612, 827]]);
const CAFE = q([[654, 289], [1397, 288], [1400, 756], [653, 758]]);
window.CARDS = {
  1: { foto: 'fotos/mesa3.jpg', tela: 'fotos/sc-full-ext-1-cartao.jpg', quad: MESA, prompt: 'sales coach, entra nessa reunião e grava pra mim', prompt_y: 92, tela_filtro: 'brightness(.94) contrast(1.02)' },
  2: { foto: 'fotos/mesa3.jpg', tela: 'fotos/sc-full-app-3-analise.jpg', quad: MESA, prompt: 'agora me manda o vídeo já analisado', prompt_y: 92, tela_filtro: 'brightness(.94) contrast(1.02)' },
  3: { foto: 'fotos/cafe3.jpg', tela: 'fotos/sc-full-app-4-nota.jpg', quad: CAFE, legenda: 'ok, agora me lembra como era antes', legenda_y: 150, tela_filtro: 'brightness(1.02)' },
  4: { foto: 'fotos/caos1.jpg', nota: true },
};
