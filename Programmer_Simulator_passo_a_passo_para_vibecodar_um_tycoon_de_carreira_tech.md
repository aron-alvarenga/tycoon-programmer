# Programmer Simulator: do Estagiário ao Arquiteto. Passo a passo para vibecodar um tycoon de carreira tech

Guia prático com explicação e prompts prontos para copiar. Este tipo de jogo é um dos mais amigáveis ao vibe coding: não tem física, animação nem arte pesada. O trabalho está em três coisas: **um modelo de simulação bem pensado, muito conteúdo (eventos) e balanceamento**. A IA ajuda muito nas três, desde que você a mantenha dentro de regras claras.

## O jogo em uma página

Você começa como estagiário e tenta chegar a Arquiteto. Cada semana traz tasks bugadas, legado, deploys quebrados, PO, sprint, burnout e eventos aleatórios. Cada escolha tem custo: **gambiarra** entrega rápido e agrada hoje, **refatorar** custa tempo agora e evita incêndios depois.

**Insight de design:** o jogo muda de gênero na promoção a Tech Lead.

- **Fase 1 (Estagiário até Sênior):** você é quem executa. O foco é suas skills, suas tasks, sua energia e sua reputação.
- **Fase 2 (Tech Lead e Arquiteto):** você decide pelos outros. O foco é sprint, time, conflitos, negócio e decisões arquiteturais com consequências de longo prazo.

Isso dá ao jogo duas metades diferentes e mantém o interesse. Também é por isso que o guia constrói primeiro o motor e a Fase 1, e só depois a liderança.

## Decisões de arquitetura (importantes para vibe coding)

1. **Stack:** TypeScript + React + Vite, roda no navegador e é fácil de publicar. Gerenciamento de estado simples (um store ou useReducer).
2. **Motor de simulação puro:** toda a lógica do jogo fica em `src/engine`, em TypeScript puro, sem React. A interface só lê o estado e envia ações. Isso permite testar e balancear sem abrir o navegador.
3. **Determinístico com seed:** um gerador de números aleatórios com seed. Assim você reproduz uma carreira inteira e depura bugs.
4. **Conteúdo em dados:** eventos, tasks, falas, promoções e decisões ficam em arquivos JSON em `src/data`, validados por esquema. Você adiciona conteúdo sem mexer em código.
5. **Balanceamento por simulação:** bots jogam milhares de carreiras e geram relatório (Passo 12). É a forma mais confiável de achar estratégias dominantes.

## Modelo de variáveis (ponto de partida)

**Jogador (0 a 100, salvo indicação):**

- Skills: Java, Spring, Docker, System Design, Soft Skills (e opcionalmente SQL e Cloud).
- Energia e Estresse (burnout).
- Reputação com: Chefe, Time, PO e Cliente.
- XP, nível de carreira e salário.

**Empresa:**

- Dívida técnica, bugs em produção (contagem), custo de cloud (R$/mês).
- Moral do time, satisfação do cliente, pressão do investidor.
- Caixa e runway (meses de caixa).

**Ligações que movem o jogo (ideia central):**

- Gambiarra aumenta a velocidade e a satisfação do PO, mas aumenta a dívida técnica.
- Dívida técnica alta aumenta a chance de incidente em produção e deixa as próximas tasks mais lentas.
- Incidente em produção derruba satisfação do cliente, moral e a sua energia, e atrai o investidor.
- Estresse alto reduz a eficiência e aumenta o risco de erro.
- Refatorar e documentar custam tempo hoje e reduzem os incêndios futuros.

Peça ao agente para escrever as fórmulas em `docs/BALANCE.md`, e ajuste os números nas simulações do Passo 12.

## Regras de ouro do vibe coding

1. Um passo por vez, com Git a cada passo que funciona.
2. Peça plano de 5 a 10 linhas antes de tarefas grandes.
3. Termine todo prompt com um critério de aceite ("Pronto quando: ...").
4. Peça testes para o motor. Um bug de balanceamento escondido é pior do que um bug visual.
5. Reporte bugs com contexto: o que fez, o que esperava, o que aconteceu, e a seed da partida.
6. Se o agente errar 3 vezes seguidas, reverta e reformule em uma conversa nova.
7. **Revise todo texto gerado.** É o conteúdo que dá personalidade ao jogo.

