var express = require("express");
var router = express.Router();
var ctrlThreats = require("./app_api/controllers/threats");


// Threats
router.post('/threats', ctrlThreats.threatsCreate);
router.get('/threats/:threatid', ctrlThreats.threatsReadOne);
router.put('/threats/:threatid', ctrlThreats.threatUpdateOne);
router.delete('/threats/:threatid', ctrlThreats.threatDeleteOne);

// Providers
router.post('/threats/:threatid/providers', ctrlThreats.providersCreate);
router.get('/threats/:threatid/providers/:providerid', ctrlThreats.providersRead)
router.put('/threats/:threatid/providers/:providerid', ctrlThreats.providersUpdate);
router.delete('/threats/:threatid/providers/:providerid', ctrlThreats.providersDelete);

module.exports = router;