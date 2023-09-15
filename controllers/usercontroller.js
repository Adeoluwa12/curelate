const bcrypt = require('bcryptjs');
const { User } = require('../models/user');


async function handleRegister (req, res) {
  const { username, email, password } = req.body;
  

   try {
  
        // Hash the password
        const hashedPassword = await bcrypt.hash(password, 10);
  
        // Create a new user
        await User.create ({
          username,
          email,
          password: hashedPassword,
        });

        
  
        res.redirect('/user/login');
      } catch (error) {
        console.error(error);
        res.status(500).send('Server Error');
      }
    }



    async function handleLogin(req, res) {
      const { username, password } = req.body;
    
      const user = await User.findOne({ username });
      console.log('User', user);
    
      if (!user || !(await bcrypt.compare(password, user.password))) {
        return res.render('login', {
          error: 'Invalid username or password',
        });
      } else {
        req.session.userId = user._id; // Store the correct _id of the found user
        return res.redirect('/user/dashboard');
      }
    };


    async function handleLogout(req, res) {
      req.session.destroy((err) => {
        if (err) {
          console.error('Error destroying session:', err);
          res.status(500).send('Server Error');
        } else {
          res.redirect('/user/login');
        }
      });
    }


    
    async function handleDashboard(req, res) {
      try {
        if (req.session.userId) {
          // Assuming you have access to the user object with the username
          const user = await User.findOne({ _id: req.session.userId });
          if (!user) {
            // Handle the case where the user is not found or not logged in properly
            return res.redirect('/user/login');
          }
          res.render('dashboard', { loggedIn: true, username: user.username });
        } else {
          res.redirect('/user/login');
        }
      } catch (error) {
        console.error('Error handling dashboard:', error);
        res.status(500).send('Server Error');
      }
    }
        




          

    module.exports = {
      handleRegister, handleLogin, handleLogout, handleDashboard
    }













