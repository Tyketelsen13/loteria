// Browser console test script for Socket.IO connection
// Paste this into the browser console on the production site to test connectivity

console.log('🔍 Testing Socket.IO connection from browser...');

// Test the connection manually
const testSocket = io('https://loteria-backend-aoiq.onrender.com', {
  path: '/socket.io',
  transports: ['polling', 'websocket'],
  timeout: 30000,
  forceNew: true
});

testSocket.on('connect', () => {
  console.log('✅ Socket connected successfully!', testSocket.id);
  console.log('✅ Connection is working - the issue may be elsewhere');
  testSocket.disconnect();
});

testSocket.on('connect_error', (error) => {
  console.error('❌ Socket connection failed:', error);
  console.log('🔧 Check network connectivity and CORS settings');
});

testSocket.on('disconnect', (reason) => {
  console.log('📡 Socket disconnected:', reason);
});

// Also test with the old path to see if that's the issue
console.log('🔍 Testing old socket path...');
const testSocketOld = io('https://loteria-backend-aoiq.onrender.com', {
  path: '/api/socket/io',
  transports: ['polling', 'websocket'],
  timeout: 30000,
  forceNew: true
});

testSocketOld.on('connect', () => {
  console.log('✅ Old path connected!', testSocketOld.id);
  testSocketOld.disconnect();
});

testSocketOld.on('connect_error', (error) => {
  console.error('❌ Old path failed (expected):', error.message);
});
