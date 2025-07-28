/**
 * Emergency production fix for Socket.IO connection issues
 * This script adds connection status monitoring and automatic fallback
 */

// Add to browser console to test socket connection in production
function testProductionSocket() {
  console.log('🔍 Testing production Socket.IO connection...');
  
  // Test direct connection to backend
  const testSocket = io('https://loteria-backend-aoiq.onrender.com', {
    path: '/socket.io',
    transports: ['polling', 'websocket'],
    forceNew: true,
    timeout: 10000
  });
  
  let connectionTimeout = setTimeout(() => {
    console.error('❌ Socket connection timeout after 10 seconds');
    testSocket.disconnect();
  }, 10000);
  
  testSocket.on('connect', () => {
    clearTimeout(connectionTimeout);
    console.log('✅ Socket connected successfully!', testSocket.id);
    
    // Test joining a lobby
    console.log('🏠 Testing lobby join...');
    testSocket.emit('join-lobby', {
      lobbyCode: 'TEST123',
      playerName: 'TestPlayer',
      playerEmail: 'test@test.com'
    });
    
    // Test calling a card
    setTimeout(() => {
      console.log('🃏 Testing card call...');
      testSocket.emit('call-card', {
        lobbyCode: 'TEST123',
        card: 'La Corona'
      });
    }, 1000);
    
    // Clean up after 5 seconds
    setTimeout(() => {
      console.log('🧹 Cleaning up test connection');
      testSocket.disconnect();
    }, 5000);
  });
  
  testSocket.on('connect_error', (error) => {
    clearTimeout(connectionTimeout);
    console.error('❌ Socket connection failed:', error);
  });
  
  testSocket.on('called-card', (card) => {
    console.log('✅ Received called-card event:', card);
  });
  
  testSocket.on('called-cards', (cards) => {
    console.log('✅ Received called-cards event:', cards);
  });
  
  return testSocket;
}

// Also add this to the LobbyClient for production debugging
window.testProductionSocket = testProductionSocket;
