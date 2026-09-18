# Handoff — iPod touch 6 como rastreador de hábitos

**Para:** agente de implementação no ambiente de João (Omarchy/Linux).  
**Data:** 18 de setembro de 2026.  
**Status:** especificação para executar; o app ainda não foi implementado e o iPod não foi configurado por este handoff.

## 1. Missão e decisões de partida

Implemente um rastreador de hábitos pequeno e confiável e prepare a instalação em um **iPod touch de 6ª geração**, mantendo o iOS e sem jailbreak. A experiência desejada é: despertar o aparelho, abrir a lista de hoje, marcar um hábito com um toque e guardar. Não transforme isso em uma plataforma.

João confirmou que é um Touch, não Classic nem Nano. Não volte a perguntar qual dessas famílias ele possui. A versão de iOS instalada, o estado do aparelho, o repositório e a hospedagem ainda não foram verificados.

**Premissas do MVP, reversíveis:** português brasileiro; hábitos binários diários; funcionamento offline após instalação; dados locais; backup manual exportável; sem login e sem sincronização automática. João ainda não escolheu entre histórico só no iPod e sincronizado. Portanto, o modo local é uma decisão provisória de implementação, não uma preferência confirmada. Não bloqueie o desenvolvimento por essa pergunta.

A Apple lista o iOS **12.5.8**, lançado em 26/01/2026, para o Touch de 6ª geração. Use o Safari/iOS 12 como alvo de compatibilidade; confira a versão disponível no aparelho antes da instalação. Não trate essa atualização como garantia de suporte a tecnologias web modernas. [S1]

**Fora do escopo:** trocar o sistema operacional, jailbreak, app nativo/App Store, assinatura de desenvolvedor, IA, backend, conta de usuário, analytics, push, tarefas em segundo plano, integração com Mindo e reorganização da workstation.

## 2. Como trabalhar no ambiente de João

Inspecione primeiro o diretório atual, as instruções `AGENTS.md` aplicáveis, o estado do Git e a organização real dos projetos. Não presuma `~/work`, não invente um repositório existente e não faça uma varredura indiscriminada dos arquivos pessoais. Use uma pasta de projeto coerente com o ambiente encontrado e informe o caminho absoluto escolhido.

Use agentes Astra em sessões novas e worktrees separadas para implementação, quando esse recurso estiver disponível. Mantenha poucos agentes: este projeto não justifica uma equipe inteira. Cada agente recebe caminho exato, escopo e critérios de conclusão; implementa, valida sua parte e para. O agente principal revisa os diffs, integra e executa a validação final. Não permita alterações simultâneas nos mesmos arquivos. Se não houver orquestração disponível, declare isso e trabalhe de forma isolada; não simule agentes.

Preserve mudanças preexistentes. Não apague dados, faça push, publique um site, contrate serviços ou altere contas sem autorização específica. Prepare build e procedimento de deploy; execute publicação somente em um destino autorizado. Não peça confirmação para decisões locais pequenas e reversíveis. Só bloqueie uma etapa quando faltar uma permissão ou acesso realmente necessário; continue o restante.

Faça implementação incremental, com relatos curtos de progresso e evidências. Não devolva apenas um plano: entregue código, build, testes e instruções reproduzíveis.

## 3. Produto mínimo

Nome de trabalho: **Hábitos**, sem trabalho de branding nesta etapa.

A interface deve ter três áreas simples:

- **Hoje:** data, lista de hábitos ativos, marcar/desmarcar com um toque e indicador discreto de salvamento. Botões suficientemente grandes; sem confirmação modal para cada check-in.
- **Histórico:** semana atual e navegação por semanas anteriores. Diferenciar concluído, não registrado e não aplicável. Datas futuras e dias anteriores à criação do hábito não são falhas. Não adicionar pontuações, rankings ou sequências nesta versão.
- **Ajustes:** criar, renomear e arquivar hábitos; exportar/importar backup; versão do app; diagnóstico de armazenamento e disponibilidade offline.

Todos os hábitos são diários neste MVP. Recorrência por dias da semana, metas quantitativas, correção de dias passados e sincronização ficam para uma etapa posterior. Arquivar preserva o histórico. Não invente a lista pessoal de hábitos de João: comece vazio, com criação simples, ou ofereça exemplos claramente opcionais.

Projetar para **320 × 568 CSS px**, verificando também o espaço menor disponível com as barras do Safari e com o teclado aberto. A tela física do modelo tem 4 polegadas e resolução de 640 × 1136 pixels. [S2]

