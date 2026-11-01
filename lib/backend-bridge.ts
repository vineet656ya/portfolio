import {z} from 'zod';
import * as p from '@/lib/platform';
const id=z.string().regex(/^[a-zA-Z0-9-]{1,150}$/);
const row=z.object({id,kind:z.enum(['entry','settings','media','session','rate']),data:z.unknown()});
const storageKey=z.string().regex(/^[a-z][a-z0-9-]{0,49}\/[a-zA-Z0-9-]+\.(png|jpg|webp|pdf)$/);
const requestSchema=z.discriminatedUnion('operation',[
 z.object({operation:z.literal('allRows')}),
 z.object({operation:z.literal('getRow'),id}),
 z.object({operation:z.literal('putRow'),row,ignore:z.boolean().optional()}),
 z.object({operation:z.literal('putRows'),rows:z.array(row).max(501)}),
 z.object({operation:z.literal('removeRow'),id}),
 z.object({operation:z.literal('putFile'),key:storageKey,type:z.enum(['image/png','image/jpeg','image/webp','application/pdf']),base64:z.string().max(5600000)}),
 z.object({operation:z.literal('getFile'),key:storageKey}),
 z.object({operation:z.literal('removeFile'),key:storageKey}),
 z.object({operation:z.literal('consumeRate'),id,limit:z.number().int().min(1).max(100),now:z.number().int().positive()})
]);
async function authorized(request:Request){const expected=p.config('PORTFOLIO_BRIDGE_SECRET');const actual=request.headers.get('x-portfolio-backend-key')||'';if(expected.length<64||actual.length!==expected.length)return false;const encode=new TextEncoder();const [a,b]=await Promise.all([crypto.subtle.digest('SHA-256',encode.encode(expected)),crypto.subtle.digest('SHA-256',encode.encode(actual))]);const av=new Uint8Array(a),bv=new Uint8Array(b);let diff=0;for(let i=0;i<av.length;i++)diff|=av[i]^bv[i];return diff===0}
export async function backendBridge(request:Request){if(!p.isSites)return Response.json({error:'Not found.'},{status:404});if(request.method!=='POST'||!await authorized(request))return Response.json({error:'Unauthorized.'},{status:401});if(Number(request.headers.get('content-length')||0)>8*1024*1024)return Response.json({error:'Request too large.'},{status:413});try{const body=requestSchema.parse(await request.json());let result:unknown=null;switch(body.operation){case'allRows':result=await p.allRows();break;case'getRow':result=await p.getRow(body.id);break;case'putRow':await p.putRow(body.row.id,body.row.kind,body.row.data,body.ignore);break;case'putRows':await p.putRows(body.rows.map(r=>({id:r.id,kind:r.kind,data:r.data})));break;case'removeRow':await p.removeRow(body.id);break;case'putFile':{const bytes=Uint8Array.from(atob(body.base64),c=>c.charCodeAt(0));if(bytes.length>4*1024*1024)throw new Error('File too large.');await p.putFile(body.key,bytes.buffer,body.type);break}case'getFile':{const file=await p.getFile(body.key);result=file?{base64:Buffer.from(file.bytes).toString('base64'),type:file.type}:null;break}case'removeFile':await p.removeFile(body.key);break;case'consumeRate':result=await p.consumeRate(body.id,body.limit,body.now);break}return Response.json({result},{headers:{'Cache-Control':'no-store','X-Content-Type-Options':'nosniff'}})}catch{return Response.json({error:'Backend request failed.'},{status:400})}}
