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

function getLogin(account_name){
    return new Promise((resolve,reject) => {
        var query = con.query("SELECT * FROM login WHERE account_name = ?",
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

function getAdmin(id_login){
    return new Promise((resolve,reject) => {
        var query = con.query("SELECT * FROM admin_account WHERE fk_login = ?",
				[id_login],
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

function getPlayer(id_login){
    return new Promise((resolve,reject) => {
        var query = con.query("SELECT * FROM player_account WHERE fk_login = ?",
				[id_login],
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

//Inserting a new person (Registration)
function insertLogin(account_name, password_hash, password_salt){
    return new Promise((resolve,reject) => {
        var query = con.query("INSERT INTO login(account_name, password_hash, password_salt) VALUES (?,?,?)",
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
                if(Number.isInteger(result.insertId)){
                    resolve(result.insertId)
                } else{
                    console.log("Reject")
                    reject()
                }       
            }
        );
        
    });
}

function insertPlayer(fk_login, email){
    return new Promise((resolve,reject) => {
        var query = con.query("INSERT INTO player_account(fk_login, email) VALUES (?,?)",
            [fk_login,
                email
            ],
            function(err, result){
                if (err){
                    console.log(err)
                    reject("Error inserting player");
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

//Inserting a new person (Registration)
function insertRound(id_abstract_game){
    return new Promise((resolve,reject) => {
        var query = con.query("INSERT INTO round(fk_abstract_game) VALUES (?)",
            [id_abstract_game],
            function(err, result){
                if (err){
                    console.log(err)
                    reject();
                }

                console.log(query.sql)
                if(Number.isInteger(result.insertId)){
                    resolve(result.insertId)
                } else{
                    console.log("Reject")
                    reject()
                }       
            }
        );
        
    });
}

//On startup (if crashed)
function transferAllPersonStackToBalance(){
    return new Promise((resolve,reject) => {    
        var query = con.query("UPDATE player_account SET balance = balance + stack, stack = 0 WHERE id_player >= 0;",
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

function getRooms(){
    return new Promise((resolve,reject) => {
        var query = con.query("SELECT * FROM abstract_game ab JOIN game_room gr ON ab.id_abstract_game = gr.fk_abstract_game; ",
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

function getTournaments(){
    return new Promise((resolve,reject) => {
        var query = con.query("SELECT * FROM abstract_game ab JOIN game_tournament gt ON ab.id_abstract_game = gt.fk_abstract_game; ",
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

function getTournamentReward(id_tournament){
    return new Promise((resolve,reject) => {
        var query = con.query("SELECT * FROM tournament_reward WHERE fk_game_tournament = ?",
            id_tournament,
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

function getPendingWithdrawals(id_person){
    return new Promise((resolve,reject) => {    
        var query = con.query("SELECT SUM(amount) as result_sum FROM transaction WHERE fk_player = ? AND completed = 0 AND fk_type = 2;",
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

function insertWithdraw(id_person, amount){
    return new Promise((resolve,reject) => {    
        var query = con.query("INSERT INTO transaction(fk_player, fk_type, amount, completed) VALUE (?,?,?,?)",
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
        var query = con.query("INSERT INTO transaction(fk_player, fk_type, amount, completed) VALUE (?,?,?,?)",
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
                console.log(result);
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

function insertBuyin(id_player, amount, note){
    return new Promise((resolve,reject) => {    
        var query = con.query("INSERT INTO transaction(fk_player, fk_type, amount, completed, note) VALUE (?,?,?,?,?)",
            [id_player,
                3,
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

function insertBuyout(id_player, amount, note){
    return new Promise((resolve,reject) => {    
        var query = con.query("INSERT INTO transaction(fk_player, fk_type, amount, completed, note) VALUE (?,?,?,?,?)",
            [id_player,
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

function insertLeftover(amount,note){
    return new Promise((resolve,reject) => {    
        var query = con.query("INSERT INTO transaction(fk_player, fk_type, amount, completed) VALUE (?,?,?,?,?)",
            [null,
                5,
                amount,
                0,
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

function increaseBalance(id_player, increase_by){
    return new Promise((resolve,reject) => {
        var query = con.query("UPDATE player_account SET balance = balance + ? WHERE id_player = ?",
        [increase_by, id_player],
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

//getUserBalance
function decreaseBalance(user_id, decrease_by){
    return new Promise((resolve,reject) => {
        var query = con.query("UPDATE player_account SET balance = balance - ? WHERE id_player = ?",
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

function setPlayerStack(id_player, new_stack){
    return new Promise((resolve,reject) => {
        var query = con.query("UPDATE player_account SET stack = ? WHERE id_player = ?",
        [new_stack, id_player],
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

function setPlayerEmail(id_player, email){
    return new Promise((resolve,reject) => {
        var query = con.query("UPDATE player_account SET email = ? WHERE id_player = ?",
        [email, id_player],
		function(err, result){
            console.log(query.sql)
            if (err){
                console.log(err)
                reject();
                return;
            }
			if(result.changedRows == 1){
				resolve()
			}
			else{
				reject()
			}
        });
    });
}

function setLoginPassword(id_login, hash, salt){
    return new Promise((resolve,reject) => {
        var query = con.query("UPDATE login SET password_hash = ?, password_salt = ? WHERE id_login = ?",
        [hash, salt, id_login],
		function(err, result){
            console.log(query.sql)
            if (err){
                console.log(err)
                reject();
                return;
            }

			if(result.changedRows == 1){
				resolve()
			}
			else{
				reject()
			}
        });
    });
}

function topTenWinnings(){
    return new Promise((resolve,reject) => {    
        var query = con.query("SELECT account_name, rounds_total, rounds_played FROM player_account pa JOIN login l ON (l.id_login = pa.fk_login) ORDER BY rounds_total DESC LIMIT 10;",
            null,
            function(err, result){
                if (err) {
                    console.log(err)
                    reject()
                }
                console.log(query.sql); 
                resolve(result)
            }
        );
    });
}

function topTenTourWinnings(){
    return new Promise((resolve,reject) => {    
        var query = con.query("SELECT account_name, tours_total, tours_played FROM player_account pa JOIN login l ON (l.id_login = pa.fk_login) ORDER BY rounds_total DESC LIMIT 10;",
            null,
            function(err, result){
                console.log(query.sql); 
                if (err) {
                    console.log(err)
                    reject()
                }
                resolve(result)
            }
        );
    });
}

function transferStackToBalance(user){
    return new Promise((resolve,reject) => {    
        var query = con.query("UPDATE player_account SET balance = balance + ?, stack = 0 WHERE id_player = ?",
            [user.stack, user.id_player],
            function(err, result){
                console.log(query.sql); 
                if (err) {
                    console.log(err)
                    reject()
                }
                if(result.affectedRows == 1){
                    resolve()
                }else{
                    reject()
                }
            }
        );
    });
}

function changeWinnings(id_player, change_by){
    return new Promise((resolve,reject) => {    
        var query = con.query("UPDATE player_account SET rounds_total = rounds_total + ?, rounds_played = rounds_played + 1 WHERE id_player = ?",
            [change_by, id_player],
            function(err, result){
                console.log(query.sql); 
                if (err) {
                    console.log(err)
                    reject()
                }
                if(result.changedRows == 1){
                    resolve()
                }else{
                    reject()
                }
            }
        );
    });
}

function changeTourWinnings(id_player, change_by){
    return new Promise((resolve,reject) => {    
        var query = con.query("UPDATE player_account SET tours_total = tours_total + ?, tours_played = tours_played + 1 WHERE id_player = ?",
            [change_by, id_player],
            function(err, result){
                console.log(query.sql); 
                if (err) {
                    console.log(err)
                    reject()
                }
                if(result.changedRows == 1){
                    resolve()
                }else{
                    reject()
                }
            }
        );
    });
}

module.exports = connectDatabase();

module.exports.getLogin = getLogin;
module.exports.getPlayer = getPlayer;
module.exports.getAdmin = getAdmin;
module.exports.insertLogin = insertLogin;
module.exports.insertPlayer = insertPlayer;
module.exports.insertRound = insertRound;

module.exports.transferAllPersonStackToBalance = transferAllPersonStackToBalance;

module.exports.getRooms = getRooms;
module.exports.getTournaments = getTournaments;
module.exports.getTournamentReward = getTournamentReward;
module.exports.getPendingWithdrawals = getPendingWithdrawals;

module.exports.insertDeposit = insertDeposit;
module.exports.insertWithdraw = insertWithdraw;
module.exports.insertBuyin = insertBuyin;
module.exports.insertBuyout = insertBuyout;

module.exports.insertLeftover = insertLeftover;

module.exports.increaseBalance = increaseBalance;
module.exports.decreaseBalance = decreaseBalance;

module.exports.setPlayerEmail = setPlayerEmail;
module.exports.setLoginPassword = setLoginPassword;

module.exports.topTenWinnings = topTenWinnings;
module.exports.topTenTourWinnings = topTenTourWinnings;


module.exports.setPlayerStack = setPlayerStack;
module.exports.transferStackToBalance = transferStackToBalance;

module.exports.changeWinnings = changeWinnings;
module.exports.changeTourWinnings = changeTourWinnings;
