var express = require('express'),
    router = express.Router(),
    mongoose = require('mongoose'), //mongo connection
    bodyParser = require('body-parser'), //parses information from POST
    methodOverride = require('method-override'); //used to manipulate POST

router.use(bodyParser.urlencoded({ extended: true }))
router.use(methodOverride(function(req, res){
        if (req.body && typeof req.body === 'object' && '_method' in req.body) {
        // look in urlencoded POST bodies and delete it
        var method = req.body._method
        delete req.body._method
        return method
        }
}))

router.route('/')
.get(function(req, res, next) {
    mongoose.model('Todo').find({}, function (err, todos){
        if (err) {
            return console.error(err);
        } else {
            //respond to both HTML and JSON. JSON responses require 'Accept: application/json;' in the Request Header
            res.format({
                html: function(){
                    res.render('todos/index', {
                        title: 'Todo List', 
                        "todos": todos
                    });
                },
                json: function(){
                    res.json(infophotos)
                }
            });
        }
    });
})
//post a new todo
.post(function(req,res){
    var content = req.body.content;
    var completed = req.body.completed;
    var dob = req.body.dob;
    // call create fn for the db
    mongoose.model('Todo').create({
        content: content,
        completed: completed,
        dob: dob
    }, function(err, todo){
        if (err) {
            res.send("There has been a problem adding the info to the db")
        } else {
            // Todo created
            console.log("POST creating new todo: " + todo)
            res.format({
                html: function(){
                    // If it worked, set the header so the address bar doesn't still say /adduser
                    res.location("todos");
                    res.redirect("/todos")
                },
                json: function(){
                    res.json(todo)
                }
            })
        }
    })
});

router.get('/new', function(req, res) {
    res.render('todos/new', { title: 'Add New Todo' });
});

// middleware validates the id exists
router.param('id', function(req, res, next, id) {
    // console.log("validating ID# " + id + " exists")
    mongoose.model('Todo').findById(id, function(err, todo){
        if (err) {
            console.log(id + ' was not found');
            res.status(404)
            var err = new Error('Not Found');
            err.status = 404;
            res.format({
                html:function(){
                    next(err);
                },
                json: function(){
                    res.json({message : err.status + ' ' + err})
                }
            })
        } else {
            console.log(todo)
            req.id = id
            next()
        }
    })
})

// grabs individual todo by id
router.route('/:id')
.get(function(req,res){
    mongoose.model('Todo').findById(req.id, function(err,todo){
        if (err) {
            console.log('GET error: Problem retrieving:' + err);
        } else {
            console.log('GET Retreiving ID: ' + todo._id);
            
            var tododob = todo.dob.toISOString();
            tododob = tododob.substring(0, tododob.indexOf('T'))
            res.format({
                html: function(){
                    res.render('todos/show', {
                        "tododob": tododob,
                        "todo": todo
                    })
                },
                json: function(){
                    res.json(todo)
                }
            });
        }
    });
});


router.route('/:id/edit')
.get(function(req, res) {
    //search for the lob within Mongo
    mongoose.model('Todo').findById(req.id, function (err, todo) {
        if (err) {
            console.log('GET Error: There was a problem retrieving: ' + err);
        } else {
            //Return the todo
            console.log('GET Retrieving ID: ' + todo._id);
          var tododob = todo.dob.toISOString();
          tododob = tododob.substring(0, tododob.indexOf('T'))
            res.format({
                //HTML response will render the 'edit.jade' template
                html: function(){
                       res.render('todos/edit', {
                          title: 'todo' + todo._id,
                        "tododob" : tododob,
                          "todo" : todo
                      });
                 },
                 //JSON response will return the JSON output
                json: function(){
                       res.json(todo);
                 }
            });
        }
    });
})
//PUT to update a todo by ID
.put(function(req, res) {
    // Get our REST or form values. These rely on the "name" attributes
    var content = req.body.content;
    var completed = req.body.completed;
    var dob = req.body.dob;
    //find the document by ID
    mongoose.model('Todo').findById(req.id, function (err, todo) {
        //update it
        todo.update({
            content : content,
            completed : completed,
            dob : dob,
            
        }, function (err, todoID) {
          if (err) {
              res.send("There was a problem updating the information to the database: " + err);
          } 
          else {
                  //HTML responds by going back to the page or you can be fancy and create a new view that shows a success page.
                  res.format({
                      html: function(){
                           res.redirect("/todos/" + todo._id);
                     },
                     //JSON responds showing the updated values
                    json: function(){
                           res.json(todo);
                     }
                  });
           }
        })
    });
})
//DELETE a todo by ID
.delete(function (req, res){
    //find todo by ID
    mongoose.model('Todo').findById(req.id, function (err, todo) {
        if (err) {
            return console.error(err);
        } else {
            //remove it from Mongo
            todo.remove(function (err, todo) {
                if (err) {
                    return console.error(err);
                } else {
                    //Returning success messages saying it was deleted
                    console.log('DELETE removing ID: ' + todo._id);
                    res.format({
                        //HTML returns us back to the main page, or you can create a success page
                          html: function(){
                               res.redirect("/todos");
                         },
                         //JSON returns the item with the message that is has been deleted
                        json: function(){
                               res.json({message : 'deleted',
                                   item : todo
                               });
                         }
                      });
                }
            });
        }
    });
});


//////// OLD EDIT AND DELTE FUNCTIONS
// router.get('/:id/edit', function(req,res) {
//     mongoose.model('Todo').findById(req.id, function(err, todo){
//         if (err) {
//             console.log('GET Error: Problem retrieving' + err);
//         } else {
//             console.log('GET retrieving ID: ' + todo._id);
//             //format the date properly for the value to show correctly in our edit form
//             var tododob = todo.dob.toISOString();
//             tododob = tododob.substring(0, tododob.indexOf('T'))

//             res.format({
//                 //HTML response will render the 'edit.jade' template
//                 html: function(){
//                     res.render('todos/edit', {
//                         title: 'Todo' + todo._id,
//                         "tododob": tododob,
//                         "todo": todo
//                     });
//                 },
//                 //JSON response will return the JSON output
//                 json: function(){
//                     res.json(todo)
//                 }
//             })
//         }
//     })
// })

// //DELETE a todo by ID
// router.delete('/:id/edit', function(req,res){
//     mongoose.model('Todo').findById(req.id, function(err, todo){
//         if (err) {
//             return console.error(err)
//         } else {
//             // remove it from Mongo
//             todo.remove(function(err, todo) {
//                 if (err) {
//                     return console.error(err);
//                 } else {
//                     // Return success message: successfully deleted
//                     console.log('DELETE removing ID: ' + todo._id);
//                     res.format({
//                         //HTML returns us back to the main page, or you can create a success page
//                         html: function(){
//                             res.redirect("/todos");
//                         },
//                         json: function(){
//                             res.json({
//                                 message: 'deleted',
//                                 item: todo
//                             });
//                         }
//                     });
//                 }
//             });
//         }
//     });
// });
//////// END OF OLD EDIT AND DELTE FUNCTIONS

module.exports = router;