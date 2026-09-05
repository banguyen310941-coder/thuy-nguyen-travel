import {redirect} from 'next/navigation';

export default function AdminAffiliatesPage(){
 redirect('/admin?module=network&tab=affiliates');
}
