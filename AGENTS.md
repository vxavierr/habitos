# AGENTS.md — Hábitos (iPod touch 6)

Projeto isolado em `/home/vxavierr/workspace/projects/habitos`. Não misturar com `/home/vxavierr/workspace/projects/ipod-habitos` (Nano 6G).

Alvo: Safari/iOS 12. Sem `?.`, `??`, `globalThis`, `replaceAll`, `Object.fromEntries`, `Promise.allSettled`, class fields privados, flex `gap`. Sem framework, sem CDN, sem bundler de runtime.

Datas civis: `Habitos.date.localISODate`. Nunca `toISOString().slice(0, 10)`.

Não publicar HTTPS, não apagar o iPod, não commitar no git do HUB (`unimontes`). Git próprio deste diretório, se houver.

Confirme gravação pelo `oncomplete` da transação, não só pelo `onsuccess` do request.
