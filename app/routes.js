const express = require('express')
const router = express.Router()

// Deal with Variant values
router.use(function (req, res, next) {
  if (req.query.variant) {
    req.session.variant = Number(req.query.variant)
  }
  // Allow 0 as variant 
  if (req.session.variant === undefined || req.session.variant === null) {
    req.session.variant = 1
  }
  next();
});

router.get('/protected', function (req, res) {
  res.render('errors/failed-login');
})

// Add your routes here - above the module.exports line
function ensureLoggedIn(req, res, next) {
  if (req.isAuthenticated()) {
    return next();
  }
  return res.redirect('/protected');
}

router.get('/gender', ensureLoggedIn, function (req, res) {
  return res.render('gender');
})

router.post('/gender', ensureLoggedIn, function (req, res) {
  const { data } = req.session;
  if (data['email-select'] && data['email-select'] === "keep") {
    return res.redirect('summary');
  }
  return res.redirect('email');
})

router.get('/email', ensureLoggedIn, function (req, res) {
  let emailValue = req.body.email ?? '';
  if (emailValue === '') {
    emailValue = req.session.passport.user.email;
  }
  res.render('email', { emailValue });
})

router.get('/summary', ensureLoggedIn, function (req, res) {
  let application = {};
  const { user } = req.session.passport;
  const { data } = req.session;
  application.name = user.name;
  application.email = data.email;
  application.gender = data.gender;
  res.render('summary', { application });
})

router.get('/welcome', function (req, res) {
  console.log("req.session", req.session);
  const { user } = req.session.passport;
  // Update session values (in case values are not changed - 'keep' option)
  req.session.data.email = req.session.passport.user.email;
  res.render('welcome', { user });
})

router.post('/welcome', ensureLoggedIn, function (req, res) {
  res.redirect('/gender');
})

router.get('/auth/redirect', function (req, res) {
  // Redirect to internal login end point
  res.redirect('/auth/login');
})

module.exports = router
