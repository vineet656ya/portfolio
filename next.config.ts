import type {NextConfig} from 'next';
import path from 'node:path';
const vercel=process.env.PORTFOLIO_BUILD_TARGET==='vercel'||process.env.VERCEL==='1';
const nextConfig:NextConfig=vercel?{turbopack:{resolveAlias:{'@/lib/platform':'./lib/platform-vercel.ts'}},webpack(config){config.resolve.alias['@/lib/platform']=path.resolve(process.cwd(),'lib/platform-vercel.ts');return config;}}:{};
export default nextConfig;
