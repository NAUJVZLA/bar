'use client';

import { useEffect, useState } from 'react';
import { db } from '@/lib/db';
import { syncService } from '@/lib/syncService';

export function useSyncQueue() {
  const [isOnline, setIsOnline] = useState<boolean>(
    typeof window !== 'undefined' ? navigator.onLine : true
  );
  const [pendingCount, setPendingCount] = useState<number>(0);
  const [isSyncing, setIsSyncing] = useState<boolean>(false);

  // Consulta el conteo actual de operaciones en la cola
  const updatePendingCount = async () => {
    if (!db) return;
    try {
      const count = await db.cola_sincronizacion.count();
      setPendingCount(count);
    } catch (e) {
      console.error('Error obteniendo conteo de cola:', e);
    }
  };

  useEffect(() => {
    if (typeof window === 'undefined') return;

    // Inicializar el conteo de la cola
    updatePendingCount();

    const handleOnline = async () => {
      setIsOnline(true);
      setIsSyncing(true);
      try {
        await syncService.syncPendingQueue();
      } catch (err) {
        console.error('Fallo en sincronización al reconectar:', err);
      } finally {
        await updatePendingCount();
        setIsSyncing(false);
      }
    };

    const handleOffline = () => {
      setIsOnline(false);
    };

    const handleSyncUpdate = () => {
      updatePendingCount();
    };

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);
    window.addEventListener('sync_queue_updated', handleSyncUpdate);

    // Si detectamos que está online al arrancar, programar una sincronización inicial
    if (navigator.onLine) {
      // Breve retraso para que Next.js se hidrate por completo
      const timer = setTimeout(() => {
        handleOnline();
      }, 1500);
      return () => {
        clearTimeout(timer);
        window.removeEventListener('online', handleOnline);
        window.removeEventListener('offline', handleOffline);
        window.removeEventListener('sync_queue_updated', handleSyncUpdate);
      };
    }

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
      window.removeEventListener('sync_queue_updated', handleSyncUpdate);
    };
  }, []);

  const forceSync = async () => {
    if (typeof window === 'undefined' || !navigator.onLine) return;
    setIsSyncing(true);
    try {
      await syncService.syncPendingQueue();
    } catch (err) {
      console.error('Fallo en sincronización manual:', err);
    } finally {
      await updatePendingCount();
      setIsSyncing(false);
    }
  };

  return {
    isOnline,
    pendingCount,
    isSyncing,
    forceSync,
  };
}
