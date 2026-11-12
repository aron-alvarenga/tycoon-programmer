# GDD — Programmer Simulator: do Estagiário ao Arquiteto

## Direção

A referência principal é `Programmer_Simulator_passo_a_passo_para_vibecodar_um_tycoon_de_carreira_tech.md`, na raiz. Este jogo é sobre **evoluir como desenvolvedor**, não fundar uma empresa de software. As referências visuais de tycoon servem à apresentação; não substituem esse conceito.

O jogador começa como estagiário, enfrenta tarefas vagas, legado, incidentes, mudanças de escopo e reputação. Cada promoção amplia o impacto e a responsabilidade. Ao chegar a Tech Lead, o jogo muda de execução individual para liderança.

Não há identidade de empresa fixa na interface. O jogador é um profissional empregado numa equipe de produto. O caixa pertence à empresa; o salário e o cargo representam a carreira individual.

## Pilares

1. **Uma escolha deixa uma conta.** O atalho ajuda agora e pode virar incidente depois. O Livro de Decisões conecta a consequência à origem.
2. **Responsabilidade muda o jogo.** Até Sênior, você executa; a partir de Tech Lead, o time executa e você decide por ele.
3. **Progressão precisa ser compreensível.** A tela mostra o capítulo atual, a próxima avaliação, os requisitos, a saúde da produção e as consequências registradas.

## Loop

- **Dia:** duas ações individuais ou uma ação de liderança. Encerrar recupera energia, movimenta custos e receita, executa o plano do time e dispara consequências.
- **Semana:** novas tasks chegam, com dificuldade e prazo. A produção exige manutenção.
- **Sprint:** dez dias, meta de entregas e efeito na reputação e pressão.
- **Avaliação:** a cada quarenta dias úteis, o motor avalia habilidade, entregas, confiança e incidentes. O resultado é exibido com feedback.
- **Prova de Arquiteto:** vinte dias no cargo, uma ADR e seis entregas do time. O estado da operação define o final.

## Os seis capítulos

| Cargo | Desafio principal | Mudança na experiência |
|---|---|---|
| Estagiário | Aprender, perguntar e conquistar confiança | Primeiras tasks e habilidades |
| Júnior | Entregar com consistência | Código e infraestrutura na avaliação |
| Pleno | Resolver o problema inteiro | Mais autonomia e System Design |
| Sênior | Multiplicar o impacto | Arquitetura, comunicação e mentoria |
| Tech Lead | Escolher o que cabe na sprint | Um comando diário; equipe executa o plano |
| Arquiteto | Decidir o legado que fica | ADR, prova de operação e relatório final |

O ambiente, a missão, o salário, os critérios e a apresentação acompanham o cargo. Não existe compra de uma promoção ou de uma sala.

## Execução individual

O jogador prioriza uma task e escolhe uma abordagem:

- Fazer direito: progresso mais lento, mais controle da dívida e proteção contra retrabalho.
- Gambiarra: progresso maior, dívida imediata e risco futuro registrado.
- Pedir ajuda: melhora avanço e aprendizado, mas consome reputação do time; a troca pode beneficiar a relação depois.
- Negociar prazo: alívio imediato, custo com a PO e uma tarefa mais difícil na volta.

Estudo, descanso, ajuda, correção de bugs e refatoração completam o loop. As habilidades técnicas estão agrupadas em Java/Spring, Docker/Cloud, System Design e Soft Skills.

## Liderança

Quatro membros têm proficiência, moral e traços. O jogador assume escopo comparando pontos de tarefa e capacidade; escolhe proteger o time, equilibrar ou ceder ao prazo. Ao encerrar o dia, a equipe avança nas tarefas comprometidas.

Sobrecarga e pressão aumentam o desgaste e a dívida. Apoio e 1:1 recuperam confiança e moral. É possível cancelar o escopo para recuperar uma equipe exausta.

A primeira ADR escolhe entre monólito modular e microsserviços. As opções têm custo inicial, impacto na dívida, capacidade e custo de cloud posterior. Outras famílias de ADR, gestão individual de conflitos e negociação mais ampla continuam no planejamento.

## Finais

- Arquiteto de verdade: prova concluída e operação saudável.
- Arquiteto de PowerPoint: prova concluída com operação degradada.
- Burnout: desgaste extremo.
- Desligamento: dois alertas no plano de melhoria ou confiança do chefe esgotada.
- Falência: crise de caixa sustentada.
- Startup própria: saída escolhida a partir de Sênior com integridade suficiente.

O relatório mostra cargo, duração, entregas, incidentes, dívida, moral, integridade e decisões registradas.

## Limites

Esta versão implementa o núcleo das duas fases. O guia original contém uma produção de várias semanas: não se presume que todas as suas funcionalidades estejam prontas. Consulte `CAREER_ALIGNMENT.md` para a cobertura e `BALANCE_REPORT.md` para os resultados e limites da calibração.
