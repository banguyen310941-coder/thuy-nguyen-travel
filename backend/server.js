import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import mysql from 'mysql2/promise';
import crypto from 'node:crypto';

const app = express();
const port = Number(process.env.PORT || 3001);
const allowedOrigins = String(process.env.ALLOWED_ORIGINS || '').split(',').map(v=>v.trim()).filter(Boolean);

app.use(cors({origin(origin, callback){if(!origin||allowedOrigins.length===0||allowedOrigins.includes(origin))return callback(null,true);return callback(new Error('Origin not allowed'));}}));
app.use(express.json({limit:'1mb'}));

const pool = mysql.createPool({uri:process.env.DATABASE_URL,connectionLimit:10,charset:'utf8mb4'});
const statuses = new Set(['new','contacting','confirmed','completed','cancelled']);
const customerStatuses = new Set(['lead','contacting','customer','inactive']);

function adminOnly(req,res,next){const expected=process.env.ADMIN_API_KEY;if(!expected)return res.status(503).json({error:'ADMIN_API_KEY is not configured'});const supplied=req.get('x-admin-key');if(!supplied||supplied!==expected)return res.status(401).json({error:'Unauthorized'});next();}
function code(){const d=new Date();const y=d.getFullYear();const m=String(d.getMonth()+1).padStart(2,'0');const day=String(d.getDate()).padStart(2,'0');return `TN-${y}${m}${day}-${crypto.randomBytes(3).toString('hex').toUpperCase()}`;}

app.get('/api/health',async(_req,res)=>{try{await pool.query('SELECT 1');res.json({ok:true,service:'thuy-nguyen-travel-booking-api'});}catch{res.status(500).json({ok:false,error:'Database unavailable'});}});

app.post('/api/bookings',async(req,res)=>{
  const body=req.body||{};const customerName=String(body.customerName||'').trim();const phone=String(body.phone||'').trim();const product=String(body.product||'').trim();const kind=String(body.kind||'dịch vụ').trim();
  if(!customerName||!phone||!product)return res.status(400).json({error:'customerName, phone and product are required'});
  const bookingCode=code();const conn=await pool.getConnection();
  try{
    await conn.beginTransaction();
    await conn.execute(`INSERT INTO customers (customer_name,phone,email,source,first_booking_at,last_booking_at) VALUES (?,?,?,?,NOW(),NOW()) ON DUPLICATE KEY UPDATE customer_name=VALUES(customer_name),email=COALESCE(VALUES(email),email),source=VALUES(source),last_booking_at=NOW()`,[customerName,phone,body.email||null,body.source||'website']);
    const [result]=await conn.execute(`INSERT INTO bookings (code,kind,product,customer_name,phone,email,start_date,end_date,adults,children,rooms,note,source) VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?)`,[bookingCode,kind,product,customerName,phone,body.email||null,body.startDate||null,body.endDate||null,Math.max(1,Number(body.adults||1)),Math.max(0,Number(body.children||0)),Math.max(1,Number(body.rooms||1)),body.note||null,body.source||'website']);
    await conn.commit();res.status(201).json({ok:true,id:result.insertId,code:bookingCode,status:'new'});
  }catch(error){await conn.rollback();throw error;}finally{conn.release();}
});

app.get('/api/bookings',adminOnly,async(req,res)=>{const status=String(req.query.status||'').trim();const q=String(req.query.q||'').trim();const where=[];const params=[];if(status&&statuses.has(status)){where.push('status=?');params.push(status);}if(q){where.push('(code LIKE ? OR customer_name LIKE ? OR phone LIKE ? OR product LIKE ?)');const like=`%${q}%`;params.push(like,like,like,like);}const sql=`SELECT * FROM bookings ${where.length?`WHERE ${where.join(' AND ')}`:''} ORDER BY created_at DESC LIMIT 500`;const [rows]=await pool.execute(sql,params);res.json({items:rows});});

app.patch('/api/bookings/:id',adminOnly,async(req,res)=>{const id=Number(req.params.id);if(!Number.isFinite(id))return res.status(400).json({error:'Invalid id'});const body=req.body||{};const fields=[];const params=[];if(body.status){if(!statuses.has(body.status))return res.status(400).json({error:'Invalid status'});fields.push('status=?');params.push(body.status);}if(Object.prototype.hasOwnProperty.call(body,'adminNote')){fields.push('admin_note=?');params.push(body.adminNote||null);}if(!fields.length)return res.status(400).json({error:'Nothing to update'});params.push(id);await pool.execute(`UPDATE bookings SET ${fields.join(',')} WHERE id=?`,params);const [rows]=await pool.execute('SELECT * FROM bookings WHERE id=?',[id]);if(body.status==='confirmed'&&rows[0]?.phone)await pool.execute("UPDATE customers SET status='customer',last_booking_at=NOW() WHERE phone=?",[rows[0].phone]);res.json({ok:true,item:rows[0]||null});});

app.get('/api/customers',adminOnly,async(req,res)=>{const q=String(req.query.q||'').trim();const status=String(req.query.status||'').trim();const where=[];const params=[];if(status&&customerStatuses.has(status)){where.push('c.status=?');params.push(status);}if(q){const like=`%${q}%`;where.push('(c.customer_name LIKE ? OR c.phone LIKE ? OR c.email LIKE ?)');params.push(like,like,like);}const [rows]=await pool.execute(`SELECT c.*, COUNT(b.id) AS booking_count, MAX(b.created_at) AS latest_booking_at FROM customers c LEFT JOIN bookings b ON b.phone=c.phone ${where.length?`WHERE ${where.join(' AND ')}`:''} GROUP BY c.id ORDER BY COALESCE(c.last_booking_at,c.created_at) DESC LIMIT 500`,params);res.json({items:rows});});

app.get('/api/customers/:id',adminOnly,async(req,res)=>{const id=Number(req.params.id);const [customers]=await pool.execute('SELECT * FROM customers WHERE id=?',[id]);if(!customers[0])return res.status(404).json({error:'Customer not found'});const [bookings]=await pool.execute('SELECT * FROM bookings WHERE phone=? ORDER BY created_at DESC',[customers[0].phone]);res.json({item:customers[0],bookings});});

app.patch('/api/customers/:id',adminOnly,async(req,res)=>{const id=Number(req.params.id);const body=req.body||{};const fields=[];const params=[];if(body.status){if(!customerStatuses.has(body.status))return res.status(400).json({error:'Invalid status'});fields.push('status=?');params.push(body.status);}if(Object.prototype.hasOwnProperty.call(body,'note')){fields.push('note=?');params.push(body.note||null);}if(!fields.length)return res.status(400).json({error:'Nothing to update'});params.push(id);await pool.execute(`UPDATE customers SET ${fields.join(',')} WHERE id=?`,params);const [rows]=await pool.execute('SELECT * FROM customers WHERE id=?',[id]);res.json({ok:true,item:rows[0]||null});});

app.use((error,_req,res,_next)=>{console.error(error);res.status(500).json({error:'Internal server error'});});
app.listen(port,()=>console.log(`Booking API running on :${port}`));
