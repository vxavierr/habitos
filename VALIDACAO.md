# Validação

Atualizado em 2026-09-18 16:55 BRT.

**Build concluído, deploy realizado e validado no iPod não são a mesma coisa.**

- Build: arquivos em `dist/` gerados por `npm run build`.
- Deploy: **realizado** em 2026-09-18 17:00 BRT. URL https://vxavierr.github.io/habitos/ — HTTP 200 em index, sw.js, JS, CSS e ícone; certificado Let's Encrypt; HSTS. USB nesta máquina neste momento: iPod **Nano** 6G (`05ac:1266`), não o Touch. Não houve toque no aparelho alvo.
- Validado no iPod: **não**. Versão de iOS no Touch: desconhecida.

Navegador WebKit/Chromium atual **não** comprova Safari/iOS 12.

## O que foi executado nesta máquina (2026-09-18 16:44 BRT)

Pasta: `/home/vxavierr/workspace/projects/habitos`

| Comando | Resultado |
|---|---|
| `npm test` | **pass** — 17/17 |
| `npm run check:ios12` | **pass** — 11 arquivos JS sem sintaxe Safari 12-proibida |
| `npm run build` | **pass** — `dist/` v0.1.0 |
| `npm run smoke` | **pass** no Chromium 152 do sistema, viewport 320×568, Playwright + `executablePath=/usr/bin/chromium`. Primeira tentativa falhou porque o Playwright não tinha o browser próprio baixado; não instalei o pacote da Microsoft. |

O smoke cobriu: criar “Água”, marcar, recarregar e persistir, histórico da semana, exportar JSON, importar `{nao:valido}` com confirmação aceita sem apagar o hábito. Capturas: `evidence/hoje-320x568.png`, `historico-320x568.png`, `ajustes-320x568.png`, `evidence/smoke.json`.

Isto **não** é Safari/iOS 12.

## Checklist do handoff

| Item | Estado | Evidência |
|---|---|---|
| Criar, renomear, marcar, desmarcar e arquivar; histórico preservado | testado em Node (memória) | `tests/model.test.js`, `tests/storage.test.js` |
| Toques repetidos sem duplicar | testado em Node | `tests/storage.test.js` |
| Fechar e reabrir sem perder check-in | testado em Chromium (reload) e via export/import em memória | `evidence/smoke.json` |
| Wi-Fi off, reabrir, registrar, histórico | **pendente no iPod** | — |
| Reiniciar o iPod com Wi-Fi off | **pendente no iPod** | — |
| Repouso, virada de dia, fim de mês/ano | datas de calendário testadas em Node; repouso **pendente no iPod** | `tests/date.test.js` |
| Exportar, guardar fora do site, importar em banco limpo | fluxo de dados testado; guardar fora do iPod **pendente** | testes + caixa JSON no smoke |
| Importação inválida e falha de gravação não destroem dados | testado em Node; inválido também no Chromium | `tests/storage.test.js`, smoke |
| Atualização do app mantém histórico; rede interrompida não inutiliza versão anterior | implementado no worker; **não testado no iPod** | `app/sw.js` |
| Layout 320 px, teclado, Safari/standalone | screenshot Chromium 320×568; teclado iOS e standalone **pendentes no iPod** | `evidence/*.png` |
| Acesso Guiado; repouso/despertar | **pendente no iPod** | — |
| Nenhum hábito na rede; sem dependência remota essencial | código local, sem CDN; tráfego de rede no iPod **não medido** | `app/` |

## Contexto de teste do computador

- Host: Omarchy/Linux, Node v26, Chromium headless via Playwright quando disponível.
- IndexedDB real do Safari 12: não exercitado. Os testes de persistência usam o backend `memory` com a mesma fila e o mesmo modelo.
- Service worker: registrado só em contexto seguro. No smoke Chromium, localhost é seguro; isso **não** vale para o IP da LAN no iPod.

## Revisão

O revisor em subagente foi cancelado com a sessão. Releitura local em 16:55 BRT: sem `?.` / `??` / `globalThis` no `app/`; IndexedDB confirma no `oncomplete` da transação; worker clássico sem recarregar no meio da gravação; viewport não bloqueia zoom. Isso não substitui Safari/iOS 12 no aparelho.

## Pronto para uso?

**Build concluído. Deploy HTTPS realizado. Validado no iPod: não.**

O próximo passo é humano: no Safari do Touch, abrir https://vxavierr.github.io/habitos/ (Wi-Fi, não aba privada), marcar um teste, adicionar à Tela de Início e repetir offline.
