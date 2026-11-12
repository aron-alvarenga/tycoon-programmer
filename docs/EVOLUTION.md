> **Histórico superado:** a experiência ativa voltou à carreira dev na versão 0.4, conforme o guia original. Consulte [CAREER_ALIGNMENT.md](CAREER_ALIGNMENT.md). O texto abaixo registra uma direção anterior.

> **Versão atual 0.3:** a direção ativa é o tycoon de estúdio e produtos descrito em [TYCOON.md](TYCOON.md). O conteúdo abaixo registra a etapa anterior e não representa toda a experiência atual.

﻿# Diagnóstico e evolução do Programmer Simulator

## Problema encontrado

O projeto tinha uma boa base técnica: motor separado de React, RNG determinístico, conteúdo validado, persistência versionada e testes. O loop, porém, não fechava seus circuitos:

- Habilidades subiam sem aumentar o avanço das tarefas.
- Os cargos existiam apenas como conteúdo; não havia promoção.
- Caixa, receita e salário não participavam de uma economia operacional.
- Bugs e dívida aumentavam sem ações corretivas.
- Encerrar o dia consumia energia, criando desgaste mesmo quando o jogador tentava se recuperar.
- A seleção automática da primeira tarefa eliminava priorização.
- Eventos tinham textos e opções, mas não eram executados.
- A interface tratava todas as estatísticas como igualmente importantes; o jogador precisava deduzir a próxima ação.
- Tooltips prometiam demissão, burnout e ultimatos inexistentes.

## Direção adotada

O foco desta versão é um tycoon de carreira: priorizar uma entrega, escolher o ritmo, administrar a produção, desenvolver habilidades e conquistar o próximo cargo. Essa identidade vem antes de adicionar contratação, escritório ou outros sistemas do GDD original.

As referências de design usadas foram [Improving Player Choices](https://www.gamedeveloper.com/design/improving-player-choices), sobre decisões e consequências ligadas ao objetivo, e o [relatório de progressão do Project Horseshoe 2014](https://www.projecthorseshoe.com/reports/ph14/Project_Horseshoe_2014_report_section_3.pdf), que relaciona progressão a diferenças percebidas entre iterações do loop em direção a metas. São critérios de avaliação; não garantem diversão sem playtests humanos.

## Implementado

1. Primeiro dia com uma entrega possível; duas ações por dia e recuperação noturna sustentável.
2. Backlog selecionável, progresso preservado na troca, dificuldade, prazo e recompensa visíveis.
3. Dois ritmos de trabalho com previsão calculada pelo motor. O atalho aumenta a velocidade e cobra bugs e dívida por bloco.
4. Correção de bugs e refatoração com aprendizado, satisfação e produtividade conectados.
5. Meta de sprint, bônus, reputação e resultado persistido.
6. Seis cargos, requisitos de habilidade e entregas, solicitação de promoção e salário crescente.
7. Economia diária com receita ajustada pela satisfação, cloud, folha, salário e retorno das entregas.
8. Três eventos existentes ativados, com efeitos declarativos, decisões visíveis e resolução única.
9. Nova interface com navegação entre mesa, carreira e empresa; resumo diário, orientação contextual e guia.
10. Save v3 com migração v1/v2 e validação adicional de atributos internos.

## Validação

- `npm run build`: TypeScript estrito e bundle de produção.
- `npm test`: testes de motor, conteúdo, calendário, RNG, formatação, ações e persistência.
- Simulação determinística de 240 dias com decisões de manutenção, estudo e entrega: alcança Arquiteto; backlog limitado; produção recuperável.
- Primeiro dia verificado em vinte seeds: a tarefa inicial é concluída em dois blocos cuidadosos.
- Testes de custo de atalhos, seleção e preservação de progresso, pagamento único, atraso, bônus, falha recuperável, promoções e eventos.
- Migração de saves anteriores preservando atributos existentes; rejeição de saves com campos internos inválidos.

A abertura do navegador para inspeção visual foi bloqueada pelas permissões do ambiente. Build e testes não substituem inspeção visual nem playtest humano. Há layouts responsivos em CSS, mas sua aparência precisa ser conferida no navegador.

## Roteiro de teste manual

1. Abra uma nova carreira. A primeira tarefa deve estar selecionada e mostrar o avanço previsto.
2. Trabalhe duas vezes: confirme a entrega, o caixa, o contador e os botões desativados.
3. Encerre o dia: confira a energia recuperada e os dois blocos novos.
4. Trabalhe em outra tarefa; troque a seleção e confirme que o progresso anterior permanece.
5. Compare os modos cuidadoso e atalho; use o atalho e confirme o aumento de bugs e dívida na tela da empresa.
6. Corrija bugs e refatore; confira custos e efeitos. Quando o indicador zerar, a ação correspondente fica indisponível.
7. Chegue ao dia 3: resolva o evento e confira os efeitos anunciados.
8. Estude Código, entregue três tarefas e solicite a promoção em Minha carreira. Confirme cargo e salário.
9. Termine o dia 10: confira resultado da sprint e reinício do contador.
10. Salve, recarregue a página e continue a carreira; confira também um save anterior, se disponível.
11. Inspecione larguras de 390, 768 e 1440 pixels; navegue por teclado e habilite movimento reduzido.

## Próxima evolução sugerida

- Playtests de 15–20 minutos para medir clareza, tempo até a primeira promoção e frequência de manutenção.
- Ampliar o catálogo de eventos com condições mais específicas, evitando repetição e alternativas dominantes.
- Tornar os cargos finais diferentes mecanicamente: delegação e planejamento de capacidade, antes de expandir os sistemas financeiros.
- Criar uma prova final e relatório de carreira que usem integridade, decisões e saúde da empresa.

O GDD original permanece como visão de longo prazo. Seus finais, liderança autônoma e demais sistemas não descritos como implementados acima ainda são propostas.

## Arquivos alterados

- Motor: `types.ts`, `state.ts`, `balance.ts`, `actions.ts`, `save.ts`, `index.ts`; novo `progression.ts`.
- Conteúdo: `events.json`, `lines.json`, `schema.ts`.
- Interface: `Workspace.tsx`, `TitleScreen.tsx`, `TopBar.tsx`, `copy.ts`, `styles.css`.
- Testes: `actions.test.ts`, `save.test.ts`; novo `progression.test.ts`.
- Documentação: `BALANCE.md`, `GDD.md`, este diagnóstico e `README.md`.
