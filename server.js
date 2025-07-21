const express = require("express");
const session = require("express-session");
const bodyParser = require("body-parser");
const bcrypt = require("bcrypt");

const app = express();
const PORT = 3000;

// Usuário de exemplo (normalmente viria de um banco de dados)
const usuarioFake = {
  username: "kinkas@gmail.com",
  passwordHash: bcrypt.hashSync("kinkas", 10), // senha criptografada
};

// Middlewares
app.use(bodyParser.urlencoded({ extended: true }));
app.use(
  session({
    secret: "segredo-super-seguro",
    resave: false,
    saveUninitialized: true,
  })
);
app.use(express.static("views")); // Serve HTML estático

// Rotas

// tela inical
app.get("/", (req, res) => {
  res.sendFile(__dirname + "/views/telaInicial.html");
});

// tela de login
app.get("/login", (req, res) => {
  res.sendFile(__dirname + "/views/login.html");
});

app.get("/loginerror", (req, res) => {
  res.sendFile(__dirname + "/views/loginerror.html");
});

app.post("/login", (req, res) => {
  const { username, password } = req.body;
  if (
    username === usuarioFake.username &&
    bcrypt.compareSync(password, usuarioFake.passwordHash)
  ) {
    req.session.usuario = username;
    res.redirect("/feed");
  } else {
    res.redirect("/loginerror");
  }
});

// tela de registro
app.get("/register", (req, res) => {
  res.sendFile(__dirname + "/views/register.html");
});

app.get("/registererror", (req, res) => {
  res.sendFile(__dirname + "/views/registererror.html");
});

app.get("/registersuccess", (req, res) => {
  res.sendFile(__dirname + "/views/registersuccess.html");
});

// Lógica de registro (simples)
app.post("/register", (req, res) => {
  const { email, password, confirmPassword } = req.body;
  if (password == confirmPassword) {
    // Aqui você pode salvar em banco de dados
    res.redirect("/registersuccess");
    // res.send("Cadastro realizado com sucesso!");
  } else{
    res.redirect("/registererror");
  }
});

app.get("/feed", (req, res) => {
  if (req.session.usuario) {
    res.sendFile(__dirname + "/views/feed.html");
  } else {
    res.redirect("/");
  }
});

app.get("/logout", (req, res) => {
  req.session.destroy();
  res.redirect("/");
});

// tela de oportunidades
app.get("/feedOpportunities", (req, res) => {
  if (req.session.usuario) {
    res.sendFile(__dirname + "/views/feedOpportunities.html");
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
