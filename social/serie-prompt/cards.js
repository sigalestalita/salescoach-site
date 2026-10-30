// Cards do carrossel. quad = cantos da tela (sup-esq, sup-dir, inf-dir, inf-esq),
// medidos na foto original 2048×1152 e levados ao card 1080×1350: a foto cobre o
// card pela altura (escala 1350/1152) e é recortada em 4:5 centrada no notebook.
const S = 1350 / 1152, W = 1152 * 0.8;
const foto = (arquivo, centro, pts) => {
  const x0 = centro - W / 2;
  return { foto: arquivo, foto_pos: `${(x0 * S / (2048 * S - 1080) * 100).toFixed(2)}% 50%`, quad: pts.map(([x, y]) => [(x - x0) * S, y * S]) };
};
const MESA = foto('fotos/mesaw3.jpg', 1041, [[755, 516], [1327, 513], [1330, 893], [751, 896]]);
const CAFE = foto('fotos/cafew3.jpg', 993, [[666, 240], [1320, 236], [1318, 659], [674, 671]]);
window.CARDS = {
  1: { ...MESA, tela: 'fotos/sc-full-ext-1-cartao.jpg', prompt: 'entra nessa reunião e grava pra mim', prompt_y: 300, tela_filtro: 'brightness(.93) contrast(1.02)' },
  2: { ...MESA, tela: 'fotos/sc-full-app-3-analise.jpg', prompt: 'agora me manda o vídeo já analisado', prompt_y: 300, tela_filtro: 'brightness(.93) contrast(1.02)' },
  3: { ...CAFE, tela: 'fotos/sc-full-app-4-nota.jpg', prompt: 'e me fala onde essa venda travou', prompt_y: 70, tela_filtro: 'brightness(1.02)' },
  4: { foto: 'fotos/caos1.jpg', nota: true },
};
