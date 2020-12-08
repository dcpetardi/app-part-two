
/*how to run app:
open cmd
cd C:\
cd Program Files\nodejs\apps\
C:\Program Files\nodejs\apps>node partOne*/



let express = require('express')
let app = express()
let bodyParser = require('body-parser')
app.use(bodyParser.raw({type:"*/*"}))
const cors = require('cors')
app.use(cors())
const port = 4000


let passwords = new Map()
passwords.set("bob", "bob123")
passwords.set("sue", "bob123")
passwords.set("bobr", "bob123")

let sessions = new Map()
sessions.set("sessid100", "bob")
sessions.set("sessid101", "sue")
sessions.set("sessid102", "bobr")

let listings = new Map()
//listings.set(sessId, [{price:15,description:"a hat",itemId:"xyz123",sellerUsername:"bob"}])

let cart = new Map()
//cart.set(sessId, [{price:15,description:"a hat",itemId:"xyz123",sellerUsername:"bob"}])

let purchased = new Map()
//purchased.set(sessId, [{price:15,description:"a hat",itemId:"xyz123",sellerUsername:"bob"}])

let chatMessages = new Map()
//purchased.set(sessId, [{"from":"bob","contents":"hey"},{"from":"sue","contents":"hi"}])

let channel = new Map()
channel.set("awesome-chatters", "sessid100")
channel.set("awesome-chatterss", "sessid101")

let channelUsers = new Map()
channelUsers.set("awesome-chatters", ["bob","bobr"])
channelUsers.set("awesome-chatterss", ["sue"])

let channelMessages = new Map()
channelMessages.set("awesome-chatters", [
  {from:"bob", contents:"Hello"},
  {from:"bob", contents:"Hi"},
  {from:"bob", contents:"Ciao"}
])

let channelUsersBan = new Map()
channelUsersBan.set("awesome-chatters", ["sue", "bobr"])

let counter = 144
let genSessionId = () => {
    counter = counter + 1
    return "sess" + counter
}
let counterL = 144
let genlistingId = () => {
    counterL = counterL + 1
    return "listing" + counterL
}

app.get("/sourcecode", (req, res) => {
res.send(require('fs').readFileSync(__filename).toString())
})

/*app.listen(port, () => {
  console.log(`partOne.js app listening at http://localhost:${port}`)
})*/

/*app2*/

app.listen(process.env.PORT||4000)

app.post("/signup", (req, res) => {
	//this is creates a json object 
	let parsedBody = JSON.parse(req.body)
    // the has method returns true if the key is already in the map
    if(!parsedBody.hasOwnProperty('password')) {
        res.send(JSON.stringify({"success":false,"reason":"password field missing"}))
        return
    }else if(!parsedBody.hasOwnProperty('username'))  {
        res.send(JSON.stringify({"success":false,"reason":"username field missing"}))
        return
    }else if (passwords.has(parsedBody.username)) {
        res.send(JSON.stringify({"success":false,"reason":"Username exists"}))
        return
    }
    passwords.set(parsedBody.username, parsedBody.password)
    res.send(JSON.stringify({ success: true}))

})

app.post("/login", (req, res) => {
	//this is creates a json object 
	let parsedBody = JSON.parse(req.body)
    let username = parsedBody.username
    let actualPassword = parsedBody.password
    let expectedPassword = passwords.get(username)
	//let expectedUN = passwords.get(actualPassword)

    if(!parsedBody.hasOwnProperty('password')) {
		res.send(JSON.stringify({"success":false,"reason":"password field missing"}))
		return
	
	}else if(!parsedBody.hasOwnProperty('username'))  {	
		res.send(JSON.stringify({"success":false,"reason":"username field missing"}))
		return
	}else if(!passwords.has(parsedBody.username)) {
		res.send(JSON.stringify({"success":false,"reason":"User does not exist"}))
		return
	
	}else if (actualPassword === expectedPassword) {
        let sessId = genSessionId()
        sessions.set(sessId, username)
        res.send(JSON.stringify({success: true, token: sessId}))
        return
		
    }
	res.send(JSON.stringify({"success":false,"reason":"Invalid password"}))
})

