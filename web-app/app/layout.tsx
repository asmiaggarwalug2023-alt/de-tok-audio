import type { Metadata } from 'next';
import './globals.css';
import InstallApp from './install-app';
export const metadata: Metadata = {title:'De-Tok | Evidence, not influence',description:'A friendly evidence companion for health and wellness claims. Explore the papers behind your feed.',manifest:'/manifest.webmanifest',icons:{icon:'/favicon.svg',apple:'/icon-192.png'}};
export default function RootLayout({children}:{children:React.ReactNode}) { return <html lang="en"><body><InstallApp/>{children}</body></html>; }
