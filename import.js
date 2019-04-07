const fs = require('fs')
const path = require('path')
const diretorio = './arquivos/'

let importPerguntas = false
let importCargos = false
let importExp = false
let importRegime = false
let importEtnia = false

let dbPerguntas = true
let dbCargos = true
let dbRegime = true
let dbEtnia = true

let perguntas = []
let cargos = []
let regimes = []
let etnias = []

let questionarios = []

let idCargo = 0
let idRegime = 0
let idEtnia = 0

class Questao {
    constructor(linha) {
        linha = linha.replace('"', '')
        let pergunta = linha.split(';')
        let splitLinha = pergunta[0].split('. ')
        this.numeroj = splitLinha[0]
        this.questao = splitLinha[1]
        this.getResposta(linha)
    }

    getResposta(linha) {
        let splLinha = linha.split(';')
        for(let i = 0; i < splLinha.length; i++) {
            if(splLinha[i].toLowerCase() === 'x') {
                this.resposta = i - 1
            }
        }
    }
}

const criarObjPergunta = pergunta => {
    const {numero, questao} = pergunta
    if(questao)
        perguntas.push({numero, questao})
}

const importarPergunta = (questionario, linha) => {
    let pergunta = new Questao(linha)
    if(dbPerguntas)
        criarObjPergunta(pergunta)
    const {numero, resposta} = pergunta
    if(resposta)
        questionario.respostas.push({numero, resposta})
}

const importarCargos = (questionario, linha) => {
    if(linha.match('Cargo;'))
        return

    idCargo++
    if(dbCargos) {
        descricao = linha.split(';')[0]
        if(descricao)
            cargos.push({ id: idCargo, descricao })
    }
    if(linha.split(';')[1].toLowerCase() === 'x')
        questionario.cargo = idCargo
}

const importarExp = (questionario, linha) => {
    let tempo = linha.split(';')[1]
    if(tempo)
        questionario.exp = tempo
}

const importarRegime = (questionario, linha) => {
    if(linha.match('Regime de trabalho;'))
        return

    idRegime++
    if(dbRegime) {
        descricao = linha.split(';')[0]
        if(descricao)
            regimes.push({ id: idRegime, descricao })
    }
    if(linha.split(';')[1].toLowerCase() === 'x')
        questionario.regime = idRegime
}

const importarEtnia = (questionario, linha) => {
    if(linha.match('Grupo étnico;'))
        return

    idEtnia++
    if(dbEtnia) {
        descricao = linha.split(';')[0]
        if(descricao)
            etnias.push({ id: idEtnia, descricao })
    }
    if(linha.split(';')[1].toLowerCase() === 'x')
        questionario.etnia = idEtnia
}

const lerDiretorio = () => {
    files = fs.readdirSync(diretorio)
    return files.filter(file => {
        return path.extname(file).toLowerCase() === '.csv'
    })
}

const novoQuestionario = () => {
    return {
        respostas: []
    }
}

const importar = arq => {
    let texto = fs.readFileSync(diretorio + arq, 'utf-8')

    linhas = texto.split('\n')
    let questionario = novoQuestionario()

    linhas.forEach(linha => {
        if(linha.match(';DT;DP')) {
            importPerguntas = true
            return
        }
        else if(linha.match('Cargo;')) {
            importPerguntas = false
            importCargos = true
        } else if(linha.match('Tempo de Experiencia;')) {
            importCargos = false
            importExp = true
        } else if(linha.match('Regime de trabalho;')) {
            importExp = false
            importRegime = true
        } else if(linha.match('Grupo étnico;')) {
            importRegime = false
            importEtnia = true
        } else if(linha.match('trabalha neste hospital;')) {
            importEtnia = false
        }

        if(importPerguntas)
            importarPergunta(questionario, linha)
        else if(importCargos)
            importarCargos(questionario, linha)
        else if(importExp)
            importarExp(questionario, linha)
        else if(importRegime)
            importarRegime(questionario, linha)
        else if(importEtnia)
            importarEtnia(questionario, linha)
    })
    return  questionario
}

arquivos = lerDiretorio()

arquivos.forEach(arq => {
    idCargo = 0
    idRegime = 0
    idEtnia = 0

    let questionario = importar(arq)
    questionarios.push(questionario)
    dbPerguntas = false
    dbCargos = false
    dbRegime = false
    dbEtnia = false
})

questionarios.forEach( questionario => {
    console.log(questionario.etnia)
})

console.log(etnias)