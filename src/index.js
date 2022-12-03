const express = require('express');
const path = require('path');
const exphbs = require('express-handlebars');
const methodOverride = require('method-override');
const session = require('express-session');
const flash = require('connect-flash');
const passport = require('passport');

//Inicializaciones
const app = express();
require('./database');
require('./config/passport');

//Configuraciones
app.set('puerto', process.env.PORT || 3000);
app.set('views', path.join(__dirname, 'views'));

const hbs = exphbs.create({
    defaultLayout: 'main',
    defaultDir: 'scr/views/layouts',
    partialsDir: __dirname + '/views/partials',
    extname: 'hbs',
    runtimeOptions: {
        allowProtoPropertiesByDefault: true
    },
    helpers: {
        equal: (lvalue, rvalue, options) => {
            if (lvalue != rvalue) {
                return options.inverse(this);
            } else {
                return options.fn(this);
            }
        },
        for: (current, pages, options) => {
            current = Number(current);
            pages = Number(pages);
            var code = "";

            var i = current > 3 ? current - 2 : 1;

            if (i !== 1) {
                let last = i - 1;
                code += `
                <li class="page-item me-1">
                    <a href="/notes/${last}" class="page-link">...</a>
                 </li>
                `
            }

            for (; i < (current + 3) && i <= pages; ++i) {
                if (i == current) {
                    code += `
                    <li class="page-item me-1">
                        <a href="${i}" class="page-link">${i}</a>
                    </li>
                    `
                } else {
                    code += `
                    <li class="page-item me-1">
                        <a href="/notes/${i}" class="page-link">${i}</a>
                    </li>
                    `
                }

                if (i == (current + 2) && i < pages) {
                    let last = i + 1;
                    code += `
                    <li class="page-item me-1">
                        <a href="/notes/${last}" class="page-link">...</a>
                    </li>
                    `
                }
            }
            return options.fn(code);
        }
    }
})
app.engine('.hbs', hbs.engine);
app.set('view engine', 'hbs');

//Middleware
app.use(express.urlencoded({ extended: false }));
app.use(methodOverride('_method'));
app.use(session({
    secret: 'mysecretapp',
    resave: true,
    saveUninitialized: true
}));
app.use(passport.initialize());
app.use(passport.session());
app.use(flash());

//Variables globales
app.use((request, response, next) => {
    response.locals.success_msg = request.flash('success_msg');
    response.locals.error_msg = request.flash('error_msg');
    response.locals.error = request.flash('error');
    response.locals.usuario = request.user || null
    next();
});

//Rutas
app.use(require('./routes/index'));
app.use(require('./routes/notes'));
app.use(require('./routes/users'));

//Archivos estaticos
app.use(express.static(path.join(__dirname, 'public')));

//servidor
app.listen(app.get('puerto'), () => {
    console.log(`Servidor corriendo en el puerto: ${app.get('puerto')}`);
})