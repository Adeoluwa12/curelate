const express = require('express');


const router = express.Router();
const bcrypt = require('bcryptjs')
const axios = require('axios');
const User = require('../models/user')
const ConversionResult = require('../models/conversionModel');

const { handleRegister, handleLogin, handleLogout, handleDashboard } = require('../controllers/usercontroller')




router.get('/signup', (req, res) => {
    res.render('signup')
});

router.post('/signup', handleRegister)



// //login

router.get('/login', (req, res) => {
    res.render('login');
  });
  
  router.post('/login', handleLogin ) 


  
  //logout

  router.get('/logout', (req, res) => {
    res.render('login');
  });
  
  router.post('/logout', handleLogout )


// Dashboard

  router.get('/dashboard', handleDashboard);


// Conversion logic

const currencies = [
  "USD", "EUR", "GBP", "AED", "AFN", "ALL", "AMD", "ANG", "AOA", "ARS", "AUD", "AWG", "AZN",
  "BAM", "BBD", "BDT", "BGN", "BHD", "BIF", "BMD", "BND", "BOB", "BRL",
  "BSD", "BTC", "BTN", "BWP", "BYN", "BZD", "CAD", "CDF", "CHF", "CLF",
  "CLP", "CNH", "CNY", "COP", "CRC", "CUC", "CUP", "CVE", "CZK", "DJF",
  // ... (and so on)
  "VUV", "WST", "XAF", "XCD", "XDR", "XOF", "XPF", "YER", "ZAR", "ZMW", "ZWL",
  "SCR", "SDG"
];



router.get('/dashboard/conversion', (req, res) => {
  req.session.currencies = currencies;
  res.render('index', {
    currencies,
    initialCurrency: '',
    nairaAmount: '',
    selectedCurrency: '',
  });
});

router.post('/dashboard/convert', (req, res) => {
  const nairaAmount = parseFloat(req.body.nairaAmount);
  const selectedCurrency = req.body.selectedCurrency;
  const customConversionRate = parseFloat(req.body.customConversionRate);

  
// Store parameters in the session
req.session.nairaAmount = nairaAmount;
req.session.customConversionRate = customConversionRate;
req.session.selectedCurrency = selectedCurrency;

  const convertedAmount = nairaAmount / customConversionRate;

  res.render('result', { nairaAmount, selectedCurrency, convertedAmount, currencies });
});



// router.post('/dashboard/finalconvert', async (req, res) => {
//   const convertedAmount = parseFloat(req.body.convertedAmount);
  
//   // Access parameters from the session
//   const nairaAmount = parseFloat(req.session.nairaAmount); 
//   const customConversionRate = parseFloat(req.session.customConversionRate); // Manually inputted rate
//   const selectedCurrency = req.session.selectedCurrency;
  

//   try {
//     // Fetch exchange rates for the selected currency
//     const response = await axios.get(`https://v6.exchangerate-api.com/v6/592041f6817d1d4f1dd5e2c8/latest/${selectedCurrency}`);
//     const data = await response.data;
//     const conversionRates = data.conversion_rates;

//     // Initialize objects to store the converted amounts, convertedToNairaResults, and profits
//     const convertedResults = {};
//     const convertedToNairaResults = {};
//     const profits = {};

//     // Calculate the initial converted amounts for each currency using the fetched conversion rates
//     for (const currency of currencies) {
//       const rate = parseFloat(conversionRates[currency]);
//       const initialConvertedValue = rate * convertedAmount;
//       convertedResults[currency] = initialConvertedValue.toFixed(2);
//     }

//     // Calculate the converted amounts back to NGN using the custom conversion rate
//     for (const currency of currencies) {
//       const convertedValue = convertedResults[currency] * customConversionRate;
//       convertedToNairaResults[currency] = convertedValue.toFixed(2);
//     }

//     // Calculate profit
//     for (const currency of currencies) {
//       const profitValue = (nairaAmount - convertedToNairaResults[currency]).toFixed(2);
//       profits[currency] = profitValue;
//     }

//     // Debugging: Output calculated results to console
//     console.log("Calculated Results:", convertedResults);

//     try {
//       // Create a new instance of the ConversionResult model
//       // Save the results to the database
//       const conversionResult = new ConversionResult({
//         selectedCurrency,
//         convertedAmount,
//         customConversionRate, // Store the custom rate in the results
//         results: convertedResults,
//         convertedToNairaResults,
//         profit: profits,
//       });

//       await conversionResult.save();

