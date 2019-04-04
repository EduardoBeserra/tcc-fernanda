const fs = require('fs')
const path = require('path')
const diretorio = './arquivos/'
let importPerguntas = false
let dbPerguntas = true
let perguntas = []
let questionarios = []

class Questao {
    constructor(linha) {
        linha = linha.replace('"', '')
        let pergunta = linha.split(';')
        let splitLinha = pergunta[0].split('. ')
        this.numero = splitLinha[0]
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
        else if(linha.match('Cargo;'))
            importPerguntas = false

        if(importPerguntas)
            importarPergunta(questionario, linha)
    })
    return  questionario
}

arquivos = lerDiretorio()

arquivos.forEach(arq => {
    let questionario = importar(arq)
    questionarios.push(questionario)
    dbPerguntas = false
})