Use tipografia do sistema, contraste legível, alvos de toque de pelo menos 44 × 44 CSS px e rolagem vertical natural. Não dependa só de cor para indicar conclusão. Evite fontes remotas, efeitos pesados, animações contínuas e componentes minúsculos. Não bloqueie o zoom por padrão.

## 4. Arquitetura e compatibilidade

Prefira HTML, CSS e JavaScript pequenos, sem framework de runtime se ele não trouxer benefício concreto. Caso use bundler/transpilador, configure explicitamente a saída para Safari/iOS 12 e verifique o código gerado, incluindo o service worker e as dependências. O alvo é o navegador antigo, não o Node instalado no computador.

Não use APIs ou sintaxe modernas sem verificar suporte e fornecer alternativa. Não faça o funcionamento essencial depender de instalação programática, compartilhamento de arquivos, acesso moderno ao sistema de arquivos ou execução em segundo plano. Detecte capacidades; em caso de incompatibilidade, mostre um erro útil, não uma tela branca.

**Persistência:** IndexedDB, com uma camada pequena e testável. Use IDs estáveis, versão de esquema e no máximo um check-in por hábito/data. Serializar alterações concorrentes e confirmar o salvamento após a transação concluir. Falha de escrita deve ser visível; nunca mostrar um check como salvo se a gravação falhou. Não troque silenciosamente para um banco vazio ou para outro mecanismo de armazenamento.

Modelo mínimo sugerido, adaptável à implementação:

```text
schemaVersion
habits: id, name, createdOn, archivedOn
checkins: habitId, localDate, completedAt
settings: locale, weekStartsOn
```

Use datas de calendário local no formato `YYYY-MM-DD`, calculadas pelos componentes locais da data. Não derive o dia com `toISOString().slice(0, 10)`, que usa UTC. O relógio/fuso do aparelho é a referência; oriente João a configurá-lo corretamente. Recalcule “hoje” ao abrir, voltar do repouso ou retomar a página. Não use um timer em segundo plano para “zerar hábitos”: a data define quais registros aparecem.

**Offline:** implementar service worker clássico e cache dos recursos essenciais do app. O suporte para esse mecanismo chegou ao Safari/iOS na geração do iOS 11.3. Adicionar um ícone à tela inicial, sozinho, não implementa funcionamento offline. [S3]

Somente indicar “disponível offline” depois de verificar os recursos essenciais em cache e o controle da página pelo worker. Cobrir a primeira instalação, reabertura, navegação e atualização. Uma atualização interrompida deve preservar a versão utilizável anterior. Não recarregar no meio de uma gravação. Nunca limpar o banco do usuário ao atualizar os arquivos do app.

Todos os recursos essenciais devem ser locais ao projeto, sem CDN, fontes externas ou dependências de rede em cada abertura. Não usar cache de páginas como substituto do banco de hábitos.

Inclua viewport, `apple-touch-icon`, configuração Apple para abertura como web app e um manifest simples. A documentação arquivada da Apple descreve as metatags de modo standalone. Valide o comportamento no aparelho; não assuma que um manifest moderno resolve tudo no iOS 12. [S4]

## 5. Backup é parte do produto

Armazenamento web não é cópia permanente garantida. O navegador pode remover dados sob determinadas condições; limpeza manual dos dados do site também é um risco. Além disso, cache e registros do service worker podem ser removidos após inatividade. Não aplique ao iOS 12 regras específicas de versões mais novas como se fossem universais. [S3, S5]

Implemente exportação **JSON versionada** com todos os hábitos, registros e ajustes; CSV é opcional, não necessário. Implemente importação com validação de esquema, datas, IDs, duplicatas e referências. Rejeitar arquivo inválido sem alterar o banco. Nesta versão, importar substitui o conjunto inteiro, com confirmação explícita e oferta de backup do estado anterior; não inventar merge silencioso.

O fluxo de exportação precisa funcionar no próprio iPod. Não presuma que um botão de download ou compartilhamento tenha o mesmo comportamento de um navegador atual. Como contingência, ofereça JSON integral selecionável e importação por colagem, além de arquivo quando suportado. Trate os dados importados como dados, nunca como HTML executável.

**Critério real:** o usuário consegue guardar uma cópia fora do armazenamento desse site, preferencialmente fora do iPod, e restaurá-la em uma instalação limpa. Apenas exibir texto na tela não conta como backup concluído. Documente o caminho efetivamente testado de transferência; não envie hábitos para um servidor sem aprovação.

