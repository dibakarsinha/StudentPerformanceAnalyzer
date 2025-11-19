const fs = require('fs');
const path = require('path');

const srcDir = '/mnt/data/pbl_images/'; // <<-- YOUR uploaded images path
const destDir = path.join(__dirname, 'public', 'images');

if (!fs.existsSync(destDir)) fs.mkdirSync(destDir, { recursive: true });

const files = ['image2.png','image3.png','image4.png','image5.png','image6.png'];

files.forEach(f => {
  const src = path.join(srcDir, f);
  const dest = path.join(destDir, f);
  if (fs.existsSync(src)) {
    fs.copyFileSync(src, dest);
    console.log('copied', f);
  } else {
    console.warn('not found:', src);
  }
});
console.log('done');
