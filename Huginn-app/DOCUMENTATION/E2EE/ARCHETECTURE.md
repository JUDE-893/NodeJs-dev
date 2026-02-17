# ARCHETECTURE
- Each conversation has a group key that is used to ecrypt/decrypt the secret version
- The group member has a key (`member key`: unique per member ans shared with the server)
- the `member key` is the `group key` encrypted using the user `identity secret` 
- The conversation record holds that members list alongside with their `member key`s and the current `group key version name` and the latest `token version name`
- the `token version` is not held in the conversation record or anywhere in the common database
- using a hashorp-vault systeme we will store the history of conversations's `token version`s:
 + we can then request a specific version of any conversation from the  hashicorp-vault
 + each conversation is a collection of `token version`s 
 + each `token version` holds : "create_date" & token (+storage-base encrypted)
 + the token is stored encrypted using the group key 

## When user Signup
- when the user register successfully an `identity secret` is generated in client-side
- `identity secret` is kept in the user device and never left


## When user Authenticate : With Other Device
- the user perform a typical log in (email & password)
- if the app can't find the user `identity secret` in user device: 
 -> the app prompt a request to the user in order to provide the identity key
 -> the user uses its former device (device has the `identity secret` ) to generate a QR code
 -> the user scans the QR code and retrieve the `identity secret`

## When user Authenticate : when No Other Device Available
- same as when user Authenticate : With Other Device
- if the user select no device available
 -> a request made to  the backend to send verification mail 
 -> the user must verify his request by clicking a link in the mail
 -> the server verifiy the token from the mail url
 -> if token is valid: all conversation where the user is member are retrieved and his member key is are set to null
 -> the server then return a success response
 -> the client receive the response and generate a new `identity secret` and store it locally

## When users  fetches conversation data : After Generating a new Identity Key
> the user once fetched the conversation data can't  read or send messages (as the `group key` is encrypted using the former `identity key`), so the user needs to request `group key` from another member

 -> after the client fetches the conversateion data and found out that the `member key` = null
 -> the user generates a pair key `publicKey`/`privateKey`
 -> the user client associate the `privateKey` with a `group key version name` and store it locally
 -> the user client make a request to the server to retrieve the `group key` with the `publicKey`
 -> the server send a notification to the any comrade member in the same conversation (who is online with preferance to be admin) along side with the `publicKey` and the required `group key version name`
 -> if the comrade member has the required `group key version name`
 -> the comrade member then decrypt its `member key` using his own `identity secret` and re-encrypt it using the new `publicKey`
 -> the comrade member then send the encrypted `group key` to the requesting member (user)
 -> the user client decrypt the `group key` using the `privateKey` 
 -> the user then encrypt the `group key` using new `identity secret` and submit it to the server
 -> the server (after integrity checks) update the user's `member key` in the conversation record (only if `member key = null `)
 -> the user then has regained his access to the selected conversation
!> before regaining access the user is prevented from access in the conversation (read or send messages) if no other member is online

## When  the user  joins
- a new member is appended in the conversation member list with the `member key` is set to `null`
- the new member retrieve the conversation data and found out that the `member key` = null 
- [SAME PROCESS AS: *"When users  fetches conversation data : After Generating a new Identity Key"*]
- the new member then have the `group key` plain text
- a new `token version` in generated in the client side (of the new member) and encrypt it using the `group key`
- the client encrypt the `group key` using new `identity secret` to get the `member key`
- the client then submit the new `token version` to the server alongside with the new payload to update conversation (`member key`, latest `token version` name)
- the server (after integrity checks) submit new `token version` to hashicorp-vault store
- the server update the user's `member key` in the conversation record (only if ` member key = null `) and latest `token version` name


## When a Member leaves
- the member is removed from the conversation member list
- all data about the conversation stored locally is cleared (`member key` & all `token version`)
- in database a new `token version` creation request is queued and scheduled to be sent to a member online
- by then a new `token version` isn't created each time a member leaves but in a scheduled time
- when the scheduled time is reached the server send a notification a the all members online
- the member client receive the notification
- a new `token version` in generated and encrypt it using the `group key` and submit it to the server
- to avoid concurancy race : the member client will not store the new `token version` locally (as other member might also has received the same notification and attempted to generate a new `token version`)
- the client invalidates its cache in order to be able to retrieve the newly updated conversation data
- the server receives the first new `token version` created and check if a pending token creation exist in the database
- server checks if a creation request exist in the database
- based on the previous `token version name` a new name is derived ("v_1.3.4" -> "v_1.3.5")
- the `token version` data is submitted and stored in hashicorp vault
- hashicorp vault stores the new `token version`
- due to concurrancy (as the creation request is still pending) it may also happen that hashicorp-vault might recieve a creation requestio for the specified `token version` in the specified conversation
- the hashicorp-vault should eather : 
 - reject creation request for duplicate version name (as the version is already created)
 - or just update the token that is already exist (which is delicate)
 > The second option can allow for harmfull token altering, for example if someone gained access he can change all the `token version`s leading to all conversation history lost
 - in both cases the server will only update the conversation data in he receives a success response from hashicorp-vault
 - the server updates the conversation record with the new `token version` name

