import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';
import multer from 'multer';
import bodyParser from 'body-parser';
import cors from 'cors';
import fs from 'fs';
import { createServer as createViteServer } from 'vite';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = 3000;

app.use(cors());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

// Serve uploads directory statically
const uploadsDir = path.join(__dirname, 'uploads');
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
}
app.use('/uploads', express.static(uploadsDir));

// Multer for uploads (Stable 1.4.x usage)
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    console.log('Multer: Setting destination to', uploadsDir);
    cb(null, uploadsDir);
  },
  filename: (req, file, cb) => {
    const uniqueName = Date.now() + '-' + Math.round(Math.random() * 1E9) + path.extname(file.originalname);
    console.log('Multer: Generating filename', uniqueName);
    cb(null, uniqueName);
  }
});

const upload = multer({ 
  storage,
  limits: { fileSize: 10 * 1024 * 1024 } // Increase to 10MB
});

// API Route (Replacing PHP)
app.post('/api/order', upload.single('slip'), (req, res) => {
  try {
    const orderData = JSON.parse(req.body.order_data);
    const slip = req.file;

    console.log('New Order Received:', orderData);
    if (slip) {
      console.log('Payment Slip Uploaded:', slip.filename);
    }

    // ဒီနေရာမှာ Email ပို့တဲ့ logic (Nodemailer) ထည့်လို့ရပါတယ်
    // လောလောဆယ်တော့ Success response ပဲ ပြန်ပါမယ်

    res.json({ 
      status: 'success', 
      message: 'Order processed successfully by Node.js backend',
      orderId: orderData.id 
    });
  } catch (error) {
    console.error('Order processing error:', error);
    res.status(500).json({ status: 'error', message: error.message });
  }
});

// API Route for Product Image Upload
app.post('/api/upload-product', (req, res) => {
  console.log('--- New Product Image Upload Request ---');
  
  const uploadSingle = upload.single('productImage');
  
  uploadSingle(req, res, (err) => {
    if (err instanceof multer.MulterError) {
      console.error('Multer Error:', err);
      return res.status(400).json({ status: 'error', message: `Upload error: ${err.message}` });
    } else if (err) {
      console.error('Unknown Upload Error:', err);
      return res.status(500).json({ status: 'error', message: `Server error: ${err.message}` });
    }

    if (!req.file) {
      console.error('No file received by Multer');
      return res.status(400).json({ status: 'error', message: 'No file selected or invalid file type' });
    }

    console.log('File saved successfully:', req.file.filename);
    const imageUrl = `/uploads/${req.file.filename}`;
    res.json({ status: 'success', imageUrl });
  });
});

// Serve static files and Vite
async function startServer() {
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'custom', // We handle routing ourselves
    });
    app.use(vite.middlewares);
  } else {
    app.use(express.static('dist'));
  }

  // Multi-page routing
  app.get(['/', '/index.html'], (req, res) => res.sendFile(path.join(__dirname, 'index.html')));
  app.get('/admin.html', (req, res) => res.sendFile(path.join(__dirname, 'admin.html')));
  app.get('/driver.html', (req, res) => res.sendFile(path.join(__dirname, 'driver.html')));

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();
