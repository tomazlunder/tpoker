var express = require('express');
var app = express();

var crypto = require('crypto');
const https = require('https');
const fs = require('fs');
var path = require('path');

var db = require('./db.js');
var Room = require('./room.js');
var Tournament = require('./tournament.js');

//Options for running HTTPS
//TODO: Get a CA for production
const options = {
  key: fs.readFileSync('key.pem'),
  cert: fs.readFileSync('cert.pem')
};

//Creating a server
server = https.createServer(options, app);
server.listen(3000);

//Socket.IO
var io = require('socket.io')(server);

//Express Middleware for serving static files
app.use(express.static(path.join(__dirname, 'public')));


//Aplication variables
let socketUserMap = new Map()
let pidRoomMap = new Map()
let roomidRoomMap = new Map()

var users = []
var rooms = []

const removeDisconnectedUsersTime = 5000;


//Serving front-end files
app.get('/', function(req, res) {
   res.sendFile(__dirname +'/public/index.html');
});

//Socket.io message handling
io.on('connection', function(socket) {
	console.log('Someone connected');

	//Account actions
	socket.on('disconnect', disconnect);
	socket.on('login', login);
	socket.on('registration', registration);
	socket.on('withdraw', withdraw);
	socket.on('deposit', deposit)
	//socket.on('tip', tip);
	socket.on('changePassword', changePassword);
	socket.on('changeEmail', changeEmail);

	//Get something
	socket.on('accountStats', accountStats);
	socket.on('getLeaderboard', getLeaderboard);
	socket.on('lookingForRooms',lookingForRooms)

	//Joining and playing game
	socket.on('joinRoom', joinRoom);
	socket.on('joinTournament', joinTournament);
	socket.on('rebuyRoom', rebuyRoom);
	socket.on('leaveRoom',leaveRoom)
	socket.on('actionRequest', actionRequest);
	socket.on('reconnect', reconnect);

	//Admin actions
	socket.on('adminRoomStop', adminRoomStop);
	socket.on('adminRoomStart', adminRoomStart);

	function adminRoomStop(room_id){
		if(!socketUserMap.has(socket)){
			console.log("Tried something but is not logged in")
			socket.emit('dc')
			socket.disconnect;
			return;
		}
		if(socketUserMap.get(socket).is_admin == 0){
			console.log("Tried admin cmd but is not an admin.")
			return;
		}

		console.log("Received room stop ("+room_id+")")
		var the_room 

		for(var i in rooms){
			if(rooms[i].room_id == room_id){
				if(rooms[i].running == 0 || rooms[i].markedForShutdown == 1){
					console.log("Received room stop but room already stopped/marked for stopping");
					return;
				}

				rooms[i].markedToStop = 1;
				if(rooms[i].roomState == 0){
					rooms[i].updateState();
				}

				socket.emit("listOutdated")

				break;
			}
		}
		
	}

	function adminRoomStart(room_id){
		if(!socketUserMap.has(socket)){
			console.log("Tried something but is not logged in")
			socket.emit('dc')
			socket.disconnect;
			return;
		}
		if(socketUserMap.get(socket).is_admin == 0){
			console.log("Tried admin cmd but is not an admin.")
			return;
		}

		console.log("Received room start ("+room_id+")")
		for(var i in rooms){
			if(rooms[i].room_id == room_id){
				if(rooms[i].running == 1 ){
					console.log("Received room start but room already running");
					return;
				}

				socket.emit("listOutdated")

				rooms[i].startRoom();
			}
		}
	}

	async function getLeaderboard(){
		if(!socketUserMap.has(socket)){
			console.log("Tried something but is not logged in")
			socket.emit('dc')
			socket.disconnect;
			return;
		}

		try{
			const result = await db.topTenWinnings();

			const result2 = await db.topTenTourWinnings();
			
			socket.emit('leaderboard', [result,result2])

		} catch(err) {
			console.log("Get leaderboard error")
			console.log(err)
		}
	}

	async function changePassword(newPassword){
		if(!socketUserMap.has(socket)){
			console.log("Tried something but is not logged in")
			socket.emit('dc')
			socket.disconnect;
			return;
		}

		var user = socketUserMap.get(socket);

		var salt = crypto.randomBytes(10).toString('hex');
		salt = crypto.createHash('sha256').update(salt).digest('base64');


		var hash = crypto.createHash('sha256').update(newPassword + salt).digest('base64');

		try{
			const response = await db.setLoginPassword(user.id_login, hash, salt);

			socket.emit("changePasswordOk");

		} catch (err){
			console.log("changePasswordFailed")
			socket.emit("changePasswordFailed")
			console.log(err)
		}
	}

	async function changeEmail(newEmail){
		if(!socketUserMap.has(socket)){
			console.log("Tried something but is not logged in")
			socket.emit('dc')
			socket.disconnect;
			return;
		}

		var user = socketUserMap.get(socket);

		try{
			const response = await db.setPlayerEmail(user.id_player, newEmail);

			socket.emit("changeEmailOk");
			accountStats();

		} catch (err){
			console.log("changeEmailFailed")
			socket.emit("changeEmailFailed")
			console.log(err)
		}
	}

	async function withdraw(amount){
		if(!socketUserMap.has(socket)){
			console.log("Tried something but is not logged in")
			socket.emit('dc')
			socket.disconnect;
			return;
		}

		try{
			var user = socketUserMap.get(socket)
			const a = await db.decreaseBalance(user.id_player, amount)
			const b = await db.insertWithdraw(user.id_player, amount)
			
			user.balance = parseInt(user.balance) - parseInt(amount)
			socket.emit("withdrawOk")
			user.socket.emit("newBalance", user.balance)
			accountStats();

		} catch (err){
			console.log("withdrawFailed")
			socket.emit("withdrawFailed")
			console.log(err)
		}
	}

	async function deposit(amount){
		if(!socketUserMap.has(socket)){
			console.log("Tried something but is not logged in")
			socket.emit('dc')
			socket.disconnect;
			return;
		}

		try{
			var user = socketUserMap.get(socket)
			const a = await db.increaseBalance(user.id_player, amount)
			const b = await db.insertDeposit(user.id_player, amount)
			
			user.balance = parseInt(user.balance) + parseInt(amount)
			socket.emit("depositOk")
			user.socket.emit("newBalance", user.balance)
			accountStats();
			user.socket.emit("listOutdated")

		} catch (err){
			console.log("depositFailed")
			socket.emit("depositFailed")
			console.log(err)
		}
	}

	function lookingForRooms(){
		if(!socketUserMap.has(socket)){
			console.log("Tried something but is not logged in")
			socket.emit('dc')
			socket.disconnect;
			return;
		}

		var alreadyInRoom
		var user = socketUserMap.get(socket)
		if(pidRoomMap.has(user.id_login)){
			alreadyInRoom = pidRoomMap.get(user.id_login).room_id;
		}

		var roomList = []
		var tournamentList = []

		for(var i in rooms){
			var room = rooms[i]
			if(room.type == "room"){
				roomList.push([room.room_id,room.sb_size,room.min_buy_in, room.max_buy_in, room.numberOfPlayers(), room.seats.length, room.name, room.running, room.markedForShutdown])
			}
			else if(room.type == "tournament"){
				tournamentList.push(([room.room_id, room.entry_fee, room.numberOfPlayers(), room.numPlayers, room.name, room.running, room.markedForShutdown, room.rewards]))
			}

		}

		socket.emit("roomList",[alreadyInRoom, roomList, users.length]);

		socket.emit("tournamentList",[alreadyInRoom, tournamentList])
	}

	function actionRequest(data){
		if(!socketUserMap.has(socket)){
			console.log("Tried something but is not logged in")
			socket.emit('dc')
			socket.disconnect;
			return;
		}

		//console.log("AR :" + data)
	    var room_id = data[0]
	    var action = data[1];
		var raise_number = null;
		var user = socketUserMap.get(socket)

	    if(action == "raise"){
		   raise_number = data[2];
	    }

	    var the_room;

		if(pidRoomMap.has(user.id_login)){
			the_room = pidRoomMap.get(user.id_login)
		}
	
		if(the_room){
			the_room.tryAction(user.id_login,action,raise_number)
		} else {
			console.log(socket.id +" tried action but not in a room.")
		}

   }

    async function login(data){
		try {
			const response = await db.getLogin(data.name)

			var hash = crypto.createHash('sha256').update(data.password + response.password_salt).digest('base64');

			if(response.password_hash == hash){
				//Check if user is already logged in (disconnect current one and connect new one)
				var someUser = null;
				for(var i in users){
					if(users[i].id_login == response.id_login){
						someUser = users[i];
					}
				}

				if(someUser){
					console.log("Duplicate login")
					someUser.socket.emit("dc")
					someUser.socket.disconnect();
					someUser.socket = socket;
					socketUserMap.set(socket, someUser);
					someUser.disconnected = 0;

					socket.emit("loginOk",[response.account_name, someUser.balance, someUser.is_admin])
					accountStats();
				}
				else {

					try {
						const adminResponse = await db.getAdmin(response.id_login)


						var user = new User(socket,response.id_login,response.account_name, null, 1)
						users.push(user);
						socketUserMap.set(socket, user)

						
						console.log(response.account_name + " logged in")
						console.log('Number of users: '+ users.length);
						socket.emit("loginOk",[response.account_name, null, 1]);
						return;
					} catch (errA){
						console.log("Admin login failed")
					}

					try {
						const playerResponse = await db.getPlayer(response.id_login)


						var user = new User(socket,response.id_login,response.account_name, playerResponse.balance, 0)
						user.id_player = playerResponse.id_player;
						users.push(user);
						socketUserMap.set(socket, user)

						
						console.log(response.account_name + " logged in")
						console.log('Number of users: '+ users.length);
						socket.emit("loginOk",[response.account_name, playerResponse.balance, 0]);
						accountStats();

					} catch (errA){
						console.log("Player login failed")
						socket.emit("login failed");
					}
				}


			} else {
				socket.emit("loginFailed", "Incorrect pasword")
			}

		} catch (err) {
			console.log("Account not registered")
			console.log(err)
			socket.emit("loginFailed", "Account not registered");
		}
	}


	async function accountStats(){
		if(!socketUserMap.has(socket)){
			console.log("Tried something but is not logged in")
			socket.emit('dc')
			socket.disconnect;
			return;
		}

		try{
			var user = socketUserMap.get(socket)

			const response = await db.getPlayer(user.id_login)
			//const response2 = await db.getSumTips(response.id_login)
			const response3 = await db.getPendingWithdrawals(response.id_player)

			console.log(response)
			console.log(response3)

			winnings = parseInt(response.rounds_total) + parseInt(response.tours_total)

			//socket.emit("accountStats", [response.balance, winnings, response2, response.rounds_played, response3, response.email] )
			socket.emit("accountStats", [response.balance, winnings, 0, response.rounds_played, response3, response.email] )

			
		} catch (err) {
			console.log("[ERROR] accountStats")
		}
	}

	function disconnect(reason){
		console.log('Someone disconnected');

		//Marks user as zombie if in any room
		leaveRoom()

		if(socketUserMap.has(socket)){
			socketUserMap.get(socket).disconnected = 1;
		}
	}

	function leaveRoom(){
		if(!socketUserMap.has(socket)){
			console.log("Tried something but is not logged in")
			socket.emit('dc')
			socket.disconnect;
			return;
		}

		var user = socketUserMap.get(socket)
		var room = pidRoomMap.get(user.id_login)

		if(room){
			user.zombie = 1;
			if(room.roomState == 0){
				room.updateState()
			}
		}
	}

	//User registration
	async function registration(data) {
        console.log(data)

		
		try{
			const login = await db.getLogin(data.name);
			socket.emit("registrationFailed", "Account already registered");
			return;
		} catch (err){}

        if(data.password.length < 8){
			socket.emit("registrationFailed","Password too short")
			return
		}

		try{
			var salt = crypto.randomBytes(10).toString('hex');
			salt = crypto.createHash('sha256').update(salt).digest('base64');

			var hash = crypto.createHash('sha256').update(data.password + salt).digest('base64');

			var email = null
			if(data.email != ''){
				email = data.email
			}

			const responseInsertLogin = await db.insertLogin(data.name, hash, salt)

			const responseInsertPlayer = await db.insertPlayer(responseInsertLogin, email)

			console.log("Registration Successful!")
			login(data)

		} catch (err){
			if(err == "User exist"){
				socket.emit("registrationFailed", "Account already registered");
			}

			else{
				console.log("registration unknown error")
			}
		}
    }

	async function joinRoom(arg){
		if(!socketUserMap.has(socket)){
			console.log("Tried something but is not logged in")
			socket.emit('dc')
			socket.disconnect;
			return;
		}

		var room_id = arg[0]
		var buy_in = arg[1]

		console.log(socketUserMap.get(socket).name + " requested to join " + room_id)
		var user = socketUserMap.get(socket)

		if(pidRoomMap.has(socketUserMap.get(socket).id_login)){
			console.log("Already in a room... ("+rooms[i].room_id+")")

			socket.emit("roomJoinFailed", "Already in a room!")
			return;
		}

		var the_room = null;
		for(var i in rooms){
			var room = rooms[i]
			if(room.room_id == room_id){
				the_room = room;
				break;
			}
		}

		if(!the_room){
			console.log("ERROR: Room not found");
			return;
		}

		if(buy_in > room.max_buy_in){
			console.log("Buy_in too big for room")
			return
		}
		
		if(buy_in < room.min_buy_in){
			console.log(room.min_buy_in)
			console.log("Buy in too small for room")
			return
		}

		if(room.running == 0 || room.markedForShutdown == 1){
			console.log("Room is shutting down or already shut down")
			return;
		}

		try{
			await db.insertBuyin(user.id_player, buy_in, room.room_id)
		}
		catch (err){
			console.log(err)
		}

		the_room.joinRoom(user, buy_in);
	}

	async function joinTournament(arg){
		console.log("join tour "+ arg)

		if(!socketUserMap.has(socket)){
			console.log("Tried something but is not logged in")
			socket.emit('dc')
			socket.disconnect;
			return;
		}

		var user = socketUserMap.get(socket)

		if(pidRoomMap.has(socketUserMap.get(socket).id_login)){
			console.log("Already in a room... ("+pidRoomMap.has(socketUserMap.get(socket).id_login).room_id+")")

			socket.emit("roomJoinFailed", "Already in a room!")
			return;
		}

		var tournament_id = arg

		console.log(socketUserMap.get(socket).name + " requested to join " + tournament_id)

		var the_tournament = null;
		for(var i in rooms){
			var room = rooms[i]
			if(room.room_id == tournament_id){
				the_tournament = room;
				break;
			}
		}

		if(!the_tournament){
			console.log("ERROR: Tournament not found");
			return;
		}

		if(the_tournament.running == 0 || the_tournament.markedForShutdown == 1){
			console.log("Room is shutting down or already shut down")
			return;
		}

		the_tournament.joinRoom(user);
	}

	async function reconnect(){
		if(!socketUserMap.has(socket)){
			console.log("Tried something but is not logged in")
			socket.emit('dc')
			socket.disconnect;
			return;
		}

		var user = socketUserMap.get(socket)
		var room = pidRoomMap.get(user.id_login)


		if(room){
			var seatId = room.seats.indexOf(user);

			socket.join(room.room_id);
	
			if(room.type == "room"){
				socket.emit("roomJoined",[room.type, room.room_id, seatId, user.balance, room.min_buy_in, room.max_buy_in])
			}
			else if(room.type == "tournament"){
				user.socket.emit("roomJoined",[room.type,room.room_id, seatId, user.balance])
			}

			io.to(user.socket.id).emit("drawnCards", user.cards);				
			room.sendNamesStacks();
			room.sendGamestate();
			socket.emit("reconnectOK");

			user.zombie = 0;
			if(room.gameState.to_act == user & room.roomState == 1){
				clearInterval(room.timeoutID)
				room.betting();
			}
		}

	}
	
	async function rebuyRoom(arg){
		if(!socketUserMap.has(socket)){
			console.log("Tried something but is not logged in")
			socket.emit('dc')
			socket.disconnect;
			return;
		}

		var buy_in = parseInt(arg[0])
		var user = socketUserMap.get(socket)

		if(pidRoomMap.has(user.id_login)){
			var the_room = pidRoomMap.get(user.id_login);
			if(the_room.state == 0 || the_room.state == 8){
				if(buy_in <= the_room.max_buy_in - user.stack & buy_in != 0 & user.stack < the_room.min_buy_in){
					try{
						const response = db.decreaseBalance(user.id_player, buy_in)

						const response2 = db.setPlayerStack(user.id_player, parseInt(user.stack) + parseInt(buy_in))

						user.stack = user.stack + buy_in
						user.balance -= buy_in

						const response3 = db.insertBuyin(user.id_player, parseInt(buy_in), the_room.room_id);

						console.log(the_room.room_id + ": rebuy successful ("+user.name+","+buy_in+")")

						user.socket.emit("newBalance", user.balance)
						the_room.sendNamesStacks()

					} catch (err){
						console.log(err)
					}
				}
			}
			else{
				console.log("Someone tried rebuy but roomstate not 0 or 14.")
			}
		}
	}
	
});

