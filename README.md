# SCL Voting Network - Example Deployed Blockchain

A bare minimum voting application written as a POC for Hyperledger Fabric Composer.

## Get it Working ##
Using the command line,
1. Clone the repo:

    `git clone https://github.com/aranjbar1313/scl-voting-network.git`

2. Navigate to scl-voring-network directory:

    `cd scl-voting-network`

3. Now the business network must be packaged into a deployable business network archive (`.bna`) file.
    
    + From the `scl-voting-network` directory, run the following command:

        `composer archive create -t dir -n .`
    
    After the command has run, a business network archive file called `scl-voting-network@0.0.1.bna` has been created in the `scl-voting-network` directory.

4. After creating the `.bna` file, the business network can be deployed to the instance of Hyperledger Fabric.

    + Hyperledger Composer Playground

        You can simply deploy the network on [online-playground](https://composer-playground.mybluemix.net/) using `.bna` file for testing.
    
    + Peer Network

        - Deploying the business network

            Deploying a business network to the Hyperledger Fabric requires the Hyperledger Composer business network to be installed on the peer, then the business network can be started, and a new participant, identity, and associated card must be created to be the network administrator. Finally, the network administrator business network card must be imported for use, and the network can then be pinged to check it is responding.

            1. To install the business network, from the `scl-voting-network` directory, run the following command:

                ```
                composer network install --card PeerAdmin@hlfv1 --archiveFile scl-voting-network@0.0.1.bna
                ```
            
            2. To start the business network, run the following command:

                ```
                composer network start --networkName scl-voting-network --networkVersion 0.0.1 --networkAdmin admin --networkAdminEnrollSecret adminpw --card PeerAdmin@hlfv1 --file networkadmin.card
                ```
            3. To import the network administrator identity as a usable business network card, run the following command:

                ```
                composer card import --file networkadmin.card
                ```
            
            4. To check that the business network has been deployed successfully, run the following command to ping the network:

                ```
                composer network ping --card admin@scl-voting-network
                ```
        
        - Generating a REST server

            Hyperledger Composer can generate a bespoke REST API based on a business network. For developing a web application, the REST API provides a useful layer of language-neutral abstraction.

            1. To create the REST API, navigate to the `scl-voting-network` directory and run the following command:

                ```
                composer-rest-server
                ```

            2. Enter `admin@scl-voting-network` as the card name.

            3. Select **never use namespaces** when asked whether to use namespaces in the generated API.

            4. Select **No** when asked whether to secure the generated API.

            5. Select **Yes** when asked whether to enable event publication.

            6. Select **No** when asked whether to enable TLS security.
        
        - Generating a skeleton Angular application

            Hyperledger Composer can also generate an Angular 4 application running against the REST API.

            1. To create your Angular 4 application, navigate to `scl-voting-network` directory and run the following command:

                ```
                yo hyperledger-composer:angular
                ```
            
            2. Select Yes when asked to connect to running business network.

            3. Enter standard `package.json` questions (project name, description, author name, author email, license)

            4. Enter `admin@scl-voting-network` for the business network card.

            5. Select **Connect to an existing REST API**

            6. Enter `http://localhost` for the REST server address.

            7. Enter `3000` for server port.

            8. Select **Namespaces are not used**

            The Angular generator will then create the scaffolding for the project and install all dependencies. To run the application, navigate to your angular project directory and run `npm start`. This will fire up an Angular 4 application running against your REST API at `http://localhost:4200`.

## Modeling assets, participants, and transactions ##

The first document to write is the model (`.cto`) file. This file is written using the [Hyperledger Composer Modelling Language](https://hyperledger.github.io/composer/latest/reference/cto_language.html). The model file contains the definitions of each class of asset, transaction, participant, and event. It implicitly extends the Hyperledger Composer System Model described in the modelling language documentation.

### Personnel - Participant

```javascript
participant Personnel identified by personnelId {
  o String personnelId
  o String fullName optional
}
```

### Day - Asset ### 
```javascript
asset Day identified by date {
  o String date
  o Integer[] options
  o String description optional
  o Vote[] votes optional
}
```

### VoteCount - Asset ###

```javascript
asset VoteCount identified by date {
  o String date 
  o Integer[] count
}
```

### Vote - Concept ###
```javascript
concept Vote {
  o Integer vote
  --> Personnel voter
}
```

### MakeVote - Transaction ###
```javascript
transaction MakeVote {
  o Vote vote
  --> Day day
}
```

### DeleteAllVotes - Transaction ###
```javascript
transaction DeleteAllVotes {
  --> Day day 
}
```

### CountingVotes - Transaction ###
```javascript
transaction CountingVotes {
  --> Day day
}
```

### SetupDemo - Transaction ###
```javascript
transaction SetupDemo {
  o String date
  o Integer personnelsNumber
  o Integer optionsNumber
}
```

## Tain Note ##
 * Take a look at ACL
 * Personnel can only see and update themselves only