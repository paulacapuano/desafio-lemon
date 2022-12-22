const fs = require('fs');
const { input, output } = require('./schema.js');
const ajv = require('ajv')

const dataBuffer = fs.readFileSync('examples.json');
const dataJSON = dataBuffer.toString();
var dataParsed = JSON.parse(dataJSON);
// console.log(dataParsed);
// console.log(dataParsed.example1.tipoDeConexao);

const validate = ajv.compile(input)

const isEligible = function (client) {
    const isValid = validate(client)
    if (!isValid) {
        return console.error("Incorrect Input");
    }
    if (!client.classeDeConsumo.contains("comercial", "residencial", "industrial")) {
        output.elegivel = false
        output.razoesInelegibilidade = "Classe de consumo não aceita"
        if (!client.modalidadeTarifaria.contains("convencional", "branca")) {
            output.razoesInelegibilidade =+ "\nModalidade tarifária não aceita"
        }
        return output
    } 
    const average = client.historicoDeConsumo.reduce((a,b) => a + b, 0) / client.historicoDeConsumo.length
    if ((client.tipoDeConexao === "monofasico" && average <= 400) ||
        (client.tipoDeConexao === "bifasico" && average <= 500) ||
        (client.tipoDeConexao === "trifasico" && average <= 750)){
            output.elegivel = false
            output.razoesInelegibilidade = "Média de consumo abaixo do necessário"
            return output
    }
    const totalKWh = client.historicoDeConsumo.reduce((partialSum, a) => partialSum + a, 0)
    const CO2Saving = (totalKWh / 1000) * 84
    output.elegivel = true
    output.economiaAnualDeCO2 = CO2Saving
    return output
}

