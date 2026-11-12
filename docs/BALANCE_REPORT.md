# Relatório de balanceamento — carreira dev

1000 carreiras por estratégia, limite de 600 dias, seeds simulation-0 até simulation-999. Simulação do motor; não é playtest humano.

## Equilibrado

Incidentes médios: 2.4. Dívida final média: 10.6%. Duração média: 219.2 dias.

| Final | Quantidade | Percentual |
|---|---:|---:|
| healthy | 987 | 98.7% |
| dismissed | 13 | 1.3% |

| Promoção | Carreiras que alcançaram | Dia médio entre quem alcançou |
|---|---:|---:|
| junior | 987 | 40.0 |
| mid | 987 | 80.0 |
| senior | 987 | 120.0 |
| tech_lead | 987 | 160.0 |
| architect | 987 | 200.0 |

**Sinal de estratégia extrema:** 98.7% chegam a um final de Arquiteto. Requer revisão antes de tratar o balanceamento como definitivo.

## Gambiarreiro

Incidentes médios: 14.7. Dívida final média: 99.9%. Duração média: 50.9 dias.

| Final | Quantidade | Percentual |
|---|---:|---:|
| burnout | 1000 | 100.0% |

| Promoção | Carreiras que alcançaram | Dia médio entre quem alcançou |
|---|---:|---:|
| junior | 765 | 40.0 |
| mid | 0 | — |
| senior | 0 | — |
| tech_lead | 0 | — |
| architect | 0 | — |

**Sinal de estratégia extrema:** 0.0% chegam a um final de Arquiteto. Requer revisão antes de tratar o balanceamento como definitivo.

## Perfeccionista

Incidentes médios: 1.7. Dívida final média: 0.5%. Duração média: 176.4 dias.

| Final | Quantidade | Percentual |
|---|---:|---:|
| healthy | 684 | 68.4% |
| dismissed | 316 | 31.6% |

| Promoção | Carreiras que alcançaram | Dia médio entre quem alcançou |
|---|---:|---:|
| junior | 684 | 40.0 |
| mid | 684 | 80.0 |
| senior | 684 | 120.0 |
| tech_lead | 684 | 160.0 |
| architect | 684 | 200.0 |

## Limites e próximos ajustes a avaliar

Os bots usam regras fixas; podem se prender a prioridades que um jogador humano abandonaria. Não há garantia de estratégia ótima. O teste de liderança separado cobre três sprints. Os tempos-alvo do guia (Sênior em cerca de dois anos) ainda precisam de calibração.

Sugestões para uma próxima rodada, sem aplicação automática: revisar a meta fixa de três entregas por sprint conforme a oferta; ajustar o peso de reputação na avaliação; calibrar a intensidade e o cooldown de incidentes contra a recuperação disponível.
