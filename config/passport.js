const GoogleStrategy = require('passport-google-oauth20').Strategy; 
const mongoose = require('mongoose'); 

const keys = require('./keys'); 

require('../models/User'); 
// Load User Model
const User = mongoose.model('users'); 

module.exports = function(passport) {
    passport.use(
        new GoogleStrategy({
            clientID: keys.googleClientID,
            clientSecret: keys.googleClientSecret,
            callbackURL: "/auth/google/callback",
            proxy: true
        }, (accessToken, refreshToken, profile, done) => {
            //console.log(accessToken); 
            //console.log(profile); 
            const image = profile.photos[0].value.substring(0, profile.photos[0].value.indexOf('?')); 
            //console.log(image); 

            const newUser = {
                googleID : profile.id,
                firstName : profile.name.givenName,
                lastName : profile.name.familyName,
                email: profile.emails[0].value,
                image: image
            }

            // Check for existing
            User.findOne({
                googleID : profile.id
            })
            .then(user => {
                if(user) {
                    // return User
                   done(null, user);
                } else {
                    // Create User 
                    new User(newUser)
                        .save()
                        .then(user => done(null, user))
                        .catch(err => {
                            console.log(err); 
                        })
                }
            })
        })
    ); 

    passport.serializeUser((user, done) => {
        done(null, user.id);
    });

    passport.deserializeUser((id, done) => {
        User.findById(id).then(user => done(null, user)); 
    }); 
}