Não presuma que Safari e o ícone da tela inicial compartilhem dados em todos os casos. Teste os dois contextos, escolha um como principal antes do uso real e documente exportação/importação para eventual migração.

## 6. Entrega e hospedagem

Entregue um build estático, pequeno e reproduzível, com dependências fixadas quando existirem. O app não precisa manter o computador ligado para cada registro depois de instalado e validado offline, desde que os recursos armazenados permaneçam disponíveis. Documente que recuperar uma instalação cujo cache foi removido pode exigir reconexão.

Para instalação no iPod, use **HTTPS com certificado confiável pelo aparelho** e um endereço estável. Service workers exigem contexto seguro; a exceção de desenvolvimento para localhost não transforma um IP HTTP da rede local em um endereço seguro para outro dispositivo. [S6]

Não entregue `localhost` do computador como endereço utilizável no iPod. Não trate `file://`, ZIP aberto diretamente, certificado com aviso ignorado ou servidor HTTP de desenvolvimento como solução offline validada.

Reutilize hospedagem já autorizada, se houver. Caso não exista, deixe os artefatos e o procedimento prontos e indique exatamente qual autorização falta. Não publique automaticamente só porque alguma credencial está disponível. Não há backend de hábitos no MVP; a hospedagem distribui apenas os arquivos do aplicativo.

Evite trocar domínio, protocolo ou porta depois do início do uso. Armazenamento é associado à origem; uma nova origem não deve ser apresentada como se contivesse os registros anteriores. Prepare migração por backup quando necessário. [S5]

## 7. Configuração manual do iPod — nesta ordem

O agente prepara e orienta. Não afirme que alterou fisicamente o aparelho sem acesso e evidência.

### A. Antes de apagar

1. Confirmar acesso ao código do aparelho e à conta Apple vinculada, sem solicitar que João envie senhas ao chat. Salvar fotos, músicas e outros dados que importem.
2. Conferir `Ajustes → Geral → Atualização de Software` e registrar a versão instalada. Fazer backup antes de uma atualização ou apagamento.
3. Abrir o tracker pelo endereço HTTPS no Safari normal, não em sessão privada. Criar registros de teste e validar salvamento, funcionamento offline e recuperação de backup.
4. Testar também a abertura pelo ícone da tela inicial e identificar o contexto principal de uso. Nenhum passo de apagamento deve ser condição para descobrir se o app funciona.

### B. Apagar e configurar como novo — opcional e destrutivo

Depois de validar o app e obter confirmação de João sobre o backup, orientar: `Ajustes → Geral → Redefinir → Apagar Conteúdo e Ajustes`. Na configuração seguinte, escolher novo iPod em vez de restaurar automaticamente todo o ambiente anterior. Esse é o caminho documentado para iOS 12. [S7]

A formatação não é necessária para o rastreador funcionar. Serve apenas para deixar o dispositivo limpo. Se houver bloqueio de ativação, usar a recuperação oficial da conta; não tentar contornar a proteção.

### C. Instalar e dedicar

Com Wi-Fi, data e hora corretos, abrir a URL no Safari. Usar `Compartilhar → Tela de Início` e abrir o novo ícone ainda conectado para concluir sua preparação offline. Esse atalho é documentado no manual do iOS 12. [S8]

Repetir o teste offline no contexto escolhido. Importar dados reais somente após validá-lo. Organizar a tela inicial e reduzir notificações desnecessárias, sem alterar ou excluir contas sem autorização.

Para Acesso Guiado no iOS 12: `Ajustes → Geral → Acessibilidade → Acesso Guiado`; ativar e definir um código. Abrir o tracker, acionar o atalho de acessibilidade pelo botão de Início e iniciar a sessão. Para encerrar, pressionar Início três vezes e informar o código. [S9]

Testar o Acesso Guiado no modo standalone. Se não funcionar adequadamente, usar Safari normal com o tracker aberto e mascarar apenas os controles de navegação, sem bloquear a lista, a rolagem ou o teclado necessário. Registrar o modo realmente testado. A Apple permite restringir áreas da tela e botões. [S9]

Manter uma forma conhecida de sair e de colocar o aparelho em repouso. Não prometer boot automático direto no tracker, bloqueio permanente ou funcionamento idêntico após reinicialização. Testar repouso/despertar e reinício. Não manter a tela permanentemente acesa como solução padrão.

## 8. Validação e critério de conclusão

Automatize onde houver infraestrutura, sem confundir emulação de tamanho de tela com Safari antigo. Um navegador WebKit atual não comprova compatibilidade com o iOS 12.

