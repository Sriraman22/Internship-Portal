const { BlobServiceClient } = require('@azure/storage-blob');
const config = require('../config');

const blobServiceClient = BlobServiceClient.fromConnectionString(config.storageConnectionString);
const containerClient = blobServiceClient.getContainerClient(config.storageContainer);

async function ensureContainer() {
  const exists = await containerClient.exists();
  if (!exists) await containerClient.create();
}

async function uploadBuffer(name, buffer, contentType) {
  await ensureContainer();
  const block = containerClient.getBlockBlobClient(name);
  await block.uploadData(buffer, { blobHTTPHeaders: { blobContentType: contentType } });
  return block.url;
}

module.exports = { uploadBuffer };