app.post("/change-password", (req, res) => {

	let parsedBody = JSON.parse(req.body)
	let sessId = req.headers.token
	let oldPassword = parsedBody.oldPassword
    let newPassword = parsedBody.newPassword
	
    if(sessId===undefined){
		res.send(JSON.stringify({"success":false,"reason":"token field missing"}))
		return
	}else if(!sessions.has(sessId)) {
		res.send(JSON.stringify({"success":false,"reason":"Invalid token"}))
		return
	}
	 
	let username = sessions.get(sessId)
	let expectedPW = passwords.get(username)

	/*console.log("username",username)
	console.log("expectedPW",expectedPW)
	console.log("oldPassword",oldPassword)
	console.log("sessions",sessions)
	console.log("passwords",passwords)*/
	
	if(oldPassword !== expectedPW) {
		res.send(JSON.stringify({"success":false,"reason":"Unable to authenticate"}))
		return
	}
	passwords.set(username, newPassword)
	res.send(JSON.stringify({"success":true}))
  })

app.post("/create-listing", (req, res) => {

	let parsedBody = JSON.parse(req.body)
	let sessId = req.headers.token
	let price = parsedBody.price
    let description = parsedBody.description
	
    if(sessId===undefined){
		res.send(JSON.stringify({"success":false,"reason":"token field missing"}))
		return
	}else if(!sessions.has(sessId)) {
		res.send(JSON.stringify({"success":false,"reason":"Invalid token"}))
		return
	}else if(!parsedBody.hasOwnProperty('price'))  {	
		res.send(JSON.stringify({"success":false,"reason":"price field missing"}))
		return
	}else if(!parsedBody.hasOwnProperty('description')) {
		res.send(JSON.stringify({"success":false,"reason":"description field missing"}))
		return
	
	}
	let listingId = genlistingId()
	let username = sessions.get(sessId)
    listings.set(listingId, {price:price,description:description,itemId:listingId,sellerUsername:username})
	res.send(JSON.stringify({"success":true,"listingId":listingId}))
  })

app.get("/listing", (req, res) => {

	let rqlistingId = req.query.listingId
	//let listingItem = {}

	if(!listings.has(rqlistingId)) {
		res.send(JSON.stringify({"success":false,"reason":"Invalid listing id"}))
		return
	}

		res.send(JSON.stringify({"success":true,"listing":listings.get(rqlistingId)}))
		return

  })

app.post("/modify-listing", (req, res) => {
	let parsedBody = JSON.parse(req.body)
	let sessId = req.headers.token
	
	
    if(sessId===undefined){
		res.send(JSON.stringify({"success":false,"reason":"token field missing"}))
		return
	}else if(!sessions.has(sessId)) {
		res.send(JSON.stringify({"success":false,"reason":"Invalid token"}))
		return
	}else if(!parsedBody.hasOwnProperty('itemid'))  {	
		res.send(JSON.stringify({"success":false,"reason":"itemid field missing"}))
		return
	}else if(!parsedBody.hasOwnProperty('price')||!parsedBody.hasOwnProperty('description'))  {
	//let listingId = genlistingId()
		if(!parsedBody.hasOwnProperty('price')){
			let username = sessions.get(sessId)
			let listingId = parsedBody.itemid
			let price = listings.get(listingId).price
			let description = parsedBody.description
	
   			listings.set(listingId, {price:price,description:description,itemId:listingId,sellerUsername:username})
			res.send(JSON.stringify({"success":true}))
			return
		}else if(!parsedBody.hasOwnProperty('description'))  {
				//let listingId = genlistingId()
				let username = sessions.get(sessId)
				let listingId = parsedBody.itemid
				let price = parsedBody.price
				console.log("listingId",listingId)
				let description = listings.get(listingId).description
				console.log("description",description)
				console.log("listingId2",listingId)
				listings.set(listingId, {price:price,description:description,itemId:listingId,sellerUsername:username})
				res.send(JSON.stringify({"success":true}))
				return
			}
	}
		let username = sessions.get(sessId)
		let listingId = parsedBody.itemId
		let priceT = parsedBody.price
    	let descriptionT = parsedBody.description
	   
		listings.set(listingId, {price:priceT,description:descriptionT,itemId:listingId,sellerUsername:username})	
		res.send(JSON.stringify({"success":true}))
		return
	
  })

