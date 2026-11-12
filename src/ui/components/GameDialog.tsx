import { useEffect, useRef } from 'react';
import type { ReactNode } from 'react';
import { GameIcon } from './GameIcon';
export function GameDialog({title,onClose,children,required=false}:{title:string;onClose:()=>void;children:ReactNode;required?:boolean}) {
 const ref=useRef<HTMLDialogElement>(null);
 useEffect(()=>{const dialog=ref.current;dialog?.showModal();return()=>dialog?.close();},[]);
 return <dialog ref={ref} className="game-dialog" aria-label={title} onCancel={event=>{event.preventDefault();if(!required)onClose();}} onClick={event=>{if(!required&&event.target===event.currentTarget)onClose();}}><header><div><span className="overline">DO ESTAGIÁRIO AO ARQUITETO</span><h2>{title}</h2></div>{!required&&<button className="icon-button" onClick={onClose} aria-label="Fechar"><GameIcon name="close"/></button>}</header>{children}</dialog>;
}
