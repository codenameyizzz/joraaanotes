'use client';

import React, { useEffect, useState, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft, Loader2, AlertCircle } from 'lucide-react';
import { CapsuleData } from '@/lib/types';
import { decodeCapsule } from '@/lib/storage';
import EnvelopeView from '@/components/EnvelopeView';
import LetterReader from '@/components/LetterReader';
import ShareModal from '@/components/ShareModal';

function OpenCapsuleContent() {
  const searchParams = useSearchParams();
  const [capsule, setCapsule] = useState<CapsuleData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isOpened, setIsOpened] = useState(false);
  const [isShareModalOpen, setIsShareModalOpen] = useState(false);

  useEffect(() => {
    // 1. Try decoding from hash (#data=...)
    const hash = window.location.hash;
    if (hash && hash.includes('data=')) {
      const encoded = hash.split('data=')[1];
      if (encoded) {
        const decoded = decodeCapsule(encoded);
        if (decoded) {
          setCapsule(decoded);
          setLoading(false);
          return;
        }
      }
    }

    // 2. Try fetching from query param (?id=...) or server
    const id = searchParams.get('id');
    if (id) {
      fetch(`/api/capsules/${id}`)
        .then((res) => res.json())
        .then((data) => {
          if (data && data.capsule) {
            setCapsule(data.capsule);
          } else {
            // Check local vault as fallback
            const local = localStorage.getItem('joraaa_saved_capsules');
            if (local) {
              const list: CapsuleData[] = JSON.parse(local);
              const found = list.find((c) => c.id === id);
              if (found) {
                setCapsule(found);
                setLoading(false);
                return;
              }
            }
            setError('Amplop ini tidak ditemukan atau tautan belum lengkap.');
          }
          setLoading(false);
        })
        .catch(() => {
          setError('Gagal memuat amplop kenangan.');
          setLoading(false);
        });
      return;
    }

    // If neither exists
    setError('Tautan amplop tidak menyertakan data pesan.');
    setLoading(false);
  }, [searchParams]);

  if (loading) {
    return (
      <div className="min-h-screen bg-[#FAF7F2] flex flex-col items-center justify-center p-4">
        <Loader2 className="animate-spin text-[#964332] mb-3" size={32} />
        <p className="font-mono text-xs text-[#7A6F63]">Sedang menyiapkan amplop...</p>
      </div>
    );
  }

  if (error || !capsule) {
    return (
      <div className="min-h-screen bg-[#FAF7F2] flex flex-col items-center justify-center p-6 text-center">
        <div className="w-14 h-14 rounded-full bg-[#BA6E52]/15 flex items-center justify-center text-[#BA6E52] mb-4">
          <AlertCircle size={26} />
        </div>
        <h2 className="font-serif text-2xl text-[#2B2520] mb-2">Amplop Tak Ditemukan</h2>
        <p className="text-xs font-sans text-[#7D7061] max-w-sm mb-6">
          {error || 'Mungkin tautan ini terpotong saat dikirimkan atau pesan telah kadaluarsa.'}
        </p>
        <Link
          href="/"
          className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-[#2B2520] text-white text-xs font-mono tracking-wider hover:bg-[#3D352E] transition-all"
        >
          <ArrowLeft size={13} />
          <span>Kembali ke Halaman Utama</span>
        </Link>
      </div>
    );
  }

  const currentUrl = typeof window !== 'undefined' ? window.location.href : '';

  return (
    <>
      {!isOpened ? (
        <EnvelopeView capsule={capsule} onOpen={() => setIsOpened(true)} />
      ) : (
        <LetterReader
          capsule={capsule}
          onBackToEnvelope={() => setIsOpened(false)}
          onShare={() => setIsShareModalOpen(true)}
        />
      )}

      <ShareModal
        isOpen={isShareModalOpen}
        onClose={() => setIsShareModalOpen(false)}
        capsule={capsule}
        shareUrl={currentUrl}
      />
    </>
  );
}

export default function OpenPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-[#FAF7F2] flex items-center justify-center">
          <Loader2 className="animate-spin text-[#964332]" size={28} />
        </div>
      }
    >
      <OpenCapsuleContent />
    </Suspense>
  );
}