Checklist mínimo:

- [ ] Criar, renomear, marcar, desmarcar e arquivar; histórico preservado.
- [ ] Tocar repetidamente sem duplicar registros ou perder alterações.
- [ ] Fechar completamente e reabrir sem perder os check-ins.
- [ ] Desligar Wi-Fi, reabrir, registrar e consultar histórico.
- [ ] Reiniciar o iPod com Wi-Fi desligado e repetir o fluxo.
- [ ] Retomar após repouso e mudança de dia; testar meia-noite, fim de mês e ano.
- [ ] Exportar, guardar a cópia fora do site e importar em banco limpo de teste.
- [ ] Importação inválida e falha de gravação não destroem dados existentes.
- [ ] Atualização do app mantém histórico; rede interrompida não inutiliza a versão anterior.
- [ ] Layout utilizável a 320 px, com teclado e nos contextos Safari/standalone.
- [ ] Entrar/sair do Acesso Guiado; repouso/despertar sem perder funcionalidade.
- [ ] Nenhum hábito enviado para rede; nenhuma dependência remota essencial.

Realize testes destrutivos apenas com dados de teste ou depois de backup restaurável confirmado. Não limpe dados reais para demonstrar que o backup funciona.

Sem acesso ao hardware, execute o que for possível e marque o restante como **pendente de validação no iPod**. Não declare “pronto para uso” com base apenas em build verde, capturas de desktop ou testes em navegador moderno. O critério é funcionar no aparelho de João.

## 9. Artefatos e resposta final do agente

Entregar no repositório real:

- Código e build estático; comandos exatos para instalar dependências, desenvolver, testar e gerar build, compatíveis com a estrutura encontrada.
- `README.md` com arquitetura mínima, premissas e limites.
- `CONFIGURAR-IPOD.md` com URL real, quando autorizada, passos manuais e modo validado.
- `BACKUP-E-RECUPERACAO.md` com exportação, transferência, restauração e atualização segura.
- `VALIDACAO.md` com testes executados, resultados, versão de iOS, contexto e pendências reais.

Na resposta final, informe caminho do projeto, o que está implementado, evidências de teste, como abrir/instalar e o único próximo passo manual necessário. Diferencie **build concluído**, **deploy realizado** e **validado no iPod**. Não os trate como sinônimos. Não alegue testes, publicação ou configuração que não ocorreram.

**Comece pela inspeção mínima do ambiente e por uma primeira fatia funcional: criar hábito → marcar → salvar → fechar → reabrir. Depois implemente offline, backup, instalação e validação.**

## Referências técnicas

Fontes consultadas em 18/09/2026. Documentação arquivada deve ser usada para o comportamento da época; suporte e configuração reais devem ser verificados no dispositivo.

[S1] Apple — Versões de segurança; iOS 12.5.8 e modelos compatíveis.  
`https://support.apple.com/pt-br/100100`

[S2] Apple — iPod touch (6th generation), especificações técnicas.  
`https://support.apple.com/en-us/112023`

[S3] WebKit — Workers at Your Service; suporte inicial, ciclo de vida e descarte de cache.  
`https://webkit.org/blog/8090/workers-at-your-service/`

[S4] Apple Developer, arquivo — Configuring Web Applications.  
`https://developer.apple.com/library/archive/documentation/AppleApplications/Reference/SafariWebContent/ConfiguringWebApplications/ConfiguringWebApplications.html`

[S5] MDN — Storage quotas and eviction criteria; comportamento geral, não matriz histórica de iOS 12.  
`https://developer.mozilla.org/en-US/docs/Web/API/Storage_API/Storage_quotas_and_eviction_criteria`

[S6] MDN — Service Worker API; contexto seguro e instalação.  
`https://developer.mozilla.org/en-US/docs/Web/API/Service_Worker_API`

[S7] Apple — Apagar todo o conteúdo e ajustes do iPod touch; manual iOS 12.  
`https://support.apple.com/pt-br/guide/ipod-touch/iph7a2a9399b/12.0/ios/12.0`

[S8] Apple — Favoritos e ícone na tela de Início; manual iOS 12.  
`https://support.apple.com/pt-br/guide/ipod-touch/iph42ab2f3a7/12.0/ios/12.0`

[S9] Apple — Acesso Guiado no iPod touch; manual iOS 12.  
`https://support.apple.com/pt-br/guide/ipod-touch/iph7fad0d10/12.0/ios/12.0`
