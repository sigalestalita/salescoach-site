/**
 * Planilha de leads do Sales Coach ↔ CRM da NEXA (aba Inbound).
 *
 * Cole este arquivo em Extensões → Apps Script, na própria planilha.
 *
 * 1. Leads da Meta → CRM: a cada 5 minutos, manda as linhas novas da aba da Meta
 *    (a que a integração da Meta preenche) para a função lead-meta do CRM. O CRM
 *    não grava o mesmo lead duas vezes, então reenviar não duplica.
 * 2. Leads do site → planilha: a função lead-site do CRM chama este script
 *    (doPost) e o lead entra na aba "Site", com origem e campanha.
 *
 * Configuração (Projeto → Configurações do projeto → Propriedades do script):
 *   CRM_TOKEN       o mesmo valor do segredo LEAD_META_TOKEN no Supabase
 *   PLANILHA_TOKEN  uma senha qualquer; o mesmo valor do segredo PLANILHA_TOKEN no Supabase
 *   ABA_META        opcional; nome da aba da Meta (padrão: a primeira aba)
 * Depois rode instalar() uma vez e autorize.
 */

var CRM_URL = 'https://atzwinvlemkyttkrdumn.supabase.co/functions/v1/lead-meta';
var ABA_SITE = 'Site';
var COLUNAS_SITE = ['created_time', 'origem', 'canal', 'nome', 'email', 'whatsapp', 'empresa', 'cargo', 'funcionarios',
  'vendedores', 'interesse', 'utm_source', 'utm_medium', 'utm_campaign', 'utm_content', 'pagina'];

function prop(k) { return PropertiesService.getScriptProperties().getProperty(k) || ''; }

/** Rode uma vez: cria o gatilho de 5 em 5 minutos e envia o que já está na planilha. */
function instalar() {
  ScriptApp.getProjectTriggers().forEach(function (t) {
    if (t.getHandlerFunction() === 'enviarLeadsMeta') ScriptApp.deleteTrigger(t);
  });
  ScriptApp.newTrigger('enviarLeadsMeta').timeBased().everyMinutes(5).create();
  enviarLeadsMeta();
}

function abaMeta() {
  var ss = SpreadsheetApp.getActiveSpreadsheet();
  var nome = prop('ABA_META');
  return nome ? ss.getSheetByName(nome) : ss.getSheets().filter(function (s) { return s.getName() !== ABA_SITE; })[0];
}

/** Linhas novas da aba da Meta → CRM. Guarda até qual linha já foi enviada. */
function enviarLeadsMeta() {
  var aba = abaMeta();
  if (!aba) return;
  var valores = aba.getDataRange().getDisplayValues();
  if (valores.length < 2) return;
  var cab = valores[0].map(function (c, i) { return String(c).trim() || (i === valores[0].length - 1 ? 'qualidade_do_lead' : 'coluna_' + (i + 1)); });
  var props = PropertiesService.getScriptProperties();
  var feito = Number(props.getProperty('ULTIMA_LINHA_META') || 1);
  if (feito >= valores.length) return;

  var lote = [];
  for (var r = feito; r < valores.length; r++) {
    var o = {};
    cab.forEach(function (c, i) { if (valores[r][i] !== '') o[c] = valores[r][i]; });
    if (o.id || o.email) lote.push(o);
  }
  if (!lote.length) { props.setProperty('ULTIMA_LINHA_META', String(valores.length)); return; }

  var res = UrlFetchApp.fetch(CRM_URL, {
    method: 'post', contentType: 'application/json', muteHttpExceptions: true,
    headers: { 'x-nexa-token': prop('CRM_TOKEN') },
    payload: JSON.stringify(lote),
  });
  // Só avança se o CRM recebeu; senão tenta de novo na próxima rodada.
  if (res.getResponseCode() === 200) props.setProperty('ULTIMA_LINHA_META', String(valores.length));
  else console.error('CRM respondeu ' + res.getResponseCode() + ': ' + res.getContentText().slice(0, 300));
}

/** Recebe os leads do site (função lead-site do CRM) e grava na aba "Site". */
function doPost(e) {
  var corpo = {};
  try { corpo = JSON.parse(e.postData.contents); } catch (err) { return resposta({ ok: false, erro: 'json' }); }
  if (!prop('PLANILHA_TOKEN') || corpo.token !== prop('PLANILHA_TOKEN')) return resposta({ ok: false, erro: 'token' });
  var ss = SpreadsheetApp.getActiveSpreadsheet();
  var aba = ss.getSheetByName(ABA_SITE) || ss.insertSheet(ABA_SITE);
  if (aba.getLastRow() === 0) aba.appendRow(COLUNAS_SITE);
  var l = corpo.lead || {};
  aba.appendRow(COLUNAS_SITE.map(function (c) {
    var v = l[c] == null ? '' : String(l[c]);
    if (c === 'created_time' && v) v = Utilities.formatDate(new Date(v), 'America/Sao_Paulo', 'yyyy-MM-dd HH:mm:ss');
    // Telefone começa com "+" ou dígitos: o apóstrofo impede a planilha de virar número.
    return c === 'whatsapp' && v ? "'" + v : v;
  }));
  return resposta({ ok: true });
}

function resposta(o) { return ContentService.createTextOutput(JSON.stringify(o)).setMimeType(ContentService.MimeType.JSON); }