//       // Render the view with all data
//       res.render('finalResult', {
//         selectedCurrency,
//         convertedAmount,
//         customConversionRate,
//         results: convertedResults,
//         convertedToNairaResults,
//         nairaAmount,
//         profit: profits,
//       });
//     } catch (error) {
//       console.error("Error saving result:", error);
//       res.status(500).send("Error saving result");
//     }
//   } catch (error) {
//     console.error('Error calculating conversion:', error);
//     res.status(500).send('Error calculating conversion');
//   }
// });





// New /dashboard/finalcon route for initial conversion calculation

router.post('/dashboard/finalcon', async (req, res) => {
  const convertedAmount = parseFloat(req.body.convertedAmount);

  //store objects in session
  req.session.convertedAmount = convertedAmount;
  
  // Access parameters from the session
  const nairaAmount = parseFloat(req.session.nairaAmount); 
  const selectedCurrency = req.session.selectedCurrency;
  
  try {
    // Fetch exchange rates for the selected currency
    const response = await axios.get(`https://v6.exchangerate-api.com/v6/592041f6817d1d4f1dd5e2c8/latest/${selectedCurrency}`);
    const data = await response.data;
    const conversionRates = data.conversion_rates;

    // Initialize an object to store the initial converted amounts
    const initialConvertedResults = {};

    // Calculate the initial converted amounts for each currency using the fetched conversion rates
    for (const currency of currencies) {
      const rate = parseFloat(conversionRates[currency]);
      const initialConvertedValue = rate * convertedAmount;
      initialConvertedResults[currency] = initialConvertedValue.toFixed(2);
    }

     // store objects in session
  req.session.initialConvertedResults = initialConvertedResults;
console.log("Initial Converted Results:", req.session.initialConvertedResults);


    // Render the 'finalConResult' view with initial conversion results and a form to input custom conversion rates
    res.render('finalcon', {
      selectedCurrency,
      convertedAmount,
      initialConvertedResults,
    });
  } catch (error) {
    console.error('Error calculating initial conversion:', error);
    res.status(500).send('Error calculating initial conversion');
  }
});




router.post('/dashboard/finalconvert', async (req, res) => {
  // Retrieve custom conversion rates for each currency from the form
  const customConversionRates = req.body.customConversionRates;

  // Access parameters from the session
  const nairaAmount = parseFloat(req.session.nairaAmount); 
  const selectedCurrency = req.session.selectedCurrency;
  const convertedAmount = parseFloat(req.session.convertedAmount); // Parse as float
  const initialConvertedResults = req.session.initialConvertedResults; // Keep as is

  try {
    // Initialize objects to store the converted amounts and profits
    const convertedToNairaResults = {};
    const profits = {};

    // Debugging: Log the values of variables for debugging
    console.log("Custom Conversion Rates:", customConversionRates);
    console.log("Initial Converted Results:", initialConvertedResults);

    // Calculate converted amounts back to NGN using the custom conversion rates
    for (const currency in customConversionRates) {
      const customRate = parseFloat(customConversionRates[currency]);
      // Debugging: Log customRate for debugging
      console.log(`Custom Rate for ${currency}:`, customRate);

      // Ensure that initialConvertedResults is parsed as a float
      const initialResultValue = parseFloat(initialConvertedResults[currency]);
      // Debugging: Log initialResultValue for debugging
      console.log(`Initial Result Value for ${currency}:`, initialResultValue);

      if (!isNaN(customRate) && !isNaN(initialResultValue)) {
        const convertedValue = customRate * initialResultValue;

        // Debugging: Log convertedValue for debugging
        console.log(`Converted Value for ${currency}:`, convertedValue);

        convertedToNairaResults[currency] = convertedValue.toFixed(2);
        const profitValue = (nairaAmount - convertedValue).toFixed(2);
        profits[currency] = profitValue;
      } else {
        console.error(`Invalid custom rate or initial result value for ${currency}:`, customConversionRates[currency], initialConvertedResults[currency]);
        // You can handle the error here or skip this currency and continue the loop.
      }
    }

    // Debugging: Output calculated results to console
    console.log("Calculated Results:", convertedToNairaResults);

    try {
      // Create a new instance of the ConversionResult model
      // Save the results to the database
      const conversionResult = new ConversionResult({
        selectedCurrency,
        convertedAmount,
        customConversionRates, // Store the custom rates in the results
        results: convertedToNairaResults, // Store the converted amounts in NGN
        profit: profits,
      });

      await conversionResult.save();

      // Render the 'finalResult' view with the complete conversion results
      res.render('finalResult', {
        selectedCurrency,
        convertedAmount,
        customConversionRate: req.session.customConversionRate,
        results: convertedToNairaResults,
        convertedToNairaResults,
        nairaAmount,
        profit: profits,
      });
    } catch (error) {
      console.error("Error saving result:", error);
      res.status(500).send("Error saving result");
    }


  } catch (error) {
    console.error('Error calculating final conversion:', error);
    res.status(500).send('Error calculating final conversion');
  }
});