## Ferramentas sugeridas

- **Agente de código:** Claude Code ou Cursor.
- **Stack:** Node.js, Vite, React, TypeScript, Vitest (testes). Zod é bem-vindo para validar dados.
- **Conteúdo:** o próprio Claude para gerar e revisar eventos em lote.
- **Visual (opcional):** ícones e avatares pequenos em pixel art ou estilo flat, de um gerador de imagens. O jogo funciona bem só com uma interface de dashboard estilizada.
- **Publicação:** itch.io (HTML5), GitHub Pages ou Netlify.

---

## Passo 1: GDD de 3 páginas

Num chat normal com o Claude:

```
Atue como game designer sênior de simuladores e tycoons. Quero um GDD de 3 páginas para um jogo chamado Programmer Simulator: do Estagiário ao Arquiteto, um tycoon de carreira tech jogado no navegador.
Conceito: o jogador começa como estagiário e tenta chegar a Arquiteto, enfrentando tasks bugadas, legado, deploys quebrados, PO, sprints, burnout, dívida técnica, custo de cloud, bugs em produção e pressão de investidor.
Inclua: 3 pilares de design, loop de turno (dia, semana e sprint), variáveis do jogador e da empresa com faixas de valores, grafo de causa e efeito entre as variáveis, carreira com 6 níveis (Estagiário, Júnior, Pleno, Sênior, Tech Lead, Arquiteto) e critérios de promoção, 30 eventos iniciais com tags, escolhas morais (gambiarra ou refatorar), fase de liderança (sprint, conflitos de equipe, pressão do negócio, decisões arquiteturais), finais bons e ruins, e o que fica FORA do escopo.
Restrições: 1 pessoa usando IA, 4 a 6 semanas, sem arte pesada (interface de dashboard), humor ácido da cultura dev brasileira, sem nomes de empresas ou pessoas reais.
```

Salve como `docs/GDD.md`. Corte tudo que parecer grande demais.

---

## Passo 2: Projeto base e arquivo de regras

```
Crie um projeto novo com Vite + React + TypeScript.
Requisitos:
- Pastas: src/engine (lógica pura, sem importar React), src/data (JSON de eventos, tasks, promoções), src/ui (componentes), src/store (ponte entre engine e UI), tests.
- Gerador de números aleatórios com seed em src/engine/rng.ts. Proibido Math.random() dentro de src/engine.
- Configure Vitest e um teste de exemplo.
- Tela inicial com um título e um botão Nova Carreira que mostra o estado inicial em JSON (apenas para debug).
- Salvamento em localStorage com um campo de versão do save.
Pronto quando: npm run dev abre a tela, npm test passa e a mesma seed gera sempre o mesmo estado.
Explique em 5 linhas a estrutura criada. Não adicione outras bibliotecas sem pedir.
```

Crie o `CLAUDE.md` na raiz:

```
# Programmer Simulator: regras do projeto
- Stack: Vite + React + TypeScript; testes com Vitest; Zod permitido para validar dados.
- src/engine é lógica pura (sem React, sem DOM, sem Math.random). A UI só lê o estado e envia ações.
- Toda aleatoriedade usa o RNG com seed em src/engine/rng.ts.
- Conteúdo (eventos, tasks, falas, promoções) fica em src/data, validado por esquema. Nada de texto de jogo hardcoded no engine.
- Fórmulas e números de balanceamento ficam em src/engine/balance.ts e documentados em docs/BALANCE.md.
- Todo sistema novo vem com testes.
- Antes de tarefas grandes, apresente um plano de 5 a 10 linhas e espere aprovação.
- Ao terminar, liste os arquivos alterados e como testar.
- Textos do jogo em português do Brasil, com humor ácido e sem nomes reais; identificadores em inglês.
```

---

## Passo 3: Motor de simulação por turnos

**Por que:** o coração do jogo é uma função que recebe o estado e uma ação e devolve o novo estado. Se isso estiver sólido e testado, o resto é conteúdo e interface.

