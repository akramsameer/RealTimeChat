module.exports = {
  // Secret key for JWT signing and encryption 
  secret : 'super secret key',
  // Database connection information
  database : 'mongodb://localhost/api-secure',
  // Setting port for server
  port: process.env.PORT || 3000 
};
