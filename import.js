const fs = require('fs')
const path = require('path')
const diretorio = './arquivos/'
let importPerguntas = false
let dbPerguntas = true
let perguntas = []
let questionario = {
    respostas: []
}

class Questao {
    constructor(linha) {
        linha = linha.replace('"', '')
        let pergunta = linha.split(',')
        let splitLinha = pergunta[0].split('. ')
        this.numero = splitLinha[0]
        this.questao = splitLinha[1]
        this.getResposta(linha)
    }

    getResposta(linha) { //TODO erro na pergunta 4 (ha mais) esta pegando a posicao errada da resposta
        let splLinha = linha.split(',')
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

const importarPergunta = linha => {
    let pergunta = new Questao(linha)
    if(dbPerguntas)
        criarObjPergunta(pergunta)
    const {numero, resposta} = pergunta
    questionario.respostas.push({numero, resposta})
}

const lerDiretorio = () => {
    files = fs.readdirSync(diretorio)
    return files.filter(file => {
        return path.extname(file).toLowerCase() === '.csv'
    })
}

const importar = arq => {
    let texto = fs.readFileSync(diretorio + arq, 'utf-8')

    linhas = texto.split('\n')
    linhas.forEach(linha => {
        if(linha.match(',DT,DP')) {
            importPerguntas = true
            return
        }
        else if(linha.match('Cargo,'))
            importPerguntas = false

        if(importPerguntas)
            importarPergunta(linha)
    })

    
    
    //console.log(perguntas)
    console.log(questionario)
}

arquivos = lerDiretorio()

arquivos.forEach(arq => {
    importar(arq)
})

