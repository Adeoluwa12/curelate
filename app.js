const express = require("express");
const mongoose = require("mongoose");
const ejs = require("ejs");
const path = require('path');

const session = require('express-session');
const bodyParser = require("body-parser");

const PORT = 8000 


const { userController } = require('./controllers/usercontroller');

const { User } = require('./models/user')


const mainRouter = require("./routes/main");
const userRouter = require("./routes/user");





const app = express();

//session
app.use(session({
  secret: 'your-secret-key', // Replace with your secret key
  resave: false,
  saveUninitialized: true,
}));

//Connect to MongoDB
mongoose.connect('mongodb+srv://Adeoluwa123:09014078564Feranmi@cluster0.r8sg61r.mongodb.net/?retryWrites=true&w=majority', {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

  
//MIDDLEWARES

app.set("view engine", "ejs");

app.use(express.json());
app.use(express.static(path.join(__dirname, 'public/css')));
app.use(bodyParser.urlencoded ({ extended: true} ));

app.use(
  session({
    secret: 'myappsecret',
    resave: false,
    saveUninitialized: true,
  })
 );



 const formatResults = (results) => {
  return Object.keys(results)
    .map((currency) => `${currency}:${results[currency]}`)
    .join(",\n");
};

//ROUTES
app.use('/', mainRouter);


app.use('/user', userRouter);


// for dashboard username display
app.get('/user/getUsername', async (req, res) => {
    if (req.session.userId) {
      const user = await User.findOne({ _id: req.session.userId });
      if (user) {
        res.json({ username: user.username });
      } else {
        res.status(404).json({ error: 'User not found' });
      }
    } else {
      res.status(401).json({ error: 'User not logged in' });
    }
  });








 

app.listen(8000, () => {
    console.log(`Server is running on port ${PORT}`);
});
