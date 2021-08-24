if (process.env.NODE_ENV !== "production") {
  require("dotenv").config()
}

const express = require("express")
const path = require("path")
const mongoose = require("mongoose")
const helmet = require("helmet")
const mongoSanitize = require("express-mongo-sanitize")
const Cliente = require("./models/cliente")
const ExpressError = require("./utils/ExpressError")
const catchAsync = require("./utils/catchAsync")
const app = express()

const dbUrl = process.env.DB_URL || "mongodb://localhost:27017/foleocadastro"

mongoose.connect(dbUrl, {
  useNewUrlParser: true,
  useCreateIndex: true,
  useUnifiedTopology: true,
  useFindAndModify: false,
})

const db = mongoose.connection
db.on("error", console.error.bind(console, "connection error:")) //show error
db.once("open", () => {
  console.log("Banco de dados conectado")
}) //confirm connection

app.set("view engine", "ejs")
app.set("views", path.join(__dirname, "views")) //estabelece a pasta "views" como caminho às páginas a partir deste arquivo JS

app.use(mongoSanitize({ replaceWith: "_" })) //não permite o usuário inserir $, exemplo: "$gt":""
app.use(express.urlencoded({ extended: false })) //to parse req.body (somente "extended: true")
app.use(express.json())
app.use(express.static(path.join(__dirname, "public"))) //estabelece a pasta "public" como caminho inicial padrão para os os demais arquivos, como EJS, após redirecionamento deste arquivo JS
app.use(helmet({ contentSecurityPolicy: false })) //para maior segurança use "helmet()"

app.get("/", (req, res) => {
  res.render("cadastro")
})

app.get("/sucesso", (req, res) => {
  res.render("sucesso")
})

const senha = process.env.SENHA || "123"
app.get(
  "/clientes",
  catchAsync(async (req, res, next) => {
    const { acesso } = req.query
    if (acesso === senha) {
      const clientes = await Cliente.find({})
      res.render("clientes", { clientes })
    } else {
      next()
    }
  })
)

app.post(
  "/",
  catchAsync(async (req, res) => {
    if (!req.body.nome || !req.body.cpf || !req.body.email || !req.body.telefone)
      throw new ExpressError("Por favor, preencha todos os campos", 400)
    const cliente = new Cliente(req.body)
    await cliente.save()
    console.log(cliente)
    res.redirect("/sucesso")
  })
)

app.all("*", (req, res, next) => {
  next(new ExpressError("Página não encontrada", 404))
})

app.use((err, req, res, next) => {
  const { statusCode = 500 } = err
  if (!err.message) err.message = "Essa não, há algo de errado no servidor"
  res.status(statusCode).render("error", { err })
})

const port = process.env.PORT || 3000
app.listen(port, () => {
  console.log(`Servidor na porta ${port}`)
})
