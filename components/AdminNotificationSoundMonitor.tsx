'use client';

import {useEffect} from 'react';

const SOUND_PREF_KEY='happygo_admin_notification_sound_v1';
const WORK_ROOT='.admin-chat-notify .admin-bell';
const ATTENDANCE_ROOT='.attendance-notify .attendance-notify-trigger';

type AudioWindow=Window&{webkitAudioContext?:typeof AudioContext};
type CounterState={root:Element|null;count:number;ready:boolean};

let audioContext:AudioContext|null=null;
let lastPlayedAt=0;

function soundEnabled(){
 try{return localStorage.getItem(SOUND_PREF_KEY)!=='off'}catch{return true}
}

function getAudioContext(){
 if(audioContext&&audioContext.state!=='closed')return audioContext;
 const Ctor=window.AudioContext||(window as AudioWindow).webkitAudioContext;
 if(!Ctor)return null;
 try{audioContext=new Ctor();return audioContext}catch{return null}
}

function tone(ctx:AudioContext,start:number,frequency:number,duration:number,peak:number){
 const osc=ctx.createOscillator(),gain=ctx.createGain();
 osc.type='sine';
 osc.frequency.setValueAtTime(frequency,start);
 gain.gain.setValueAtTime(.0001,start);
 gain.gain.exponentialRampToValueAtTime(peak,start+.012);
 gain.gain.exponentialRampToValueAtTime(.0001,start+duration);
 osc.connect(gain);gain.connect(ctx.destination);
 osc.start(start);osc.stop(start+duration+.03);
}

function playNotificationChime(){
 if(!soundEnabled())return;
 const now=Date.now();
 if(now-lastPlayedAt<900)return;
 lastPlayedAt=now;
 const ctx=getAudioContext();
 if(!ctx)return;
 const play=()=>{
  const start=ctx.currentTime+.015;
  tone(ctx,start,880,.24,.045);
  tone(ctx,start+.11,1174.66,.30,.035);
  tone(ctx,start+.29,659.25,.32,.032);
  try{if('vibrate'in navigator)navigator.vibrate?.([70,45,90])}catch{}
 };
 if(ctx.state==='suspended')void ctx.resume().then(play).catch(()=>{});else play();
}

function countFor(root:Element|null){
 if(!root)return 0;
 const badge=root.querySelector('strong');
 if(!badge)return 0;
 const value=parseInt(String(badge.textContent||'0').replace(/\D/g,''),10);
 return Number.isFinite(value)?value:0;
}

export function AdminNotificationSoundMonitor(){
 useEffect(()=>{
  const states=new Map<string,CounterState>([
   [WORK_ROOT,{root:null,count:0,ready:false}],
   [ATTENDANCE_ROOT,{root:null,count:0,ready:false}],
  ]);
  let queued=false;
  const scan=()=>{
   queued=false;
   let shouldRing=false;
   for(const [selector,state] of states){
    const root=document.querySelector(selector);
    if(!root){state.root=null;state.count=0;state.ready=false;continue}
    const count=countFor(root);
    if(!state.ready||state.root!==root){state.root=root;state.count=count;state.ready=true;continue}
    if(count>state.count)shouldRing=true;
    state.count=count;
   }
   if(shouldRing)playNotificationChime();
  };
  const scheduleScan=()=>{
   if(queued)return;queued=true;
   queueMicrotask(scan);
  };
  const observer=new MutationObserver(scheduleScan);
  observer.observe(document.body,{subtree:true,childList:true,characterData:true});
  const unlock=()=>{if(!soundEnabled())return;const ctx=getAudioContext();if(ctx?.state==='suspended')void ctx.resume().catch(()=>{})};
  window.addEventListener('pointerdown',unlock,{passive:true});
  window.addEventListener('touchstart',unlock,{passive:true});
  window.addEventListener('keydown',unlock);
  const appEvents=['happygo-team-chat-v4','tn-bookings-updated','happygo-crm-assignment','happygo-crm-followups-updated','happygo-customer-feedback-updated','happygo-partners-updated','happygo-partner-support-updated','happygo-payment-updated','happygo-customer-receipts-updated','happygo-booking-ops-updated','happygo-attendance-updated'];
  appEvents.forEach(event=>window.addEventListener(event,scheduleScan));
  scan();
  return()=>{
   observer.disconnect();
   window.removeEventListener('pointerdown',unlock);
   window.removeEventListener('touchstart',unlock);
   window.removeEventListener('keydown',unlock);
   appEvents.forEach(event=>window.removeEventListener(event,scheduleScan));
  };
 },[]);
 return null;
}
