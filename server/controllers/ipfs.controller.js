const multer = require('multer');
const path = require('path');
const fs = require('fs');
const makeId = require('../utils/makeId');
const { BadRequestError } = require('../utils/ApiError');
const { addJob } = require('../services/queue/ipfs');
const IpfsFile = require('../models/ipfsFile');

const allowedMediaExtensions = ['.gif', '.jpeg', '.jpg', '.png', '.wav', '.ogg', '.glb', '.glt', '.webm', '.mp3', '.mp4'];

const generateFilename = (ogFilename) => {
  const id = makeId(100);
  return `${`${Date.now()}-${id}`}${path.extname(ogFilename).toLowerCase()}`;
};

module.exports = {
  PostUploadSingleFile: async (req, res, next) => {
    try {
      const NFTFilesDest = './server/storage/nfts';
      const multerStorage = multer.diskStorage({
        destination: (_, file, cb) => {
          fs.mkdirSync(NFTFilesDest, { recursive: true });
          cb(null, NFTFilesDest);
        },
        filename: (_, file, cb) => {
          cb(null, generateFilename(file.originalname));
        },
      });

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

        // const generatedFilename = generateFilename(req.file.originalname);

        // const fileStream = stream.Readable.from(req.file.buffer);

        // const ext = path.extname(req.file.originalname);
        // await awsUpload(fileStream, `public/nfts/${ext}/${generatedFilename}`);

        const ipfs = new IpfsFile();
        ipfs.localPath = `${NFTFilesDest}/${req.file.filename}`;
        ipfs.filename = req.file.filename;
        ipfs.mimetype = path.extname(req.file.filename);
        await ipfs.save();

        await addJob(ipfs._id);

        res.send({
          message: 'Upload pending',
        });
      });
    } catch (e) {
      next(e);
    }
  },
};
