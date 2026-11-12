import { createServer } from 'vite';
import fs from 'node:fs/promises';
const count=Number(process.argv[process.argv.indexOf('--careers')+1])||1000;
const maxDays=Number(process.argv[process.argv.indexOf('--days')+1])||600;
if(!Number.isInteger(count)||count<1||count>10000)throw new Error('Use --careers entre 1 e 10000');
const server=await createServer({server:{middlewareMode:true},appType:'custom'});
try{
 const {runCareer}=await server.ssrLoadModule('/scripts/career-bots.ts');
 let report='# Relatório de balanceamento — carreira dev\n\n'+count+' carreiras por estratégia, limite de '+maxDays+' dias, seeds simulation-0 até simulation-'+(count-1)+'. Simulação do motor; não é playtest humano.\n\n';
 for(const bot of ['Equilibrado','Gambiarreiro','Perfeccionista']){
  const results=[];
  for(let i=0;i<count;i++)results.push(runCareer(bot,'simulation-'+i,maxDays));
  const avg=key=>(results.reduce((sum,item)=>sum+item[key],0)/count).toFixed(1);
  const endings={};for(const result of results)endings[result.ending]=(endings[result.ending]??0)+1;
  report+='## '+bot+'\n\nIncidentes médios: '+avg('incidents')+'. Dívida final média: '+avg('debt')+'%. Duração média: '+avg('day')+' dias.\n\n';
  report+='| Final | Quantidade | Percentual |\n|---|---:|---:|\n';
  for(const [ending,total]of Object.entries(endings))report+='| '+ending+' | '+total+' | '+(total/count*100).toFixed(1)+'% |\n';
  report+='\n| Promoção | Carreiras que alcançaram | Dia médio entre quem alcançou |\n|---|---:|---:|\n';
  for(const level of ['junior','mid','senior','tech_lead','architect']){const reached=results.filter(item=>level in item.promotions);report+='| '+level+' | '+reached.length+' | '+(reached.length?(reached.reduce((sum,item)=>sum+item.promotions[level],0)/reached.length).toFixed(1):'—')+' |\n';}
  const wins=(endings.healthy??0)+(endings.powerpoint??0);
  if(wins/count>.95||wins/count<.05)report+='\n**Sinal de estratégia extrema:** '+(wins/count*100).toFixed(1)+'% chegam a um final de Arquiteto. Requer revisão antes de tratar o balanceamento como definitivo.\n';
  report+='\n';console.log(bot+': '+JSON.stringify(endings));
 }
 report+='## Limites e próximos ajustes a avaliar\n\nOs bots usam regras fixas; podem se prender a prioridades que um jogador humano abandonaria. Não há garantia de estratégia ótima. O teste de liderança separado cobre três sprints. Os tempos-alvo do guia (Sênior em cerca de dois anos) ainda precisam de calibração.\n\nSugestões para uma próxima rodada, sem aplicação automática: revisar a meta fixa de três entregas por sprint conforme a oferta; ajustar o peso de reputação na avaliação; calibrar a intensidade e o cooldown de incidentes contra a recuperação disponível.\n';
 await fs.writeFile('docs/BALANCE_REPORT.md',report,'utf8');
 console.log('Relatório salvo em docs/BALANCE_REPORT.md');
}finally{await server.close();}
