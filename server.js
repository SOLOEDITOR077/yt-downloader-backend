const express = require('express');
const { execFile } = require('child_process');
const fs = require('fs');
const path = require('path');

const app = express(); // ✅ THIS LINE WAS MISSING
const PORT = 3000;

app.use(express.json());
app.use(express.static('public'));

app.post('/download', (req, res) => {
  const videoUrl = req.body.url;
  const outputPath = path.join(__dirname, 'video.mp4');

  if (!videoUrl) {
    return res.status(400).send('No URL provided');
  }

  console.log('🛰️ Download request received for:', videoUrl);

  execFile(path.join(__dirname, 'yt-dlp.exe'), [
    '-f', 'mp4',
    '-o', outputPath,
    videoUrl
  ], (error, stdout, stderr) => {
    if (error) {
      console.error('❌ yt-dlp error:', error.message);
      console.error('📄 stderr:', stderr);
      return res.status(500).send('Download failed');
    }

    console.log('✅ Download complete:', outputPath);

    res.download(outputPath, 'video.mp4', (err) => {
      if (err) {
        console.error('❌ Error sending file:', err.message);
        return;
      }
      console.log('📤 File sent to browser');

      // Cleanup
      if (fs.existsSync(outputPath)) {
        fs.unlinkSync(outputPath);
        console.log('🗑️ File deleted after sending');
      }
    });
  });
});

app.listen(PORT, () => {
  console.log(`✅ Server running at http://localhost:${PORT}`);
});
