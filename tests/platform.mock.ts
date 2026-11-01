export let isSites=false;export let loggedIn=false;
export const rows=new Map<string,{id:string;kind:string;data:any}>();export const files=new Map<string,{bytes:ArrayBuffer;type:string}>();
export function setAdmin(value:boolean){loggedIn=value}
export const config=(key:string)=>process.env[key]||'';
export async function identity(){return loggedIn?{email:'admin@example.com'}:null}
export async function allRows(){return [...rows.values()].filter(r=>r.kind!=='rate').map(r=>structuredClone(r))}
export async function putRow(id:string,kind:string,data:unknown,ignore=false){if(!ignore||!rows.has(id))rows.set(id,{id,kind,data:structuredClone(data)})}
export async function removeRow(id:string){rows.delete(id)}
export async function putRows(input:{id:string;kind:string;data:unknown}[]){input.forEach(r=>rows.set(r.id,structuredClone(r)))}
export async function putFile(key:string,bytes:ArrayBuffer,type:string){files.set(key,{bytes,type})}
export async function getFile(key:string){return files.get(key)||null}
export async function removeFile(key:string){files.delete(key)}
export async function consumeRate(id:string,limit:number,now:number){let r=rows.get(id)?.data;if(!r||r.until<now)r={count:0,until:now+600000};if(r.count>=limit)return false;r.count++;rows.set(id,{id,kind:'rate',data:r});return true}

export async function logoutSession(){}

export async function getRow(id:string){return rows.get(id)||null}

export function setSites(value:boolean){isSites=value}
