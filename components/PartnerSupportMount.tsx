'use client';
import {PartnerSupportPortal} from '@/components/PartnerSupportPortal';
type Partner={id:string;name:string;contact:string};export function PartnerSupportMount({partner}:{partner:Partner}){return <PartnerSupportPortal partner={partner}/>}
