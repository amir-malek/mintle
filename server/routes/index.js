module.exports = (app) => {
  // app.use('/users', require('./users'));
  app.use('/ipfs', require('./ipfs.router'));
  app.use('/mint', require('./mint.router'));
};
