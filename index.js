
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
  })

app.get("/cart", (req, res) => {
  })

app.post("/checkout", (req, res) => {
  })

app.get("/purchase-history", (req, res) => {
  })

app.post("/chat", (req, res) => {
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