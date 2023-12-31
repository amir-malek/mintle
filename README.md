# Mintle minting platform API

This is a API service that utilizes Redis, mongodb and nodejs (express) to deliver API endpoints for minting files and uploading those files to IPFS
## Docker

To start the server, and it's the first run, you need to build it first with:

```bash
docker-compose build
```

And then you can simply start it with:

```bash
docker-compose up
```

To access to the console of each container, you can run this command:

```bash
// access to the web container
$ docker-compose exec web /bin/bash

// access to the mongo container
$ docker-compose exec mongo /bin/bash
```

> Be aware that before you can start the server properly, you will need to install **npm dependencies** with `npm install`, and after you start it with **docker-compose** you will need to access to the mongo instance, add a user to the database you want to use, and then update the `config/docker.json` file (if you don't have it, just copy the `config/docker.sample.json` file).

---

### PM2 commands

PM2 has some handy commands to monitoring the server status, these ones are the most common, but you can type `sudo pm2 --help` to get the full list.

- `pm2 update` - Refresh and reload the current active instances
- `pm2 status` - It shows the current status of the PM2 instances
- `pm2 logs` - It shows the last 10 lines of each logs and a live stream of the logs generated in real time.
- `pm2 start <app.js> -i 0 --name "<app name>"` - Start an app using all CPUs available + set a name
- `pm2 stop <app name>` - Stops the app passed
- `pm2 delete <app name>` - Delete the passed app from PM2
- `pm2 start <app.js> -i <number of instances>` - Create an N number of instances for the server you want to start and activate a load balancer for it

---

## MongoDB

On first initialization of this application with docker-compose, an empty database called `test` will be created, username and password are both `test`, just to get you started, if you use this repo as a starting point, and you wish to change this info, please change both the `docker-compose.yml` file and the `.docker/init/db.js` file with your credentials.

### Create admin user on MongoDB

If you wish to use a self hosted solution for MongoDB, remember that you need to create a MongoDB user and associate it with the database you want to use, here you can find a simple template of how to do it.

```
use <dbname>

db.createUser({
  user: "<username>",
  pwd: "<password>",
  roles: [
    {
      role: "userAdmin",
      db: "<dbname>"
    },
    "readWrite"
  ]
})
```

In case you never used the MongoDB shell, to run this code you simply have to run `mongo` in your terminal.
### Smart contract

#### Deployment:

To deploy a smart contract you must initially check the `hardhat.config.js` file for required configuration variables and environment variables then be sure to check the `/server/scripts/deploy.js` file to provide the smart contract constructor values.
then you can start deployment buy running the following line in your running docker container:

```
npx hardhat run --network sepolia server/scripts/deploy.js
```

#### Verification (Etherscan)

To verify your deployed smart contract on Etherscan you can run the following code:

```
npx hardhat verify <contract address> <...constructor values>
```
the Constructor values in the line above should be the same ones used to deploy the smart contract

### Security

There are a couple of steps to make MongoDB secure from the default configuration, which is defined in the `/etc/mongod.conf` file.
One is to never allow `0.0.0.0` in the `bindIp` parameter, but just bind the ip you want to use to connect.
Also once you entered the user as shown above, to enable only the valid users to login into the db, you should add the following lines in the configuration file:

```yaml
security:
  authorization: enabled
```

This will tell to MongoDB to allow connections only with the valid users, and not to be open to the public as it's by default (and I don't understand why they do that).

#### Encrypting env config files:
if using a gitlab/github runner, you can run the following lines to convert your local .json file to a base64 text that you can paste in your git environment configurations, along with the encryption phrase:

```
openssl enc -e -aes-256-cbc -md sha256 -in config/production.json -out encrypted_config.txt -k <encryption phrase>
```

```
base64 -i encrypted_config.txt | tr -d '\n' > encoded_config.txt
```

The decryption phase can be found in `/.github/workflows/node.js.yml`

### Backup and Restore with MongoDB

#### Create a backup

MongoDB comes with some utilities to easily make backups and restore data from a backup, the first one is `mongodump` (similar to *mysqldump*) and the second is `mongorestore`.
To create a backup the command is the following:

```
mongodump --out <path-to-backup-folder>
```

This will backup all the databases in the folder you passed in the arguments. If you want to backup one single database, you have to pass the `--db <dbname>` in the arguments. You can even trim down the backup to a single collection, just use the `--collection <collectionName>` attribute in addition to the others.
Here a few examples with all the cases:

```
// backup all the databases
mongodump --out /data/backup/

// backup only one database
mongodump --out /data/backup/ --db mydb

// backup only one collection of one database
mongodump --out /data/backup/ --db mydb --collection events

// backup only one database with authentication
mongodump --username <username> --password <password> --authenticationDatabase mydb --out /data/backup/ --db mydb

//backup an archive with docker
docker-compose exec -T mongo sh -c 'mongodump --host=localhost -u <username> -p <password> --archive' > your-host-file.archive
```

#### Restore a backup

Restoring the database is essentially the same, where the only difference is that the command is expecting at least a value, which is the path of the files to restore, so if we stored out backup files in the `/data/backup` folder, to restore anything it's in that path, you just have to run the following command:

```
mongorestore <path-to-backup-folder>
```

And if you want to restore one database, or even one collection of a database, it works exactly like the `mongodump` command, but here you can find some examples:

```
// restore all the databases
mongorestore /data/backup/

// restore only one database
mongorestore /data/backup/ --db mydb

// restore only one collection of one database
mongorestore /data/backup/ --db mydb --collection threads

//restore only one database with authentication
mongorestore /data/backup/ --username <username> --password <password> --authenticationDatabase mydb --db mydb

//restore an archive with docker
docker-compose exec -T mongo sh -c 'mongorestore --nsInclude=mydb.* --host=localhost -u <username> -p <password> --archive' < your-host-file.archive
```

---

