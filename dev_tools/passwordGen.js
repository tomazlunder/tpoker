var salt = crypto.randomBytes(10).toString('hex');
salt = crypto.createHash('sha256').update(salt).digest('base64');

var hash = crypto.createHash('sha256').update("awdqseww" + salt).digest('base64');

console.log(salt)
console.log(hash)