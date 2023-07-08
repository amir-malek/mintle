const multer = require('multer');
const path = require('path');
const fs = require('fs');
const makeId = require('../utils/makeId');
const { BadRequestError } = require('../utils/ApiError');
const { addJob: addMediaJob } = require('../services/queue/ipfs/media');
const { addJob: addImageJob } = require('../services/queue/ipfs/image');
const { addJob: addImageDownloadJob } = require('../services/queue/ipfs/imageWithUrl');
const { addJob: addMediaDownloadJob } = require('../services/queue/ipfs/mediaWithUrl');
const Image = require('../models/Image');
const Media = require('../models/Media');
const NFTModel = require('../models/NFT');
const { validateIpfsUpload, validateIpfsUploadWithUrl } = require('../services/validators/ipfs');

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
      }).fields([
        { name: 'image', maxCount: 1 },
        { name: 'media', maxCount: 1 },
      ]);

      upload(req, res, async (err) => {
        if (err) {
          throw new BadRequestError(err.message);
        }

        const {
          callback,
          attributes,
          name,
          // eslint-disable-next-line camelcase
          external_url,
          description,
        } = req.body;

        await validateIpfsUpload(req.body);

        const image = new Image();

        const imageFilename = req.files.image[0].filename;

        image.localPath = `${NFTFilesDest}/${imageFilename}`;
        image.filename = imageFilename;
        image.mimetype = path.extname(imageFilename);
        image.callback = callback;
        await image.save();

        let media;

        if (req.files.media) {
          media = new Media();

          const mediaFilename = req.files.media[0].filename;

          media.localPath = `${NFTFilesDest}/${mediaFilename}`;
          media.filename = mediaFilename;
          media.mimetype = path.extname(mediaFilename);
          media.image = image.id;
          await media.save();

          await addMediaJob(media.id);
        } else {
          await addImageJob(image.id);
        }

        const nft = new NFTModel();

        nft.image = image.id;
        if (req.files.media) nft.media = media.id;
        nft.metadata = {
          name,
          // eslint-disable-next-line camelcase
          external_url,
          description,
          attributes,
        };

        await nft.save();

        res.send({
          message: 'Upload pending',
          nftId: nft.id,
        });
      });
    } catch (e) {
      next(e);
    }
  },
  PostUploadWithUrl: async (req, res, next) => {
    try {
      const {
        imageUrl,
        mediaUrl,
        callback,
        attributes,
        name,
        external_url,
        description,
      } = req.body;

      await validateIpfsUploadWithUrl(req.body);

      const ext = path.extname(imageUrl);
      if (!allowedMediaExtensions.includes(ext.toLowerCase())) {
        throw new BadRequestError(`Extension not supported: ${ext}`);
      }

      const image = new Image();

      const splitString = imageUrl.split('/');
      const filename = splitString[splitString.length - 1];

      image.filename = filename;
      image.sourceUrl = imageUrl;
      image.mimetype = ext;
      image.callback = callback;
      await image.save();

      let media;

      if (mediaUrl) {
        const mediaExt = path.extname(mediaUrl);
        if (!allowedMediaExtensions.includes(mediaExt.toLowerCase())) {
          throw new BadRequestError(`Extension not supported: ${mediaExt}`);
        }

        media = new Media();

        const splitStringMedia = mediaUrl.split('/');
        const mediaFilename = splitStringMedia[splitStringMedia.length - 1];

        media.filename = mediaFilename;
        media.mimetype = mediaExt;
        media.sourceUrl = mediaUrl;
        media.image = image.id;
        await media.save();

        await addMediaDownloadJob(media.id);
      } else {
        await addImageDownloadJob(image.id);
      }

      const nft = new NFTModel();

      nft.image = image.id;
      if (mediaUrl) nft.media = media.id;

      nft.metadata = {
        name,
        external_url,
        description,
        attributes,
      };

      await nft.save();
    } catch (e) {
      next(e);
    }
  },
  // PostUploadBulk: async (req, res, next) => {
  //   try {
  //     const NFTFilesDest = './server/storage/nfts';
  //     const multerStorage = multer.diskStorage({
  //       destination: (_, file, cb) => {
  //         fs.mkdirSync(NFTFilesDest, { recursive: true });
  //         cb(null, NFTFilesDest);
  //       },
  //       filename: (_, file, cb) => {
  //         cb(null, generateFilename(file.originalname));
  //       },
  //     });

  //     const multerFilter = (_, file, cb) => {
  //       const ext = path.extname(file.originalname);
  //       if (!allowedMediaExtensions.includes(ext.toLowerCase())) {
  //         return cb(new Error(`${ext} files are not supported`));
  //       }

  //       cb(null, true);
  //     };

  //     const upload = multer({
  //       storage: multerStorage,
  //       fileFilter: multerFilter,
  //       limits: {
  //         fileSize: 100 * 1024 * 1024,
  //       },
  //     }).fields([
  //       { name: 'image', maxCount: 1 },
  //       { name: 'media', maxCount: 1 },
  //     ]);

  //     upload(req, res, async (err) => {
  //       if (err) {
  //         throw new BadRequestError(err.message);
  //       }

  //       const {
  //         callback,
  //         attributes,
  //       } = req.body;

  //       await validateIpfsUpload(req.body);

  //       const image = new Image();

  //       const imageFilename = req.files.image[0].filename;

  //       image.localPath = `${NFTFilesDest}/${imageFilename}`;
  //       image.filename = imageFilename;
  //       image.mimetype = path.extname(imageFilename);
  //       image.callback = callback;
  //       await image.save();

  //       let media;

  //       if (req.files.media) {
  //         media = new Media();

  //         const mediaFilename = req.files.media[0].filename;

  //         media.localPath = `${NFTFilesDest}/${mediaFilename}`;
  //         media.filename = mediaFilename;
  //         media.mimetype = path.extname(mediaFilename);
  //         media.image = image.id;
  //         await media.save();

  //         await addMediaJob(media.id);
  //       } else {
  //         await addImageJob(image.id);
  //       }

  //       const nft = new NFTModel();

  //       nft.image = image.id;
  //       if (req.files.media) nft.media = media.id;
  //       nft.metadata = {
  //         name: req.body.name,
  //         external_url: req.body.external_url,
  //         description: req.body.description,
  //         attributes,
  //       };

  //       await nft.save();

  //       res.send({
  //         message: 'Upload pending',
  //         nftId: nft.id,
  //       });
  //     });
  //   } catch (e) {
  //     next(e);
  //   }
  // },
};
