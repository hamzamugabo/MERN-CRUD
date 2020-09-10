const express = require("express");
const app = express();
const bodyParser = require("body-parser");
const cors = require("cors");
const mongoose = require("mongoose");
const todoRoutes = express.Router();
const PORT = 4000;

const bcrypt = require("bcryptjs");

let Todo = require("./todo.model");
let Todo2 = require("./todo.model2");

app.use(cors());
app.use(bodyParser.json());

mongoose.connect("mongodb://127.0.0.1:27017/todos", { useNewUrlParser: true });
const connection = mongoose.connection;

connection.once("open", function () {
  console.log("MongoDB database connection established successfully");
});
const crypto = require("crypto");
const algorithm = "aes-256-cbc";
const key = crypto.randomBytes(32);
const iv = crypto.randomBytes(16);

function encrypt(text) {
  let cipher = crypto.createCipheriv("aes-256-cbc", Buffer.from(key), iv);
  let encrypted = cipher.update(text);
  encrypted = Buffer.concat([encrypted, cipher.final()]);
  return { iv: iv.toString("hex"), encryptedData: encrypted.toString("hex") };
}

function decrypt(text) {
  let iv = Buffer.from(text.iv, "hex");
  let encryptedText = Buffer.from(text.encryptedData, "hex");
  let decipher = crypto.createDecipheriv("aes-256-cbc", Buffer.from(key), iv);
  let decrypted = decipher.update(encryptedText);
  decrypted = Buffer.concat([decrypted, decipher.final()]);
  return decrypted.toString();
}

var hw = encrypt("Some serious stuff");
console.log(hw);
console.log(decrypt(hw));
todoRoutes.route("/home").get(function (req, res) {
  Todo.find(function (err, todos) {
    if (err) {
      console.log(err);
    } else {
      res.json(todos);
    }
  });
});
todoRoutes.route("/").get(function (req, res) {
  Todo2.find(function (err, todos) {
    if (err) {
      console.log(err);
    } else {
      res.json(todos);
    }
  });
});

todoRoutes.route("/:id").get(function (req, res) {
  let id = req.params.id;
  Todo.findById(id, function (err, todo) {
    res.json(todo);
  });
});
todoRoutes.route("/show/:id").get(function (req, res) {
  let id = req.params.id;
  Todo.findById(id, function (err, todo) {
    res.json(todo);
  });
});

todoRoutes.route("/update/:id").post(function (req, res) {
  Todo.findById(req.params.id, function (err, todo) {
    if (!todo) res.status(404).send("data is not found");
    else todo.todo_description = req.body.todo_description;
    todo.todo_responsible = req.body.todo_responsible;
    todo.todo_priority = req.body.todo_priority;
    todo.todo_completed = req.body.todo_completed;

    todo
      .save()
      .then((todo) => {
        res.json("Todo updated!");
      })
      .catch((err) => {
        res.status(400).send("Update not possible");
      });
  });
});

todoRoutes.route("/delete/:id").delete(function (req, res) {
  Todo.findById(req.params.id, function (err, todo) {
    if (!todo) res.status(404).send("data is not found");
    else
      todo
        .deleteOne(todo)
        .then(() => {
          res.status(200).send("data deleted successfully");
        })
        .catch((error) => {
          res.status(500).send("data not deleted successfully");
        });
  });
});

// todoRoutes.route('/delete').delete(function(req, res) {
//     Todo.find(function(err, todos) {
//         if (!todos)
//             res.status(404).send("data is not found");
//         else

//             todos.remove(todos).then(()=>{ res.status(200).send("data deleted successfully");})
//             .catch((error)=>{
//             res.status(500).send("data not deleted successfully")})

//     });
// });

todoRoutes.route("/add").post(function (req, res) {
  let todo = new Todo(req.body);
  todo
    .save()
    .then((todo) => {
      res.status(200).json({ todo: "todo added successfully" });
      // console.log(todo);
    })
    .catch((err) => {
      res.status(400).send("adding new todo failed");
    });
});
var BCRYPT_SALT_ROUNDS = 12;
todoRoutes.route("/register").post(function (req, res) {
  Bcrypt.hash(req.body.password, BCRYPT_SALT_ROUNDS)
  .then(function(hashedPassword) {
    let todo = new Todo2({
       username:req.body.username,
       email:req.body.email,
       password:hashedPassword

    });
      return  todo
      .save()
      .then((todo) => {
        res.status(200).json("registered successfully");
        // console.log(todo);
      })
      .catch((err) => {
        res.status(400).send("registration failed");
      });
  })
 
});
todoRoutes.route("/login").post(function (req, res) {
  const email = req.body.email;
  const password = req.body.password;
// Find user by email
  Todo2.findOne({ email }).then(user => {
    // Check if user exists
    if (!user) {
      return res.status(404).json({ emailnotfound: "Email not found" });
    }
// Check password
    bcrypt.compare(password, user.password).then(isMatch => {
      if (isMatch) {
        // User matched
        // Create JWT Payload
//         const payload = {
//           id: user.id,
//           name: user.name
//         };
// // Sign token
//         jwt.sign(
//           payload,
//           keys.secretOrKey,
//           {
//             expiresIn: 31556926 // 1 year in seconds
//           },
//           (err, token) => {
//             res.json({
//               success: true,
//               token: "Bearer " + token
//             });
//           }
//         );
return res
.status(200)
.json({ usermatched: "user mathed" });
      } else {
        return res
          .status(400)
          .json({ passwordincorrect: "Password incorrect" });
      }
    });
  });
});

app.use("/todos", todoRoutes);

app.listen(PORT, function () {
  console.log("Server is running on Port: " + PORT);
});
