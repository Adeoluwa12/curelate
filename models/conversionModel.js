const mongoose = require('mongoose');

const conversionResultSchema = new mongoose.Schema({
    
    selectedCurrency: String,             // The selected currency
    selectedCurrencies: [String],         // Array of selected currencies
    convertedAmount: Number,              // The converted amount
    conversionRates: Object,              // Conversion rates for each currency
    results: Object,                      // Converted amounts for each currency
    convertedToNairaResults: Object,      // Converted amounts back to NGN for each currency
    profit: Object,
});

const ConversionResult = mongoose.model('ConversionResult', conversionResultSchema);

module.exports = ConversionResult;


