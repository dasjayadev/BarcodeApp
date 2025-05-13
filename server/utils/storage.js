const { put, del } = require('@vercel/blob');

exports.uploadFile = async (buffer, filename) => {
  try {
    const blob = await put(filename, buffer, { access: 'public' });
    return blob.url;
  } catch (error) {
    console.error('Error uploading to Vercel Blob:', error);
    throw error;
  }
};

exports.deleteFile = async (url) => {
  try {
    await del(url);
  } catch (error) {
    console.error('Error deleting from Vercel Blob:', error);
    throw error;
  }
};