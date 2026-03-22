const router = require('express').Router();
const {
  createUser,
  getUsers,
  calculateCredits,
  buyCredits,
  sellCredits,
  getTrades,
} = require('../controllers/tradingController');

router.post('/user', createUser);
router.get('/users', getUsers);
router.post('/calculate', calculateCredits);
router.post('/buy', buyCredits);
router.post('/sell', sellCredits);
router.get('/trades', getTrades);

module.exports = router;
