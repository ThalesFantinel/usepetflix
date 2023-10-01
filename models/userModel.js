const Database = require('./database');
const md5 = require('md5');

class User {
    constructor(id, nome, email, cpf, telefone, senha, imagem) {
        this.id = id;
        this.nome = nome;
        this.email = email;
        this.cpf = cpf;
        this.telefone = telefone;
        this.senha = senha;
        this.imagem = imagem;
    }

    static async autenticar(email, senha) {
        let sql = `SELECT * FROM user WHERE email='${email}' AND senha='${md5(senha)}';`
        return await Database.query(sql);
    }

    static async listarUser() {
        let users = await Database.query("SELECT * FROM user");
        return users;
    }

    static async findById(userId) {
        try {
            let user = await Database.query(`SELECT * FROM user WHERE id_user = ${userId}`);
            console.log("user aqui msm:");
            console.log(user);
            console.log("acima--");
            return user;
        } catch (error) {
            console.error('Erro ao buscar usuário por ID:', error);
            throw error;
        }
    }


    static async userDono(user_id_user) {
        try {
            let user = await Database.query(`SELECT * FROM user WHERE id_user = ${user_id_user}`);

            return user;
        } catch (error) {
            console.error('Erro ao buscar usuário por ID:', error);
            throw error;
        }
    }

    async save(imagePath) {
        let resp = await Database.query(`INSERT INTO user (nome, email, cpf, telefone, senha, imagem ) VALUES ('${this.nome}', '${this.email}', '${this.cpf}', '${this.telefone}' , '${md5(this.senha)}', '${imagePath}' );`);
        console.log(resp);
    }

    static async update(id, nome, telefone, fileName) {
        const resp = await Database.query(`UPDATE user SET nome = '${nome}', telefone = '${telefone}', imagem = '${fileName}' WHERE id_user = '${id}'`)
        if (resp) {
            if (resp.affectedRows > 0) {
                return true;
            } else {
                return false;
            }
        } else
            return false;

    }

    static async verificarEmail(email) {
        const resp = await Database.query(`SELECT * FROM user WHERE email = '${email}'`);
        
        return resp;        
    }

    static async verificarCpf(cpf) {
        const resp = await Database.query(`SELECT * FROM user WHERE cpf = '${cpf}'`);
        
        return resp;
        
    }

}

module.exports = User