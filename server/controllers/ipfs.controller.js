const multer = require('multer');
const path = require('path');
const stream = require('stream');
const makeId = require('../utils/makeId');
const database = require('../models');
const { upload: awsUpload } = require('../services/storage/aws/objects');
const { BadRequestError } = require('../utils/ApiError');

const allowedMediaExtensions = ['.gif', '.jpeg', '.jpg', '.png', '.wav', '.ogg', '.glb', '.glt', '.webm', '.mp3', '.mp4'];

const generateFilename = (ogFilename) => {
  const id = makeId(100);
  return `${`${Date.now()}-${id}`}${path.extname(ogFilename).toLowerCase()}`;
};

module.exports = {
  PostUploadSingleFile: async (req, res, next) => {
    try {
      const multerStorage = multer.memoryStorage();

      const multerFilter = (_, file, cb) => {
        const ext = path.extname(file.originalname);
        if (!allowedMediaExtensions.includes(ext.toLowerCase())) {
          return cb(new Error(`${ext} files are not supported`));
        }

        cb(null, true);
      };

      const upload = multer({
        storage: multerStorage,
        fileFilter: multerFilter,
        limits: {
          fileSize: 100 * 1024 * 1024,
        },
      }).single('file');

      upload(req, res, async (err) => {
        if (err) {
          throw new BadRequestError(err.message);
        }

        const generatedFilename = generateFilename(req.file.originalname);

        const fileStream = stream.Readable.from(req.file.buffer);

        const ext = path.extname(req.file.originalname);
        await awsUpload(fileStream, `public/nfts/${ext}/${generatedFilename}`);
      });
    } catch (e) {
      next(e);
    }
  },
};
