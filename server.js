const express = require("express");
const session = require("express-session");
const bodyParser = require("body-parser");
const bcrypt = require("bcrypt");

const axios = require("axios");

const app = express();
const PORT = 3000;

//EJS 
// Configura o EJS como engine de visualização
app.set('view engine', 'ejs');

// Pasta onde estão os arquivos .ejs
app.set('views', __dirname + '/views');

// Usuário de exemplo (normalmente viria de um banco de dados)

// Middlewares
app.use(bodyParser.urlencoded({ extended: true }));
app.use(
  session({
    secret: "segredo-super-seguro",
    resave: false,
    saveUninitialized: true,
    cookie: {
      maxAge: 60 * 60 * 1000 // 1h
    }
  })
);
app.use(express.static("views")); // Serve HTML estático

// Rotas

// tela inical
app.get("/", (req, res) => {
  res.render("telaInicial");
});

// tela de login
app.get("/login", (req, res) => {
  res.render("login");
});

app.get("/loginerror", (req, res) => {
  res.render("loginerror");
});

app.post("/login", async (req, res) => {
  const { username, password } = req.body;
  const email = username;


  try {
    const response = await axios.post('http://localhost:2000/user/login', {
      email,
      password
    });

    if (response.status == 200) {

      // Salvar no localStorage, se quiser
      req.session.usuario = {
        id: response.data.id,
        token: response.data.token
      };

      res.redirect("/feed")

    } else {

      res.redirect('/loginerror');
    }
  } catch (error) {
    //console.log(error)
    res.redirect('/loginerror')
  }

});

// tela de registro
app.get("/register", (req, res) => {
  res.render("register");
});

app.get("/registersuccess", (req, res) => {
  res.render("registersuccess");
});

// Lógica de registro (simples)
app.post("/register", async (req, res) => {
  const { email, password, confirmPassword } = req.body;
  if (password == confirmPassword) {
    // Aqui você pode salvar em banco de dados
    try {
      const response = await axios.post('http://localhost:2000/user/create', {
        email,
        password
      });

      //Verifica se foi salvo
      if (response.status == 201) {
        return res.redirect("/registersuccess");
      } else {
        return res.render('registererror',{"erro": (response.data.error || "Erro interno")});
      }
    } catch (error) {

      return res.render('registererror',{"erro":error.response.data.error})

    }
    // res.send("Cadastro realizado com sucesso!");
  } else {
    return res.render("registererror",{"erro":"As senhas não as mesmas"});
  }
});

app.get("/feed", async (req, res) => {

  if (!req.session.usuario) {
    return res.redirect("/");
  }

  const user_id = req.session.usuario.id;

  const user_info = await axios.get(`http://localhost:2000/user/get/${user_id}`)
  const posts = await axios.get(`http://localhost:2000/post/list`)


  res.render("feed", { "user_info": user_info.data, "posts": posts.data });

});

app.get("/logout", (req, res) => {
  req.session.destroy();
  res.redirect("/");
});

// tela de oportunidades
app.get("/feedOpportunities", (req, res) => {
  if (req.session.usuario) {
    res.render("feedOpportunities");
  } else {
    res.redirect("/");
  }
});

//tela do perfil 
app.get("/perfil", (req, res) => {
  if (req.session.usuario) {
    res.sendFile(__dirname + "/views/perfil.html");
  } else {
    res.redirect("/");
  }
});


app.listen(PORT, () => {
  console.log(`Servidor rodando em http://localhost:${PORT}`);
});
