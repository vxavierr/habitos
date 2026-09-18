# Configurar o iPod touch 6

Atualizado em 2026-09-18 17:01 BRT.

**URL real (HTTPS):** https://vxavierr.github.io/habitos/

Certificado Let's Encrypt, HSTS ligado. Conferido neste computador em 17:00 BRT: `index.html`, `sw.js`, CSS, JS e ícone responderam HTTP 200. Isso **não** substitui abrir no Safari do iPod.

Não use `http://127.0.0.1:4173/`, IP da LAN, `file://` nem ZIP. Depois que o uso real começar, não troque essa URL: o armazenamento fica preso a ela.

O repositório público é só o app vazio, sem os seus hábitos. Os registros ficam no IndexedDB do Safari/ícone.

## A. Antes de apagar qualquer coisa no aparelho

1. Confirme que você tem o código do iPod e a conta Apple vinculada. Não envie senhas ao chat.
2. Salve fotos, músicas e o que mais importar.
3. `Ajustes → Geral → Atualização de Software`. Anote a versão instalada. A Apple lista iOS 12.5.8 para este modelo; confirme no aparelho, não neste documento.
4. Faça backup do iPod (Finder/iTunes ou o caminho que você já usa) **antes** de atualizar ou apagar.
5. Abra o tracker pela URL HTTPS no Safari normal, **não** em aba privada.
6. Crie hábitos de teste, marque, feche, reabra, desligue o Wi-Fi, exporte o JSON e importe num teste.
7. `Compartilhar → Tela de Início`, abra o ícone ainda com Wi-Fi, e repita o teste offline nesse contexto.
8. Escolha um contexto principal (Safari ou ícone) antes do uso real. Os dois podem não compartilhar o mesmo IndexedDB.

Nenhum passo de apagamento é condição para descobrir se o app funciona.

## B. Apagar e configurar como novo — opcional e destrutivo

A formatação **não** é necessária para o rastreador. Só entra se você quiser o aparelho limpo, depois do app validado e de um backup que você confirmou.

`Ajustes → Geral → Redefinir → Apagar Conteúdo e Ajustes`. Na configuração seguinte, escolha novo iPod — não restaure automaticamente o ambiente antigo.

Se houver bloqueio de ativação, use a recuperação oficial da conta Apple. Não tente contornar.

## C. Instalar e dedicar

Com Wi-Fi, data e hora corretos:

1. No Safari (não aba privada), abrir **https://vxavierr.github.io/habitos/**
2. Criar um hábito de teste, marcar, fechar o Safari, reabrir a mesma URL e conferir se continua marcado.
3. `Compartilhar → Tela de Início` → adicionar **Hábitos**.
4. Abrir o ícone novo **ainda com Wi-Fi**, para o cache offline terminar.
5. Em Ajustes do app, ver se aparece “Disponível offline”.
6. Desligar o Wi-Fi e repetir: marcar, histórico, reabrir pelo ícone.
7. Só então apague o hábito de teste (arquivar) e crie os reais. Exportar o JSON para fora do iPod.
8. Organizar a tela inicial. Não excluir contas Apple sem autorização explícita.

Acesso Guiado no iOS 12: `Ajustes → Geral → Acessibilidade → Acesso Guiado`; ativar e definir um código. Abrir o tracker, clicar três vezes o botão de Início, iniciar. Para sair: Início três vezes e o código.

Se o Acesso Guiado atrapalhar rolagem, teclado ou a lista, use o Safari normal e só esconda a chrome de navegação. O modo realmente testado deve ir para `VALIDACAO.md`.

Não há boot automático no tracker. Não deixe a tela acesa o tempo todo. Teste repouso/despertar e reinício.

## Hospedagem

Publicado em GitHub Pages, origem:

`https://vxavierr.github.io/habitos/`

Fonte: branch `gh-pages` do repositório `vxavierr/habitos`. Republicar: `npm run deploy` na pasta do projeto.

O computador **não** precisa ficar ligado depois que o iPod baixou e cacheou o app. Se o Safari apagar o cache, o iPod precisa de HTTPS de novo nessa mesma URL.

Migração para outro domínio = exportar backup e importar na origem nova. Não trate uma URL nova como se já tivesse os registros.
