import React, { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';

interface Announcement {
  id: string;
  message: string;
  emoji: string;
  created_at: string;
}

export default function AnnouncementBanner() {
  const [announcement, setAnnouncement] = useState<Announcement | null>(null);
  const [dismissed, setDismissed] = useState(false);

  useEffect(() => {
    supabase
      .from('announcements')
      .select('id, message, emoji, created_at')
      .order('created_at', { ascending: false })
      .limit(1)
      .single()
      .then(({ data }) => {
        if (!data) return;
        const key = `announcement_dismissed_${data.id}`;
        if (!localStorage.getItem(key)) {
          setAnnouncement(data);
        }
      })
      .catch(() => {});
  }, []);

  if (!announcement || dismissed) return null;

  const handleDismiss = () => {
    localStorage.setItem(`announcement_dismissed_${announcement.id}`, '1');
    setDismissed(true);
  };

  return (
    <div className="w-full bg-amber-400 border-b-2 border-amber-500 px-3 py-2 flex items-center gap-2 shrink-0">
      <span className="text-base shrink-0">{announcement.emoji || '📢'}</span>
      <p className="font-mono text-xs text-amber-900 font-bold flex-1 leading-tight">
        {announcement.message}
      </p>
      <button
        type="button"
        onClick={handleDismiss}
        className="text-amber-800 hover:text-amber-900 font-black text-sm shrink-0 cursor-pointer"
        aria-label="Fechar aviso"
      >✕</button>
    </div>
  );
}
