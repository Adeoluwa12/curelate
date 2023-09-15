const express = require("express");
const router = express.Router();


router.get('/', (req, res) => {
    res.render('home')
});



module.exports = router;

{/* <form action="/user/dashboard/saveresult" method="post">
<input type="hidden" name="selectedCurrency" value="<%= selectedCurrency %>">
<input type="hidden" name="results" value='<%= JSON.stringify(convertedResults) %>'>
<input type="submit" value="Save Result">
</form> */}