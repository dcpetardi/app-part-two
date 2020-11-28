
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

app.get("/sourcecode", (req, res) => {
res.send(require('fs').readFileSync(__filename).toString())
})

/*app.listen(port, () => {
  console.log(`partOne.js app listening at http://localhost:${port}`)
})*/

app.listen(process.env.PORT||4000)

app.post("/signup", (req, res) => {
	//this is creates a json object 
	let parsedBody = JSON.parse(req.body)
    // the has method returns true if the key is already in the map
    if (passwords.has(parsedBody.username)) {
        res.send(JSON.stringify({"success":false,"reason":"Username exists"}))
        return
    }else if(!parsedBody.hasOwnProperty('password')) {
        res.send(JSON.stringify({"success":false,"reason":"password field missing"}))
        return
    }else if(!parsedBody.hasOwnProperty('username'))  {
        res.send(JSON.stringify({"success":false,"reason":"username field missing"}))
        return
    }
    passwords.set(parsedBody.username, parsedBody.password)
    res.send(JSON.stringify({ success: true}))

})

app.post("/login", (req, res) => {
	//this is creates a json object 
	let parsedBody = JSON.parse(req.body)
    let usr = parsedBody.username
    let actualPassword = parsedBody.password
    let expectedPassword = passwords.get(usr)
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
        sessions.set(sessId, usr)
        res.send(JSON.stringify({success: true, token: sessId}))
        return
		
    }
	res.send(JSON.stringify({"success":false,"reason":"Invalid password"}))
})

app.post("/change-password", (req, res) => {
  })

app.post("/create-listing", (req, res) => {
  })

app.get("/listing", (req, res) => {
  })

app.post("/modify-listing", (req, res) => {
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