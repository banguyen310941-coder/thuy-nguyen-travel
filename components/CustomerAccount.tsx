'use client';
import Link from 'next/link';import {useEffect,useState} from 'react';
export type CustomerAccount={id:string;name:string;phone:string;email:string;password:string;createdAt:string;status:'active'|'blocked'};
export const CUSTOMER_ACCOUNTS_KEY='happygo_customer_accounts_v1';export const CUSTOMER_SESSION_KEY='happygo_customer_session_v1';
export function readCustomerAccounts():CustomerAccount[]{try{const x=JSON.parse(localStorage.getItem(CUSTOMER_ACCOUNTS_KEY)||'[]');return Array.isArray(x)?x:[]}catch{return[]}}
export function CustomerAccountBadge(){const[name,setName]=useState('');useEffect(()=>{const load=()=>{const id=localStorage.getItem(CUSTOMER_SESSION_KEY)||'';setName(readCustomerAccounts().find(x=>x.id===id)?.name||'')};load();window.addEventListener('happygo-customer-auth',load);return()=>window.removeEventListener('happygo-customer-auth',load)},[]);return <Link href="/account" className="customer-account-link">👤 {name||'Tài khoản'}</Link>}
