'use client'

import React, { useEffect, useState } from 'react';
import { AppLayout } from '@/components/AppLayout';
import AuthGuard from '@/components/AuthGuard';
import { ProfileView } from '@/components/ProfileView';
import { supabase } from '@/lib/supabaseClient';

export default function HistoryPage() {
  const [userId, setUserId] = useState<string | null>(null);

  useEffect(() => {
    const fetchSession = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (session) setUserId(session.user.id);
    };
    fetchSession();
  }, []);

  if (!userId) return null;

  return (
    <AuthGuard>
      <AppLayout>
        <ProfileView targetUserId={userId} isOwnProfile={true} />
      </AppLayout>
    </AuthGuard>
  );
}
