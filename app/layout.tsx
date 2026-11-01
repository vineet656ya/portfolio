import type {Metadata} from 'next';
import './globals.css';
export const metadata:Metadata={title:'Your Name — Developer · Problem Solver',description:'Computer Science student in Your city exploring backend engineering, full-stack systems and AI. Build. Solve. Learn. Evolve.',icons:{icon:'/assets/favicon.svg'}};
export default function RootLayout({children}:{children:React.ReactNode}){return <html lang="en"><body>{children}</body></html>}
