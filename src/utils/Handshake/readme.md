# Handshake protocol for Direct Connections

1. Alice generates a connection bundle and shows it to Bob.
2. This connection bundle contains: 
    1. Direct connection linkId
    2. Nonce
    3. Hash of Alice public key
3. Bob uses the Direct connection linkId to request the server for the generation of a chatId (also called lineId).
4. If request succeeds, a chatId is sent to Bob in response and a chatId is sent to Alice as a new message referencing the linkId. So both users now know that a chat with a chatId has been created. Now they need to authenticate themselves.
5. Alice sends the first message to the chatId that contains her public key.
6. Bob verifies the public key by comparing it with the hash received with the bundle. If this succeeds, Alice has authenticated herself to Bob.
7. Bob now generates his key pair and calculates a shared secret using Alice's public key and his private key. 
8. Bob encrypts the nonce received using this shared secret.
9. Bob sends his public key to Alice and the encrypted nonce.
10. Alice generates the same shared secret using Bob's public key and her private key. She then decrypts the encrypted nonce. If the decrypted data matches the nonce in the bundle, Bob has authenticated himself to Alice.
11. Full messaging capability starts after a user has authenticated the other person.