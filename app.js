const express = require("express")
const path = require("path")
const mongoose = require("mongoose")
const Cliente = require("./models/cliente")
const ExpressError = require("./utils/ExpressError")
const catchAsync = require("./utils/catchAsync")
const app = express()

mongoose.connect("mongodb://localhost:27017/foleocadastro", {
  useNewUrlParser: true,
  useCreateIndex: true,
  useUnifiedTopology: true,
})

const db = mongoose.connection
db.on("error", console.error.bind(console, "connection error:")) //show error
db.once("open", () => {
  console.log("Banco de dados conectado")
}) //confirm connection

app.set("view engine", "ejs")
app.set("views", path.join(__dirname, "views")) //estabelece a pasta "views" como caminho às páginas a partir deste arquivo JS

app.use(express.urlencoded({ extended: false })) //to parse req.body (somente "extended: true")
app.use(express.json())
app.use(express.static(path.join(__dirname, "public"))) //estabelece a pasta "public" como caminho inicial padrão para os os demais arquivos, como EJS, após redirecionamento deste arquivo JS

app.get("/", (req, res) => {
  res.render("cadastro")
})

app.get("/sucesso", (req, res) => {
  res.send("seu cadastro deu certo")
})

app.get(
  "/clientes",
  catchAsync(async (req, res) => {
    const clientes = await Cliente.find({})
    res.render("clientes", { clientes })
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

app.listen(3000, () => {
  console.log("Servidor na porta 3000")
})
