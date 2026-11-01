import {spawn} from 'node:child_process';
const command=process.argv[2];if(!['build','dev','start'].includes(command))throw new Error('Expected build, dev or start.');
const child=spawn(process.execPath,['node_modules/next/dist/bin/next',command,...process.argv.slice(3)],{stdio:'inherit',env:{...process.env,PORTFOLIO_BUILD_TARGET:'vercel',NEXT_TELEMETRY_DISABLED:'1'}});
child.on('exit',code=>process.exit(code??1));
