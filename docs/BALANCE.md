# Balanceamento — carreira dev, versão 0.4

A referência de experiência é o guia original da raiz. Os novos parâmetros ficam em `src/engine/balance.ts`, em `CAREER_BALANCE`; os parâmetros anteriores de ações e produtividade continuam no mesmo arquivo. `src/data/studio.ts` pertence apenas ao módulo arquivado de estúdio.

## Tempo e atributos

- Dois blocos diários até Sênior; uma ação de liderança em Tech Lead e Arquiteto.
- Semana de cinco dias úteis; sprint de dez dias; avaliação de quarenta dias úteis.
- Energia, estresse, habilidades, reputação, integridade, dívida, moral e pressão: 0–100. Bugs: 0–20.
- Começo: energia 80, estresse 20, Java/Spring 15, Docker/Cloud 5, System Design 0 e Soft Skills 10. Reputações 50. Dívida 45 e dois bugs.
- Empresa empregadora: R$ 1,2 milhão de caixa, receita potencial de R$ 180 mil/mês, cloud de R$ 40 mil/mês e folha do time de R$ 90 mil/mês. O salário individual começa em R$ 1.800.

## Produtividade e aprendizado

```
eficiência = (0,5 + energia/200) × (1 − estresse/250) × (1 − dívida/200)
moral = 0,85 + moralDoTime/400
avanço-base = arredondar(60 × eficiência × (1 + habilidade/40) × moral × abordagem / dificuldade)
```

O mínimo de avanço é um. O ganho usa os atributos anteriores ao consumo de energia. A previsão da interface usa o mesmo cálculo do motor.

Aprendizado: `arredondar(base × (1 − habilidade/120))`. Estudar usa base 6; trabalho, manutenção e ajuda usam base 3; pedir ajuda soma 2 à base de aprendizado da task.

## Ações

| Ação | Custo | Efeito |
|---|---|---|
| Trabalho | 1 ação, −14 energia, +5 estresse | Avanço e prática na habilidade da task |
| Fazer direito | Avanço ×0,85 | −4 dívida na entrega e −4 na consequência posterior |
| Gambiarra | Avanço ×1,6 | +3 dívida por bloco; risco posterior, sem bug automático imediato |
| Pedir ajuda | Avanço ×1,2, −3 reputação do time | Mais aprendizado e +3 confiança do time na consequência |
| Negociar prazo | 1 ação, −5 estresse, −4 PO | +10 dias de prazo, +1 dificuldade até limite 5; cobrança posterior |
| Estudar | 1 ação, −12 energia, +3 estresse | Habilidade escolhida, +5 XP |
| Pausa | 1 ação | +18 energia, −10 estresse |
| Ajudar colega | 1 ação, −8 energia, +2 estresse | +3 time, +1 chefe, Soft Skills, +2 moral e +8 XP |
| Corrigir bugs | 1 ação, −10 energia | Até −2 bugs, +3 satisfação, prática de Infra e +8 XP |
| Refatorar | 1 ação, −10 energia | Até −12 dívida, prática de arquitetura e +8 XP |
| Encerrar | Descarta ações restantes | +24 energia, estresse `2 × bugs −10`, operação, equipe e calendário |

Trabalho cuidadoso e ajuda são abordagens da task; refatorar é uma ação separada de manutenção. Uma abordagem é registrada uma vez por tarefa, preservando o histórico na troca de seleção. A negociação de prazo também aumenta a dificuldade e agenda a cobrança da PO.

## Consequências

- Gambiarra: agenda entre 10 e 30 dias úteis; chance de incidente na execução igual à dívida/100. Se ocorrer: +1 bug, +8 estresse, −5 satisfação e +1 incidente atribuído.
- Fazer direito, pedir ajuda e negociação: efeitos em dez dias, vinculados à decisão.
- ADR: efeito de cloud em dez dias. A dívida e o custo inicial são imediatos.
- A fila e o resultado são salvos. A mensagem cita a tarefa ou a escolha original. Uma consequência resolvida não dispara novamente.

## Avaliação e progressão

