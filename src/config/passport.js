const passport = require('passport');
const LocalStragegy = require('passport-local').Strategy;
const Usuario = require('../model/Usuarios');

passport.use(new LocalStragegy(
    {
        usernameField: 'email'
    },
    async (email, password, done) => {
        const usuario = await Usuario.findOne({ email: email });
        if (!usuario) {
            return done(null, false, { message: 'No se encontro el usuario' });
        } else {
            const coincide = await usuario.matchPassword(password);
            if (coincide) {
                return done(null, usuario);
            } else {
                return done(null, false, { message: 'Password incorrecto' });
            }
        }
    }
));

passport.serializeUser((usuario, done) => {
    done(null, usuario.id);
});

passport.deserializeUser((id, done) => {
    Usuario.findById(id, (error, usuario) => {
        done(error, usuario);
    })
});