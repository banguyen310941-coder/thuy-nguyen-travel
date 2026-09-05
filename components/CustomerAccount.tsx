'use client';
import Link from 'next/link';
import {useEffect,useState} from 'react';

export type CustomerAccount={id:string;customerId:string;name:string;phone:string;email:string;status:'active'|'blocked';createdAt:string;lastLoginAt?:string};
export const CUSTOMER_ACCOUNTS_KEY='happygo_customer_accounts_v1';
export const CUSTOMER_SESSION_KEY='happygo_customer_session_v1';
export function readCustomerAccounts():CustomerAccount[]{return[]}

export function CustomerAccountBadge(){
 const[name,setName]=useState('');
 useEffect(()=>{
  let alive=true;
  const load=async()=>{try{const r=await fetch('/api/account',{cache:'no-store'});const j=await r.json();if(alive)setName(j.authenticated?String(j.account?.name||''):'')}catch{if(alive)setName('')}};
  void load();
  const refresh=()=>void load();window.addEventListener('happygo-customer-auth',refresh);
  return()=>{alive=false;window.removeEventListener('happygo-customer-auth',refresh)};
 },[]);
 return <Link href="/tai-khoan" className="customer-account-link">👤 {name||'Tài khoản'}</Link>;
}
