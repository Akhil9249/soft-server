const express = require("express")
const registerAndLogin = require("../controllers/register-Login/registerAndLogin")
const { checkAuth } = require("../middlewares/checkAuth");
const router = express.Router()


router.post("/signup", registerAndLogin.signup);
router.post("/login", registerAndLogin.login);
// router.post("/interns-login", registerAndLogin.internslogin); // Combined into /login with userType parameter
// router.post('/google-login', registerAndLogin.googleLoginController);

module.exports = router;