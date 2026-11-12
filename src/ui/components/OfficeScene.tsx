import type { CSSProperties } from 'react';
import type { GameState } from '../../engine';

const point = (u: number, v: number, z = 0) => [500+(u-v)*.72, 210+(u+v)*.36-z] as const;
const pts = (...values: readonly (readonly number[])[]) => values.map(value => value.join(',')).join(' ');

const Box = ({u,v,w,d,h,z=0,color='#c39567',top='#e3bf85',side='#a87850'}:{u:number;v:number;w:number;d:number;h:number;z?:number;color?:string;top?:string;side?:string}) => {
  const a=point(u,v,z+h),b=point(u+w,v,z+h),c=point(u+w,v+d,z+h),e=point(u,v+d,z+h);
  return <g><polygon points={pts(e,c,point(u+w,v+d,z),point(u,v+d,z))} fill={color}/><polygon points={pts(b,c,point(u+w,v+d,z),point(u+w,v,z))} fill={side}/><polygon points={pts(a,b,c,e)} fill={top}/></g>;
};
const Plant=({u,v,large=false}:{u:number;v:number;large?:boolean})=>{
  const [x,y]=point(u,v);return <g transform={`translate(${x} ${y}) scale(${large?1.3:.8})`}><ellipse cy="5" rx="25" ry="12" fill="#313b4822"/><path d="M-17-30H17L12 0Q0 8-12 0Z" fill="#ce8264"/><ellipse cy="-30" rx="17" ry="8" fill="#e6a684"/><path d="M0-30V-85M0-50Q-40-50-32-78Q-7-83 0-50M0-65Q30-65 29-95Q3-96 0-65M0-42Q24-37 33-64Q6-74 0-42M0-71Q-23-82-10-107Q9-98 0-71" fill="#5b9f77" stroke="#407c60" strokeWidth="3" strokeLinejoin="round"/></g>;
};
const Desk=({u,v,level=0}:{u:number;v:number;level?:number})=>{
  const [x,y]=point(u+65,v+20,88);
  return <g><ellipse cx={point(u+80,v+40)[0]} cy={point(u+80,v+40)[1]+4} rx="94" ry="38" fill="#55453e19"/>{[[u+5,v+5],[u+157,v+5],[u+5,v+65],[u+157,v+65]].map(([a,b],i)=><Box key={i} u={a!} v={b!} w={8} d={8} h={72} top="#63677a" color="#73778b" side="#4e5368"/>)}<Box u={u} v={v} w={175} d={85} h={10} z={72} top={level>1?'#a7b8c7':'#e7bd85'} color="#c79766" side="#b8855b"/>
    <g transform={`translate(${x} ${y})`}><path d="M-4 0L18 11L30 5L8-6Z" fill="#687486"/><path d="M10 0V-23" stroke="#69768a" strokeWidth="7"/><path d="M-31-76L42-39V8L-31-29Z" fill="#3c4b63" stroke="#303e55" strokeWidth="3"/><path d="M-26-68L36-36V0L-26-32Z" fill={level>0?'#80ddd4':'#b4dbdf'}/><g stroke="#528c9a" strokeWidth="2.2"><path d="M-19-56L7-43M-19-47L20-27M-19-39L5-27M-6-43L12-34"/></g>{level>0&&<g transform="translate(65 33)"><path d="M-31-76L27-47V-4L-31-33Z" fill="#384860"/><path d="M-27-69L23-44V-10L-27-35Z" fill="#d3b7f4"/><path d="M-20-53L15-35M-20-43L0-33" stroke="#9b72ba" strokeWidth="3"/></g>}</g>
    <Box u={u+50} v={v+58} w={70} d={19} h={3} z={83} color="#c2cfce" top="#e8e9dd" side="#8d9caa"/>
    <g transform={`translate(${point(u+143,v+55,84).join(' ')})`}><path d="M-7-12H7L6 0Q0 5-6 0Z" fill="#ecf0e6"/><path d="M7-10Q17-10 12-3H7" fill="none" stroke="#ecf0e6" strokeWidth="3"/><path className="steam" d="M-2-18Q-7-24-1-30" fill="none" stroke="#ffffff99" strokeWidth="2"/></g>
  </g>;
};
const Developer=({u,v}:{u:number;v:number})=>{
 const [x,y]=point(u,v);return <g transform={`translate(${x} ${y})`}><ellipse cy="2" rx="33" ry="14" fill="#3f475c22"/><path d="M0-24V-1M0-4L-26 9M0-4L25 9M0-4L2 16" stroke="#627083" strokeWidth="5" strokeLinecap="round"/><path d="M-24-37L5-53L31-40L0-24Z" fill="#556682"/><path d="M-17-35L-4-30L-2-8M3-30L13-24L19-12" stroke="#38415c" strokeWidth="10" strokeLinejoin="round"/><path d="M-25-58Q-22-83-4-81L17-71L20-38Q4-25-22-44Z" fill="#e49a5b"/><path d="M-20-74L-40-84M12-64L-1-76" stroke="#edae7c" strokeWidth="10" strokeLinecap="round"/><path d="M-25-44L3-30L3-8L-25-21Z" fill="#637792"/><path d="M-16-76V-87" stroke="#e7ad88" strokeWidth="12"/><ellipse cx="-14" cy="-101" rx="19" ry="22" fill="#efbc98"/><path d="M-34-102Q-36-128-14-128Q10-125 4-101L-4-98L-9-114Q-20-104-34-102Z" fill="#453c49"/><path d="M-31-100Q-38-108-37-93Q-35-87-30-91" fill="#efbc98"/><path d="M-3-103L8-99L4-94" fill="#d7987d"/></g>;
};

