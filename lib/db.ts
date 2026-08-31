import {neon} from '@neondatabase/serverless';

export function hasDatabase(){return Boolean(process.env.DATABASE_URL)}

export function db(){
 const url=process.env.DATABASE_URL;
 if(!url)throw new Error('DATABASE_URL is not configured');
 return neon(url);
}

export async function databaseHealth(){
 if(!hasDatabase())return{configured:false,ok:false,message:'DATABASE_URL chưa được cấu hình'};
 try{const sql=db();const rows=await sql`select now() as now`;return{configured:true,ok:true,now:rows[0]?.now}}catch(error){return{configured:true,ok:false,message:error instanceof Error?error.message:'Database connection failed'}}
}
