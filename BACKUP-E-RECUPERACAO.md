# Backup e recuperação

Atualizado em 2026-09-18 16:35 BRT.

O Safari pode apagar IndexedDB e o cache do service worker. Ícone na tela inicial não é backup. Copiar o JSON para outra nota, e-mail ou computador é o critério real.

## Exportar

Em **Ajustes**:

1. `Mostrar JSON para copiar` — o texto inteiro vai para a caixa, selecionável. Este é o caminho principal no iPod.
2. `Baixar arquivo (se o Safari deixar)` — tentamos um download; no iOS 12 isso costuma falhar. Se falhar, copie o JSON.

Guarde a cópia **fora** do site e, de preferência, fora do iPod.

O arquivo é JSON versionado:

```text
format: habitos-backup
formatVersion: 1
schemaVersion: 1
habits, checkins, settings
```

## Importar

Importar **substitui** hábitos, registros e ajustes. Não há merge.

1. Mostre o JSON atual (vira rede de segurança na caixa).
2. Cole o backup ou escolha um arquivo.
3. Confirme o aviso.
4. Arquivo inválido é recusado; o banco permanece como estava.
5. Dados importados são dados. Nada é interpretado como HTML.

## Transferência testada nesta sessão

- **Testado no computador:** copiar o JSON da caixa, importar numa instância de armazenamento em memória limpa (`npm test`) e recusar JSON inválido sem apagar o que já existia.
- **Testado no Chromium 320×568:** exportar preenche a caixa; JSON inválido com confirmação aceita não apaga o hábito de teste. Ver `evidence/smoke.json`.
- **Não testado:** AirDrop, e-mail no iPod, app Arquivos, iCloud Drive, Safari vs ícone na tela inicial compartilhando o mesmo banco.

## Atualização do app

Trocar os arquivos em `dist/` (nova versão do HTML/JS) não deve limpar o IndexedDB. O service worker usa um nome de cache versionado; se a instalação da cache nova falhar, a anterior permanece.

Não recarregue no meio de uma gravação. Se aparecer “Nova versão pronta”, reabra o app. Isso não é migração de origem: mudar URL/domínio é outro banco. Aí use exportar/importar.

## Recuperar instalação cujo cache sumiu

Se o Safari evictou o worker, o app precisa de HTTPS de novo para baixar os arquivos. Os hábitos só voltam se o IndexedDB ainda estiver lá, ou via backup JSON. Sem backup e sem banco, os registros acabaram.
