const express = require("express");
const app = express();
const port = process.env.PORT || 4000;
const jwt = require("jsonwebtoken");
const cors = require("cors");
const jwtKey = "my_secret_key";
const jwtExpirySeconds = 30000;
let customers = [
  { customerId: 1, firstName: "Sukesh", lastName: "Marla" },
  { customerId: 2, firstName: "Dipal", lastName: "Marla" },
  { customerId: 3, firstName: "Satvik", lastName: "Marla" },
];

const users = [
  {
    firstName: "Dipal",
    userId: 1,
    userName: "Admin1",
    password: "Admin1",
  },
  {
    firstName: "Sukesh",
    userId: 2,
    userName: "Admin2",
    password: "Admin2",
  },
  {
    firstName: "Sagar",
    userId: 3,
    userName: "Sagar",
    password: "123",
  },
  ,
  {
    firstName: "Chandan",
    userId: 4,
    userName: "Chandan",
    password: "Chandan",
  }
];



const products = [
  {
    name: "Apple",
    qty: 100
  },
  {
    name: "Samsung",
    qty: 50
  },
  {
    name: "Xiaomi",
    qty: 30
  }
]

// Read json encoded body data
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(
  cors({
    origin: "*",
    credentials: true,
  })
);


app.post("/products-stock", (req, res) => {
  const { name, qty } = req.body;
  const p = products.find(x => x.name == name);
  if (p && p.qty >= qty) {
    res.json({
      invalidQty: false
    })
  } else {
    res.json({
      invalidQty: true
    })
  }
})


app.post("/exists", (req, res) => {
  const { username } = req.body;
  if (users.some(x => x.userName == username)) {
    res.json({
      isAlreadyExists: true
    })
  } else {
    res.json({
      isAlreadyExists: false
    })
  }
})

app.post("/signin", (req, res) => {
  const { UserName, Password } = req.body;
  try {
    if (!UserName) {
      throw new Error("Invalid username");
    }
    if (!Password) {
      throw new Error("Invalid password.");
    }
    let filterUsers = users.filter(
      (x) => x.userName === UserName && x.password === Password
    );
    if (filterUsers.length == 0) {
      throw new Error("Invalid creadentials.");
    }
    const token = jwt.sign(
      { userId: filterUsers[0].userId, firstName: filterUsers[0].firstName },
      jwtKey,
      {
        algorithm: "HS256",
        expiresIn: jwtExpirySeconds,
      }
    );
    res.send({ token: token });
    res.end();
  } catch (err) {
    res.send({
      error: `${err.message}`,
    });
  }
});
app.use((req, res, next) => {
  var token = req.headers["x-access-token"];
  if (!token)
    return res.status(401).send({ auth: false, message: "No token provided." });

  jwt.verify(token, jwtKey, function (err, decoded) {
    if (err)
      return res
        .status(500)
        .send({ auth: false, message: "Failed to authenticate token." });
    next();
  });
});
app.post("/customers", (req, res) => {
  try {
    const { firstName, lastName } = req.body;
    if (!firstName || typeof firstName !== "string") {
      res.send("Invalid FirstName!");
      return;
    }
    if (!lastName || typeof lastName !== "string") {
      res.send("Invalid LastName!");
      return;
    }
    customers.push({ firstName: firstName, lastName: lastName });
    res.send({ status: "success" });
  } catch {
    res.status(400).send("Error While adding data.");
  }
});

app.get("/customers", (req, res) => {
  res.send(customers);
});

app.listen(port, () => {
  console.log("Listening on port %s...", port);
});


