const { response } = require('express');
var mysql = require('mysql');
var con;

function connectDatabase() {
    if (!con) {
        con = mysql.createPool({
            host: "localhost",
            port: 3307,
            user: "appUser1",
            password: "awdqseww123",
            database: "t_poker",
            insecureAuth : true
        });

        /*
        con.connect(function(err){
            if(!err) {
                console.log('Database is connected!');
            } else {
                console.log('Error connecting database!');
            }
        });*/
    }

    return con;
}

//getUserBalance
function getPerson(account_name){
    return new Promise((resolve,reject) => {
        var query = con.query("SELECT * FROM person WHERE account_name = ?",
				[account_name],
				function(err, result){
					if (err) {
                        console.log(err)
                        reject()
                    }
					console.log(query.sql); 
					//console.log(result);
					if(result.length == 1){
                        resolve(result[0])
					}
					else{
                        reject()
					}
				}
			);
    });
}

function getAdmin(account_name){
    return new Promise((resolve,reject) => {
        var query = con.query("SELECT * FROM admin_account WHERE account_name = ?",
				[account_name],
				function(err, result){
					if (err) {
                        console.log(err)
                        reject()
                    }
					console.log(query.sql); 
					console.log(result);
                    console.log(result.length)
					if(result.length == 1){
                        resolve(result[0])
					}
					else{
                        reject()
					}
				}
			);
    });
}


//getUserBalance
function tryDecreaseBalance(user_id, decrease_by){
    return new Promise((resolve,reject) => {
        var query = con.query("UPDATE person SET balance = balance - ? WHERE id_person = ?",
        [decrease_by, user_id],
		function(err, result){
            if (err){
                console.log(err)
                reject();
                return;
            }
            
            console.log(query.sql); 
			//console.log(result);

			if(result.affectedRows == 1){
				//Complete room join
				resolve()
			}
			else{
				reject()
			}
        });
    });
}

function tryIncreaseBalance(id_person, increase_by){
    return new Promise((resolve,reject) => {
        var query = con.query("UPDATE person SET balance = balance + ? WHERE id_person = ?",
        [increase_by, id_person],
		function(err, result){
            if (err){
                console.log(err)
                reject();
                return;
            }
            
            console.log(query.sql); 
			//console.log(result);

			if(result.affectedRows == 1){
				//Complete room join
				resolve()
			}
			else{
				reject()
			}
        });
    });
}

function increaseDeposited(id_person, increase_by){
    return new Promise((resolve,reject) => {
        var query = con.query("UPDATE person SET deposited = deposited + ? WHERE id_person = ?",
        [increase_by, id_person],
		function(err, result){
            if (err){
                console.log(err)
                reject();
                return;
            }
            
            console.log(query.sql); 
			//console.log(result);

			if(result.affectedRows == 1){
				//Complete room join
				resolve()
			}
			else{
				reject()
			}
        });
    });
}

function resetDeposited(id_person){
    return new Promise((resolve,reject) => {
        var query = con.query("UPDATE person SET deposited = 0 WHERE id_person = ?",
        [id_person],
		function(err, result){
            if (err){
                console.log(err)
                reject();
                return;
            }
            
            console.log(query.sql); 
			//console.log(result);

			if(result.affectedRows == 1){
				//Complete room join
				resolve()
			}
			else{
				reject()
			}
        });
    });
}

function setPersonStack(user_id, new_stack){
    return new Promise((resolve,reject) => {
        var query = con.query("UPDATE person SET stack = ? WHERE id_person = ?",
        [new_stack, user_id],
		function(err, result){
            if (err){
                console.log(err)
                reject();
                return;
            }
            console.log(query.sql)

			if(result.affectedRows == 1){
				resolve()
			}
			else{
				reject()
			}
        });
    });
}

function setPersonPassword(id_person, hash, salt){
    return new Promise((resolve,reject) => {
        var query = con.query("UPDATE person SET password_hash = ?, password_salt = ? WHERE id_person = ?",
        [hash, salt, id_person],
		function(err, result){
            if (err){
                console.log(err)
                reject();
                return;
            }
            console.log(query.sql)

			if(result.changedRows == 1){
				resolve()
			}
			else{
				reject()
			}
        });
    });
}

function setPersonEmail(id_person, email){
    return new Promise((resolve,reject) => {
        var query = con.query("UPDATE person SET email = ? WHERE id_person = ?",
        [email, id_person],
		function(err, result){
            if (err){
                console.log(err)
                reject();
                return;
            }
            console.log(query.sql)
			if(result.changedRows == 1){
				resolve()
			}
			else{
				reject()
			}
        });
    });
}


