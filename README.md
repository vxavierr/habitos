# Hábitos

Rastreador mínimo de hábitos diários para um **iPod touch de 6ª geração**, no iOS original, sem jailbreak. Nome de trabalho: Hábitos. Sem branding nesta etapa.

Caminho absoluto: `/home/vxavierr/workspace/projects/habitos`

Isto **não** é o ledger do iPod Nano 6G. Esse trabalho continua intacto em `/home/vxavierr/workspace/projects/ipod-habitos` e não foi modificado.

## Premissas do MVP (reversíveis)

Português brasileiro. Hábitos binários e diários. Offline depois de instalado. Dados só neste aparelho. Backup manual exportável. Sem login, sem sincronização automática, sem backend de hábitos.

O modo local é decisão provisória de implementação: João ainda não escolheu entre histórico só no iPod e sincronizado.

Alvo de compatibilidade: Safari/iOS 12. HTML, CSS e JavaScript pequenos, sem framework e sem bundler de runtime. A saída é o que o Safari antigo executa, não o Node desta máquina.

## Fora de escopo

Trocar o sistema do iPod, jailbreak, app nativo/App Store, conta de desenvolvedor, IA, backend, analytics, push, segundo plano, integração com Mindo, e qualquer reorganização da workstation.

## Comandos

Na pasta do projeto:

```sh
npm test
npm run check:ios12
npm run build
npm run serve
npm run smoke
npm run deploy
```

Não há dependências npm. `serve` escuta só `127.0.0.1` e é HTTP de desenvolvimento: serve para testar no computador, **não** para o iPod. Service worker no aparelho exige HTTPS com certificado confiável.

Abrir no desktop depois do build: `http://127.0.0.1:4173/`

## Arquitetura

Arquivos estáticos em `app/`, copiados para `dist/` no build.

- IndexedDB, com fila de gravação. Um check-in por hábito/data. A UI só diz “Salvo” depois que a transação termina. Falha de escrita reverte o estado em memória.
- Datas civis `YYYY-MM-DD` pelos componentes locais. Não se usa `toISOString().slice(0, 10)`.
- Service worker clássico (`sw.js`) com cache dos arquivos essenciais. “Disponível offline” só aparece se o worker controla a página **e** o cache essencial está completo.
- Backup JSON versionado (`habitos-backup`, `formatVersion` 1). Importação valida e substitui o conjunto inteiro, ou recusa sem alterar o banco.
- Começa vazio. Exemplos são opcionais e rotulados como tal.

## Estado desta entrega

| Camada | Estado |
|---|---|
| Código e build estático | implementado |
| Testes Node + checagem iOS 12 + smoke Chromium 320×568 | ver `VALIDACAO.md` |
| Deploy HTTPS | **realizado** — https://vxavierr.github.io/habitos/ (Let's Encrypt, 200 neste computador) |
| Validado no iPod | **não** — pendente de você abrir no Safari do Touch |

Detalhes: `CONFIGURAR-IPOD.md`, `BACKUP-E-RECUPERACAO.md`, `VALIDACAO.md`.
