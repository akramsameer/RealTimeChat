const hello = msg => {
  return new Promise((resolve, reject) => {
    resolve(`Hey mr ${msg}`);
  });
};

hello('Akram').then(msg => console.log(msg));