interface OfficeSceneProps { state: GameState; onDesk:()=>void; onResearch:()=>void; onUpgrade:()=>void; activity: string; activityKey?: number }
export const OfficeScene=({state,onDesk,onResearch,onUpgrade,activity,activityKey=0}:OfficeSceneProps)=>{
 const order=['intern','junior','mid','senior','tech_lead','architect'].indexOf(state.levelId);
 const level=state.career.enabled?Math.min(2,Math.floor(Math.max(0,order)/2)):state.studio.office;
 const hardware=state.career.enabled?Math.min(2,Math.floor(Math.max(0,order)/2)):state.studio.hardware;
 return <div className={`office-scene office-level-${level}`}><svg viewBox="0 0 1000 670" role="img" aria-label={`Seu ${state.career.enabled?['espaço de aprendizado','estação de desenvolvimento','ambiente de liderança'][level]:['quarto na garagem','estúdio independente','campus de tecnologia'][level]}, com computador, personagem, livros e melhorias visíveis`}>
 <defs><pattern id="floor-grain" width="70" height="35" patternUnits="userSpaceOnUse" patternTransform="matrix(.72 .36 -.72 .36 500 210)"><rect width="70" height="35" fill={level>0?'#d4b88e':'#d8b78a'}/><path d="M0 0H70V35H0Z" fill="none" stroke="#b99a7080" strokeWidth="1.5"/></pattern><linearGradient id="glass" x2="1" y2="1"><stop stopColor="#ade1e6"/><stop offset="1" stopColor="#c8e9e1"/></linearGradient><filter id="room-shadow" x="-25%" y="-25%" width="150%" height="160%"><feDropShadow dx="0" dy="22" stdDeviation="18" floodColor="#4c7993" floodOpacity=".22"/></filter></defs>
 <ellipse cx="500" cy="560" rx="330" ry="55" fill="#76a9b129"/>
 <g filter="url(#room-shadow)"><polygon points="140,380 500,200 860,380 500,560 140,380" fill="#b78760"/><polygon points="140,380 500,560 500,580 140,400" fill="#a68060"/><polygon points="500,560 860,380 860,400 500,580" fill="#bd9771"/><polygon points="140,380 500,200 860,380 500,560" fill="url(#floor-grain)"/>
 <polygon points="140,180 500,0 500,210 140,390" fill={level>0?'#a4c0b9':'#afc5ca'}/><polygon points="500,0 860,180 860,390 500,210" fill={level>0?'#d4e3d6':'#e0e8dd'}/><path d="M140 180L500 0L860 180" fill="none" stroke="#edf3e6" strokeWidth="12" strokeLinejoin="round"/><path d="M140 380L500 200L860 380" fill="none" stroke="#8da4a1" strokeWidth="8"/>
 <polygon points="195,186 330,119 330,252 195,319" fill="#839ba9"/><polygon points="204,192 321,134 321,244 204,303" fill="url(#glass)"/><path d="M204 264L243 220L263 228L299 187L321 204V244L204 303Z" fill="#a8c9b3"/><path d="M263 163V274M204 248L321 189" stroke="#edf2e8" strokeWidth="7"/><polygon points="189,320 332,248 343,255 200,328" fill="#e4e9d9"/><path d="M205 193L241 175L205 236Z" fill="#ffffff55"/>
 <polygon points="695,139 800,192 800,343 695,291" fill="#b2c0b4"/><polygon points="704,156 790,199 790,331 704,288" fill="#c6cfb9"/><path d="M715 176L778 208V303L715 271Z" fill="none" stroke="#aebca7" strokeWidth="3"/><ellipse cx="775" cy="267" rx="3" ry="5" fill="#7c8d76"/>
 <polygon points="534,58 622,102 622,166 534,122" fill="#fff5d9"/><polygon points="542,70 614,106 614,151 542,115" fill="#6693a0"/><path d="M553 107L571 91L582 113L594 105L607 141Z" fill="#d4e4c1"/><ellipse cx="600" cy="109" rx="6" ry="7" fill="#f4ce8e"/>
 <g transform="translate(383 96)"><ellipse rx="20" ry="25" fill="#e9edda"/><ellipse rx="15" ry="20" fill="#f7f6e5"/><path d="M0-12V0L9 5" fill="none" stroke="#788b8f" strokeWidth="3" strokeLinecap="round"/></g>
 <Box u={35} v={35} w={130} d={35} h={110} top="#ceac7f" color="#b48d65" side="#9d7a56"/><Box u={42} v={39} w={116} d={24} h={38} z={61} top="#52656e" color="#475c67" side="#3d515c"/>
 {[0,1,2,3,4,5].map(i=><Box key={i} u={48+i*15} v={45} w={11} d={18} h={26+i%3*5} z={65} color={['#c48777','#9fb7a4','#d8ba72'][i%3]} top="#e6d4a5" side="#6b8390"/>)}
 <Plant u={36} v={105} large/>
 {level>0&&<><Desk u={310} v={55} level={level}/><Developer u={400} v={185}/><Plant u={455} v={40}/></>}
 <polygon points={pts(point(65,210),point(315,210),point(315,420),point(65,420))} fill="#9aabb0" opacity=".65"/>
 <polygon points={pts(point(75,220),point(305,220),point(305,410),point(75,410))} fill="none" stroke="#d3ddd4" strokeWidth="3" strokeDasharray="7 6"/>
 <Desk u={70} v={245} level={hardware}/><Developer u={174} v={385}/>
 {hardware>1&&<Box u={245} v={251} w={35} d={58} h={60} top="#506b7b" color="#3e596e" side="#2a4057"/>}
 <Plant u={435} v={405} large/>
 <Box u={330} v={300} w={60} d={60} h={43} color="#ae8664" top="#e1c198" side="#977451"/><Box u={335} v={305} w={50} d={50} h={6} z={43} top="#edd9b6" color="#c3a47e" side="#bea07b"/>
 {[0,1,2].map(i=><Box key={i} u={337} v={315} w={38} d={22} h={6} z={49+i*6} top={['#d6c693','#a5bdad','#b7accc'][i]} color="#dfdbbd" side="#9c8e90"/>)}
 {level===0&&<><Box u={330} v={50} w={60} d={70} h={45} color="#c99c6a" top="#e3c392" side="#bb895e"/><Box u={365} v={75} w={65} d={60} h={70} color="#bd9669" top="#d9b785" side="#a67e53"/><path d="M760 302L779 312" stroke="#f0ddab" strokeWidth="5"/><g transform="translate(677 363)"><ellipse cx="10" cy="17" rx="33" ry="12" fill="#7d676233"/><path d="M-11 10Q-20-8-4-17Q22-31 32-10L27 13Q0 30-11 10Z" fill="#dcab79"/><path d="M-9-10L-13-29L2-20L17-22L28-31L29-11" fill="#d3a16f"/><path d="M-10 7Q-37-6-34 15" fill="none" stroke="#d3a16f" strokeWidth="9" strokeLinecap="round"/><path d="M1-10L5-8M17-10L21-8" stroke="#5e5355" strokeWidth="2"/><path d="M10-1L13 1L10 3" fill="#a36c5c"/></g></>}
 {level>1&&<><Box u={350} v={245} w={70} d={100} h={70} color="#324e63" top="#536f7a" side="#263f55"/>{[0,1,2].map(i=><g key={i}><path d={`M${point(425,265,20+i*17)[0]} ${point(425,265,20+i*17)[1]}l22 -11`} stroke="#8399a6" strokeWidth="5"/><circle cx={point(425,265,20+i*17)[0]+26} cy={point(425,265,20+i*17)[1]-13} r="3" fill="#8fe5b9"/></g>)}</>}
 </g>
 <g className="scene-sparkles" fill="#ffffffbb"><path d="M130 110v14m-7-7h14M892 318v14m-7-7h14M800 504v10m-5-5h10" stroke="#ffffffbb" strokeWidth="2"/><circle cx="101" cy="436" r="3"/><circle cx="874" cy="102" r="3"/></g>
 </svg>
 <button className="scene-hotspot desk-hotspot" onClick={onDesk} aria-label="Interagir com o computador: trabalhar na task ou planejar com o time"><span className="hotspot-dot"/><span>{state.career.enabled?(order>=4?'Planejar com o time':'Trabalhar na task'):(state.studio.project?'Continuar projeto':'Criar um projeto')} <b>↗</b></span></button>
 <button className="scene-hotspot book-hotspot" onClick={onResearch} aria-label="Interagir com os livros: estudar"><span className="hotspot-dot"/><span>Estudar e evoluir</span></button>
 <button className="scene-hotspot upgrade-hotspot" onClick={onUpgrade} aria-label="Ver minha carreira"><span className="hotspot-dot"/><span>Minha próxima promoção</span></button>
 {activity&&<div key={activityKey} className="activity-bubble" style={{'--bubble-color':'#35a99b'} as CSSProperties}>{activity}</div>}
 </div>;
};
