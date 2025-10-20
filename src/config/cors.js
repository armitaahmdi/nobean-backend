// CORS Configuration for Production
const cors = require('cors');

// Allowed origins for CORS
const allowedOrigins = [
  // Development
  'http://localhost:3000',
  'http://localhost:5173',
  'http://localhost:8888',
  'http://127.0.0.1:3000',
  'http://127.0.0.1:5173',
  
  // Production
  'https://nobean.ir',
  'https://www.nobean.ir',
  'https://api.nobean.ir',
'http://nobean.ir',
  
  // Testing
  'https://36b57023baaf.ngrok-free.app'
];

// CORS options
const corsOptions = {
  origin: function(origin, callback) {
    // Allow requests with no origin (like mobile apps or curl requests)
    if (!origin) return callback(null, true);
    
    // Check if origin is in allowed list
    if (allowedOrigins.includes(origin)) {
      console.log('✅ CORS allowed origin:', origin);
      return callback(null, true);
    }
    
    // Log the blocked origin for debugging
    console.log('🚫 CORS blocked origin:', origin);
    console.log('📋 Allowed origins:', allowedOrigins);
    
    const msg = 'The CORS policy for this site does not allow access from the specified Origin.';
    callback(new Error(msg), false);
  },
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
  allowedHeaders: [
    'Content-Type',
    'Authorization',
    'X-Requested-With',
    'x-auth-token',
    'Accept',
    'Origin',
    'Access-Control-Request-Method',
    'Access-Control-Request-Headers',
    'Cache-Control',
    'Pragma'
  ],
  credentials: true,
  optionsSuccessStatus: 200, // Some legacy browsers choke on 204
  preflightContinue: false
};

// CORS middleware function
const corsMiddleware = (req, res, next) => {
  const origin = req.headers.origin;
  
  // Handle preflight requests
  if (req.method === 'OPTIONS') {
    console.log('🔄 Handling preflight request from:', origin);
    
    res.header('Access-Control-Allow-Origin', origin || '*');
    res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, PATCH, OPTIONS');
    res.header('Access-Control-Allow-Headers', 'Content-Type, Authorization, X-Requested-With, x-auth-token, Accept, Origin, Access-Control-Request-Method, Access-Control-Request-Headers, Cache-Control, Pragma');
    res.header('Access-Control-Allow-Credentials', 'true');
    res.header('Access-Control-Max-Age', '86400'); // 24 hours
    
    return res.status(200).end();
  }
  
  // Add CORS headers to all responses
  if (origin && allowedOrigins.includes(origin)) {
    res.header('Access-Control-Allow-Origin', origin);
    res.header('Access-Control-Allow-Credentials', 'true');
  }
  
  next();
};

module.exports = {
  corsOptions,
  corsMiddleware,
  allowedOrigins
};
