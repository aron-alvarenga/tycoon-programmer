import { createServer } from 'vite';
const server=await createServer({server:{middlewareMode:true},appType:'custom'});
try{
 const {gameContent}=await server.ssrLoadModule('/src/data/content.ts');
 const {careerChapters}=await server.ssrLoadModule('/src/data/career.ts');
 if(careerChapters.some(chapter=>!gameContent.promotions.some(level=>level.levelId===chapter.levelId)))throw new Error('Capítulo com nível de carreira desconhecido');
 const choices=gameContent.events.flatMap(event=>event.choices.map(choice=>event.id+':'+choice.id));
 if(new Set(choices).size!==choices.length)throw new Error('Escolhas duplicadas');
 console.log('Conteúdo válido: '+gameContent.tasks.length+' tasks, '+gameContent.events.length+' eventos e '+careerChapters.length+' capítulos.');
}finally{await server.close();}
