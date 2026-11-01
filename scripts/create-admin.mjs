import {pbkdf2Sync,randomBytes} from 'node:crypto';
import readline from 'node:readline';
process.stdout.write('Enter admin password (input hidden): ');
const rl=readline.createInterface({input:process.stdin,output:process.stdout,terminal:true});
rl._writeToOutput=()=>{};
rl.question('',password=>{rl.close();if(password.length<12){console.error('\nUse at least 12 characters.');process.exit(1)}const salt=randomBytes(24).toString('hex');const hash=pbkdf2Sync(password,salt,210000,32,'sha256').toString('hex');console.log('\nADMIN_PASSWORD_HASH='+salt+':'+hash);console.log('SESSION_SECRET='+randomBytes(48).toString('hex'));console.log('Add these to Vercel environment variables. Do not commit them.');});
