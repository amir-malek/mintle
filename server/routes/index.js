module.exports = (app) => {
  // app.use('/users', require('./users'));
  app.use('/ipfs', require('./ipfs.router'));
};
