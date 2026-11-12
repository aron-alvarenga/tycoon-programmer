# Direção obrigatória da experiência
- A fonte principal é Programmer_Simulator_passo_a_passo_para_vibecodar_um_tycoon_de_carreira_tech.md. Leia antes de alterar o loop.
- O jogo é uma carreira dev: Estagiário → Júnior → Pleno → Sênior → Tech Lead → Arquiteto. Em Tech Lead, execução individual muda para liderança.
- Referências de outros tycoons orientam apresentação e feedback; não substituem a carreira por um jogo de fundar estúdio e vender produtos.
- docs/CAREER_ALIGNMENT.md registra o escopo atual e os pontos ainda não implementados.

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