const fs = require('fs')
const path = require('path')
const diretorio = './arquivos/oficial/'

let peso = [0, 25, 50, 75, 100, 0]
let importPerguntas = false
let importCargos = false
let importExp = false
let importRegime = false
let importEtnia = false
let importTempTrabalho = false
let importIdade = false
let importTurno = false
let importSexo = false
let importComunicacao = false

let dbPerguntas = true
let dbCargos = true
let dbRegime = true
let dbEtnia = true
let dbTurnos = true
let dbComunicacao = true

let perguntas = []
let cargos = []
let regimes = []
let etnias = []
let turnos = []
let dominios = []
let comunicacoes = []

let questionarios = []

let idCargo = 0
let idRegime = 0
let idEtnia = 0
let idTurno = 0
let idComunicacao = 0

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


class RespComunicacao {
    constructor(id, linha) {
        linha = linha.replace('"', '')
        let splitLinha = linha.split(';')
        this.id = id
        this.descricao = splitLinha[0]
        this.getResposta(linha)
    }

    getResposta(linha) {
        let splitLinha = linha.split(';')
        for(let i = 0; i < splitLinha.length; i++) {
            if(splitLinha[i].toLowerCase() === 'x') {
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

    if(resposta != undefined)
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

const importarComunicacao = (questionario, linha) => {
    if(linha.match('Comunicação;'))
        return
    
    idComunicacao++
    descricao = linha.split(';')[0]

    if(descricao) {
        if(dbComunicacao)
            comunicacoes.push({id: idComunicacao, descricao})

        let comunicacao = new RespComunicacao(idComunicacao, linha)
        const {id, resposta} = comunicacao
        questionario.comunicacoes.push({id, resposta})
    }
}

const lerDiretorio = () => {
    files = fs.readdirSync(diretorio)
    return files.filter(file => {
        return path.extname(file).toLowerCase() === '.csv'
    })
}

const novoQuestionario = () => {
    return {
        respostas: [],
        comunicacoes: []
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
        } else if(linha.match('Comunicação;')) {
            importSexo = false
            importComunicacao = true
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
        else if(importComunicacao)
            importarComunicacao(questionario, linha)
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

    perguntas[15].dominio = 4
    perguntas[16].dominio = 4
    perguntas[17].dominio = 4
    perguntas[21].dominio = 4
    perguntas[22].dominio = 4
    perguntas[25].dominio = 4

    perguntas[8].dominio = 5
    perguntas[9].dominio = 5
    perguntas[14].dominio = 5
    perguntas[18].dominio = 5

    perguntas[11].dominio = 6
    perguntas[20].dominio = 6
    perguntas[23].dominio = 6
    perguntas[24].dominio = 6

    perguntas[1].dominio = 7
    perguntas[2].dominio = 7
    perguntas[3].dominio = 7

    perguntas[1].dominio = 8

    perguntas[7].dominio = 9
    perguntas[19].dominio = 9

    perguntas[26].dominio = 10
    perguntas[39].dominio = 10

    perguntas[12].dominio = 11

    perguntas[38].dominio = 12
        
}

const importacao = () => {
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

        importComunicacao = false
    })

    setDominios()
}

importacao()

//Consultas
/*
const getRespostas = dominio => {
    let pergDom = perguntas.filter(pergunta => {
        return pergunta.dominio === dominio
    })

    let respTeste = []
    pergDom.forEach(perg => {
        questionarios.forEach(q => {
            resp = q.respostas.filter(respQuest => {
                return respQuest.numero === perg.numero
            })
            respTeste.push(resp[0])
        })
    })
    return respTeste
}

const calcValDominio = dominio => {
    let resp = getRespostas(dominio)
    let total = 0
    resp.forEach(r => {
        total += peso[r.resposta]
    })
    return total / resp.length / 10
}

dominios.forEach(dominio => {
    console.log(`Dominio: ${dominio.id} - ${dominio.descricao} = ${calcValDominio(dominio.id)}`)
})
*/

let caracSexo = { MAS: 0, FEM: 0 }
let caracTemp = {
    de6a11m: 0,
    de1a2a: 0,
    de3a4a: 0,
    de5a10a: 0,
    de11a20a: 0,
    de21a39a: 0,
    ausentes: 0
}
let caracIdade = {
    ate30: 0,
    ate40: 0,
    ate50: 0,
    ate60: 0,
    mais60: 0,
    ausentes: 0
}

const calcTempoTrabalho = q => {
    if(q.tempoTrabalho.toLowerCase().match('mes')) {
        let txt = q.tempoTrabalho.replace('mes', '')
        txt = q.tempoTrabalho.replace('es', '')
        txt = q.tempoTrabalho.replace('MES', '')
        txt = q.tempoTrabalho.replace('ES', '')
        let tempo = parseInt(txt, 10)
        
        if(tempo >= 6)
            caracTemp.de6a11m++
    } else {
        let txt = q.tempoTrabalho.replace('ano', '')
        txt = q.tempoTrabalho.replace('s', '')
        txt = q.tempoTrabalho.replace('ANO', '')
        txt = q.tempoTrabalho.replace('S', '')
        let tempo = parseInt(txt, 10) || 0
        
        if(tempo == 0)
            caracTemp.ausentes++
        else if(tempo <= 2)
            caracTemp.de1a2a++
        else if(tempo <= 4)
            caracTemp.de3a4a++
        else if(tempo <= 10)
            caracTemp.de5a10a++
        else if(tempo <= 20)
            caracTemp.de11a20a++
        else if(tempo <= 39)
            caracTemp.de21a39a++
            
    }
}

const calcFaixaEtaria = q => {
    let txt = q.idade.replace('ano', '')
    txt = q.idade.replace('s', '')
    txt = q.idade.replace('ANO', '')
    txt = q.idade.replace('S', '')
    let tempo = parseInt(txt, 10) || 0

    if(tempo == 0)
        caracIdade.ausentes++
    else if(tempo <= 30)
        caracIdade.ate30++
    else if(tempo <= 40)
        caracIdade.ate40++
    else if(tempo <= 50)
        caracIdade.ate50++
    else if(tempo <= 60)
        caracIdade.ate60++
    else
        caracIdade.mais60++
}

questionarios.forEach(q => {
    caracSexo[q.sexo] = caracSexo[q.sexo] + 1
    calcTempoTrabalho(q)
    calcFaixaEtaria(q)
})

console.log(`Caracteristica        Frequencia       Percentual`)
console.log('Sexo')
console.log(`   Feminino                    ${caracSexo['FEM']}              ${caracSexo['FEM'] * 100 / questionarios.length}`)
console.log(`   Masculino                   ${caracSexo['MAS']}                ${caracSexo['MAS'] * 100 / questionarios.length}`)

console.log(`Tempo de atuação`)
console.log(`   6 a 11 meses                ${caracTemp.de6a11m}               ${caracTemp.de6a11m * 100 / questionarios.length}`)
console.log(`   1 a 2 anos                  ${caracTemp.de1a2a}                ${caracTemp.de1a2a * 100 / questionarios.length}`)
console.log(`   3 a 4 anos                  ${caracTemp.de3a4a}                ${caracTemp.de3a4a * 100 / questionarios.length}`)
console.log(`   5 a 10 anos                 ${caracTemp.de5a10a}                ${caracTemp.de5a10a * 100 / questionarios.length}`)
console.log(`   11 a 20 anos                ${caracTemp.de11a20a}               ${caracTemp.de11a20a * 100 / questionarios.length}`)
console.log(`   21 a 39 anos                ${caracTemp.de21a39a}                ${caracTemp.de21a39a * 100 / questionarios.length}`)
console.log(`   Ausentes                    ${caracTemp.ausentes}                ${caracTemp.ausentes * 100 / questionarios.length}`)

console.log('Faixa etária')
console.log(`   Até 30 anos                 ${caracIdade.ate30}                ${caracIdade.ate30 * 100 / questionarios.length}`)
console.log(`   31 a 40 anos                ${caracIdade.ate40}              ${caracIdade.ate40 * 100 / questionarios.length}`)
console.log(`   41 a 50 anos                ${caracIdade.ate50}                ${caracIdade.ate50 * 100 / questionarios.length}`)
console.log(`   51 a 60 anos                ${caracIdade.ate60}                ${caracIdade.ate60 * 100 / questionarios.length}`)
console.log(`   Mais de 60 anos             ${caracIdade.mais60}                ${caracIdade.mais60 * 100 / questionarios.length}`)
console.log(`   Ausentes                    ${caracIdade.ausentes}                ${caracIdade.ausentes * 100 / questionarios.length}`)