process
  .on('unhandledRejection', (reason, p) => {
    console.error(reason, 'Unhandled Rejection at Promise', p);
  })
  .on('uncaughtException', err => {
    console.error(err, 'Uncaught Exception thrown');
    process.exit(1);
  });

//LOGGED IN USER
function User(socket, id_login, name, balance, admin){
	this.socket = socket;
	this.id_login = id_login;
	this.name = name;
	this.balance = balance;
	this.id_player = null;
	
	this.cards = []
	this.stack = 0;
	this.bet = 0;
	this.alive = 0;
	this.zombie = 0;

	this.all_in = 0;
	this.total_bet_size = 0;
	this.result = 0;

	this.disconnected = 0;

	this.has_acted;

	this.busted = 0;

	this.is_admin = admin;
}

async function runServer(){
	users = []
	rooms = []
	tournaments = []
	
	try{
		/*
		* If some of the players stacks are non zero (served crashed mid-game):
		* Transfer that players playing stack to balance
		*/
		const p = await db.transferAllPersonStackToBalance();

		//Creating normal rooms
		console.log("Fetching and creating rooms...")
		const roomRequest = await db.getRooms();
		for(var i in roomRequest){
			req = roomRequest[i]
			//console.log(req)
			//console.log(req.id_room)
			if(req.fk_status == 2 || req.fk_status == 1){
				var newRoom = new Room.Room(io, req.id_abstract_game, req.label, req.num_seats, pidRoomMap, req.small_blind, req.min_buyin, req.max_buyin)
				if(req.fk_status == 1){
					newRoom.running = 0;
				}
				//newRoom.db_id = req.id_room;

				rooms.push(newRoom)
				roomidRoomMap.set(req.id_room, newRoom)
			}

			i++;
		}


		//Creating tournaments
		console.log("Fetching and creating tournaments...")
		const tourRequest = await db.getTournaments();
		//console.log(tourRequest.length)
		for(var i in tourRequest){
			req = tourRequest[i]
			//console.log(req)

			//Get rewards
			var rewards = []
			try{
				const rewardRequest = await db.getTournamentReward(req.id_game_tournament);
				for(var j in rewardRequest){
					if(Number.isInteger(rewardRequest[j].reward)){
						rewards.push(rewardRequest[j].reward)
					}
					else{
						console.log("Error: Tournament reward not integer?!")
						continue;
					}
				}

			}
			catch (err){
				console.log("Tournament reward fetch error");
				console.log(err)
				continue
			}
			if(rewards.length == 0){
				console.log("No rewards found")
				continue;
			}

			console.log("Tournament rewards: " + rewards)
			//If room is "stopped" or "running" add it to room list
			if(req.fk_status == 2 || req.fk_status == 1){
				var newRoom = new Tournament.Tournament(io, req.id_abstract_game, req.label, req.num_players, pidRoomMap, req.small_blind, req.entry_fee, req.starting_chips,req.schedule_time, rewards, req.continuous)
				if(req.fk_status == 1){
					newRoom.running = 0;
				}
				//newRoom.db_id = req.id_tournament;

				rooms.push(newRoom)
				roomidRoomMap.set(req.id_room, newRoom)
			}

			i++;
		}

		//Starting rooms (... and tournaments)
		for(var i in rooms){
			rooms[i].startRoom();
		}

		//Removing disconnected users from the user list
		setInterval(function(){
			for(var i =0;i<users.length;i++){
				if(users[i].disconnected & !pidRoomMap.has(users[i].id_login)){
				  console.log("Removed " + users[i].name + " from user list");
				  users.splice(i,1);
				  console.log('Number of users: '+users.length);
				  break;
				}
			}
		}, removeDisconnectedUsersTime);

	} catch (err) {
		console.log("[SERVER] CRITICAL ERROR")
		console.log(err)
	}
}

//loadRoomsAndTournaments();
runServer();
