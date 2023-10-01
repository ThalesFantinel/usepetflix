const User = require('../models/userModel');
const Pet = require('../models/petModel');
const validator = require('validator');

let users = [];

async function getUsers(req, res) {
    users = await User.listarUser();
    res.render('perfil', { users });
}

function login(req, res) {
    res.render("login");
}

async function autenticar(req, res) {
    try {
        const resp = await User.autenticar(req.body.email, req.body.senha);

        if (resp && resp.length > 0) {
            // res.status(200).json({ message: 'Usuário autenticado com sucesso!' });

            req.session.user = resp[0];
            res.redirect('/');
        } else {
            res.locals.erro = 'Email ou senha incorretos.'; // Define a mensagem de erro
            res.render('login');
            // res.status(401).json({ message: 'Credenciais inválidas!' });
            res.redirect('/login')
        }
    } catch (error) {
        // res.status(500).json({ messsage: 'Erro durante a autenticação!'})
    }
}

let user = {};


async function mostrarPerfil(req, res) {
    const userId = req.session.user.id_user;

    const listaPets = await Pet.getAnimaisByDono(userId);


    user = await User.findById(userId);
    res.render('perfil', { user, listaPets });
};


async function getPetById(req, res) {
    const userId = req.session.user.id_user;

    user = await User.findById(userId);
    res.render('editarUser', { user });
}

async function logout(req, res) {
    delete req.session.user;
    res.redirect('/login');
}

function validarCPF(cpf) {
    cpf = cpf.replace(/[^\d]/g, '');

    if (cpf.length !== 11) {
        return false;
    }

    if (/^(\d)\1+$/.test(cpf)) {
        return false;
    }

    let sum = 0;
    for (let i = 0; i < 9; i++) {
        sum += parseInt(cpf.charAt(i)) * (10 - i);
    }
    let remainder = 11 - (sum % 11);
    if (remainder === 10 || remainder === 11) {
        remainder = 0;
    }
    if (remainder !== parseInt(cpf.charAt(9))) {
        return false;
    }

    sum = 0;
    for (let i = 0; i < 10; i++) {
        sum += parseInt(cpf.charAt(i)) * (11 - i);
    }
    remainder = 11 - (sum % 11);
    if (remainder === 10 || remainder === 11) {
        remainder = 0;
    }
    if (remainder !== parseInt(cpf.charAt(10))) {
        return false;
    }

    return true;
}

async function addUser(req, res, imagePath) {
    const { id_user, nome, email, cpf, telefone, senha, imagem } = req.body;

    try {
        const emailExiste = await User.verificarEmail(email);

        if (emailExiste.length > 0) {
            res.locals.emailCad = 'Email já cadastrado! Faça login!';
            res.render('cadastro');
        } else {
            const cpfExiste = await User.verificarCpf(cpf);
            if (cpfExiste.length > 0) {
                res.locals.cpfCad = 'Cpf já cadastrado!';
                res.render('cadastro');
            } else {
                if (validator.isEmail(email)) {
                    if (validarCPF(cpf)) {
                        const user = new User(id_user, nome, email, cpf, telefone, senha, imagem);
                        user.save(imagePath).then(() => console.log("user cadastrado com sucesso hehe"));
                        res.redirect('/');
                    } else {
                        res.locals.erro2 = 'Cpf inválido!';
                        res.render('cadastro');
                    }

                } else {
                    res.locals.erro = 'Email inválido!';
                    res.render('cadastro');
                }
            }


        }
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Erro ao verificar o email.' });
    }

}

async function updateUser(req, res, filename) {
    console.log("Nome do arquivo recebido no controlador:", +filename);

    const { id } = req.params;
    const { nome, telefone } = req.body;

    User.update(id, nome, telefone, filename, (err) => {
        if (err) {
            console.error('Erro ao atualizar o user:', err);
            return res.status(500).send('Erro ao atualizar o user no banco de dados.');
        }
        res.render('editarUser');
    });
    res.redirect('/perfil');

}


module.exports = { getUsers, login, autenticar, logout, mostrarPerfil, addUser, updateUser, getPetById };