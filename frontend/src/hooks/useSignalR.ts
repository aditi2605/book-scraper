import { useState, useEffect, useCallback } from 'react';
import * as signalR from '@microsoft/signalr';
import type { ScrapeProgress } from '../types';

export function useScrapingProgress() {
  const [progress, setProgress] = useState<ScrapeProgress | null>(null);
  const [isConnected, setIsConnected] = useState(false);

  useEffect(() => {
    const connection = new signalR.HubConnectionBuilder()
      .withUrl('/hubs/scraping', {
        skipNegotiation: true,
        transport: signalR.HttpTransportType.WebSockets
      })
      .withAutomaticReconnect()
      .configureLogging(signalR.LogLevel.Warning)
      .build();

    connection.on('ScrapeProgress', (data: ScrapeProgress) => {
      setProgress(data);
    });

    connection.onclose(() => setIsConnected(false));
    connection.onreconnected(() => setIsConnected(true));

    connection.start()
      .then(() => { setIsConnected(true); console.log('SignalR connected'); })
      .catch(() => { console.log('SignalR unavailable — scraping still works, just no live progress bar'); });

    return () => { connection.stop(); };
  }, []);

  const resetProgress = useCallback(() => { setProgress(null); }, []);

  return { progress, isConnected, resetProgress };
}