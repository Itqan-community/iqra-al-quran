import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';
import { createProxyMiddleware } from 'http-proxy-middleware';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 8080;

// Backend URL from environment variable (for proxying)
const BACKEND_URL = process.env.BACKEND_URL || 'http://localhost:5000';

console.log(`🔗 Proxying /api/* requests to: ${BACKEND_URL}`);

// Health check endpoint
app.get('/health', (req, res) => {
  res.status(200).json({ 
    status: 'healthy', 
    timestamp: new Date().toISOString(),
    service: 'iqra-al-quran-frontend',
    version: '1.0.0',
    backendProxy: 'loaded'
  });
});

// CORS + Origin Check Middleware for API routes
app.use('/api', (req, res, next) => {
  const origin = req.headers['origin'] || req.headers['referer'];
  const allowedOrigins = [
    'https://iqra.itqan.dev',
    'http://localhost:5173',     // Vite dev server
    'http://localhost:8080',     // Express dev server
    'http://localhost:3000',     // Express dev server (alt port)
  ];

  // Check if request has an origin (browser requests will have this)
  if (!origin) {
    console.warn('⚠️  API request without origin header - likely from curl/Postman');
    return res.status(403).json({ 
      error: 'Forbidden',
      message: 'API access is restricted to the web application only'
    });
  }

  // Check if origin is allowed
  const isAllowed = allowedOrigins.some(allowed => origin.startsWith(allowed));
  
  if (!isAllowed) {
    console.warn(`🚫 Blocked API request from unauthorized origin: ${origin}`);
    return res.status(403).json({ 
      error: 'Forbidden',
      message: 'API access is restricted to authorized domains only'
    });
  }

  console.log(`✅ Allowed API request from: ${origin}`);
  
  // Set CORS headers
  res.setHeader('Access-Control-Allow-Origin', origin);
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  res.setHeader('Access-Control-Allow-Credentials', 'true');

  // Handle preflight requests
  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  next();
});

// Proxy API requests to backend
app.use('/api', createProxyMiddleware({
  target: BACKEND_URL,
  changeOrigin: true,
  pathRewrite: {
    '^/': '/api/' // Add /api prefix since Express strips it from req.url
  },
  onProxyReq: (proxyReq, req, res) => {
    console.log(`→ Proxying: ${req.method} ${req.originalUrl} to ${BACKEND_URL}/api${req.url}`);
  },
  onError: (err, req, res) => {
    console.error('❌ Proxy error:', err.message);
    res.status(500).json({ 
      error: 'Backend proxy error', 
      message: err.message 
    });
  }
}));

// Serve static files from dist directory
app.use(express.static(path.join(__dirname, 'dist')));

// Handle client-side routing - serve index.html for all non-API routes
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'dist', 'index.html'));
});

app.listen(PORT, '0.0.0.0', () => {
  console.log(`Server running on http://0.0.0.0:${PORT}`);
  console.log(`Health check available at http://0.0.0.0:${PORT}/health`);
});
