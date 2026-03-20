const bcrypt = require("bcrypt");

bcrypt.hash("422627",10).then(hash=>{
console.log(hash);
});