## When a Member leaves : When User Is Banned By The Admins
- the admin member ban a member by making a request to the server
- the server updates the conversation data and return a response to the admin member client
- if success the admin then generate a new `token version` and submit it to the server
- [SAME PROCESS AS: *"When a Member leaves"*]
- after new `token version` creation and updating the conversation data in the database the server
- the server send a request to the online members to incvalidate the cache (only that stores the conversation data) to enforce conversation re-fetche
> is this case no pending creation request is queued or scheduled the new version token is created immediately by the issuer admin 

## When users fetches conversation data :
 - they check in their local storage for the matching `token version` found in the received conversation data
 - if the version is not found  
  -> client make a request to the server for the specified `token version`
  -> the server (after the integrity checks) make a request to the hashicorp -vault store in order to retrieve the specified `token version`
 -> the server uses a `secret token` to communicate to the hashcorp-vault store
 -> the hashicorp-vault store return `token version` data (transit-based encrypted)
 -> the server recieve the response
 -> the server then implement integrity check of user legimity to the token 
 -> the server checks if `user.join_date is < token.create_date`
 -> if condition is met the server return it to the user
 -> the client recieves the encrypted `token version` from the server and stored in the browser localstorage
 -> for use: the `token version` is then decrypted using the `group key` (which is the `member key` decrypted by the `identity secret`) and loaded in the memory

## When a member enter a conversation
- [PROCESS OF: When users fetches conversation data]
- the client checks the latest secret version from localStorage and retrieve it (in case of the latest `token version` conform to what was found in the browser localStorage)
- the `member key`is decrypted using the user `identity secret` producing the `group key`
- the latest `token version` is then decrypted using the `group key`
- the decrypted latest `token version` is then loaded in memory

## When a member enter a conversation : Displaying messages
 -> the client loops on the messages
 -> for each message we look for the `token version` from the cache then if not found, we look in the localStorage then if not found make a request to the server to recieve it
 -> we show spinner pending for each message which his `token version` in not yet loaded in the memory
 - the message after that is decrypted using the respective `token version` and then displayed

## When a message is sent
- the message got encrypted using the latest `token version` (already loaded in memory)
- the message is emitted and distributed to other members

## When a message is recieved
- the message decrypted is stored in the clientside cache 
- on display : the message got decrypted using the latest `token version` (already loaded in memory)

## When the conversation member keys are rotated
- the admin member rotate the member keys of a conversation (explicite trigger of implicite)
> for implicite rotation the admin is notified of the rotation
- the admin member client generate a new `group key`
- generate `member key` from encrypting the `group key` using the `identity secret`
- fetches all the conversation `token version` from the backend
- all the `token version`s are decrypted using the old `group key`
- all the `token version`s plaintext are then encrypted using the new `group key`
- the new `token version`s are then submitted to the backend for batch reset 
> Will we need to keep the old `token version`s in the hashicorp-vault store ? and just add new `token version`s for the new `group key` ? allowing rollback 
- the server then (after integrity and permissions checks):
 -> submit the new `token version`s to the hashicorp-vault store
 -> update the conversation record by setting all `member key` to `null` and update the `group key version` name
 -> send notification to all members clients to invalidate the cache to enforce refresh
- the other members clients can re-fetch the conversation data [SAME PROCESS AS: *When users fetches conversation data*]
- the server send a response back to admin member client (issuer):
    -> after receiving success response : the issuer admin member client can then clear the old `token version`s and old `member key`
- the other members' clients found that their member key is null and require the `group key` from other members clients
- partially [SAME PROCESS AS: *When users  fetches conversation data : After Generating a new Identity Key*]
- each member client get the group key from other members clients (more likely from the issuer admin)
- each `member key` is generated and submitted to the server
- the server update the conversation record with each received `member key`
> if a member fetches the conversation and no other member (who has the group key version) is online the member will be prevented from access to the conversation (no read or send messages)

---

# DATA
*conversation* : 
 - list of members with their `member key` and other metadata (join at..) 
 - `member key` : encrypted version of `group key` using the user `identity secret` | unique per user | rotate after the `group key` rotates
 - latest `token version name` | shared per members | change when a new token version is created
 - latest `group key version name` | shared per members | change after the `group key` rotates
 - major `group key` | shared per members | rotates rarely (explicitly or implicitly) | newer stored permanatly anywhere just loaded in memory when conversation is fetched in the client 
 - `token version` | shared per members with join date < token create at | stored in hashicorp-vault store encrypted using the `group key` | never rotated

*message* : 
 - `token version name`

*device* : 
 - user `identity secret` | unique | rotate rarely
 - user member pair key `publicKey`/`privateKey` | unique | short lived

---

# ACTORES
*member* : member user in a selected conversation | *admin* | *comrade member*
*server* : rest api
*hashicorp-vault* : used to store sensitive data (`token version`s, passwords ..)
*client* : front-end application used by the conversation member
