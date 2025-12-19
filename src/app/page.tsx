'use client';

import Link from 'next/link';
import { useAuthStore } from '@/store';
import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function Home() {
  const { token } = useAuthStore();
  const router = useRouter();

  useEffect(() => {
    if (token) {
      router.push('/dashboard');
    }
  }, [token, router]);

  return (
    <main className="min-h-screen flex flex-col">
      {/* Header */}
      <header className="p-6">
        <div className="max-w-6xl mx-auto">
          <h1 className="text-xl font-semibold text-evident-800">Evident</h1>
        </div>
      </header>

      {/* Hero */}
      <div className="flex-1 flex items-center">
        <div className="max-w-6xl mx-auto px-6 py-20">
          <div className="max-w-2xl">
            <h2 className="text-4xl md:text-5xl font-semibold text-evident-900 leading-tight mb-6">
              Turn daily work into structured evidence.
            </h2>
            <p className="text-xl text-evident-500 mb-8">
              Log what you do. Generate clean summaries when asked.
            </p>
            <div className="flex flex-col sm:flex-row gap-4">
              <Link href="/auth" className="btn-primary text-center">
                Start logging
              </Link>
              <button className="btn-secondary">View example output</button>
            </div>
            <p className="text-sm text-evident-400 mt-6">
              For professionals who need proof, not explanations.
            </p>
          </div>
        </div>
      </div>

      {/* Footer */}
      <footer className="p-6 border-t border-evident-200">
        <div className="max-w-6xl mx-auto">
          <p className="text-sm text-evident-400">
            Your logs stay yours. Evident records work as entered. It does not interpret or modify your activity.
          </p>
        </div>
      </footer>
    </main>
  );
}
