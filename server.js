import express from 'express';
import cors from 'cors';
import { generateTicket, validateTicket } from './build/src/main.js';
import fs from 'fs';
import path from 'path';

const app = express();
const PORT = 4242;


app.use(cors());
app.use(express.json());
app.use(express.static('frontend'));
app.use('/img', express.static('img'));


app.post('/api/generate-ticket', async (req, res) => {
  try {
    const result = await generateTicket();
    res.json({ 
      success: true, 
      publicKey: result.publicKey,
      qrPath: `/img/${result.publicKey}.bmp`
    });
  } catch (error) {
    console.error('Error generating ticket:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

app.post('/api/validate-ticket', async (req, res) => {
  try {
    const { imagePath } = req.body;
    if (!imagePath) {
      return res.status(400).json({ success: false, error: 'Image path is required' });
    }

    const status = await validateTicket(imagePath);
    
    res.json({ success: true, status });
  } catch (error) {
    console.error('Error validating ticket:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

app.post('/api/upload-image', express.raw({ limit: '10mb', type: 'image/*' }), async (req, res) => {
  try {
    const uploadDir = path.join(process.cwd(), 'uploads');
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir);
    }

    const filename = `ticket-${Date.now()}.bmp`;
    const filepath = path.join(uploadDir, filename);
    fs.writeFileSync(filepath, req.body);
    
    res.json({ success: true, filepath });
  } catch (error) {
    console.error('Error uploading image:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

app.listen(PORT, () => {
  console.log(`Server running at http://localhost:${PORT}`);
});