// automated






router.get('/dashboard/autoconversion', (req, res) => {
  res.render('autoindex', {
    currencies,
    initialCurrency: '',
    nairaAmount: '',
    selectedCurrency: '',
  });
});



router.post('/dashboard/autoconvert', async (req, res) => {
  const nairaAmount = parseFloat(req.body.nairaAmount);
  const selectedCurrency = req.body.selectedCurrency;
 
  // Store nairaAmount in the session
  req.session.nairaAmount = nairaAmount;
  


  try {
    const response = await axios.get(`https://v6.exchangerate-api.com/v6/592041f6817d1d4f1dd5e2c8/latest/NGN`);
    const data = await response.data;
    const exchangeRates = data.conversion_rates;
    const rate = exchangeRates[selectedCurrency];
    const convertedAmount = (nairaAmount * rate).toFixed(2);

    res.render('autoresult', { nairaAmount, currencies, selectedCurrency, convertedAmount });
  } catch (error) {
    console.error('Error fetching exchange rates:', error);
    res.status(500).send('Error fetching exchange rates');
  }
});






router.post('/dashboard/autofinalconvert', async (req, res) => {
  const selectedCurrency = req.body.selectedCurrency;
  const convertedAmount = parseFloat(req.body.convertedAmount);
  const selectedCurrencies = Array.isArray(req.body.selectedCurrencies)
    ? req.body.selectedCurrencies
    : [req.body.selectedCurrencies];


  // Access nairaAmount from the session
  const nairaAmount = parseFloat(req.session.nairaAmount);
  req.session.selectedCurrencies = selectedCurrencies;

  try {
    // Fetch exchange rates for the selected currency
    const response = await axios.get(`https://v6.exchangerate-api.com/v6/592041f6817d1d4f1dd5e2c8/latest/${selectedCurrency}`);
    const data = await response.data;
    const conversionRates = data.conversion_rates;

    // Initialize objects to store the converted amounts, convertedToNairaResults, and profits
    const convertedResults = {};
    const convertedToNairaResults = {};
    const profits = {};

    // Calculate the converted amounts for each currency using the fetched conversion rates
    for (const currency in conversionRates) {
      if (conversionRates.hasOwnProperty(currency)) {
        const rate = parseFloat(conversionRates[currency]);
        const convertedValue = rate * convertedAmount;
        convertedResults[currency] = convertedValue.toFixed(2); // Convert to fixed decimal places
 

    // Fetch exchange rate for NGN to convert back
    const ngnResponse = await axios.get(`https://v6.exchangerate-api.com/v6/592041f6817d1d4f1dd5e2c8/latest/NGN`);
    const ngnData = await ngnResponse.data;
    const ngnConversionRates = ngnData.conversion_rates;

    // Calculate and accumulate the converted amounts back to NGN for each currency
    for (const currency in convertedResults) {
      if (ngnConversionRates.hasOwnProperty(currency)) {
        const rate = ngnConversionRates[currency];
        const convertedValue = (convertedResults[currency] / rate).toFixed(2);
        convertedToNairaResults[currency] = convertedValue;
      }
    }

    
    }

     // Calculate profit
     const profitValue = (nairaAmount - convertedToNairaResults[currency]).toFixed(2);
     profits[currency] = profitValue;
   }


    // Debugging: Output calculated results to console
    console.log("Calculated Results:", convertedResults);

    try {
      // Create a new instance of the ConversionResult model
      // Save the results to the database
      const conversionResult = new ConversionResult({
        selectedCurrency,
        convertedAmount,
        conversionRates,
        results: convertedResults,
        convertedToNairaResults,
        profit: profits, // Include profit in the saved results
      });

      await conversionResult.save();

      // Render the view with all data
      res.render('autofinalresult', {
        selectedCurrency,
        convertedAmount,
        results: convertedResults,
        convertedToNairaResults,
        nairaAmount,
        profit: profits, // Pass profit to the template
      });
    } catch (error) {
      console.error("Error saving result:", error);
      res.status(500).send("Error saving result");
    }
  } catch (error) {
    console.error('Error fetching exchange rates:', error);
    res.status(500).send('Error fetching exchange rates');
  }
});










