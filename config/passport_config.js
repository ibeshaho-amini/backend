const passport = require('passport');
const { Strategy, ExtractJwt } = require('passport-jwt');
const User = require('../Models/User'); 
const jwtSecret = 'secret_key0987'; 

const opts = {
    jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
    secretOrKey: jwtSecret,
};

passport.use(new Strategy(opts, async (jwt_payload, done) => {
    try {
        const user = await User.findById(jwt_payload.id);
        if (user) {
            return done(null, user);
        } else {
            return done(null, false);
        }
    } catch (error) {
        return done(error, false);
    }
}));

passport.initialize();
