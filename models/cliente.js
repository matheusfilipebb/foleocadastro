const mongoose = require("mongoose")
const Schema = mongoose.Schema

const ClienteSchema = new Schema({
  nome: {type: String, required: true },
  cpf: {type: String, required: true },
  email: {type: String, required: true },
  telefone: {type: String, required: true },
  date: { type: Date, default: Date.now }
})

module.exports = mongoose.model("Cliente", ClienteSchema)