// router.post('/dashboard/saveresult', async (req, res) => {
//   try {
//     // Extract data from the request body
//     const { selectedCurrency, results, nairaAmount, convertedAmount, convertedToNairaResults, profit } = req.body;

//     // Create a new instance of the SavedResult model (assuming you have a model for saved results)
//     const conversionResult = new ConversionResult({
//       selectedCurrency,
//         convertedAmount,
//         results,
//         convertedToNairaResults,
//         nairaAmount,
//         profit,
//     });

//     // Save the result to the database
//     await conversionResult.save();

//     // Redirect to the view page to show the success message
//     res.redirect('/user/dashboard/viewresult');
//   } catch (error) {
//     console.error("Error saving result:", error);
//     res.status(500).send("Error saving result");
//   }
// });


router.post('/dashboard/saveresult', async (req, res) => {
  const selectedCurrency = req.body.selectedCurrency;
  const convertedAmount = req.body.convertedAmount;
    const conversionRates = req.body.conversionRates;
    const results = req.body.results;
     const convertedToNairaResults = req.body.convertedToNairaResults;
     const profit = req.body.profit;

  try {
  //     // Create a new ConversionResult document
  //     const newConversionResult = new ConversionResult({
  //         selectedCurrency: selectedCurrency,
  //         convertedAmount: convertedAmount,
  //         results: results
  //     });

  //     // Save the document to the database
  //     await newConversionResult.save();

      res.redirect('/user/dashboard/viewresult'); // Redirect to view saved results
  } catch (error) {
      console.error("Error saving result:", error);
      res.status(500).send("Error saving result");
  }
});


    // // Create a new instance of the ConversionResult model
    // const conversionResult = new ConversionResult({
    //   selectedCurrency,
    //   selectedCurrencies,
    //   convertedAmount,
    //   conversionRates,
    //   results,
    //   convertedToNairaResults,
    //   profit,
    // });

    // // Save the result to the database
    // await conversionResult.save();

//     res.redirect('/user/dashboard/viewresult');
//   } catch (error) {
//     console.error('Error saving result:', error);
//     res.status(500).json({ error: 'An error occurred while saving the result' });
//   }
// });


router.get('/dashboard/viewresult', async (req, res) => {
  res.render('viewresult', { message: 'Results saved successfully!' });
});



// Define a route for viewing formatted results
// router.get('/dashboard/view', async (req, res) => {
//   try {
//     const results = await ConversionResult.find(); // Fetch saved results from the database

//     // Check if results is an array before rendering the template
//     if (Array.isArray(results)) {
//       const sortedResults = results.sort((a, b) => {
//         // Assuming profit is a numeric value, you may need to parse it if it's a string
//         return parseFloat(b.profit) - parseFloat(a.profit);
//       });
//       res.render('view', { results: sortedResults });
//     } else {
//       console.error("No results found or results is not an array.");
//       res.status(404).send("No results found or results is not an array.");
//     }
//   } catch (error) {
//     console.error("Error retrieving saved results:", error);
//     res.status(500).send("Error retrieving saved results");
//   }
// });


router.get('/dashboard/view', async (req, res) => {
  try {
    const results = await ConversionResult.find(); // Fetch saved results from the database

    // Check if results is an array before rendering the template
    if (Array.isArray(results)) {
      // Convert profit to float for proper sorting
      const sortedResults = results.sort((a, b) => parseFloat(b.profit) - parseFloat(a.profit));
      
      // Debugging: Log the contents of sortedResults
      console.log(sortedResults);

      res.render('view', { results: sortedResults });
    } else {
      console.error("No results found or results is not an array.");
      res.status(404).send("No results found or results is not an array.");
    }
  } catch (error) {
    console.error("Error retrieving saved results:", error);
    res.status(500).send("Error retrieving saved results");
  }
});








// delete

router.post('/dashboard/clearresults', async (req, res) => {
  try {
    await ConversionResult.deleteMany({}); // Delete all saved results
    res.redirect('/user/dashboard/viewresult'); // Redirect back to the viewresult page
  } catch (error) {
    console.error("Error clearing results:", error);
    res.status(500).send("Error clearing results");
  }
});



module.exports = router;