```
Implemente o motor em src/engine.
- Tipos: PlayerState, CompanyState, GameState (dia, semana, sprint, seed, flags, histórico).
- Variáveis conforme o GDD (docs/GDD.md), com valores limitados às faixas definidas.
- Função pura applyAction(state, action, rng) que devolve novo estado e um log de mensagens. Ações iniciais: trabalhar na task, estudar uma skill, descansar, ajudar um colega, passar o dia.
- Função advanceDay(state, rng) que consome energia, aplica efeitos passivos e avança o calendário (dia, semana, sprint de 2 semanas).
- Todo efeito numérico passa por src/engine/balance.ts.
- Testes: o estado nunca sai das faixas, a mesma seed gera a mesma carreira, descansar reduz estresse e estudar aumenta a skill com retorno decrescente.
Pronto quando: um script de teste simula 100 dias sem erros e imprime um resumo do estado.
Antes de codar, apresente um plano e a lista de fórmulas propostas para eu aprovar.
```

---

## Passo 4: Interface de dashboard

```
Crie a interface do jogo em src/ui, com o visual de um ambiente de trabalho dev:
- Barra superior: nome do cargo, dia/semana/sprint, salário, caixa da empresa.
- Painel Você: skills, energia, estresse e reputação como barras com tooltips.
- Painel Quadro de tasks estilo Kanban (A fazer, Em andamento, Em produção).
- Painel Empresa: dívida técnica, bugs em produção, custo de cloud, moral do time e pressão do investidor.
- Feed de mensagens estilo chat da empresa (log do motor), com as mais recentes no topo.
- Botões de ação do dia.
- Tema escuro por padrão, fonte monoespaçada nos números, layout responsivo e acessível (contraste e navegação por teclado).
Pronto quando: consigo jogar 30 dias só pela interface, vendo cada ação alterar as barras com uma animação curta de variação (+2, -5).
Não coloque lógica de jogo na interface.
```

**Dica:** pergunte "o que eu não consigo ver na tela e deveria?". Em jogos de simulação, números invisíveis frustram o jogador.

---

## Passo 5: Tasks e a escolha moral (gambiarra ou refatorar)

```
Implemente o sistema de tasks.
- Modelo da task: id, título, descrição com humor (task mal escrita), tipo (feature, bug, legado, infra), dificuldade 1 a 10, skills exigidas, prazo em dias, valor de negócio e risco de efeito colateral.
- Cada semana o backlog recebe novas tasks, definidas em src/data/tasks.json.
- Ao pegar uma task, o jogador escolhe a abordagem:
  1. Gambiarra: mais rápida, aumenta a dívida técnica e o risco de bug em produção, agrada o PO.
  2. Fazer direito: leva mais dias, aumenta a skill ligada à task e reduz a dívida técnica.
  3. Pedir ajuda: custa reputação com o Time, mas reduz o risco e acelera o aprendizado.
  4. Empurrar para o próximo sprint: reduz o estresse agora e desagrada o PO.
- O resultado depende da skill do jogador contra a dificuldade, com uma chance de falha que cai com a skill e sobe com o estresse.
- Registre cada escolha no histórico (ela volta no Passo 9).
Pronto quando: testes mostram que gambiarra traz ganho de curto prazo e custo de longo prazo em 100 simulações, e nenhuma abordagem é sempre a melhor.
```

---

## Passo 6: Dívida técnica, produção, deploy e cloud

```
Implemente a simulação da empresa.
- Dívida técnica (0 a 100): sobe com gambiarras, documentação inexistente e pressa; reduz com refatoração e testes. Afeta a velocidade das tasks e a chance de incidente.
- Bugs em produção: cada incidente cria um bug que precisa ser resolvido, vira uma task urgente e, enquanto aberto, reduz a satisfação do cliente.
- Deploy: ação com risco calculado pela dívida técnica, cobertura de testes, dia da semana e hora. Deploy na sexta às 17h tem risco muito maior e gera um evento específico se der errado.
- Custo de cloud (R$/mês): cresce com o uso e com decisões ruins (consultas pesadas, serviços esquecidos ligados). Impacta o caixa e a pressão do investidor.
- Todas as fórmulas em balance.ts, comentadas em docs/BALANCE.md.
Pronto quando: uma simulação de 6 meses com estratégia gambiarreira acumula incidentes e uma com estratégia equilibrada fica estável.
```

---

## Passo 7: Motor de eventos aleatórios (data-driven)

**Por que:** os eventos são o que torna cada carreira diferente. O motor precisa ser genérico e o conteúdo vai para JSON.

