const express = require('express');
const { spawn } = require('child_process');
const cors = require('cors');
const app = express();

app.use(cors());
app.use(express.json());

app.post('/download', (req, res) => {
  const url = req.body.url;
  if (!url) return res.status(400).send('Missing URL');

  res.setHeader('Content-Disposition', 'attachment; filename="video.mp4"');
  res.setHeader('Content-Type', 'video/mp4');

  const ytdlp = spawn('./yt-dlp_linux', [
    '-f', 'best',
    '--merge-output-format', 'mp4',
    '-o', '-',
    url
  ]);

  ytdlp.stdout.pipe(res);

  ytdlp.stderr.on('data', (data) => {
    console.error(`stderr: ${data}`);
  });

  ytdlp.on('error', (err) => {
    console.error('Failed to start yt-dlp:', err);
    res.status(500).send('❌ Failed to download!');
  });

  ytdlp.on('close', (code) => {
    if (code !== 0) {
      console.error(`yt-dlp exited with code ${code}`);
    }
  });
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`✅ Server running on port ${PORT}`);
});
