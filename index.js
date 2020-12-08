
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

let chatmessages =[]
//purchased.set(sessId, [{"from":"bob","contents":"hey"},{"from":"sue","contents":"hi"}])

let shipped = new Map()
//purchased.set(sessId, "bob")

//let reviews = new Map()
let reviews =[]
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
	shipped.set(listingId,"Item not sold")
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
				
				shipped.set(y[j].itemId,"not-shipped")
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
		//shipped.set(listingId,"not-shipped")
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
	
	//let parsedBody = JSON.parse(req.body)
	let sessId = req.headers.token
	
	
    if(!sessions.has(sessId)) {
		res.send(JSON.stringify({"success":false,"reason":"Invalid token"}))
		return
	}else if(!JSON.parse(req.body).hasOwnProperty('destination'))  {	
		res.send(JSON.stringify({"success":false,"reason":"destination field missing"}))
		return
	}else if(!JSON.parse(req.body).hasOwnProperty('contents'))  {	
		res.send(JSON.stringify({"success":false,"reason":"contents field missing"}))
		return
	}
	let parsedBody = JSON.parse(req.body)
	for (let x of sessions.values()){

		if (x===parsedBody.destination){

				chatmessages.push({from:sessions.get(sessId),to:parsedBody.destination,contents:parsedBody.contents})
				res.send(JSON.stringify({"success":true}))
				return
		
		}
	}
	res.send(JSON.stringify({"success":false,"reason":"Destination user does not exist"}))
	return

  })

app.post("/chat-messages", (req, res) => {
	//let parsedBody = JSON.parse(req.body)
	let sessId = req.headers.token

	if(!sessions.has(sessId)) {
		res.send(JSON.stringify({"success":false,"reason":"Invalid token"}))
		return
	}else if(!JSON.parse(req.body).hasOwnProperty('destination'))  {	
		res.send(JSON.stringify({"success":false,"reason":"destination field missing"}))
		return
	}

	let parsedBody = JSON.parse(req.body)

	for (let x of sessions.values()){

		
		if (x===parsedBody.destination){
			let arr = [];

			console.log("chatmessages",chatmessages)
			console.log("sessions",sessions.get(sessId))

			for(i=0;i<chatmessages.length; i++){
				console.log("if",chatmessages[i].from===parsedBody.destination && chatmessages[i].to===sessions.get(sessId))
				console.log("else if",chatmessages[i].to===parsedBody.destination && chatmessages[i].from===sessions.get(sessId))
				if(chatmessages[i].from===parsedBody.destination || chatmessages[i].from===sessions.get(sessId) && chatmessages[i].to===sessions.get(sessId)||chatmessages[i].to===parsedBody.destination){
					
					arr.push({from:chatmessages[i].from,contents:chatmessages[i].contents})
				}				
			}

			res.send(JSON.stringify({"success":true,"messages":arr}))
			return
		}

	}

	res.send(JSON.stringify({"success":false,"reason":"Destination user not found"}))
	return

  })

app.post("/ship", (req, res) => {
	let parsedBody = JSON.parse(req.body)
	let sessId = req.headers.token
	let listingId = parsedBody.itemid
	let status = shipped.get(listingId)


	let listingUN = listings.get(listingId).sellerUsername
	
	let expectedUN = sessions.get(sessId)

	console.log("listingUN", listingUN)
	console.log("expectedUN", expectedUN)

	/*for (let y of listings.values()){

        for(i=0; i <y.length; i++){
      //if(username === arr[i]){
       //   yes = true;
        console.log(y[i].itemId)
      
      }  
  }*/
  if(listingUN!==expectedUN)  {	
	res.send(JSON.stringify({"success":false,"reason":"User is not selling that item"}))
	return
}else if(status==='Item not sold') {
		res.send(JSON.stringify({"success":false,"reason":"Item was not sold"}))
		return
	}else if(status==='shipped')  {	
		res.send(JSON.stringify({"success":false,"reason":"Item has already shipped"}))
		return
	}

	shipped.set(listingId,"shipped")
	res.send(JSON.stringify({"success":true}))
	return

  })

app.get("/status", (req, res) => {
	let itemid = req.query.itemid
	//let listingId = parsedBody.itemid
	let status = shipped.get(itemid)


	if(status==='shipped')  {	
		res.send(JSON.stringify({"success":true,"status":status}))
	return
	}else if(status==='Item not sold') {
		res.send(JSON.stringify({"success":false,"reason":status}))
		return
	}else if(status==='not-shipped')  {	
		res.send(JSON.stringify({"success":true,"status":status}))
		return
		}

  })

app.post("/review-seller", (req, res) => {
	let parsedBody = JSON.parse(req.body)
	let sessId = req.headers.token
	let listingId = parsedBody.itemid
	
	if(!sessions.has(sessId)) {
		res.send(JSON.stringify({"success":false,"reason":"Invalid token"}))
		return
	}

	for(i=0;i<reviews.length;i++){

		if(reviews[i].itemid===listingId){
			res.send(JSON.stringify({"success":false,"reason":"This transaction was already reviewed"}))
			return
		}
	}

	let arr = [];

	arr = purchased.get(sessId)

	for(i=0; i <arr.length; i++){		
		
		//let reqItem = arr[i].itemId;
		//console.log(y[i].price)
		for (let y of purchased.values()){
			for(j=0; j <y.length; j++){
				
				if(listingId===y[j].itemId){
					
					reviews.push({from:sessions.get(sessId),numStars:parsedBody.numStars,contents:parsedBody.contents,itemid:listingId,sellerUsername:listings.get(listingId).sellerUsername})
					res.send(JSON.stringify({"success":true}))
					return
				}	
			}  
		}
	}
	
	res.send(JSON.stringify({"success":false,"reason":"User has not purchased this item"}))
	return

	

  })

app.get("/reviews", (req, res) => {

	let arr = [];
	let sellerUsername = req.query.sellerUsername
	for(i=0; i <reviews.length; i++){

		if(sellerUsername===reviews[i].sellerUsername){

			arr.push({from:reviews[i].from,numStars:reviews[i].numStars,contents:reviews[i].contents})
		}
		
		
	}		
	res.send(JSON.stringify({"success":true,"reviews":arr}))
	return
	
  })

app.get("/selling", (req, res) => {

	let sellerUsername = req.query.sellerUsername
	if(sellerUsername===undefined)  {	
		res.send(JSON.stringify({"success":false,"reason":"sellerUsername field missing"}))
		return
	}

			let arr = [];

			for (let y of listings.values()){

				for(i=0; i <y.length; i++){
					console.log("if",sellerUsername===y[i].sellerUsername)
					console.log("y[i].sellerUsername",y[i].sellerUsername)
					console.log("sellerUsername",sellerUsername)
					if(sellerUsername===y[i].sellerUsername){

						arr.push({price:y[i].price,description:y[i].description,sellerUsername:y[i].sellerUsername,itemId:y[i].itemId})
					}
					
					
				}				
			}

			res.send(JSON.stringify({"success":true,"selling":arr}))
			return
		

  })