//Inserting a new person (Registration)
function insertPerson(account_name, password_hash, password_salt, email){
    return new Promise((resolve,reject) => {
        var query = con.query("INSERT INTO person(account_name, password_hash, password_salt) VALUES (?,?,?)",
            [account_name,
            password_hash,
            password_salt
            ],
            function(err, result){
                if (err){
                    console.log(err)
                    reject("User exist");
                    return;
                }

                console.log(query.sql)
                if(result.affectedRows == 1){
                    resolve()
                }
                else{
                    reject()
                }            
            }
        );
        
    });
}

function transferStackToBalance(user){
    return new Promise((resolve,reject) => {    
        var query = con.query("UPDATE person SET balance = balance + ?, stack = 0 WHERE account_name = ?",
            [user.stack, user.name],
            function(err, result){
                if (err) {
                    console.log(err)
                    reject()
                }
                console.log(query.sql); 
                //console.log(result);
                if(result.affectedRows == 1){
                    //console.log("Transfered stack to balance.")
                    resolve()
                }else{
                    reject()
                }
            }
        );
    });
}

function changeWinnings(id_person, change_by){
    return new Promise((resolve,reject) => {    
        var query = con.query("UPDATE person SET rounds_total = rounds_total + ?, rounds_played = rounds_played + 1 WHERE id_person = ?",
            [change_by, id_person],
            function(err, result){
                if (err) {
                    console.log(err)
                    reject()
                }
                console.log(query.sql); 
                //console.log(result);
                if(result.changedRows == 1){
                    //console.log("Changed winnings.")
                    resolve()
                }else{
                    reject()
                }
            }
        );
    });
}

function changeTourWinnings(id_person, change_by){
    return new Promise((resolve,reject) => {    
        var query = con.query("UPDATE person SET tours_total = tours_total + ?, tours_played = tours_played + 1 WHERE id_person = ?",
            [change_by, id_person],
            function(err, result){
                if (err) {
                    console.log(err)
                    reject()
                }
                console.log(query.sql); 
                //console.log(result);
                if(result.changedRows == 1){
                    //(console.log("Changed winnings.")
                    resolve()
                }else{
                    reject()
                }
            }
        );
    });
}

function insertWithdraw(id_person, amount){
    return new Promise((resolve,reject) => {    
        var query = con.query("INSERT INTO transaction(fk_person, fk_type, amount, completed) VALUE (?,?,?,?)",
            [id_person,
                2,
                amount,
                0],
            function(err, result){
                if (err) {
                    console.log(err)
                    reject()
                }
                console.log(query.sql); 
                //console.log(result);
                if(result.affectedRows == 1){
                    //console.log("Created withdraw.")
                    resolve()
                }else{
                    reject()
                }
            }
        );
    });
}

function insertDeposit(id_person, amount){
    return new Promise((resolve,reject) => {    
        var query = con.query("INSERT INTO transaction(fk_person, fk_type, amount, completed) VALUE (?,?,?,?)",
            [id_person,
                1,
                amount,
                1],
            function(err, result){
                if (err) {
                    console.log(err)
                    reject()
                }
                console.log(query.sql); 
                //console.log(result);
                if(result.affectedRows == 1){
                    //console.log("Created withdraw.")
                    resolve()
                }else{
                    reject()
                }
            }
        );
    });
}

function insertBuyin(id_person, amount, note){
    return new Promise((resolve,reject) => {    
        var query = con.query("INSERT INTO transaction(fk_person, fk_type, amount, completed, note) VALUE (?,?,?,?,?)",
            [id_person,
                4,
                amount,
                1,
                note],
            function(err, result){
                if (err) {
                    console.log(err)
                    reject()
                }
                console.log(query.sql); 
                //console.log(result);
                if(result.affectedRows == 1){
                    //console.log("Created withdraw.")
                    resolve()
                }else{
                    reject()
                }
            }
        );
    });
}

function insertBuyout(id_person, amount, note){
    return new Promise((resolve,reject) => {    
        var query = con.query("INSERT INTO transaction(fk_person, fk_type, amount, completed, note) VALUE (?,?,?,?,?)",
            [id_person,
                5,
                amount,
                1,
                note],
            function(err, result){
                if (err) {
                    console.log(err)
                    reject()
                }
                console.log(query.sql); 
                //console.log(result);
                if(result.affectedRows == 1){
                    //console.log("Created withdraw.")
                    resolve()
                }else{
                    reject()
                }
            }
        );
    });
}