app.post("/add-to-cart", (req, res) => {

	let parsedBody = JSON.parse(req.body)
	let sessId = req.headers.token
	
	
    if(!sessions.has(sessId)) {
		res.send(JSON.stringify({"success":false,"reason":"Invalid token"}))
		return
	}else if(!parsedBody.hasOwnProperty('itemid'))  {	
		res.send(JSON.stringify({"success":false,"reason":"itemid field missing"}))
		return
	}else if(!listings.get(parsedBody.itemid))  {	
		res.send(JSON.stringify({"success":false,"reason":"Item not found"}))
		return
	}

	let listingId = parsedBody.itemid
	let price = listings.get(listingId).price
	let description = listings.get(listingId).description	
	let sellerUsername = listings.get(listingId).sellerUsername

	if(cart.has(sessId)){
		cart.get(sessId).push({price:price,description:description,itemId:listingId,sellerUsername:sellerUsername})
		res.send(JSON.stringify({"success":true}))
		return
	}else{
		cart.set(sessId, [{price:price,description:description,itemId:listingId,sellerUsername:sellerUsername}])
		res.send(JSON.stringify({"success":true}))
		return

	}
  })

app.get("/cart", (req, res) => {
	let sessId = req.headers.token

	if(!sessions.has(sessId)) {
		res.send(JSON.stringify({"success":false,"reason":"Invalid token"}))
		return
	}
	res.send(JSON.stringify({"success":true,"cart":cart.get(sessId)}))
	return


  })

app.post("/checkout", (req, res) => {
	let sessId = req.headers.token
	
	if(!sessions.has(sessId)) {
		res.send(JSON.stringify({"success":false,"reason":"Invalid token"}))
		return
	}else if(!cart.has(sessId)||cart.get(sessId).length===0)  {	
		res.send(JSON.stringify({"success":false,"reason":"Empty cart"}))
		return
	}

	let arr = [];

	arr = cart.get(sessId)

	for(i=0; i <arr.length; i++){		
		
		let reqItem = arr[i].itemId;
		//console.log(y[i].price)
		for (let y of purchased.values()){
			for(j=0; j <y.length; j++){
				
				if(reqItem===y[j].itemId){
					
					res.send(JSON.stringify({"success":false,"reason":"Item in cart no longer available"}))
					return
				}
				  //console.log()
				}  

		}
        
	}


	//let listingId = parsedBody.itemid//this has to be changed
	//let price = listings.get(listingId).price
	//let description = listings.get(listingId).description	
	//let sellerUsername = listings.get(listingId).sellerUsername

	//let arr = [];

	/*if(purchased.has(sessId)){
		purchased.get(sessId).push({price:price,description:description,itemId:listingId,sellerUsername:sellerUsername})
		res.send(JSON.stringify({"success":true}))
		return
	}else{*/
		purchased.set(sessId, arr)
		res.send(JSON.stringify({"success":true}))
		return

	
  })

app.get("/purchase-history", (req, res) => {
	let sessId = req.headers.token

	if(!sessions.has(sessId)) {
		res.send(JSON.stringify({"success":false,"reason":"Invalid token"}))
		return
	}
	res.send(JSON.stringify({"success":true,"purchased":purchased.get(sessId)}))
		return

  })

app.post("/chat", (req, res) => {
	let parsedBody = JSON.parse(req.body)
	let sessId = req.headers.token
	
	
    if(!sessions.has(sessId)) {
		res.send(JSON.stringify({"success":false,"reason":"Invalid token"}))
		return
	}else if(!parsedBody.hasOwnProperty('destination'))  {	
		res.send(JSON.stringify({"success":false,"reason":"destination field missing"}))
		return
	}else if(!parsedBody.hasOwnProperty('contents'))  {	
		res.send(JSON.stringify({"success":false,"reason":"contents field missing"}))
		return
	}

	for (let x of sessions.values()){

		if (x===parsedBody.destination){

			if(chatmessages.has(sessId)){
				chatmessages.get(sessId).push({from:parsedBody.destination,contents:parsedBody.contents})
				res.send(JSON.stringify({"success":true}))
				return
			}else{
				chatmessages.set(sessId, [{from:parsedBody.destination,contents:parsedBody.contents}])
				res.send(JSON.stringify({"success":true}))
				return
		
			}

		
		}
	}
	res.send(JSON.stringify({"success":false,"reason":"Destination user does not exist"}))
	return

  })

app.post("/chat-messages", (req, res) => {
  })

app.post("/ship", (req, res) => {
  })

app.get("/status", (req, res) => {
  })

app.post("/review-seller", (req, res) => {
  })

app.get("/reviews", (req, res) => {
  })

app.get("/selling", (req, res) => {
  })