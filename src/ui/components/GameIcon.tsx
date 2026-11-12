import type { CSSProperties } from 'react';
export const GameIcon = ({name,size=22,style}:{name:string;size?:number;style?:CSSProperties}) => {
 const paths:Record<string,string>={
 code:'m8 7-5 5 5 5m8-10 5 5-5 5m-3-13-2 16',
 coin:'M12 3a9 9 0 1 0 0 18 9 9 0 0 0 0-18Zm3 5h-4a2 2 0 0 0 0 4h2a2 2 0 0 1 0 4H9m3-10v12',
 fans:'M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2m20 0v-2a4 4 0 0 0-3-3.87M9 3a4 4 0 1 0 0 8 4 4 0 0 0 0-8m8 .13a4 4 0 0 1 0 7.75',
 idea:'M9 18h6m-5 3h4M8 14a7 7 0 1 1 8 0c-1 1-1 2-1 3H9c0-1 0-2-1-3Z',
 energy:'m13 2-9 12h7l-1 8 10-13h-8l1-7Z',
 sun:'M12 8a4 4 0 1 0 0 8 4 4 0 0 0 0-8m0-6v2m0 16v2M2 12h2m16 0h2M5 5l1 1m12 12 1 1M5 19l1-1M18 6l1-1',
 moon:'M21 13a9 9 0 0 1-10-10A9 9 0 1 0 21 13Z',
 play:'m9 5 11 7-11 7V5Z',
 plus:'M12 5v14M5 12h14',
 research:'m9 3 1 7-5 8a2 2 0 0 0 2 3h10a2 2 0 0 0 2-3l-5-8 1-7M8 3h8M8 15h8',
 upgrade:'m12 3 7 7h-4v10H9V10H5l7-7Z',
 trophy:'M8 3h8v7a4 4 0 0 1-8 0V3ZM8 5H4v3a4 4 0 0 0 4 4m8-7h4v3a4 4 0 0 1-4 4m-4 2v6m-4 0h8',
 globe:'M21 12a9 9 0 1 0-18 0 9 9 0 0 0 18 0ZM3 12h18M12 3a17 17 0 0 1 0 18 17 17 0 0 1 0-18Z',
 phone:'M7 2h10a1 1 0 0 1 1 1v18a1 1 0 0 1-1 1H7a1 1 0 0 1-1-1V3a1 1 0 0 1 1-1Zm3 16h4',
 game:'M7 7h10a4 4 0 0 1 4 3l1 7a2 2 0 0 1-3 2l-4-3H9l-4 3a2 2 0 0 1-3-2l1-7a4 4 0 0 1 4-3Zm-1 4h4m-2-2v4m8-3h.01m2 3h.01',
 cloud:'M6 18a4 4 0 0 1-1-8 7 7 0 0 1 13-2 5 5 0 0 1 0 10H6Z',
 save:'M4 3h13l4 4v14H3V3h1Zm3 0v6h10V3M7 21v-7h10v7',
 book:'M12 6Q7 2 2 5v15q5-3 10 0 5-3 10 0V5q-5-3-10 1Zm0 0v14',
 check:'m5 12 4 4L19 6',
 close:'m6 6 12 12M6 18 18 6',
 lock:'M6 10h12v11H6V10Zm3 0V6a3 3 0 0 1 6 0v4',
 coffee:'M3 7h13v9a4 4 0 0 1-4 4H7a4 4 0 0 1-4-4V7Zm13 1h2a3 3 0 0 1 0 6h-2M6 2v2m5-2v2',
 star:'m12 2 3 6 7 1-5 5 1 7-6-3-6 3 1-7-5-5 7-1 3-6Z',
 home:'m3 10 9-7 9 7v11H3V10Zm6 11v-8h6v8',
 sound:'M11 5 6 9H2v6h4l5 4V5Zm4 3a6 6 0 0 1 0 8m3-11a10 10 0 0 1 0 14',
 };
 return <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" style={style} aria-hidden="true"><path d={paths[name]??paths.code}/></svg>;
};
