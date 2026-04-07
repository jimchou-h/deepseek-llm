import { redirect } from 'next/navigation';

export const dynamic = 'force-dynamic';
export const fetchCache = 'force-cache';
export const runtime = 'nodejs';
export const preferredRegion = 'auto';

export default function Home() {
  redirect('/chat');
}
