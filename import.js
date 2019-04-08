const fs = require('fs')
const path = require('path')
const diretorio = './arquivos/'

let importPerguntas = false
let importCargos = false
let importExp = false
let importRegime = false
let importEtnia = false
let importTempTrabalho = false
let importIdade = false
let importTurno = false
let importSexo = false

let dbPerguntas = true
let dbCargos = true
let dbRegime = true
let dbEtnia = true
let dbTurnos = true

let perguntas = []
let cargos = []
let regimes = []
let etnias = []
let turnos = []
let dominios = []

let questionarios = []

let idCargo = 0
let idRegime = 0
let idEtnia = 0
let idTurno = 0

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

const importarTempoTrabalho = (questionario, linha) => {
    tempo = linha.split(';')[1]
    if(tempo)
        questionario.tempoTrabalho = tempo
}

const importarIdade = (questionario, linha) => {
    idade = linha.split(';')[1]
    if(idade)
        questionario.idade = idade
}

const importarTurno = (questionario, linha) => {
    if(linha.match('Turno Habitual;'))
        return
    
    idTurno++
    if(dbTurnos) {
        descricao = linha.split(';')[0]
        if(descricao)
            turnos.push({ id: idTurno, descricao })
    }
    if(linha.split(';')[1].toLowerCase() === 'x')
        questionario.turno = idTurno
}

const importarSexo = (questionario, linha) => {
    if(linha.match('Sexo;'))
        return

    if(linha.split(';')[1] && linha.split(';')[1].toLowerCase() === 'x')
        questionario.sexo = linha.split(';')[0]
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
    questionario.arquivo = arq

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
            importTempTrabalho = true
        } else if(linha.match('Idade;')) {
            importTempTrabalho = false
            importIdade = true
        } else if(linha.match('Turno Habitual;')) {
            importIdade = false
            importTurno = true
        } else if(linha.match('Sexo;')) {
            importTurno = false
            importSexo = true
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
        else if(importTempTrabalho)
            importarTempoTrabalho(questionario, linha)
        else if(importIdade)
            importarIdade(questionario, linha)
        else if(importTurno)
            importarTurno(questionario, linha)
        else if(importSexo)
            importarSexo(questionario, linha)
    })
    return  questionario
}

const getPergunta = numero => {
    return perguntas.filter(pergunta => {
        return pergunta.numero == numero
    })
}

const setDominios = () => {
    dominios = [{
        id: 1,
        descricao: 'Clima de segurança',
        qtdPerguntas: 7
    }, {
        id: 2,
        descricao: 'Percepção da gerência',
        qtdPerguntas: 5
    }, {
        id: 3,
        descricao: 'Percepção do estresse',
        qtdPerguntas: 4
    }, {
        id: 4,
        descricao: 'Condição do Trabalho',
        qtdPerguntas: 6
    }, {
        id: 5,
        descricao: 'Comunicação no ambiente Cirúrgico',
        qtdPerguntas: 4
    }, {
        id: 6,
        descricao: 'Percepção do desempenho profissional',
        qtdPerguntas: 4
    }, {
        id: 7,
        descricao: 'Fator 7',
        qtdPerguntas: 3
    }, {
        id: 8,
        descricao: 'Fator 8',
        qtdPerguntas: 1
    }, {
        id: 9,
        descricao: 'Fator 9',
        qtdPerguntas: 2
    }, {
        id: 10,
        descricao: 'Fator 10',
        qtdPerguntas: 2
    }, {
        id: 11,
        descricao: 'Fator 11',
        qtdPerguntas: 1
    }, {
        id: 12,
        descricao: 'Fator 12',
        qtdPerguntas: 1
    }]

    perguntas[27].dominio = 1
    perguntas[28].dominio = 1
    perguntas[29].dominio = 1
    perguntas[31].dominio = 1
    perguntas[33].dominio = 1
    perguntas[34].dominio = 1
    perguntas[37].dominio = 1

    perguntas[4].dominio = 2
    perguntas[5].dominio = 2
    perguntas[6].dominio = 2
    perguntas[10].dominio = 2
    perguntas[13].dominio = 2

    perguntas[30].dominio = 3
    perguntas[32].dominio = 3
    perguntas[35].dominio = 3
    perguntas[36].dominio = 3

    perguntas[14].dominio = 4
    perguntas[16].dominio = 4
    perguntas[17].dominio = 4
    perguntas[21].dominio = 4
    perguntas[22].dominio = 4
    perguntas[25].dominio = 4

    console.log(perguntas)
}

arquivos = lerDiretorio()

arquivos.forEach(arq => {
    idCargo = 0
    idRegime = 0
    idEtnia = 0
    idTurno = 0

    let questionario = importar(arq)
    questionarios.push(questionario)
    dbPerguntas = false
    dbCargos = false
    dbRegime = false
    dbEtnia = false
    dbTurnos = false

    importSexo = false
})

setDominios()