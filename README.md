# Programmer Simulator: do Estagiário ao Arquiteto

Um tycoon de **carreira dev**. Comece como estagiário, aprenda a entregar sem incendiar a produção e chegue a Arquiteto. Em Tech Lead, o jogo muda: você deixa de ser a capacidade individual e passa a escolher escopo, apoiar o time e decidir arquitetura.

A fonte de direção é [o guia original](Programmer_Simulator_passo_a_passo_para_vibecodar_um_tycoon_de_carreira_tech.md). A revisão anterior de estúdio e vendas foi retirada da experiência principal.

## Executar

```sh
npm install
npm run dev
```

Abra a URL local do Vite, escolha o nome do dev e inicie uma carreira. Salve antes de sair. Continuar carreira carrega saves anteriores com migração para v5.

## A experiência

- **Estagiário → Júnior → Pleno → Sênior:** duas ações diárias, tasks, estudo, mentoria, energia e reputação. Quatro abordagens: fazer direito, gambiarra, pedir ajuda e negociar prazo.
- **Avaliação a cada oito semanas:** habilidades, entregas, confiança e incidentes definem promoção, manutenção ou plano de melhoria. Cargo e salário mudam juntos.
- **Tech Lead:** uma ação de liderança por dia. Escolha tarefas conforme a capacidade, negocie ritmo e veja o time executar ao avançar o calendário.
- **Arquiteto:** registre uma ADR, sustente ao menos vinte dias e seis entregas do time e conclua a prova. A saúde da empresa decide o final.
- **Livro de Decisões:** abordagens e escolhas registradas, com efeitos imediatos e consequências futuras que citam sua origem.
- **Seis finais:** Arquiteto de verdade, Arquiteto de PowerPoint, burnout, desligamento, falência e saída para startup.

O cenário isométrico, o HUD e as janelas de jogo foram mantidos, agora vinculados ao cargo e à carreira. Não há compra de escritório, vendas pessoais ou lançamentos de produtos no loop principal.

## Verificar

```sh
npm test
npm run build
npm run validate:data
npm run simulate -- --careers 1000 --days 600
```

A simulação executa três estratégias e escreve `docs/BALANCE_REPORT.md`. O relatório aponta extremos em vez de afirmar que o jogo já está perfeitamente balanceado.

## Documentação e código

- [Alinhamento com o guia e limites atuais](docs/CAREER_ALIGNMENT.md).
- [Game design atual](docs/GDD.md).
- [Balanceamento e fórmulas](docs/BALANCE.md).
- `src/engine/career.ts`: avaliações, decisões, consequências, liderança e finais.
- `src/data/career-chapters.json` e `career-lines.json`: identidade dos seis capítulos e textos de carreira.
- `src/ui/components/Workspace.tsx`: experiência de carreira.

Os módulos antigos de estúdio permanecem isolados para compatibilidade e testes; seus comandos são rejeitados durante uma carreira dev. Na migração, skills e cargo são preservados. Partidas da fase de estúdio com economia pequena recebem uma empresa empregadora compatível com o novo loop; os dados do estúdio ficam arquivados no save.
