import { Storage } from '@google-cloud/storage';
import multiparty from 'multiparty';
import { NextApiRequest, NextApiResponse } from 'next';
import { Readable } from 'stream';

export const config = {
  api: {
    bodyParser: false,
  },
};

const credentials = JSON.parse(process.env.GCP_KEY as string);

const storage = new Storage({
  projectId: credentials.project_id,
  credentials: {
    client_email: credentials.client_email,
    private_key: credentials.private_key.replace(/\\n/g, '\n'),
  },
});

const bucketName = process.env.GCP_BUCKET_NAME as string;
const bucket = storage.bucket(bucketName);

export default async function handle(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const form = new multiparty.Form();

  form.parse(req, async (err, fields, files) => {
    if (err) {
      return res.status(500).json({ error: 'Error parsing form data' });
    }

    if (!files.file || !files.file[0]) {
      return res.status(400).json({ error: 'No file uploaded.' });
    }

    const file = files.file[0];
    const fileStream = require('fs').createReadStream(file.path);
    const originalFilename = file.originalFilename;
    const sanitizedFilename = originalFilename.replace(/[^a-zA-Z0-9.]/g, '_');
    const blob = bucket.file(sanitizedFilename);
    const blobStream = blob.createWriteStream({
      resumable: false,
      contentType: file.headers['content-type'],
    });

    fileStream.pipe(blobStream)
      .on('error', (err: any) => {
        console.error('Error uploading to GCS:', err);
        res.status(500).json({ error: 'Failed to upload file.' });
      })
      .on('finish', () => {
        const publicUrl = `https://storage.googleapis.com/${bucket.name}/${blob.name}`;
        res.status(200).json({ url: publicUrl });
      });
  });
}
