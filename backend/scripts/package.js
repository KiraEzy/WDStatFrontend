import { createWriteStream } from 'fs';
import { readdir, stat } from 'fs/promises';
import { join, relative } from 'path';
import { createGzip } from 'zlib';
import archiver from 'archiver';

const OUTPUT_FILE = 'function.zip';
const SOURCE_DIR = process.cwd();

// Files and directories to exclude
const EXCLUDES = [
  '.git',
  'node_modules/.cache',
  '*.zip',
  'scripts',
  'SETUP.md',
  'QUICKSTART.md',
  'template.yaml',
  'lambda-policy.json',
  '.gitignore'
];

function shouldExclude(filePath) {
  return EXCLUDES.some(pattern => {
    if (pattern.includes('*')) {
      const regex = new RegExp(pattern.replace(/\*/g, '.*'));
      return regex.test(filePath);
    }
    return filePath.includes(pattern);
  });
}

async function createZip() {
  console.log('Creating Lambda deployment package...');
  console.log(`Source: ${SOURCE_DIR}`);
  console.log(`Output: ${OUTPUT_FILE}\n`);

  const output = createWriteStream(OUTPUT_FILE);
  const archive = archiver('zip', { zlib: { level: 9 } });

  return new Promise((resolve, reject) => {
    output.on('close', () => {
      const sizeInMB = (archive.pointer() / 1024 / 1024).toFixed(2);
      console.log(`\n✓ Package created successfully!`);
      console.log(`  File: ${OUTPUT_FILE}`);
      console.log(`  Size: ${sizeInMB} MB`);
      console.log(`\nReady to upload to AWS Lambda!`);
      resolve();
    });

    archive.on('error', (err) => {
      console.error('Error creating zip:', err);
      reject(err);
    });

    archive.on('warning', (err) => {
      if (err.code === 'ENOENT') {
        console.warn('Warning:', err);
      } else {
        reject(err);
      }
    });

    archive.pipe(output);

    // Add functions directory
    console.log('Adding: functions/');
    archive.directory('functions/', 'functions');

    // Add lib directory if it exists
    try {
      archive.directory('lib/', 'lib');
      console.log('Adding: lib/');
    } catch (e) {
      // lib directory might not exist, that's okay
    }

    // Add node_modules
    console.log('Adding: node_modules/');
    archive.directory('node_modules/', 'node_modules');

    // Add package.json
    console.log('Adding: package.json');
    archive.file('package.json', { name: 'package.json' });

    archive.finalize();
  });
}

createZip().catch(console.error);



