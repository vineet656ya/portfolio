const encoder=new TextEncoder();
function hex(bytes:Uint8Array){return [...bytes].map(b=>b.toString(16).padStart(2,'0')).join('')}
function equal(a:string,b:string){if(a.length!==b.length)return false;let n=0;for(let i=0;i<a.length;i++)n|=a.charCodeAt(i)^b.charCodeAt(i);return n===0}
export async function verifyPassword(password:string,stored:string){const [salt,expected]=stored.split(':');if(!salt||!expected)return false;const key=await crypto.subtle.importKey('raw',encoder.encode(password),'PBKDF2',false,['deriveBits']);const bits=await crypto.subtle.deriveBits({name:'PBKDF2',salt:encoder.encode(salt),iterations:210000,hash:'SHA-256'},key,256);return equal(hex(new Uint8Array(bits)),expected)}
async function sign(payload:string){const secret=process.env.SESSION_SECRET;if(!secret||secret.length<32)throw new Error('SESSION_SECRET must contain at least 32 characters.');const key=await crypto.subtle.importKey('raw',encoder.encode(secret),{name:'HMAC',hash:'SHA-256'},false,['sign']);return hex(new Uint8Array(await crypto.subtle.sign('HMAC',key,encoder.encode(payload))))}
export async function createSession(){const payload=Date.now()+8*3600000+':'+crypto.randomUUID();return payload+'.'+await sign(payload)}
export async function verifySession(token:string){try{const [payload,sig]=token.split('.');return !!sig&&Number(payload.split(':')[0])>Date.now()&&equal(await sign(payload),sig)}catch{return false}}
export function sameOrigin(request:Request){const origin=request.headers.get('origin');return !!origin&&origin===new URL(request.url).origin}