//On startup (if crashed)
function transferAllPersonStackToBalance(){
    return new Promise((resolve,reject) => {    
        var query = con.query("UPDATE person SET balance = balance + stack, stack = 0 WHERE id_person >= 0;",
            null,
            function(err, result){
                if (err) {
                    console.log(err)
                    reject()
                }
                console.log(query.sql)
                //console.log(result)
                resolve()
            }
        );
    });
}

function getSumTips(id_person){
    return new Promise((resolve,reject) => {    
        var query = con.query("SELECT SUM(amount) as result_sum FROM transaction WHERE fk_person = ? AND fk_type = 3;",
            [id_person],
            function(err, result){
                if (err) {
                    console.log(err)
                    reject()
                }
                console.log(query.sql)
                //console.log(result)
                if(result.length == 1){
                    if(result[0].result_sum){
                        resolve(result[0].result_sum)
                    } else {
                        resolve(0)
                    }
                }
            }
        );
    });
}

function getPendingWithdrawals(id_person){
    return new Promise((resolve,reject) => {    
        var query = con.query("SELECT SUM(amount) as result_sum FROM transaction WHERE fk_person = ? AND completed = 0 AND fk_type = 2;",
            [id_person],
            function(err, result){
                if (err) {
                    console.log(err)
                    reject()
                }
                console.log(query.sql)
                console.log(result)
                if(result.length == 1){
                    if(result[0].result_sum){
                        resolve(result[0].result_sum)
                    } else {
                        resolve(0)
                    }
                }
            }
        );
    });
}

function insertTip(id_person, amount){
    return new Promise((resolve,reject) => {    
        var query = con.query("INSERT INTO transaction(fk_person, fk_type, amount, completed) VALUE (?,?,?,?)",
            [id_person,
                3,
                amount,
                1],
            function(err, result){
                if (err) {
                    console.log(err)
                    reject()
                }
                console.log(query.sql); 
                //console.log(result);
                if(result.affectedRows == 1){
                    resolve()
                }else{
                    reject()
                }
            }
        );
    });
}

function topTenWinnings(){
    return new Promise((resolve,reject) => {    
        var query = con.query("SELECT account_name, rounds_total, rounds_played FROM person ORDER BY rounds_total DESC LIMIT 10;",
            null,
            function(err, result){
                if (err) {
                    console.log(err)
                    reject()
                }
                console.log(query.sql); 
                //console.log(result);
                resolve(result)
            }
        );
    });
}

function topTenTourWinnings(){
    return new Promise((resolve,reject) => {    
        var query = con.query("SELECT account_name, tours_total, tours_played FROM person ORDER BY tours_total DESC LIMIT 10;",
            null,
            function(err, result){
                if (err) {
                    console.log(err)
                    reject()
                }
                console.log(query.sql); 
                //console.log(result);
                resolve(result)
            }
        );
    });
}

function isAdmin(id_person){
    return new Promise((resolve,reject) => {    
        var query = con.query("SELECT * FROM admin_account WHERE fk_person = ?;",
            [id_person],
            function(err, result){
                if (err) {
                    console.log(err)
                    reject()
                }
                console.log(query.sql)
                console.log(result)
                if(result.length == 1){
                    resolve(1)
                    console.log("Admin")
                }
                else{
                    resolve(0)
                    console.log("Not admin")
                }
            }
        );
    });
}



module.exports = connectDatabase();

module.exports.getPerson = getPerson;
module.exports.getAdmin = getAdmin;
module.exports.tryDecreaseBalance = tryDecreaseBalance;
module.exports.tryIncreaseBalance = tryIncreaseBalance;
module.exports.setPersonStack = setPersonStack;
module.exports.insertPerson = insertPerson;
module.exports.transferStackToBalance = transferStackToBalance;
module.exports.changeWinnings = changeWinnings;
module.exports.changeTourWinnings = changeTourWinnings;

module.exports.insertWithdraw = insertWithdraw;
module.exports.insertDeposit = insertDeposit;
module.exports.transferAllPersonStackToBalance = transferAllPersonStackToBalance;
module.exports.getSumTips = getSumTips;
module.exports.getPendingWithdrawals = getPendingWithdrawals;
module.exports.insertTip = insertTip;
module.exports.setPersonPassword = setPersonPassword;
module.exports.setPersonEmail = setPersonEmail;
module.exports.topTenWinnings = topTenWinnings;
module.exports.topTenTourWinnings = topTenTourWinnings;

module.exports.insertDeposit = insertDeposit;
module.exports.increaseDeposited = increaseDeposited;
module.exports.resetDeposited = resetDeposited;

module.exports.isAdmin = isAdmin;
module.exports.insertBuyin = insertBuyin;
module.exports.insertBuyout = insertBuyout;