```
Implemente o motor de eventos em src/engine/events.ts.
Esquema de cada evento (salvo em JSON e validado com Zod): id, título, texto, tags, peso, condições (nível mínimo e máximo, faixas de variáveis, flags exigidas ou proibidas, dia da semana), cooldown em dias, lista de escolhas.
Cada escolha tem: texto, requisito opcional (ex.: Docker maior que 40), efeitos (variações nas variáveis do jogador e da empresa), chance de sucesso influenciada por skills, efeitos alternativos em caso de falha, flags definidas e consequências atrasadas (efeito que acontece N dias depois).
O sorteio usa o RNG com seed, respeita pesos, condições e cooldown, e dá mais peso a eventos que combinam com o estado atual (muita dívida técnica puxa incidentes).
UI: modal do evento com as escolhas, mostrando requisitos e riscos de forma clara.
Pronto quando: 10 eventos de exemplo funcionam e testes garantem que as condições e os cooldowns são respeitados.
```

**Pacote inicial de eventos** (use como base para gerar o conteúdo): produção caiu; cliente ligando; mudança de escopo; dev saiu da empresa; documentação inexistente; query rodando há 3 horas; deploy sexta-feira 17h; funciona na minha máquina; PO quer só uma coisinha; reunião que poderia ser e-mail; code review de 2000 linhas; conta de cloud estourou; alerta às 3h da manhã; migração sem rollback; chave de API vazada no repositório; hotfix direto na main; recrutador no LinkedIn; demo para o investidor.

### Gerando conteúdo em lote

```
Gere 20 eventos para o jogo no esquema de src/data/events.schema.ts, em português do Brasil, com humor ácido da cultura dev. Use estes temas: [cole a lista do pacote inicial].
Regras: cada evento tem 2 a 4 escolhas com custos assimétricos (nenhuma escolha é sempre a melhor); pelo menos 30% dos eventos têm consequência atrasada; varie os níveis de carreira e as tags; nada de nomes reais de empresas, pessoas ou ferramentas pagas citadas de forma depreciativa.
Entregue em JSON válido. Depois rode o script de validação e corrija os erros.
```

Peça também um script `npm run validate:data` que valida todos os JSON de `src/data` e acusa referências quebradas.

---

## Passo 8: Skills, carreira e promoções

```
Implemente skills e carreira.
- Skills: Java, Spring, Docker, System Design e Soft Skills. Estudar e trabalhar aumentam a skill com retorno decrescente. Skills podem enferrujar com o desuso.
- Níveis: Estagiário, Júnior, Pleno, Sênior, Tech Lead, Arquiteto.
- Ciclo de avaliação a cada 8 semanas: o motor calcula nota de desempenho com base em skills, tasks entregues, incidentes causados, reputação e flags de decisões.
- Promoção quando os critérios de src/data/careers.json são atendidos. Ponto de partida para Júnior para Pleno: Java 40, Spring 35, reputação 50 e 8 tasks entregues sem incidente grave. Aumente a exigência a cada nível, e a partir de Sênior exija Soft Skills e System Design.
- Resultados possíveis na avaliação: promoção, manutenção, plano de melhoria, demissão.
- Tela de avaliação com feedback do gestor, claro sobre o que faltou.
Pronto quando: uma estratégia equilibrada chega a Sênior em cerca de 2 anos de jogo e uma gambiarreira é barrada.
```

---

## Passo 9: Consequências de longo prazo e Livro de Decisões

**Por que:** é o que dá peso moral às escolhas. Gambiarra boa hoje volta como incêndio daqui a dois meses.

```
Implemente o agendador de consequências em src/engine/consequences.ts.
- Uma fila de efeitos futuros com dia de disparo, condição e mensagem.
- Eventos e escolhas podem agendar consequências. Exemplo: gambiarra sem testes agenda um possível incidente em 2 a 6 semanas, com probabilidade proporcional à dívida técnica no momento.
- Quando a consequência dispara, a mensagem referencia a decisão original ("Lembra daquele deploy sem teste?").
- Tela Livro de Decisões: lista das escolhas relevantes, com data, o que você decidiu e a consequência (ou "ainda pendente").
Pronto quando: 5 escolhas diferentes geram consequências atrasadas que aparecem no Livro de Decisões.
```

---

## Passo 10: Fase de liderança (Tech Lead e Arquiteto)

