'use client';

import { useEffect, useState } from 'react';
import { getSocket } from '@/lib/socket';

export default function SocketTestPage() {
  const [connectionStatus, setConnectionStatus] = useState<string>('Initializing...');
  const [socketId, setSocketId] = useState<string>('');
  const [logs, setLogs] = useState<string[]>([]);

  const addLog = (message: string) => {
    setLogs(prev => [...prev, `${new Date().toLocaleTimeString()}: ${message}`]);
    console.log(`[SOCKET TEST] ${message}`);
  };

  useEffect(() => {
    addLog('Component mounted, getting socket...');
    
    try {
      const socket = getSocket();
      addLog(`Socket instance created`);
      
      setConnectionStatus(socket.connected ? 'Connected' : 'Connecting...');
      setSocketId(socket.id || 'No ID yet');

      const onConnect = () => {
        addLog(`Socket connected with ID: ${socket.id}`);
        setConnectionStatus('Connected');
        setSocketId(socket.id || '');
      };

      const onDisconnect = (reason: any) => {
        addLog(`Socket disconnected: ${reason}`);
        setConnectionStatus('Disconnected');
        setSocketId('');
      };

      const onConnectError = (error: any) => {
        addLog(`Socket connection error: ${error.message || error}`);
        setConnectionStatus('Error');
      };

      socket.on('connect', onConnect);
      socket.on('disconnect', onDisconnect);
      socket.on('connect_error', onConnectError);

      // Test joining a lobby
      const testLobby = () => {
        if (socket.connected) {
          addLog('Testing lobby join...');
          socket.emit('join-lobby', {
            lobbyCode: 'TEST01',
            playerName: 'BrowserTestPlayer',
            playerEmail: 'browser@test.com'
          });

          socket.on('lobby-state', (state: any) => {
            addLog(`Received lobby state with ${state.players.length} players`);
          });
        } else {
          addLog('Socket not connected, cannot test lobby join');
        }
      };

      // Test after a short delay
      setTimeout(testLobby, 2000);

      return () => {
        socket.off('connect', onConnect);
        socket.off('disconnect', onDisconnect);
        socket.off('connect_error', onConnectError);
        socket.off('lobby-state');
      };
    } catch (error) {
      addLog(`Error initializing socket: ${error}`);
      setConnectionStatus('Initialization Error');
    }
  }, []);

  return (
    <div className="min-h-screen bg-gray-100 p-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold mb-6">Socket.IO Connection Test</h1>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
          <div className="bg-white p-6 rounded-lg shadow">
            <h2 className="text-xl font-semibold mb-4">Connection Status</h2>
            <div className={`p-3 rounded ${
              connectionStatus === 'Connected' ? 'bg-green-100 text-green-800' :
              connectionStatus === 'Error' ? 'bg-red-100 text-red-800' :
              'bg-yellow-100 text-yellow-800'
            }`}>
              {connectionStatus}
            </div>
            {socketId && (
              <div className="mt-2 text-sm text-gray-600">
                Socket ID: {socketId}
              </div>
            )}
          </div>

          <div className="bg-white p-6 rounded-lg shadow">
            <h2 className="text-xl font-semibold mb-4">Test Actions</h2>
            <button
              onClick={() => {
                try {
                  const socket = getSocket();
                  if (socket.connected) {
                    addLog('Manual lobby join test...');
                    socket.emit('join-lobby', {
                      lobbyCode: 'MANUAL',
                      playerName: 'ManualTestPlayer',
                      playerEmail: 'manual@test.com'
                    });
                  } else {
                    addLog('Socket not connected for manual test');
                  }
                } catch (error) {
                  addLog(`Manual test error: ${error}`);
                }
              }}
              className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded"
            >
              Test Lobby Join
            </button>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow">
          <h2 className="text-xl font-semibold mb-4">Connection Logs</h2>
          <div className="bg-gray-50 p-4 rounded max-h-96 overflow-y-auto">
            {logs.length === 0 ? (
              <div className="text-gray-500">No logs yet...</div>
            ) : (
              logs.map((log, index) => (
                <div key={index} className="text-sm font-mono mb-1">
                  {log}
                </div>
              ))
            )}
          </div>
        </div>

        <div className="mt-6">
          <a href="/game/private?code=TEST01" className="text-blue-500 hover:underline">
            Go to Private Lobby (TEST01)
          </a>
        </div>
      </div>
    </div>
  );
}
