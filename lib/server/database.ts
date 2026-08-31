export type DbStatus={configured:boolean;provider:'postgres';message:string};
export function databaseStatus():DbStatus{const configured=Boolean(process.env.DATABASE_URL);return{configured,provider:'postgres',message:configured?'PostgreSQL environment is configured.':'DATABASE_URL is not configured yet.'}}
export function requireDatabaseUrl(){const url=process.env.DATABASE_URL;if(!url)throw new Error('DATABASE_URL_NOT_CONFIGURED');return url}
// Database queries are intentionally kept behind this server-only module.
// The PostgreSQL driver is installed at Vercel cutover so GitHub Pages static
// builds remain dependency-safe during the migration phase.
