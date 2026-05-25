'use client';

import React, { useEffect, useState, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import Navbar from '@/components/ui/Navbar';

/* ─── Types ─────────────────────────────────────────────────────── */
type User = { id: string; name: string; email: string; username: string };
type Msg = { ok: boolean; text: string } | null;

/* ─── Utilities ──────────────────────────────────────────────────── */
function Avatar({ name }: { name: string }) {
  const initials = name.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase() || 'U';
  return (
    <div className="relative flex h-20 w-20 shrink-0 items-center justify-center rounded-2xl text-xl font-bold text-white"
      style={{ background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)' }}>
      {initials}
      <span className="absolute -bottom-1 -right-1 h-4 w-4 rounded-full border-2 border-white bg-emerald-400" />
    </div>
  );
}

function StatusBanner({ msg, onDismiss }: { msg: Msg; onDismiss: () => void }) {
  if (!msg) return null;
  return (
    <div className={`flex items-center justify-between rounded-xl px-4 py-3 text-sm font-medium
      ${msg.ok ? 'bg-emerald-50 text-emerald-800 border border-emerald-200' : 'bg-red-50 text-red-800 border border-red-200'}`}>
      <span>{msg.text}</span>
      <button onClick={onDismiss} className="ml-4 opacity-60 hover:opacity-100 text-lg leading-none">×</button>
    </div>
  );
}

function SectionCard({ title, subtitle, children }: { title: string; subtitle: string; children: React.ReactNode }) {
  return (
    <div className="rounded-2xl border border-slate-200 bg-white overflow-hidden">
      <div className="px-6 py-5 border-b border-slate-100">
        <h2 className="text-[15px] font-semibold text-slate-900">{title}</h2>
        <p className="mt-0.5 text-[13px] text-slate-500">{subtitle}</p>
      </div>
      <div className="px-6 py-6">{children}</div>
    </div>
  );
}

function Field({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center justify-between py-3 border-b border-slate-100 last:border-0">
      <span className="text-[13px] font-medium text-slate-500 w-32 shrink-0">{label}</span>
      <span className="text-[14px] text-slate-900 font-medium text-right">{value}</span>
    </div>
  );
}

function PasswordInput({ label, value, onChange, placeholder }: {
  label: string; value: string; onChange: (v: string) => void; placeholder?: string;
}) {
  const [show, setShow] = useState(false);
  return (
    <div>
      <label className="block text-[13px] font-medium text-slate-600 mb-1.5">{label}</label>
      <div className="relative">
        <input
          type={show ? 'text' : 'password'}
          value={value}
          onChange={e => onChange(e.target.value)}
          placeholder={placeholder ?? '••••••••'}
          className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-2.5 pr-11 text-[14px] text-slate-900 outline-none transition focus:border-slate-400 focus:bg-white focus:ring-2 focus:ring-slate-100"
        />
        <button type="button" onClick={() => setShow(p => !p)}
          className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-700 transition text-xs font-medium">
          {show ? 'Hide' : 'Show'}
        </button>
      </div>
    </div>
  );
}

/* ─── Main Page ──────────────────────────────────────────────────── */
export default function AccountPage() {
  const router = useRouter();
  const [user, setUser] = useState<User | null>(null);
  const [userLoading, setUserLoading] = useState(true);

  /* Change password */
  const [newPw, setNewPw] = useState('');
  const [confirmPw, setConfirmPw] = useState('');
  const [pwLoading, setPwLoading] = useState(false);
  const [pwMsg, setPwMsg] = useState<Msg>(null);

  /* Delete account */
  const [deletePhase, setDeletePhase] = useState<'idle' | 'confirm'>('idle');
  const [deleteInput, setDeleteInput] = useState('');
  const [deleteLoading, setDeleteLoading] = useState(false);
  const [deleteMsg, setDeleteMsg] = useState<Msg>(null);

  /* Load user */
  const loadUser = useCallback(async () => {
    try {
      const res = await fetch('/api/profile', { credentials: 'include' });
      if (!res.ok) throw new Error();
      const data = await res.json();
      setUser({ id: data.id, name: data.name, email: data.email, username: data.username ?? data.name });
    } catch {
      setUser(null);
    } finally {
      setUserLoading(false);
    }
  }, []);

  useEffect(() => { loadUser(); }, [loadUser]);

  /* Change password handler */
  const handleChangePassword = async () => {
    setPwMsg(null);
    if (!newPw) return setPwMsg({ ok: false, text: 'Please enter a new password.' });
    if (newPw.length < 8) return setPwMsg({ ok: false, text: 'Password must be at least 8 characters.' });
    if (newPw !== confirmPw) return setPwMsg({ ok: false, text: 'Passwords do not match.' });
    setPwLoading(true);
    try {
      const res = await fetch('/api/change-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ new_password: newPw }),
      });
      const data = await res.json().catch(() => null);
      if (!res.ok) throw new Error(data?.error ?? data?.message ?? 'Failed to update password.');
      setPwMsg({ ok: true, text: 'Password updated successfully.' });
      setNewPw(''); setConfirmPw('');
    } catch (err) {
      setPwMsg({ ok: false, text: err instanceof Error ? err.message : 'Something went wrong.' });
    } finally {
      setPwLoading(false);
    }
  };

  /* Delete account handler */
  const handleDeleteAccount = async () => {
    if (!user) return;
    setDeleteLoading(true);
    setDeleteMsg(null);
    try {
      const res = await fetch('/api/delete-account', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username: user.username }),
      });
      const data = await res.json().catch(() => null);
      if (!res.ok) throw new Error(data?.error ?? data?.message ?? 'Failed to delete account.');
      router.push('/');
    } catch (err) {
      setDeleteMsg({ ok: false, text: err instanceof Error ? err.message : 'Something went wrong.' });
      setDeleteLoading(false);
    }
  };

  if (userLoading) {
    return (
      <main className="min-h-screen bg-slate-50">
        <Navbar variant="light" />
        <div className="flex items-center justify-center py-32">
          <div className="h-6 w-6 animate-spin rounded-full border-2 border-slate-300 border-t-slate-700" />
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-slate-50">
      <Navbar variant="light" />

      <div className="mx-auto max-w-2xl px-6 py-12 space-y-6">

        {/* Header */}
        <div>
          <h1 className="text-[26px] font-bold tracking-tight text-slate-900">Account Settings</h1>
          <p className="mt-1 text-[14px] text-slate-500">Manage your profile, security, and account preferences.</p>
        </div>

        {/* Profile */}
        <SectionCard title="Profile" subtitle="Your account information">
          {user ? (
            <div className="flex items-center gap-5">
              <Avatar name={user.name} />
              <div className="flex-1 min-w-0">
                <Field label="Full name" value={user.name} />
                <Field label="Email" value={user.email} />
                <Field label="Account ID" value={`#${user.id}`} />
              </div>
            </div>
          ) : (
            <p className="text-sm text-slate-500">Could not load profile. Please sign in again.</p>
          )}
        </SectionCard>

        {/* Change Password */}
        <SectionCard title="Change Password" subtitle="Update your password regularly to keep your account secure">
          <div className="space-y-4">
            <PasswordInput label="New password" value={newPw} onChange={setNewPw} />
            <PasswordInput label="Confirm new password" value={confirmPw} onChange={setConfirmPw} />
            <StatusBanner msg={pwMsg} onDismiss={() => setPwMsg(null)} />
            <button onClick={handleChangePassword} disabled={pwLoading}
              className="inline-flex items-center gap-2 rounded-xl bg-slate-900 px-5 py-2.5 text-[13px] font-semibold text-white transition hover:bg-slate-700 disabled:opacity-50">
              {pwLoading && <span className="h-3.5 w-3.5 animate-spin rounded-full border-2 border-white/40 border-t-white" />}
              Update password
            </button>
          </div>
        </SectionCard>

        {/* Danger Zone */}
        <div className="rounded-2xl border border-red-200 bg-red-50/60 overflow-hidden">
          <div className="px-6 py-5 border-b border-red-200">
            <h2 className="text-[15px] font-semibold text-red-700">Danger Zone</h2>
            <p className="mt-0.5 text-[13px] text-red-600/80">Irreversible actions — proceed with caution.</p>
          </div>
          <div className="px-6 py-6 space-y-4">
            {deletePhase === 'idle' ? (
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-[14px] font-semibold text-slate-900">Delete account</p>
                  <p className="text-[13px] text-slate-500 mt-0.5">Permanently delete your account and all data. Cannot be undone.</p>
                </div>
                <button onClick={() => setDeletePhase('confirm')}
                  className="shrink-0 ml-4 rounded-xl border border-red-300 bg-white px-4 py-2 text-[13px] font-semibold text-red-700 transition hover:bg-red-50">
                  Delete account
                </button>
              </div>
            ) : (
              <div className="space-y-3">
                <p className="text-[14px] font-medium text-slate-800">
                  This will permanently delete your account. Type{' '}
                  <code className="rounded bg-red-100 px-1.5 py-0.5 text-red-700 font-mono text-[13px]">DELETE</code>{' '}
                  to confirm.
                </p>
                <input
                  value={deleteInput}
                  onChange={e => setDeleteInput(e.target.value)}
                  placeholder="Type DELETE"
                  className="w-full max-w-xs rounded-xl border border-red-200 bg-white px-4 py-2.5 text-[14px] text-slate-900 outline-none focus:border-red-400 focus:ring-2 focus:ring-red-100"
                />
                <StatusBanner msg={deleteMsg} onDismiss={() => setDeleteMsg(null)} />
                <div className="flex items-center gap-3">
                  <button
                    onClick={handleDeleteAccount}
                    disabled={deleteInput !== 'DELETE' || deleteLoading}
                    className="inline-flex items-center gap-2 rounded-xl bg-red-600 px-5 py-2.5 text-[13px] font-semibold text-white transition hover:bg-red-700 disabled:opacity-50">
                    {deleteLoading && <span className="h-3.5 w-3.5 animate-spin rounded-full border-2 border-white/40 border-t-white" />}
                    Permanently delete
                  </button>
                  <button onClick={() => { setDeletePhase('idle'); setDeleteInput(''); setDeleteMsg(null); }}
                    className="rounded-xl px-4 py-2.5 text-[13px] font-medium text-slate-500 hover:text-slate-900 transition">
                    Cancel
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>

      </div>
    </main>
  );
}