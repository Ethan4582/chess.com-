'use client'

import React, { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { AppLayout } from '@/components/AppLayout';
import AuthGuard from '@/components/AuthGuard';
import { ProfileView } from '@/components/ProfileView';
import { supabase } from '@/lib/supabaseClient';

export default function DetailedProfilePage() {
  const params = useParams();
  const userId = params.id as string;
  const router = useRouter();
  const [isOwn, setIsOwn] = useState(false);

  useEffect(() => {
    const checkOwn = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (session?.user.id === userId) {
        setIsOwn(true);
        // User could stay here, but requested redirect to /history if own profile
        router.replace('/history');
      }
    };
    if (userId) checkOwn();
  }, [userId]);

  if (!userId || isOwn) return null;

  return (
    <AuthGuard>
      <AppLayout>
        <ProfileView targetUserId={userId} isOwnProfile={false} />
      </AppLayout>
    </AuthGuard>
  );
}
