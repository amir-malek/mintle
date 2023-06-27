const Collection = require('../models/Collection');

exports.create = async (req, res, next) => {
  try {
    const {
      name,
      symbol,
      callback,
    } = req.body;

    const collection = new Collection();

    collection.name = name;
    collection.symbol = symbol;
    collection.callback = callback;
    await collection.save();

    res.send({
      message: 'Collection creation added to queue',
      colId: collection.id,
    });
  } catch (e) {
    next(e);
  }
};
