var router = require('express').Router();

router.use('/api/lists', require('./lists'));

module.exports = router;
