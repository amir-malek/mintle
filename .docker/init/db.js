db = db.getSiblingDB("moment")

db.createUser({
  user: "moment",
  pwd: "CHANGE_ME",
  roles: [
    {
      role: "userAdmin",
      db: "moment"
    },
    "readWrite"
  ]
})