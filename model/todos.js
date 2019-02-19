var mongoose = require('mongoose');  

var todoSchema = new mongoose.Schema({  
  content: String,
  completed: Boolean,
  dob: { type: Date, default: Date.now }
});
mongoose.model('Todo', todoSchema);