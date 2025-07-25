const express = require("express");
const session = require("express-session");
const bodyParser = require("body-parser");
const bcrypt = require("bcrypt");
const axios = require("axios");
require('dotenv').config();
const app = express();
const PORT = process.env.PORT || 3000;

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
    secret: process.env.SECRET,
    resave: false,
    saveUninitialized: true,
    cookie: {
      maxAge: process.env.MAXAGE// 1h
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
    const response = await axios.post('https://ufconnect.onrender.com/user/login', {
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
      const response = await axios.post('https://ufconnect.onrender.com/user/create', {
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


app.get("/get/token", (req, res)=>{

  return res.status(200).json({"token":req.session.usuario.token})

})

app.get("/feedOpportunities", async (req, res)=>{

  if (!req.session.usuario) {
    return res.redirect("/");
  }

  const user_id = req.session.usuario.id;

  const user_info = await axios.get(`https://ufconnect.onrender.com/user/get/${user_id}`)
  const posts = await axios.get(`https://ufconnect.onrender.com/post/list?tipo=1`)


  res.render("feedOpportunities", { "user_info": user_info.data, "posts": posts.data,"token":req.session.usuario.tonken});

})

app.get("/feed", async (req, res) => {

  if (!req.session.usuario) {
    return res.redirect("/");
  }

  const user_id = req.session.usuario.id;

  const user_info = await axios.get(`https://ufconnect.onrender.com/user/get/${user_id}`)
  const posts = await axios.get(`https://ufconnect.onrender.com/post/list?tipo=0`)


  res.render("feed", { "user_info": user_info.data, "posts": posts.data,"token":req.session.usuario.tonken});

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
app.get("/perfil/:id",async (req, res) => {

  const user_get = req.params.id;

  if (req.session.usuario) {
    const responde = await axios.get(`https://ufconnect.onrender.com/user/get/${user_get}`)
    const responde_2 = await axios.get(`https://ufconnect.onrender.com/post/user/${user_get}`)
    if(responde.data){
      return res.render('perfil',{'user_data':responde.data, "posts":responde_2.data})
    } 
  } else {
    res.redirect("/");
  }




});

app.get('/perfiltest', (req, res) =>{

  res.render('feed1')
})

app.listen(PORT, () => {
  console.log(`Servidor rodando em http://localhost:${PORT}`);
});
