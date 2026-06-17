const passport = require('passport');
const { Strategy: GoogleStrategy } = require('passport-google-oauth20');
const { Strategy: JwtStrategy, ExtractJwt } = require('passport-jwt');
const User = require('../models/User');

// ─── JWT Strategy ─────────────────────────────────────────────────────────────
passport.use(new JwtStrategy({
  jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
  secretOrKey: process.env.JWT_SECRET
}, async (payload, done) => {
  try {
    const user = await User.findById(payload.id).select('-password -otp');
    if (!user || !user.isActive) return done(null, false);
    return done(null, user);
  } catch (err) {
    return done(err, false);
  }
}));

// ─── Google OAuth Strategy ────────────────────────────────────────────────────
passport.use(new GoogleStrategy({
  clientID: process.env.GOOGLE_CLIENT_ID,
  clientSecret: process.env.GOOGLE_CLIENT_SECRET,
  callbackURL: process.env.GOOGLE_CALLBACK_URL
}, async (accessToken, refreshToken, profile, done) => {
  try {
    let user = await User.findOne({ googleId: profile.id });

    if (!user) {
      user = await User.findOne({ email: profile.emails[0].value });
      if (user) {
        user.googleId = profile.id;
        user.isGoogleUser = true;
        user.isVerified = true;
        if (!user.profilePicture) user.profilePicture = profile.photos[0]?.value || '';
        await user.save();
      } else {
        user = await User.create({
          name: profile.displayName,
          email: profile.emails[0].value,
          googleId: profile.id,
          isGoogleUser: true,
          isVerified: true,
          profilePicture: profile.photos[0]?.value || '',
          role: 'student'
        });
      }
    }

    return done(null, user);
  } catch (err) {
    return done(err, false);
  }
}));

module.exports = passport;
