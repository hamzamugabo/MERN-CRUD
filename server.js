const express = require('express');
const app = express();
const bodyParser = require('body-parser');
const cors = require('cors');
const mongoose = require('mongoose');
const todoRoutes = express.Router();
const PORT = 4000;

let Todo = require('./todo.model');
let Todo2 = require('./todo.model2');

app.use(cors());
app.use(bodyParser.json());

mongoose.connect('mongodb://127.0.0.1:27017/todos', { useNewUrlParser: true });
const connection = mongoose.connection;

connection.once('open', function() {
    console.log("MongoDB database connection established successfully");
})

todoRoutes.route('/home').get(function(req, res) {
    Todo.find(function(err, todos) {
        if (err) {
            console.log(err);
        } else {
            res.json(todos);
        }
    });
});
todoRoutes.route('/').get(function(req, res) {
    Todo2.find(function(err, todos) {
        if (err) {
            console.log(err);
        } else {
            res.json(todos);
        }
    });
});

todoRoutes.route('/:id').get(function(req, res) {
    let id = req.params.id;
    Todo.findById(id, function(err, todo) {
        res.json(todo);
    });
});
todoRoutes.route('/show/:id').get(function(req, res) {
    let id = req.params.id;
    Todo.findById(id, function(err, todo) {
        res.json(todo);
    });
});

todoRoutes.route('/update/:id').post(function(req, res) {
    Todo.findById(req.params.id, function(err, todo) {
        if (!todo)
            res.status(404).send("data is not found");
        else
            todo.todo_description = req.body.todo_description;
            todo.todo_responsible = req.body.todo_responsible;
            todo.todo_priority = req.body.todo_priority;
            todo.todo_completed = req.body.todo_completed;

            todo.save().then(todo => {
                res.json('Todo updated!');
            })
            .catch(err => {
                res.status(400).send("Update not possible");
            });
    });
});



todoRoutes.route('/delete/:id').delete(function(req, res) {
    Todo.findById(req.params.id, function(err, todo) {
        if (!todo)
            res.status(404).send("data is not found");
        else
            
            todo.deleteOne(todo).then(()=>{ res.status(200).send("data deleted successfully");})
            .catch((error)=>{
            res.status(500).send("data not deleted successfully")})

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




todoRoutes.route('/add').post(function(req, res) {
    let todo = new Todo(req.body);
    todo.save()
        .then(todo => {
            res.status(200).json({'todo': 'todo added successfully'});
            console.log(todo)
        })
        .catch(err => {
            res.status(400).send('adding new todo failed');
        });
});

todoRoutes.route('/register').post(function(req, res) {
    let todo = new Todo2(req.body);
    todo.save()
        .then(todo => {
            res.status(200).json({'todo': 'registered successfully'});
            console.log(todo)
        })
        .catch(err => {
            res.status(400).send('registration failed');
        });
});

app.use('/todos', todoRoutes);

app.listen(PORT, function() {
    console.log("Server is running on Port: " + PORT);
});