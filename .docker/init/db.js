db = db.getSiblingDB("test")

db.createUser({
  user: "moment",
  pwd: "fV=g#Dt/9JA=8{s^M?S;Wb|-",
  roles: [
    {
      role: "userAdmin",
      db: "moment"
    },
    "readWrite"
  ]
})