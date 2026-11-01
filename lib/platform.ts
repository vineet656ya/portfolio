import { env } from 'cloudflare:workers';
import {getChatGPTUser} from '@/app/chatgpt-auth';
export const isSites=true;
export const config=(key:string):string=>(env as unknown as Record<string,string>)[key]||'';
export async function identity(){const user=await getChatGPTUser();if(!user)return null;const email=config('ADMIN_EMAIL');if(!email||user.email.toLowerCase()!==email.toLowerCase())return null;return {email:user.email};}
export async function allRows(){const r=await env.DB!.prepare("SELECT id,kind,data FROM records WHERE kind IN ('entry','settings','media')").all<{id:string;kind:string;data:string}>();return r.results.map(x=>({...x,data:JSON.parse(x.data)}));}
export async function putRow(id:string,kind:string,data:unknown,ignore=false){await env.DB!.prepare(ignore?'INSERT OR IGNORE INTO records(id,kind,data) VALUES(?,?,?)':'INSERT INTO records(id,kind,data) VALUES(?,?,?) ON CONFLICT(id) DO UPDATE SET kind=excluded.kind,data=excluded.data').bind(id,kind,JSON.stringify(data)).run()}
export async function removeRow(id:string){await env.DB!.prepare('DELETE FROM records WHERE id=?').bind(id).run()}
export async function putFile(key:string,bytes:ArrayBuffer,type:string){await env.BUCKET!.put(key,bytes,{httpMetadata:{contentType:type}})}
export async function getFile(key:string){const o=await env.BUCKET!.get(key);return o?{bytes:await o.arrayBuffer(),type:o.httpMetadata?.contentType||'application/octet-stream'}:null}
export async function removeFile(key:string){await env.BUCKET!.delete(key)}
export async function putRows(rows:{id:string;kind:string;data:unknown}[]){if(!rows.length)return;await env.DB!.batch(rows.map(r=>env.DB!.prepare('INSERT INTO records(id,kind,data) VALUES(?,?,?) ON CONFLICT(id) DO UPDATE SET kind=excluded.kind,data=excluded.data').bind(r.id,r.kind,JSON.stringify(r.data))))}
export async function consumeRate(id:string,limit:number,now:number){const r=await env.DB!.prepare(`INSERT INTO records(id,kind,data) VALUES(?,'rate',json_object('count',1,'until',?)) ON CONFLICT(id) DO UPDATE SET data=json_object('count',CASE WHEN json_extract(records.data,'$.until')<? THEN 1 ELSE json_extract(records.data,'$.count')+1 END,'until',CASE WHEN json_extract(records.data,'$.until')<? THEN ? ELSE json_extract(records.data,'$.until') END) WHERE json_extract(records.data,'$.until')<? OR json_extract(records.data,'$.count')<? RETURNING id`).bind(id,now+600000,now,now,now+600000,now,limit).first();return !!r}

export async function logoutSession(){}
export async function getRow(id:string){const r=await env.DB!.prepare('SELECT id,kind,data FROM records WHERE id=?').bind(id).first<{id:string;kind:string;data:string}>();return r?{...r,data:JSON.parse(r.data)}:null}
