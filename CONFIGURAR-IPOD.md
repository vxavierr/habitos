# Configurar o iPod touch 6

Atualizado em 2026-09-18 16:35 BRT.

**URL real:** ainda não existe. Nenhum site foi publicado. Falta autorização de João para um HTTPS com certificado confiável pelo iPod e um endereço estável.

O que está pronto: o app estático em `dist/` e este procedimento. `http://127.0.0.1:4173/` e qualquer IP HTTP da LAN **não** são endereço utilizável no iPod. `file://`, ZIP aberto no Safari e certificado com aviso ignorado também não.

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

1. Abrir a URL HTTPS no Safari.
2. `Compartilhar → Tela de Início`.
3. Abrir o ícone novo ainda conectado, para o service worker terminar o cache.
4. Repetir o teste offline no contexto escolhido.
5. Importar dados reais só depois disso.
6. Organizar a tela inicial. Não excluir contas sem autorização explícita.

Acesso Guiado no iOS 12: `Ajustes → Geral → Acessibilidade → Acesso Guiado`; ativar e definir um código. Abrir o tracker, clicar três vezes o botão de Início, iniciar. Para sair: Início três vezes e o código.

Se o Acesso Guiado atrapalhar rolagem, teclado ou a lista, use o Safari normal e só esconda a chrome de navegação. O modo realmente testado deve ir para `VALIDACAO.md`.

Não há boot automático no tracker. Não deixe a tela acesa o tempo todo. Teste repouso/despertar e reinício.

## Hospedagem

Reutilize um host HTTPS já autorizado, se existir. Nesta sessão **não** havia destino autorizado para este app, então nada foi publicado.

Quando houver URL, grave-a aqui e não troque domínio, protocolo ou porta depois que o uso real começar: armazenamento está preso à origem. Migração = exportar backup e importar na origem nova.
