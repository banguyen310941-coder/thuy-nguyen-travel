'use client';
import Link from 'next/link';
import {useEffect,useState} from 'react';
export type CartItem={id:string;kind:string;product:string;unit?:string;startDate?:string;endDate?:string;adults:number;children:number;rooms:number;priceLabel?:string;createdAt:string};
const KEY='tn_booking_cart_v1';
export function readCart():CartItem[]{try{return JSON.parse(localStorage.getItem(KEY)||'[]')}catch{return[]}}
export function writeCart(items:CartItem[]){localStorage.setItem(KEY,JSON.stringify(items));window.dispatchEvent(new Event('tn-cart-updated'))}
export function addCartItem(item:Omit<CartItem,'id'|'createdAt'>){const items=readCart();const next:CartItem={...item,id:`cart_${Date.now()}_${Math.random().toString(36).slice(2,6)}`,createdAt:new Date().toISOString()};writeCart([...items,next]);return next}
export function BookingCartBadge(){const[count,setCount]=useState(0);useEffect(()=>{const load=()=>setCount(readCart().length);load();window.addEventListener('tn-cart-updated',load);window.addEventListener('storage',load);return()=>{window.removeEventListener('tn-cart-updated',load);window.removeEventListener('storage',load)}},[]);return <Link className="booking-cart-badge" href="/checkout" aria-label={`Giỏ đặt dịch vụ có ${count} mục`}><span>🧳</span><b>Đặt dịch vụ</b>{count>0&&<em>{count}</em>}</Link>}
