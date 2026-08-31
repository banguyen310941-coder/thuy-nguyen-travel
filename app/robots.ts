import type {MetadataRoute} from 'next';export const dynamic='force-static';
export default function robots():MetadataRoute.Robots{return{rules:[{userAgent:'*',allow:'/',disallow:['/admin/','/partner/','/account/','/checkout/','/api/','/search','/product','/tour-product','/guide/read']}],sitemap:'https://happygo.vn/sitemap.xml',host:'https://happygo.vn'}}
