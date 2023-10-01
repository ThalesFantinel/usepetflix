require ('dotenv').config();

const express = require('express');
const path = require('path');
const expressLayouts = require('express-ejs-layouts');
const session = require('express-session');

const userController = require('./controllers/userController');
const petController = require('./controllers/petController');
const parceiroController = require('./controllers/parceiroController');

require('dotenv').config();
const multer = require('multer');

const app = express();
const port = 5000;

app.use(express.json());

app.use(express.urlencoded({ extended: false }));
app.set('view engine', 'ejs');

app.set('views', path.join(__dirname, 'views'));

app.set(express.static(path.join(__dirname, 'views')));

app.use(express.static("uploads"));

app.use(express.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, "views")))
app.use(express.static(path.join(__dirname, "views/css")))

app.use(session({ secret: 'rdienigz' }));

app.use((req, res, next) => {
    if (!req.session.user) {
        if (req.originalUrl === '/login' || req.originalUrl === '/autenticar' || req.originalUrl === '/cadastrar') {
            app.set('layout', './layouts/default/login.ejs');
            res.locals.layoutVariables = {
                url: process.env.URL,
                img: "/img/",
                style: "/css/",
                title: "Login",
                user: null
            };
            next();
        } else {
            res.redirect('/login');
        }
    } else {
        // Verifica se o usuário é um administrador
        if (req.session.user.role === 'admin') {
            app.set('layout', './layouts/default/index.ejs');
            console.log("adm");
        } else {
            // O usuário é um usuário normal
            app.set('layout', './layouts/default/index.ejs');
        }

        res.locals.layoutVariables = {
            url: process.env.URL,
            img: "/img/",
            style: "/css/",
            title: "Página Inicial",
            user: req.session.user 
        };
        next();
    }
});


app.use(expressLayouts);
app.set('layout', './layouts/default/index.ejs');

app.listen(port, () => {
    console.log(`PetFlix rodando em http://localhost:${port}`);
})

app.get('/', (req, res) => {
    res.render('home');
})

app.post('/login', (req, res) => {
    userController.autenticar(req, res);
});

app.get('/login', (req, res) => {
    app.set('layout', './layouts/default/login.ejs');
    userController.login(req, res);
});

app.get('/perfil', userController.mostrarPerfil);

app.get('/pets', petController.getAll);

app.post('/pets/:id_animal/excluir', (req, res) => {
    petController.deletePet(req, res);
});

const Database = require('./models/database');

async function verficaDono(req, res, next) {

    const id = req.params.id;
    console.log("CREDO:");
    console.log(id);

    let user_id = await Database.query(`SELECT * FROM animal user_id_user WHERE id_animal = ${id}`);

    const user_id_user = user_id[0].user_id_user;

    console.log("finalmente foi:");
    console.log(user_id_user);

    if (req.session.user.id_user == user_id_user) {
        next();
    }
    else {
        res.send("acesso negado, você não cadastrou esse pet!");
    }
}

app.get('/pets/:id/editar', verficaDono, petController.getPetById2);

app.post('/pets/:id/editar', verficaDono, (req, res) => {
    petController.updatePet(req, res);
});

app.post('/logout', (req, res) => {
    userController.logout(req, res);
});

app.get('/logout', (req, res) => {
    res.render('login');
})

const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, "uploads/");
    },
    filename: function (req, file, cb) {
        const filePath = file.originalname + Date.now() + path.extname(file.originalname);
        cb(null, filePath);
    }
})
const upload = multer({ storage })

app.post('/cadastrarPet', upload.single("file"), (req, res) => {
    const imageName = req.file.filename;
    console.log("upload realizado com sucesso!");
    console.log(imageName);
    petController.addPet(req, res, imageName);
})


app.get('/cadastrarPet', (req, res) => {
    res.render('cadastrarPet');
});

app.get('/sobre', (req, res) => {
    res.render('sobre');
})

app.get('/conteudos', (req, res) => {
    res.render('conteudos');
})

app.get('/pets/:id/:user_id_user', petController.getPetById);

app.get('/animais', petController.filtrarAnimais);

function checkAdmin(req, res, next) {
    if (req.session.user && req.session.user.role === 'admin') {
        next();
    } else {
        res.status(403).send('Acesso negado. Esta função é apenas para administradores.');
    }
};

app.post('/admin/cadastrarParceiro', checkAdmin, upload.single("file"), (req, res) => {
    const imageName = req.file.filename;
    console.log("upload realizado com sucesso!");
    console.log(imageName);
    parceiroController.addParceiro(req, res, imageName);
    console.log("adm ne");
})

app.get('/admin/cadastrarParceiro', checkAdmin, (req, res) => {
    res.render('cadastrarParceiro');
});

app.get('/parceiros', parceiroController.getAll);

app.post('/parceiros/:id_parceiro/excluir', checkAdmin, (req, res) => {
    parceiroController.deleteParceiro(req, res);
});

app.get('/parceiros/:id', parceiroController.getParceiroById);

app.post('/parceiros', parceiroController.filtrarParceiros);
app.get('/parceiros', parceiroController.filtrarParceiros);

app.get('/parceiros/:id/editar', checkAdmin, parceiroController.getParceiroById2);

app.post('/parceiros/:id/editar', checkAdmin, parceiroController.updateParceiro);

//cadastrar user
app.post('/cadastrar', upload.single("file"), (req, res) => {
    const imageName = req.file.filename;
    console.log("upload realizado com sucesso!");
    console.log(imageName);
    userController.addUser(req, res, imageName);
})

app.get('/cadastrar', (req, res) => {
    res.render('cadastro');
})

function perfilMe(req, res, next) {
    const id = req.params.id;

    if (req.session.user.id_user == id) {
        next();
    } else {
        res.send("acesso negado :(");
    }
}

app.post('/perfil/:id/editar', perfilMe, upload.single("file"), (req, res) => {
    const imageName = req.file ? req.file.filename : undefined;
    console.log("Nome do arquivo recebido:", imageName);
    userController.updateUser(req, res, imageName);
});

app.get('/perfil/:id/editar', perfilMe, userController.getPetById);

app.post('/pet/:id/atualizar-status', verficaDono, petController.updateStatusPet);