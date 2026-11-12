export const PRODUCT_KINDS = [
  { id: 'website', name: 'Website', description: 'Sites rápidos para negócios locais.', icon: 'globe', cost: 15000, effort: 1, reward: 140000, monthly: 8000, unlock: 0, skill: 'code' },
  { id: 'app', name: 'Aplicativo', description: 'Uma boa ideia no bolso de muita gente.', icon: 'phone', cost: 45000, effort: 1.5, reward: 280000, monthly: 22000, unlock: 1, skill: 'code' },
  { id: 'game', name: 'Jogo indie', description: 'Transforme código em diversão.', icon: 'game', cost: 80000, effort: 2, reward: 430000, monthly: 30000, unlock: 2, skill: 'architecture' },
  { id: 'saas', name: 'Plataforma SaaS', description: 'Seu software. Clientes recorrentes.', icon: 'cloud', cost: 150000, effort: 2.6, reward: 650000, monthly: 85000, unlock: 4, skill: 'infra' },
] as const;

export const STUDIO_BALANCE = {
  startCash: 350000, monthlyHosting: 12000, dailyLivingCost: 4500,
  development: 70, energyCost: 12, stressCost: 3, qualityGain: 8,
  focusSpeed: 1.5, focusQuality: 1.4, rushBugs: 2, polishBugs: 2,
  hardwarePrices: [90000, 240000, 600000], hardwareSpeed: .2,
  officePrices: [450000, 1600000], officeProducts: [3, 7],
  researchCost: 12, researchMax: 5, researchPerRelease: 8,
  audienceMultipliers: { local: 1, creators: 1, business: 1.2 },
  audienceFitMultiplier: 1.25,
  qualitySpeed: .8, skillSpeedDivisor: 100, technologyQuality: 4,
  officeDailyCostMultiplier: 1,
  freelanceReward: 25000, freelanceEnergy: 10, releaseDebt: 3,
  skillQualityDivisor: 8, qualityBase: 40, qualityMax: 100,
  bugsPenalty: 8, fansPerScore: 3, releaseHistoryCap: 40,
} as const;

export const STUDIO_LINES = {
  freelance: 'Freela concluído! R$ 250 para financiar sua próxima criação.',
  started: 'Projeto iniciado: {name}. A próxima grande ideia começa aqui.',
  developed: '{name}: mais um passo rumo ao lançamento.',
  released: '{name} chegou ao mercado! Nota {score}/10. Novos fãs: {fans}.',
  hardware: 'Setup melhorado. Mais velocidade para suas próximas ideias.',
  office: 'Novo espaço desbloqueado! Seu estúdio ganhou uma nova casa.',
  researched: 'Nova tecnologia dominada! A qualidade dos próximos projetos aumentou.',
};