Aqui o jogo muda de gênero. Peça um plano antes de implementar.

```
Implemente a fase de liderança, ativada ao chegar em Tech Lead. Antes de codar, apresente um plano de 10 linhas.
Sistemas:
1. Sprint: planejamento com capacidade do time contra o backlog; o jogador escolhe o que entra, o que corta e o que vai para dívida técnica. Fim de sprint com entrega, retrospectiva e métricas.
2. Time: 4 a 6 membros gerados com perfil (estagiário, pleno, sênior, especialista, desmotivado), skills, moral e traços (perfeccionista, apressado, lobo solitário, mentor). Cada membro entrega e se desgasta de forma diferente.
3. Conflitos de equipe: eventos entre membros (discussão sobre padrões, code review agressivo, injustiça na divisão de tasks). O jogador media, escolhe um lado ou ignora, e cada opção tem custo.
4. Pressão do negócio: o PO e a diretoria pedem prazos e escopo; o jogador negocia, cede ou protege o time.
5. Decisões arquiteturais (ADRs): o jogador escolhe entre opções como monólito ou microsserviços, fila ou chamada síncrona, cache ou banco, banco relacional ou NoSQL. Cada decisão tem custo inicial, custo de cloud, complexidade, escalabilidade e riscos que aparecem ao longo de meses, ligados ao Livro de Decisões.
6. Em Arquiteto: menos execução e mais decisões de maior impacto (padrões da empresa, migração de legado, escolha de plataforma) com reflexo de longo prazo.
Pronto quando: consigo jogar 3 sprints completos como Tech Lead, com o time reagindo às minhas decisões.
```

---

## Passo 11: Investidor, caixa e finais

```
Implemente a camada de negócio e os finais.
- Caixa e runway: receita, salários, cloud e custos extras mensais. Se o runway acaba, a empresa entra em crise.
- Pressão do investidor (0 a 100): sobe com prazos estourados, incidentes e queima de caixa; gera eventos de reunião de diretoria com metas e ultimatos.
- Finais: (a) Arquiteto com empresa saudável; (b) Arquiteto de PowerPoint (cargo alto, empresa em ruínas); (c) burnout e afastamento; (d) demitido; (e) empresa vendida ou falida; (f) saída para uma startup própria.
- Tela final com Relatório de Carreira: tempo de jogo, promoções, incidentes, dívida técnica final, melhores e piores decisões e uma frase de resumo com humor.
Pronto quando: os 6 finais são alcançáveis em simulações automáticas.
```

---

## Passo 12: Balanceamento por simulação

**Por que:** é aqui que simuladores se ganham ou se perdem. Humanos não testam 1000 carreiras; bots testam.

```
Crie um simulador headless em scripts/simulate.ts (roda no Node, sem UI).
- Três bots: Gambiarreiro (sempre escolhe a opção rápida), Perfeccionista (sempre refatora) e Equilibrado (decide pela situação).
- Rode 1000 carreiras por bot, com seeds diferentes.
- Relatório em docs/BALANCE_REPORT.md: tempo médio até cada promoção, distribuição dos finais, incidentes por carreira, dívida técnica média, e quantas carreiras acabaram em burnout ou demissão.
- Sinalize estratégias dominantes: se um bot vence quase sempre ou quase nunca.
Pronto quando: npm run simulate imprime o relatório. Depois proponha ajustes de balance.ts em uma lista, sem aplicar.
```

**Metas de partida:** o Equilibrado deve vencer na maioria das vezes mas não sempre, o Gambiarreiro deve ir bem no começo e mal no fim, e o Perfeccionista deve ser lento e vulnerável a investidor. Ajuste em ciclos de simular, revisar e alterar um parâmetro.

---

## Passo 13: Polimento

```
Implemente o pacote de polimento:
- Tutorial curto nos primeiros dias, mostrando cada painel e a ideia de escolha com custo.
- Conquistas com humor (por exemplo: Funciona na minha máquina, Deploy na sexta e sobreviveu, Reunião que poderia ser e-mail).
- Tooltips em toda variável explicando o que ela afeta.
- Opções: velocidade de texto, tema claro ou escuro, tamanho de fonte, reduzir animações.
- Sons discretos (notificação, alerta de produção, promoção).
- Salvar e continuar, com versão do save e migração simples.
- Botão Compartilhar Relatório de Carreira: gera um texto ou imagem do resumo final.
Pronto quando: alguém que nunca viu o jogo entende o que fazer em 2 minutos sem ajuda.
```

