> **Histórico superado:** a experiência ativa voltou à carreira dev na versão 0.4, conforme o guia original. Consulte [CAREER_ALIGNMENT.md](CAREER_ALIGNMENT.md). O texto abaixo registra uma direção anterior.

﻿# Versão 0.3 — de painel corporativo a tycoon de software

## Direção corrigida

A identidade anterior de empresa fictícia foi removida da experiência atual. Agora o jogador dá nome ao próprio estúdio e começa na garagem. A progressão principal é produto → lançamento → vendas e fãs → pesquisa e reinvestimento → expansão.

O motor de carreira anterior permanece para compatibilidade técnica, mas cargos, kanban, planilha financeira e navegação de sistema não conduzem mais a tela principal.

## Referências consultadas

| Referência oficial | Princípio aplicado |
|---|---|
| [Game Dev Tycoon, Greenheart Games](https://www.greenheartgames.com/app/game-dev-tycoon/) | Começar pequeno, desenvolver produtos, pesquisar e crescer |
| [Software Inc.](https://swinc.net/) | Espaço e equipamentos como parte visível da construção da empresa |
| [Mad Games Tycoon 2, Eggcode](https://store.steampowered.com/app/1342330/Mad_Games_Tycoon_2/) | Criação por etapas, lançamento, recepção do mercado e reinvestimento |

Essas são referências de estrutura e experiência; não foram copiados nomes, assets ou interfaces. O cenário é próprio, desenhado em SVG e ligado ao estado do jogo. Não foram implementadas todas as funcionalidades desses títulos, como simulação de concorrentes ou construção livre de edifícios.

## Experiência implementada

- Tela inicial com nome do estúdio, garagem ilustrada e início de uma nova história.
- Cenário isométrico com personagem, computador, livros, plantas, caixas e gato na garagem.
- Pontos de interação acessíveis por botão e teclado: computador, pesquisa e melhorias.
- HUD com caixa, fãs e pontos de pesquisa; relógio do dia e energia do personagem.
- Projetos nomeáveis, escolha de produto e público.
- Etapas de criação, programação e testes, com previsão de avanço calculada pelo motor.
- Estilos de desenvolvimento: equilíbrio, capricho e velocidade.
- Lançamento com nota, vendas, fãs, pesquisa e receita mensal; tela de recompensa e coleção de produtos.
- Computadores melhores alteram os monitores e equipamentos e aumentam a velocidade.
- Evolução de garagem para estúdio indie e campus, com mudanças no cenário.
- Novos produtos desbloqueados pelo histórico de lançamentos.
- Pesquisa tecnológica com pontos ganhos, além do aprendizado de habilidades.
- Freelas para recuperar caixa e financiar uma nova ideia sem travar a partida.
- Bugs remanescentes do lançamento chegam à operação; manutenção e simplificação da base continuam disponíveis em Pesquisa.
- Nome e estado do estúdio persistem no save v4. A migração preserva os atributos da partida anterior.

O jogo continua por turnos, com duas ações diárias. Não há velocidade de simulação ou contratação automática anunciadas como se estivessem prontas.

## Parâmetros principais

Os valores estão em `src/data/studio.ts`.

| Produto | Investimento | Esforço relativo | Base de vendas | Base de receita mensal | Lançamentos para desbloquear |
|---|---:|---:|---:|---:|---:|
| Website | R$ 150 | 1 | R$ 1.400 | R$ 80 | 0 |
| Aplicativo | R$ 450 | 1,5 | R$ 2.800 | R$ 220 | 1 |
| Jogo indie | R$ 800 | 2 | R$ 4.300 | R$ 300 | 2 |
| SaaS | R$ 1.500 | 2,6 | R$ 6.500 | R$ 850 | 4 |

- Caixa inicial: R$ 3.500. Hosting inicial: R$ 120/mês. Despesas diárias: R$ 45 por nível de espaço, contando a garagem como nível 1.
- Base de avanço: 70 × eficiência do jogador × habilidade × hardware / esforço do produto.
- Equilíbrio: ritmo normal. Capricho: 20% mais lento e 40% mais qualidade por ação. Velocidade: 50% mais avanço e +2 bugs por ação.
- Desenvolver usa uma ação, 12 de energia e 3 de estresse. A etapa de testes remove até dois bugs por ação.
- Nota: base técnica + qualidade + tecnologia + habilidade − penalidade por bugs; limitada a 1–10. A nota determina vendas e receita recorrente.
- Mercado de empresas: multiplicador 1,2. Combinação indicada de público e produto: multiplicador adicional 1,25. Websites combinam com negócios locais, apps e jogos com criadores/jogadores, e SaaS com empresas.
- Cada lançamento dá oito pontos de pesquisa. Um nível tecnológico custa 12 pontos e uma ação, até nível 5.
- Hardware: três compras de R$ 900, R$ 2.400 e R$ 6.000; +20% de avanço por nível.
- Estúdio indie: três lançamentos e R$ 4.500. Campus: sete lançamentos e R$ 16.000.
- Freela: uma ação, 10 de energia, R$ 250. Não conta como lançamento nem concede pesquisa.
- Receita efetiva diária: receita mensal ajustada pela satisfação, menos hosting, dividida por 20 dias úteis; descontam-se as despesas do espaço. Não há folha fictícia de equipe nem salário de empregado descontados do novo loop.

## Verificação

`npm run build` e `npm test`: aprovados, com 52 testes. Os testes novos verificam investimento, orçamento diário, etapas, risco e qualidade, pagamento único, recorrência, combinação de público, desbloqueios, hardware, expansão, pesquisa, recuperação financeira, persistência e determinismo.

Uma simulação de oito produtos consegue reinvestir e chegar ao campus sem saldo negativo. Os testes antigos continuam cobrindo a compatibilidade do motor de carreira.

A verificação visual em um navegador controlado não foi realizada neste ambiente. Build, resposta HTTP e testes de regras não substituem inspeção de layout ou playtest humano.

## Roteiro de inspeção manual

1. Inicie uma nova história com um nome de estúdio. Clique no computador.
2. Crie um website para negócios locais. Desenvolva duas vezes e confirme que o dia pede descanso.
3. Avance o dia, responda ao evento quando aparecer e termine as três etapas.
4. Lance o produto. Confira nota, vendas, fãs e pesquisa; a recompensa não pode repetir ao fechar a janela.
5. Abra Minha jornada e confira o produto. O aplicativo deve estar disponível no próximo projeto.
6. Compre hardware e observe os monitores. Verifique o aumento de avanço previsto.
7. Lance três produtos, acumule caixa e compre o estúdio indie. O ambiente deve mudar.
8. Após dois lançamentos, pesquise tecnologia; confira o consumo de pontos e de uma ação.
9. Salve, recarregue e continue. Confira projeto em andamento, melhorias e coleção.
10. Confira o jogo nas larguras de 390, 768 e 1440 pixels, com teclado e movimento reduzido.

## Arquivos desta revisão

- Novos: `src/data/studio.ts`, `src/engine/studio.ts`, `src/ui/components/OfficeScene.tsx`, `src/ui/components/GameIcon.tsx`, `tests/studio.test.ts`, `docs/TYCOON.md`.
- Atualizados: `src/engine/{types,state,actions,balance,progression,save,index}.ts`, `src/store/gameStore.ts`, `src/data/{events,lines,tasks}.json`, `src/ui/components/{Workspace,TitleScreen,TopBar}.tsx`, `src/ui/styles.css`, `tests/progression.test.ts`, `README.md`, documentação histórica e versão do pacote.
