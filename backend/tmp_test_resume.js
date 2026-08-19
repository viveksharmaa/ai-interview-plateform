const fs = require('fs');
const path = require('path');
(async () => {
  try {
    const resumeService = require('./src/services/resumeService');
    const filePath = path.join(__dirname, '..', 'frontend', 'sample2.pdf');
    if (!fs.existsSync(filePath)) {
      console.error('Test PDF not found:', filePath);
      process.exit(1);
    }
    const buffer = fs.readFileSync(filePath);
    const file = {
      originalname: 'sample2.pdf',
      mimetype: 'application/pdf',
      buffer,
      size: buffer.length,
    };
    console.log('Calling processResume...');
    const result = await resumeService.processResume(file);
    console.log('Result:', result);
  } catch (err) {
    console.error('Test script error:', err);
    process.exit(1);
  }
})();