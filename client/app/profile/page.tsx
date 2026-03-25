'use client'

import React, { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabaseClient';
import { ProfileView } from '@/components/ProfileView';
import { AppLayout } from '@/components/AppLayout';
import AuthGuard from '@/components/AuthGuard';

export default function ProfilePage() {
  const [userId, setUserId] = useState<string | null>(null);

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session?.user) setUserId(session.user.id);
    });
  }, []);

  if (!userId) {
     return (
       <AuthGuard>
         <AppLayout>
           <div className="flex-1 flex items-center justify-center bg-[#0a0a0b]">
              <div className="w-12 h-12 border-2 border-[#ba9eff]/20 border-t-[#ba9eff] rounded-full animate-spin" />
           </div>
         </AppLayout>
       </AuthGuard>
     );
  }

  return (
    <AuthGuard>
      <AppLayout>
        <ProfileView targetUserId={userId} isOwnProfile={true} />
      </AppLayout>
    </AuthGuard>
  );
}
