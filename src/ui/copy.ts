import type { ReputationId, SkillId, TaskColumn } from '../engine';

export const SKILL_LABELS: Record<SkillId, string> = {
  code: 'Código',
  infra: 'Infra',
  architecture: 'Arquitetura',
  softSkills: 'Soft Skills',
};

export const REPUTATION_LABELS: Record<ReputationId, string> = {
  boss: "Reputação com o chefe. Sobe ao cumprir a meta da sprint e muda com decisões do escritório.",
  team: "Reputação com o time. Ajudar colegas e tomar decisões afeta essa relação.",
  po: 'PO',
};

export const COLUMN_LABELS: Record<TaskColumn, string> = {
  todo: 'A fazer',
  doing: 'Em andamento',
  production: 'Em produção',
};

export const WEEKDAY_LABELS = ['Segunda', 'Terça', 'Quarta', 'Quinta', 'Sexta'] as const;

export const TOOLTIPS = {
  energy: "Energia de 0 a 100. Aumenta a produtividade. Uma noite recupera 24; uma pausa, 18.",
  stress: "Estresse de 0 a 100. Reduz a produtividade. O descanso e as noites sem bugs ajudam a recuperar.",
  code: 'Código. Empurra tasks de feature e legado. Estudar e entregar aumentam, com retorno decrescente.',
  infra: 'Infra. Queries eternas, container e o clássico “funciona na minha máquina”.',
  architecture: 'Arquitetura. Serve pra quebrar a classe de 4 mil linhas sem criar sete classes de 4 mil linhas.',
  softSkills: 'Soft Skills. Reunião, mentoria e dizer não sem virar ticket de RH.',
  boss: "Reputação com o chefe. Sobe ao cumprir a meta da sprint e muda com decisões do escritório.",
  team: "Reputação com o time. Ajudar colegas e tomar decisões afeta essa relação.",
  po: 'Reputação com a PO. Entregar agrada. Empurrar task pro próximo sprint, não.',
  techDebt: 'Dívida técnica 0–100. Acelera hoje, atrasa amanhã e aumenta a chance de incidente.',
  prodBugs: 'Bugs em produção (0–20). Cada um vira urgente, come cliente e estresse.',
  cloudCostCents: 'Custo de cloud por mês. Cresce com desleixo e serviços esquecidos ligados.',
  teamMorale: "Moral de 0 a 100. Melhora a produtividade. Ajudar colegas aumenta a moral.",
  investorPressure: "Pressão de 0 a 100. Incidentes e metas perdidas aumentam; sprints bem-sucedidas reduzem.",
  cashCents: 'Caixa da empresa. Paga salário, cloud e o sonho de virar fintech.',
  salaryCents: "Salário mensal. Aumenta com promoções e compõe os custos diários da empresa.",
} as const;

export const COLUMN_EMPTY: Record<TaskColumn, string> = {
  todo: 'Nada aqui. Suspeito.',
  doing: 'Nenhuma task em andamento. Ou você descansou, ou o quadro mente.',
  production: 'Produção vazia. Relaxe. Não vai durar.',
};

export const LOAD_ERROR_MESSAGES = {
  'no-save': 'Nenhum save encontrado. Igual à documentação do legado.',
  'invalid-json': 'O save está corrompido. Alguém editou direto em produção?',
  'unsupported-version': 'Save de uma versão incompatível. Nem o legado é tão antigo.',
  'invalid-shape': 'O save tem um formato estranho. Parece código de sexta à noite.',
} as const;
