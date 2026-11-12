# Alinhamento com o guia original — versão 0.4

## Fonte de verdade

`Programmer_Simulator_passo_a_passo_para_vibecodar_um_tycoon_de_carreira_tech.md`, na raiz, define a experiência. O desvio para fundar um estúdio foi corrigido. O jogador é um dev empregado que sobe de Estagiário a Arquiteto; o salto de Tech Lead muda as regras para liderança.

O arquivo original foi preservado. A apresentação isométrica atende ao pedido posterior por aparência de jogo, sem substituir o tema de carreira por vendas de software.

## O que mudou de fato

| Tema do guia | Implementação atual |
|---|---|
| Dois modos de jogo | Execução individual até Sênior; planejamento e execução autônoma do time a partir de Tech Lead |
| Seis cargos | Capítulos, missões, requisitos, salários e ambientes vinculados ao nível |
| Escolhas nas tasks | Fazer direito, gambiarra, pedir ajuda e negociar prazo, com custos assimétricos |
| Avaliação | Automática a cada oito semanas, com promoção, manutenção ou alerta e feedback dos critérios |
| Reputação e qualidade | Confiança, entregas, habilidades, dívida e incidentes participam da promoção |
| Livro de Decisões | Histórico de abordagens, eventos, planejamento e ADRs; origem e resultado das consequências |
| Consequências atrasadas | Cinco famílias: gambiarra, testes, troca de conhecimento, negociação e arquitetura |
| Liderança | Quatro membros com proficiência, moral e traços; capacidade, política de ritmo, execução e apoio |
| Arquitetura | Monólito modular ou microsserviços, com custo inicial, capacidade, dívida e cloud posterior |
| Prova de Arquiteto | Vinte dias no cargo, ADR e seis entregas do time; saúde da operação define o resultado |
| Finais | Seis tipos, verificados por testes |
| Conteúdo e seed | Doze tasks, dez eventos, seis capítulos; conteúdo validado e reprodução determinística |
| Simulação | Mil carreiras para cada um dos três bots e relatório de extremos |

## O que foi retirado da experiência principal

- Nome e marca fixa de empresa que não pertenciam à intenção do usuário.
- Começo como dono de garagem/estúdio.
- Escolha comercial de websites, apps e SaaS para venda própria.
- Fãs, receitas pessoais de produtos, compra de sala e hardware como eixo de progressão.

Os módulos de estúdio continuam arquivados para preservar e testar o histórico do projeto. Seus comandos não alteram uma carreira dev. A interface não os oferece.

## Cobertura e limites

Esta é a implementação do núcleo das duas fases, não a conclusão literal de todos os quatorze passos de uma produção de várias semanas.

- Habilidades são quatro grupos (Java/Spring, Docker/Cloud, System Design, Soft Skills), não cinco habilidades independentes com enferrujamento.
- A dificuldade atual vai de um a cinco. Não há rolagem de falha por task nem deploy separado com cobertura de testes e risco de sexta-feira.
- Eventos respeitam nível mínimo e cooldown. Pesos contextuais, requisitos opcionais por escolha, flags e condições arbitrárias ainda não compõem um motor completo.
- A liderança usa planejamento de escopo e política de ritmo. Ainda não há contratação, saída individual de membros, habilidade por tecnologia de cada pessoa ou um sistema completo de negociação com a diretoria.
- Há uma família de ADR com duas opções, não todas as combinações do guia.
- O tutorial está disponível como ajuda curta. Sons, configurações de acessibilidade adicionais, conquistas e publicação não foram entregues nesta revisão.
- A calibração ainda precisa evoluir. O bot equilibrado vence com facilidade e o gambiarreiro permanece extremo; o tempo até Sênior é menor que o alvo de aproximadamente dois anos.
- Não foi realizada inspeção visual em um navegador controlado neste ambiente. Build e simulação não substituem essa inspeção nem playtests.

## Validação executada

- Build de produção e TypeScript estrito.
- `npm run validate:data`: referências e formato dos conteúdos.
- 67 testes, incluindo: abordagens, atraso de efeitos, promoção automática, reputação bloqueando promoção, orçamento de liderança, três sprints, sobrecarga, recuperação do time, ADR, seis finais e migração.
- `npm run simulate -- --careers 1000 --days 600`: três mil carreiras; resultados e alertas em `BALANCE_REPORT.md`.

## Testar a experiência

1. Nova carreira: a apresentação deve falar em primeiro crachá, cargo e nome do dev.
2. Trabalhe numa task e abra o Livro de Decisões. Troque de abordagem e compare avanço e custos.
3. Use estudo, ajuda e manutenção. Confira energia, confiança e habilidades nas telas correspondentes.
4. Avance até a avaliação do dia 40. A promoção depende dos critérios e apresenta feedback.
5. Continue até Tech Lead. Agora existe uma ação diária de liderança, e as tasks andam ao encerrar o dia conforme o plano.
6. Assuma escopo acima da capacidade e observe o desgaste. Reduza ou cancele o plano para recuperar o time.
7. Registre uma ADR e observe o efeito posterior no Livro de Decisões e na cloud.
8. Em Arquiteto, conclua a prova com tempo e entregas. O resultado deve refletir a saúde da empresa.

## Arquivos desta revisão

- Motor: `src/engine/career.ts`, `actions.ts`, `state.ts`, `types.ts`, `progression.ts`, `balance.ts`, `save.ts`, `index.ts`.
- Conteúdo: `src/data/career.ts`, `career-chapters.json`, `career-lines.json`, `events.json`, `tasks.json`, `lines.json`, `schema.ts`.
- Experiência: `src/ui/components/Workspace.tsx`, `TitleScreen.tsx`, `OfficeScene.tsx`, novo `GameDialog.tsx`, `src/ui/styles.css`, `src/store/gameStore.ts`.
- Verificação: novo `tests/career.test.ts`, ajustes em `tests/{progression,save,studio}.test.ts`, novos `scripts/{career-bots.ts,simulate.mjs,validate-data.mjs}`.
- Documentação e configuração: `README.md`, `docs/{GDD,BALANCE,CAREER_ALIGNMENT,BALANCE_REPORT}.md`, cabeçalhos históricos, `CLAUDE.md`, `package.json`, `package-lock.json`.

## Saves

Saves v1–v4 migram para v5. Cargo, habilidades e métricas individuais são preservados; XP é derivado das entregas anteriores. O histórico novo começa na migração. Se uma partida tinha a economia pequena do estúdio, ela recebe uma empresa empregadora para não falir imediatamente com a folha corporativa. Os dados do estúdio anterior permanecem arquivados no save. Arquiteto importado começa uma nova prova a partir do dia carregado.
