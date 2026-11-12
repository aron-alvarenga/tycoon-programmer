import { useMemo, useState } from 'react';
import type { GameStoreSnapshot } from '../../store/gameStore';
import { gameStore } from '../../store/useGameStore';
import { createInitialState } from '../../engine';
import { gameContent } from '../../data/content';
import { LOAD_ERROR_MESSAGES } from '../copy';
import { OfficeScene } from './OfficeScene';
import { GameIcon } from './GameIcon';
export const TitleScreen=({lastLoadError}:{lastLoadError:GameStoreSnapshot['lastLoadError']})=>{
 const [name,setName]=useState('Dev em formação');
 const [seed,setSeed]=useState('do-estagiario-ao-arquiteto');
 const preview=useMemo(()=>createInitialState('preview',gameContent),[]);
 const start=()=>gameStore.startNewCareer(seed.trim()||'do-estagiario-ao-arquiteto',name);
 return <main className="game-title-screen career-title"><header className="title-top"><div className="game-logo"><span><GameIcon name="code" size={26}/></span><div>programmer<b>DO ESTAGIÁRIO AO ARQUITETO</b></div></div><span>UMA CARREIRA TECH. CADA ESCOLHA TEM CONSEQUÊNCIA.</span></header><div className="title-composition"><section className="title-copy"><p className="chapter-label"><span/> DO PRIMEIRO CRACHÁ ÀS GRANDES DECISÕES</p><h1>Primeiro, você<br/>muda o código.<br/><em>Depois, muda o time.</em></h1><p>Comece como estagiário. Aprenda, entregue e conquiste confiança. Chegue à liderança e descubra que a decisão mais difícil nem sempre envolve código.</p><div className="career-title-phases"><span><b>01</b> Estagiário → Sênior<small>Você executa. O legado reage.</small></span><span><b>02</b> Tech Lead → Arquiteto<small>Você decide. O time sente.</small></span></div><label className="game-field">Como vamos chamar você?<input value={name} onChange={event=>setName(event.target.value)} maxLength={40} placeholder="Seu nome na próxima daily"/></label><div className="title-start-buttons"><button className="game-primary" onClick={start}>Começar minha carreira <span>→</span></button><button className="game-secondary" disabled={!gameStore.hasSave()} onClick={()=>gameStore.loadGame()}><GameIcon name="play" size={16}/> Continuar carreira</button></div><details className="seed-settings"><summary>Personalizar semente da carreira</summary><input aria-label="Semente da carreira" value={seed} onChange={event=>setSeed(event.target.value)}/><small>A mesma semente e as mesmas escolhas geram a mesma carreira.</small></details>{lastLoadError&&<p className="game-error" role="alert">{LOAD_ERROR_MESSAGES[lastLoadError]}</p>}</section><div className="title-scene"><OfficeScene state={preview} onDesk={start} onResearch={start} onUpgrade={start} activity=""/><span className="title-sticker"><GameIcon name="trophy" size={25}/><strong>6 cargos.<br/>Responsabilidades de verdade.</strong></span></div></div><footer className="title-footer"><span>APRENDA. ENTREGUE. ASSUMA O PRÓXIMO DESAFIO.</span><span>Gambiarra hoje. História para contar amanhã.</span></footer></main>;
};
