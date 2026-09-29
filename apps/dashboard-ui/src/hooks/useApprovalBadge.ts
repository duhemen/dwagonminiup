import { useEffect, useState } from 'react';
import { getApprovalStats, ApprovalStats } from '../api/approval';
import { useAuth } from '../contexts/AuthContext';

const APPROVER_ROLES = ['pimpinan', 'upt', 'kepegawaian', 'admin'];

export function useApprovalBadge() {
  const { user, isAuthenticated } = useAuth();
  const [stats, setStats] = useState<ApprovalStats | null>(null);

  const isApprover = !!user && APPROVER_ROLES.includes(user.role);

  useEffect(() => {
    if (!isAuthenticated || !isApprover) return;
    let cancelled = false;

    async function load() {
      try {
        const s = await getApprovalStats();
        if (!cancelled) setStats(s);
      } catch {
        /* ignore */
      }
    }

    load();
    const t = setInterval(load, 30000); // refresh tiap 30 detik
    return () => {
      cancelled = true;
      clearInterval(t);
    };
  }, [isAuthenticated, isApprover]);

  return { isApprover, stats };
}

export function isRoleApprover(role?: string | null): boolean {
  return !!role && APPROVER_ROLES.includes(role);
}