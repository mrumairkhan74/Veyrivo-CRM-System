
const express = require('express');

const {
    inviteUser,
    listTeam,
    updateRole,
    removeMember,
} = require('../controllers/teamController');

const router = express.Router();

router.get('/', listTeam);
router.post('/invite', inviteUser);
router.patch('/:userId/role', updateRole);
router.delete('/:userId', removeMember);

module.exports = router;