**Visual opcional:** avatares do estagiário ao arquiteto (um sprite por nível) e ícones de status, em pixel art. Peça a um gerador de imagens: pixel art 64x64, busto de desenvolvedor, estilo flat, paleta limitada, cinco versões (estagiário de moletom, júnior de camiseta, sênior de camisa, tech lead de blazer casual, arquiteto grisalho com café), mesmo estilo e mesma paleta.

---

## Passo 14: Publicação e feedback

```
Configure o build de produção (npm run build) para publicar em GitHub Pages ou itch.io como HTML5, com caminho base configurável.
Adicione contadores locais (sem rastreamento de terceiros) de qual final o jogador atingiu e em que dia ele abandonou, exportáveis em JSON, para eu analisar o playtest.
Pronto quando: o jogo roda publicado e consigo exportar os contadores de uma sessão de teste.
```

Peça a 5 pessoas que joguem uma carreira inteira e anote: onde riram, onde repetiram eventos, quando sentiram injustiça e quando quiseram parar.

---

## Roteiro sugerido (5 a 6 semanas, tempo parcial)

1. **Semana 1:** Passos 1 a 3 (GDD, projeto, motor).
2. **Semana 2:** Passos 4 a 6 (interface, tasks, dívida técnica e cloud).
3. **Semana 3:** Passos 7 a 9 (eventos, skills e promoções, consequências).
4. **Semana 4:** Passos 10 e 11 (liderança e finais).
5. **Semana 5:** Passo 12 (simulação e balanceamento, com mais conteúdo de eventos).
6. **Semana 6:** Passos 13 e 14 (polimento e publicação).

---

## Armadilhas comuns

- **Motor misturado com a interface:** impede testar e balancear. Mantenha o motor puro.
- **Estratégia única que sempre vence:** descubra pela simulação, não pelo achismo.
- **Eventos repetitivos:** use cooldowns, pesos por estado e muito conteúdo variado. Meta: 80 a 120 eventos para uma carreira completa.
- **Números invisíveis:** o jogador precisa ver o que cada decisão mudou.
- **Muito texto de uma vez:** textos curtos, com piada rápida e escolha clara.
- **Fórmulas espalhadas:** concentre tudo em `balance.ts` e `BALANCE.md`.
- **Fase de liderança grande demais:** entregue um sprint completo antes de acrescentar mais sistemas.

---

## Prompts de manutenção

**Reportar um bug:**

```
Bug: [o que aconteceu]. Esperado: [o que deveria acontecer]. Seed: [número]. Passos para reproduzir: [lista].
Antes de corrigir, explique a causa provável em 3 linhas e escreva um teste que reproduza o bug. Corrija com a menor mudança possível. Não refatore nada fora disso.
```

**Ajustar balanceamento:**

```
Com base em docs/BALANCE_REPORT.md, o bot [nome] vence em [X]% das carreiras. Proponha 3 ajustes pequenos em src/engine/balance.ts para chegar em [meta]%, com o efeito esperado de cada um. Não aplique antes de eu escolher; depois rode npm run simulate e compare os relatórios.
```

**Revisar conteúdo:**

```
Revise src/data/events.json: aponte eventos repetitivos, escolhas estritamente melhores que as outras, textos longos demais, piadas ofensivas e nomes reais. Liste os problemas por prioridade e sugira as correções, sem aplicar.
```

---

## Cuidados

- **Sátira, sem alvos reais:** não use nomes de empresas, produtos ou pessoas reais de forma depreciativa. Use nomes fictícios.
- **Conteúdo gerado por IA:** revise tudo antes de publicar. Algumas lojas pedem declaração de uso de IA; confira a regra vigente da plataforma.
- **Originalidade:** o gênero tycoon é amplo e livre, mas não copie textos, interface ou arte de outros jogos.
- **Imagens e sons:** confira a licença de qualquer asset gerado ou baixado e guarde um registro da origem.

## Próximo passo

Faça os Passos 1 a 4 em um fim de semana e jogue 30 dias pela interface. Se a ideia de escolher entre gambiarra e refatorar já parecer interessante com barras e texto, o projeto tem base para virar um jogo completo.
