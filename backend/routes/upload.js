const express = require('express');
const router = express.Router();
const { S3Client, PutObjectCommand } = require('@aws-sdk/client-s3');
const { getSignedUrl } = require('@aws-sdk/s3-request-presigner');
const { auth } = require('../middleware/auth');

const s3Client = new S3Client({ region: process.env.AWS_REGION || 'us-east-1' });
const BUCKET_NAME = process.env.S3_BUCKET_NAME;

// @route   GET /api/upload/presigned-url
// @desc    Generate S3 presigned URL for direct upload
// @access  Private
router.get('/presigned-url', auth, async (req, res, next) => {
  try {
    const { filename, contentType } = req.query;

    if (!filename || !contentType) {
      return res.status(400).json({ message: 'filename and contentType required' });
    }

    if (!BUCKET_NAME) {
      const err = new Error('S3_BUCKET_NAME not configured');
      err.code = 'CONFIG_ERROR';
      return next(err);
    }

    const key = `uploads/${Date.now()}_${req.user._id}_${filename}`;

    const command = new PutObjectCommand({
      Bucket: BUCKET_NAME,
      Key: key,
      ContentType: contentType
    });

    const uploadUrl = await getSignedUrl(s3Client, command, { expiresIn: 300 }); // 5 minutes
    const fileUrl = `https://${BUCKET_NAME}.s3.${process.env.AWS_REGION || 'us-east-1'}.amazonaws.com/${key}`;

    res.json({ uploadUrl, fileUrl, key });
  } catch (error) {
    next(error);
  }
});

module.exports = router;