- O motor realiza uma avaliação a cada quarenta dias úteis.
- Requisitos de habilidade: `src/data/promotions.json`, pertencentes ao cargo atual para alcançar o seguinte.
- Entregas acumuladas: 3, 6, 9, 12 e 15.
- Confiança mínima: 45 com chefe, time e PO.
- Incidentes por entrega: até 1 para a primeira promoção; até 0,4 nas seguintes.
- Para Tech Lead e Arquiteto, dívida no máximo 60.
- Todos os critérios atendidos: promoção e reajuste salarial. Uma ou duas insuficiências: manutenção. Três ou mais: alerta no plano de melhoria. Dois alertas encerram a carreira.
- Salários: R$ 1.800, R$ 3.500, R$ 6.500, R$ 11.000, R$ 16.000 e R$ 22.000.
- Uma entrega individual ou do time dá 30 XP. XP é feedback acumulado; não substitui habilidade ou confiança na avaliação.

## Liderança

- Quatro membros com proficiências 35, 55, 75 e 65; morais iniciais 65, 60, 65 e 55. Traços: mentor, apressado, perfeccionista e independente.
- Capacidade de planejamento: `8 × moral média /100`, arredondada a uma casa decimal.
- Trabalho diário do time: base 75 × ritmo × moral/100 × eficiência da dívida × (1 + proficiência média/100) × bônus de traço e arquitetura. Esse orçamento é distribuído entre tasks planejadas, ponderado pela dificuldade.
- Ritmos: proteger ×0,8, equilibrado ×1, ceder ao prazo ×1,4.
- Sobrecarga ou ritmo de pressão: moral −5 por membro/dia e +1 dívida. Ritmo sustentado: moral +1. Mentor recupera um ponto adicional; apressado amplia velocidade do grupo em 10%; perfeccionista com proteção reduz a dívida por entrega.
- 1:1/apoio: uma ação, +5 moral por membro, +5 confiança do time, Soft Skills e XP.
- Planejar ou cancelar escopo custa uma ação. Sem tarefas em execução, a moral recupera um ponto por dia.
- Entrega do time: conta na carreira e na sprint; aumenta confiança da PO e muda dívida conforme a política.
- ADR modular: R$ 3.000, uma ação, −10 dívida e −15% cloud em dez dias.
- ADR microsserviços: R$ 3.000, uma ação, +8 dívida, +25% capacidade e +25% cloud em dez dias.

## Produção e economia

- Incidente noturno: `1% + dívida ×0,04% + bugs ×0,5%`. Efeitos: bug +1, estresse +8, pressão +5, satisfação −6 e moral −3.
- Resultado diário: `(receita potencial × satisfação/100 − cloud − folha − salário individual)/20`, arredondado em centavos.
- Entregas individuais geram retorno à empresa e ampliam receita. O caixa nunca se torna propriedade do dev.
- Fim de semana: energia +16, estresse −8, cloud +R$ 80/mês e novas tasks. Backlog pendente limitado a oito; entregas recentes limitadas a oito.
- Sprint: três entregas; sucesso dá bônus ao caixa, chefe +6 e pressão −8. Falha: chefe −4 e pressão +5.

## Prova e finais

Arquiteto precisa de ao menos vinte dias no cargo, uma ADR e seis entregas do time durante a prova. Operação saudável: dívida até 45, bugs até três, moral pelo menos 50 e caixa positivo. Caso contrário, a conclusão gera Arquiteto de PowerPoint.

Estresse 100 ou três dias terminando sem energia: burnout. Chefe zerado ou dois alertas de melhoria: desligamento. Cinco dias com caixa zerado: falência. A partir de Sênior, integridade 60 permite escolher a saída para startup. Uma carreira encerrada deixa de aceitar ações.

## Calibração

Veja `BALANCE_REPORT.md`, gerado com três mil carreiras. A estratégia equilibrada ainda é forte demais, e a gambiarreira continua extrema. O tempo-alvo do guia, de Sênior em aproximadamente dois anos, ainda não foi atingido: a versão atual é mais acelerada. A existência de uma simulação determinística não substitui playtests humanos nem a revisão desses extremos.
