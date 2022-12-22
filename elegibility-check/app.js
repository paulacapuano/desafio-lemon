const { input, output } = require('./schema.js');
const Ajv = require('ajv');
const process = require('process');
const fs = require('fs');

const ajv = new Ajv();
const validate = ajv.compile(input);

const isEligible = function (client) {
    const isValid = validate(client);
    var array = [];
    if (!isValid) {
        return console.log(validate.errors);
    }
    if (!client.classeDeConsumo.includes("comercial", "residencial", "industrial")) {
        output.elegivel = false;
        array.push("Classe de consumo não aceita");
        if (!client.modalidadeTarifaria.includes("convencional", "branca")) {
            array.push("Modalidade tarifária não aceita");
        }
        output.razoesInelegibilidade = array;
        return output;
    } 
    const average = client.historicoDeConsumo.reduce((a,b) => a + b, 0) / client.historicoDeConsumo.length;
    if ((client.tipoDeConexao === "monofasico" && average <= 400) ||
        (client.tipoDeConexao === "bifasico" && average <= 500) ||
        (client.tipoDeConexao === "trifasico" && average <= 750)){
            output.elegivel = false;
            output.razoesInelegibilidade = "Média de consumo abaixo do necessário";
            return output;
    }
    const totalKWh = client.historicoDeConsumo.reduce((partialSum, a) => partialSum + a, 0);
    const CO2Saving = (totalKWh / 1000) * 84;
    output.elegivel = true;
    output.economiaAnualDeCO2 = CO2Saving;
    return output;
}
const filePath = process.argv[2];
const dataBuffer = fs.readFileSync(filePath);
const dataJSON = dataBuffer.toString();
var inputClient = JSON.parse(dataJSON);
console.log(isEligible(inputClient));
