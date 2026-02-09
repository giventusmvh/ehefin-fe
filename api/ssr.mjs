// Vercel Serverless Function for Angular SSR
export default async function handler(req, res) {
  try {
    // Dynamic import of the Angular SSR server
    const { reqHandler } = await import('../dist/ehefin-fe/server/server.mjs');
    return reqHandler(req, res);
  } catch (error) {
    console.error('SSR Error:', error);
    res.status(500).json({ 
      error: 'Server rendering failed',
      message: error.message 
    });
  }
}
