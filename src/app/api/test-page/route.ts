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
        
        <h2>Test 1: MongoDB Connection</h2>
        <button class="test-button" onclick="testMongo()">Test MongoDB Connection</button>
        <div id="mongo-result" class="result"></div>
        
        <h2>Test 2: Simple Signup</h2>
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
        async function testMongo() {
          const result = document.getElementById('mongo-result');
          result.innerHTML = 'Testing...';
          
          try {
            const response = await fetch('/api/test-vercel-mongo');
            const data = await response.json();
            result.innerHTML = '<pre>' + JSON.stringify(data, null, 2) + '</pre>';
          } catch (error) {
            result.innerHTML = '<div style="color: red;">Error: ' + error.message + '</div>';
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
            const data = await response.json();
            result.innerHTML = '<pre>' + JSON.stringify(data, null, 2) + '</pre>';
          } catch (error) {
            result.innerHTML = '<div style="color: red;">Error: ' + error.message + '</div>';
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
