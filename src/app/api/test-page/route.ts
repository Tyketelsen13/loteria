import { NextResponse } from "next/server";

// Test page that shows instructions and has a simple GET endpoint
export async function GET() {
  const html = `
    <!DOCTYPE html>
    <html>
    <head>
      <title>Vercel MongoDB Test</title>
      <style>
        body { font-family: Arial, sans-serif; margin: 40px; background: #f5f5f5; }
        .container { max-width: 800px; background: white; padding: 20px; border-radius: 8px; box-shadow: 0 2px 4px rgba(0,0,0,0.1); }
        .test-button { background: #0070f3; color: white; padding: 10px 20px; border: none; border-radius: 4px; cursor: pointer; margin: 10px 0; }
        .test-button:hover { background: #0051cc; }
        pre { background: #f4f4f4; padding: 15px; border-radius: 4px; overflow-x: auto; }
        .result { margin-top: 20px; }
      </style>
    </head>
    <body>
      <div class="container">
        <h1>🔧 Lotería MongoDB Tests for Vercel</h1>
        
        <div style="background: #e8f4f8; padding: 15px; border-radius: 8px; margin-bottom: 20px;">
          <h3>🔍 Current Environment Status</h3>
          <p><strong>Environment:</strong> <span id="env-info">Loading...</span></p>
          <p><strong>Base URL:</strong> <span id="base-url">Loading...</span></p>
          <button class="test-button" onclick="checkEnv()">Check Environment</button>
        </div>
        
        <h2>Test 1: MongoDB Connection (Original)</h2>
        <button class="test-button" onclick="testMongo()">Test Original MongoDB</button>
        <div id="mongo-result" class="result"></div>
        
        <h2>Test 2: SSL-Fixed MongoDB Connection</h2>
        <button class="test-button" onclick="testSSLMongo()">Test SSL-Fixed MongoDB</button>
        <div id="ssl-result" class="result"></div>
        
        <h2>Test 3: Alternative MongoDB Connection</h2>
        <button class="test-button" onclick="testAltMongo()">Test Alternative MongoDB</button>
        <div id="alt-result" class="result"></div>
        
        <h2>Test 4: TLS-Fixed MongoDB Connection</h2>
        <button class="test-button" onclick="testTLSMongo()">Test TLS-Fixed MongoDB</button>
        <div id="tls-result" class="result"></div>
        
        <h2>Test 5: Simple Signup</h2>
        <div>
          <input type="text" id="name" placeholder="Name" value="Test User">
          <input type="email" id="email" placeholder="Email" value="test@example.com">
          <input type="password" id="password" placeholder="Password" value="testpass123">
          <button class="test-button" onclick="testSignup()">Test Signup</button>
        </div>
        <div id="signup-result" class="result"></div>
        
        <h2>Manual Test URLs</h2>
        <pre>GET  /api/test-vercel-mongo
POST /api/auth/signup-simple
POST /api/auth/signup</pre>
      </div>
      
      <script>
        // Check environment info
        function checkEnv() {
          document.getElementById('env-info').textContent = location.hostname.includes('localhost') ? 'LOCAL DEVELOPMENT' : 'VERCEL PRODUCTION';
          document.getElementById('base-url').textContent = location.origin;
        }
        
        // Auto-check on load
        window.onload = checkEnv;
        
        async function testMongo() {
          const result = document.getElementById('mongo-result');
          result.innerHTML = 'Testing...';
          
          try {
            const response = await fetch('/api/test-vercel-mongo');
            
            // Show response details for debugging
            const statusText = response.ok ? 'OK' : 'ERROR';
            const status = response.status;
            
            if (!response.ok) {
              result.innerHTML = '<div style="color: red;">HTTP ' + status + ': ' + statusText + '<br>Response: ' + await response.text() + '</div>';
              return;
            }
            
            const data = await response.json();
            result.innerHTML = '<div style="color: green;">✅ SUCCESS</div><pre>' + JSON.stringify(data, null, 2) + '</pre>';
          } catch (error) {
            result.innerHTML = '<div style="color: red;">❌ NETWORK ERROR: ' + error.message + '</div>';
          }
        }
        
        async function testSSLMongo() {
          const result = document.getElementById('ssl-result');
          result.innerHTML = 'Testing SSL-fixed connection...';
          
          try {
            const response = await fetch('/api/test-ssl-mongo');
            
            const statusText = response.ok ? 'OK' : 'ERROR';
            const status = response.status;
            
            if (!response.ok) {
              result.innerHTML = '<div style="color: red;">HTTP ' + status + ': ' + statusText + '<br>Response: ' + await response.text() + '</div>';
              return;
            }
            
            const data = await response.json();
            result.innerHTML = '<div style="color: green;">✅ SSL SUCCESS</div><pre>' + JSON.stringify(data, null, 2) + '</pre>';
          } catch (error) {
            result.innerHTML = '<div style="color: red;">❌ SSL NETWORK ERROR: ' + error.message + '</div>';
          }
        }
        
        async function testAltMongo() {
          const result = document.getElementById('alt-result');
          result.innerHTML = 'Testing alternative connection strategies...';
          
          try {
            const response = await fetch('/api/test-alt-mongo');
            
            const statusText = response.ok ? 'OK' : 'ERROR';
            const status = response.status;
            
            if (!response.ok) {
              result.innerHTML = '<div style="color: red;">HTTP ' + status + ': ' + statusText + '<br>Response: ' + await response.text() + '</div>';
              return;
            }
            
            const data = await response.json();
            result.innerHTML = '<div style="color: green;">✅ ALTERNATIVE SUCCESS</div><pre>' + JSON.stringify(data, null, 2) + '</pre>';
          } catch (error) {
            result.innerHTML = '<div style="color: red;">❌ ALTERNATIVE NETWORK ERROR: ' + error.message + '</div>';
          }
        }
        
        async function testTLSMongo() {
          const result = document.getElementById('tls-result');
          result.innerHTML = 'Testing TLS-fixed connection (SSL alert fix)...';
          
          try {
            const response = await fetch('/api/test-tls-mongo');
            
            const statusText = response.ok ? 'OK' : 'ERROR';
            const status = response.status;
            
            if (!response.ok) {
              result.innerHTML = '<div style="color: red;">HTTP ' + status + ': ' + statusText + '<br>Response: ' + await response.text() + '</div>';
              return;
            }
            
            const data = await response.json();
            result.innerHTML = '<div style="color: green;">✅ TLS SUCCESS</div><pre>' + JSON.stringify(data, null, 2) + '</pre>';
          } catch (error) {
            result.innerHTML = '<div style="color: red;">❌ TLS NETWORK ERROR: ' + error.message + '</div>';
          }
        }
        
        async function testSignup() {
          const result = document.getElementById('signup-result');
          result.innerHTML = 'Testing...';
          
          const name = document.getElementById('name').value;
          const email = document.getElementById('email').value;
          const password = document.getElementById('password').value;
          
          try {
            const response = await fetch('/api/auth/signup-simple', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ name, email, password })
            });
            
            // Show response details for debugging
            const statusText = response.ok ? 'OK' : 'ERROR';
            const status = response.status;
            
            if (!response.ok) {
              result.innerHTML = '<div style="color: red;">HTTP ' + status + ': ' + statusText + '<br>Response: ' + await response.text() + '</div>';
              return;
            }
            
            const data = await response.json();
            result.innerHTML = '<div style="color: green;">✅ SUCCESS</div><pre>' + JSON.stringify(data, null, 2) + '</pre>';
          } catch (error) {
            result.innerHTML = '<div style="color: red;">❌ NETWORK ERROR: ' + error.message + '</div>';
          }
        }
      </script>
    </body>
    </html>
  `;
  
  return new Response(html, {
    headers: { 'Content-Type': 'text/html' }
  });
}
