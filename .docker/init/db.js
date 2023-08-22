db = db.getSiblingDB("moment")

db.createUser({
  user: "moment",
  pwd: "dqA8V55eEXdPRxPXV8gPpQyVnnANAc",
  roles: [
    {
      role: "userAdmin",
      db: "moment"
    },
    "readWrite"
  ]
})