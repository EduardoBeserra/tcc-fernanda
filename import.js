const fs = require('fs')
const path = require('path')
const diretorio = './arquivos/oficial/'
const formNumber = new Intl.NumberFormat('pt-Br')
let toExcel = true

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
        idComunicacao = 0

        let questionario = importar(arq)
        questionarios.push(questionario)
        dbPerguntas = false
        dbCargos = false
        dbRegime = false
        dbEtnia = false
        dbTurnos = false
        dbComunicacao = false

        importComunicacao = false
    })

    setDominios()
}

importacao()

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
let caracCargo = {}

let totalTempoTrabalho = 0
let totalIdades = 0

const calcTempoTrabalho = q => {
    if(q.tempoTrabalho.toLowerCase().match('mes') &&
        !q.tempoTrabalho.toLowerCase().match('ano')) {
        let txt = q.tempoTrabalho.replace('mes', '')
        txt = q.tempoTrabalho.replace('es', '')
        txt = q.tempoTrabalho.replace('MES', '')
        txt = q.tempoTrabalho.replace('ES', '')
        let tempo = parseInt(txt, 10)
        //if(tempo >= 6)
        caracTemp.de6a11m++
        totalTempoTrabalho += tempo / 12
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
        totalTempoTrabalho += tempo
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

    totalIdades += tempo
}

const fill = (txt, qtd) => {
    let strRet = ''
    for(let i = 0; i < qtd; i++) {
        strRet += txt
    }
    return strRet
}

const calcCargo = q => {
    caracCargo[q.cargo] = (caracCargo[q.cargo] || 0) + 1
}

const formatarNumero = num => {
    return formNumber.format(num.toFixed(2))
}

questionarios.forEach(q => {
    caracSexo[q.sexo] = caracSexo[q.sexo] + 1
    calcTempoTrabalho(q)
    calcFaixaEtaria(q)
    calcCargo(q)
})

if(!toExcel) {
    console.log(`Caracteristica        Frequencia       Percentual`)
    console.log('Sexo')
    console.log(`   Feminino                    ${caracSexo['FEM']}              ${formatarNumero(caracSexo['FEM'] * 100 / questionarios.length)}`)
    console.log(`   Masculino                   ${caracSexo['MAS']}              ${formatarNumero(caracSexo['MAS'] * 100 / questionarios.length)}`)

    console.log(`Tempo de atuação`)
    console.log(`   ate 11 meses                ${caracTemp.de6a11m}               ${formatarNumero(caracTemp.de6a11m * 100 / questionarios.length)}`)
    console.log(`   1 a 2 anos                  ${caracTemp.de1a2a}                ${formatarNumero(caracTemp.de1a2a * 100 / questionarios.length)}`)
    console.log(`   3 a 4 anos                  ${caracTemp.de3a4a}                ${formatarNumero(caracTemp.de3a4a * 100 / questionarios.length)}`)
    console.log(`   5 a 10 anos                 ${caracTemp.de5a10a}                ${formatarNumero(caracTemp.de5a10a * 100 / questionarios.length)}`)
    console.log(`   11 a 20 anos                ${caracTemp.de11a20a}               ${formatarNumero(caracTemp.de11a20a * 100 / questionarios.length)}`)
    console.log(`   21 a 39 anos                ${caracTemp.de21a39a}                ${formatarNumero(caracTemp.de21a39a * 100 / questionarios.length)}`)
    console.log(`   Ausentes                    ${caracTemp.ausentes}                ${formatarNumero(caracTemp.ausentes * 100 / questionarios.length)}`)

    console.log('Faixa etária')
    console.log(`   Até 30 anos                 ${caracIdade.ate30}                ${formatarNumero(caracIdade.ate30 * 100 / questionarios.length)}`)
    console.log(`   31 a 40 anos                ${caracIdade.ate40}              ${formatarNumero(caracIdade.ate40 * 100 / questionarios.length)}`)
    console.log(`   41 a 50 anos                ${caracIdade.ate50}                ${formatarNumero(caracIdade.ate50 * 100 / questionarios.length)}`)
    console.log(`   51 a 60 anos                ${caracIdade.ate60}                ${formatarNumero(caracIdade.ate60 * 100 / questionarios.length)}`)
    console.log(`   Mais de 60 anos             ${caracIdade.mais60}                ${formatarNumero(caracIdade.mais60 * 100 / questionarios.length)}`)
    console.log(`   Ausentes                    ${caracIdade.ausentes}                ${formatarNumero(caracIdade.ausentes * 100 / questionarios.length)}`)
} else {
    console.log(`Caracteristica;Frequencia;Percentual`)
    console.log('Sexo')
    console.log(`Feminino;${caracSexo['FEM']};${formatarNumero(caracSexo['FEM'] * 100 / questionarios.length)}`)
    console.log(`Masculino;${caracSexo['MAS']};${formatarNumero(caracSexo['MAS'] * 100 / questionarios.length)}`)

    console.log(`Tempo de atuação`)
    console.log(`ate 11 meses;${caracTemp.de6a11m};${formatarNumero(caracTemp.de6a11m * 100 / questionarios.length)}`)
    console.log(`1 a 2 anos;${caracTemp.de1a2a};${formatarNumero(caracTemp.de1a2a * 100 / questionarios.length)}`)
    console.log(`3 a 4 anos;${caracTemp.de3a4a};${formatarNumero(caracTemp.de3a4a * 100 / questionarios.length)}`)
    console.log(`5 a 10 anos;${caracTemp.de5a10a};${formatarNumero(caracTemp.de5a10a * 100 / questionarios.length)}`)
    console.log(`11 a 20 anos;${caracTemp.de11a20a};${formatarNumero(caracTemp.de11a20a * 100 / questionarios.length)}`)
    console.log(`21 a 39 anos;${caracTemp.de21a39a};${formatarNumero(caracTemp.de21a39a * 100 / questionarios.length)}`)
    console.log(`Ausentes;${caracTemp.ausentes};${formatarNumero(caracTemp.ausentes * 100 / questionarios.length)}`)

    console.log('Faixa etária')
    console.log(`Até 30 anos;${caracIdade.ate30};${formatarNumero(caracIdade.ate30 * 100 / questionarios.length)}`)
    console.log(`31 a 40 anos;${caracIdade.ate40};${formatarNumero(caracIdade.ate40 * 100 / questionarios.length)}`)
    console.log(`41 a 50 anos;${caracIdade.ate50};${formatarNumero(caracIdade.ate50 * 100 / questionarios.length)}`)
    console.log(`51 a 60 anos;${caracIdade.ate60};${formatarNumero(caracIdade.ate60 * 100 / questionarios.length)}`)
    console.log(`Mais de 60 anos;${caracIdade.mais60};${formatarNumero(caracIdade.mais60 * 100 / questionarios.length)}`)
    console.log(`Ausentes;${caracIdade.ausentes};${formatarNumero(caracIdade.ausentes * 100 / questionarios.length)}`)
}
caracCargoAux = Object.keys(caracCargo).map(cc => {
    return {cargo: cc, cont: caracCargo[cc]}
})
console.log('Profissão/Ocupação')
caracCargoAux.forEach(cc => {
    let descCargo = cargos.filter(cargo => {
        return cargo.id == cc.cargo
    })[0].descricao
    if(!toExcel)
        console.log(`${descCargo}${fill(' ', 50 - descCargo.length)}${cc.cont}     ${formatarNumero(cc.cont * 100 / questionarios.length)}`)
    else
        console.log(`${descCargo};${cc.cont};${formatarNumero(cc.cont * 100 / questionarios.length)}`)
})
if(!toExcel)
    console.log(`Total${fill(' ', 44)} ${questionarios.length}    100`)
else
    console.log(`Total;${questionarios.length};100`)
console.log('')
console.log('')

const calcularMediana = valores => {
    valOrd = valores.sort((a, b) => {
        return a - b
    })

    let val = 0
    if(valOrd.length % 2 == 0) {
        let num = valOrd.length / 2
        val = (valOrd[num - 1] + valOrd[num]) / 2
    } else {
        let num = (valOrd.length - 1) / 2
        val = valOrd[num]
    }
    return val
}

const calcularDesvioPadrao = valores => {
    let media = valores.reduce((tot, valor) => {
        return tot + valor
    }) / valores.length
    let tot = 0
    valores.forEach(val => {
        let res = Math.pow((val - media), 2)
        tot += res
    })
    tot = tot / valores.length
    tot = Math.sqrt(tot)
    return tot
}

const tabelaDados = questionarios => {
    if(!toExcel)
        console.log('Domínio                                           Média   Mediana Desvio Padrão')
    else
        console.log('Domínio;Média;Mediana;Desvio Padrão')

    dominios.forEach(dominio => {
        let {descricao} = dominio
        let total = 0
        let listResp = []
        pergdom = perguntas.filter(p => {
            return p.dominio === dominio.id
        }).map(p => {
            return {numero: p.numero}
        })


        pergdom.forEach(perg => {
            questionarios.forEach(questionario => {
                respPerg = questionario.respostas.filter(resp => {
                    return resp.numero == perg.numero
                }).forEach(r => {
                    listResp.push(r)
                })
            })
        })

        valores = listResp.map(resp => {
            return peso[resp.resposta]
        })
        total = valores.reduce((tot, valor) => {
            return tot + valor
        })
        if(!toExcel)
            console.log(`${descricao}${fill(' ', 50 - descricao.length)}${formatarNumero(total / listResp.length)}     ` +
                `${formatarNumero(calcularMediana(valores))} ${formatarNumero(calcularDesvioPadrao(valores))}`)
        else
            console.log(`${descricao};${formatarNumero(total / listResp.length)};${formatarNumero(calcularMediana(valores))};` +
                `${formatarNumero(calcularDesvioPadrao(valores))}`)

    })
}

console.log('')
cargos.forEach(cargo => {
    quests = questionarios.filter(q => {
        return q.cargo == cargo.id
    })
    
    if(quests.length > 0) {
        if(!toExcel)
            console.log(`Cargo: ${cargo.descricao}     Qtd Pessoas: ${quests.length}`)
        else
            console.log(`Cargo: ${cargo.descricao};Qtd Pessoas: ${quests.length}`)
        tabelaDados(quests)
        console.log('')
    }
})

const getDescCom = id => {
    c = comunicacoes.filter(com => {
        return com.id == id
    })
    if (c.length > 0)
        return c[0].descricao
    else
        return ''
}
const listarComunicacao = questionarios => {
    if(questionarios.length == 0)
        return
    if(!toExcel)
        console.log(`Descrição${fill(' ', 51)}Média`)
    else
        console.log('Descrição;Média')
    comunicacoes.forEach(com => {
        respostas = []
        questionarios.forEach(q => {
            q.comunicacoes.filter(c => {
                return c.id == com.id && c.resposta < 5
            }).map(respcom => {
                return peso[respcom.resposta]
            }).forEach(val => {
                respostas.push(val)
            })
        })
        if(respostas.length == 0)
            respostas = [0]
        if(respostas.length > 0) {
            total = respostas.reduce((tot, valor) => {
                return tot + valor
            })
        } else
            total = 0

        let descCom = getDescCom(com.id)
        if(!toExcel)
            console.log(`${descCom}${fill(' ', 60 - descCom.length)}${formatarNumero(total / respostas.length)}`)
        else
            console.log(`${descCom};${formatarNumero(total / respostas.length)}`)
    })
}

console.log('')
console.log('Comunicação')
cargos.forEach(cargo => {
    let descricao = cargos.filter(c => {
        return c.id == cargo.id
    })[0].descricao || 'Cargo não identificado'
    let quests = questionarios.filter(q => {
        return q.cargo == cargo.id
    })
    if(quests.length > 0) {
        if(!toExcel)
            console.log(`Cargo: ${descricao}${fill(' ', 50 - descricao.length)}   Qtd:${quests.length}`)
        else
        console.log(`Cargo: ${descricao};Qtd:${quests.length}`)
        listarComunicacao(quests)
    }
    console.log('')
})
if(!toExcel)
    console.log(`Geral${fill(' ', 55)}Qtd: ${questionarios.length}`)
else
console.log(`Geral;Qtd: ${questionarios.length}`)
listarComunicacao(questionarios)

console.log(totalTempoTrabalho / questionarios.length)
console.log(totalIdades / questionarios.length)

const mediaExp = () => {
    let total = 0
    let tempo
    questionarios.forEach(q => {
        if(q.exp.toLowerCase().match('mes') &&
            !q.exp.toLowerCase().match('ano')) {
            let txt = q.exp.replace('mes', '')
            txt = q.exp.replace('es', '')
            txt = q.exp.replace('MES', '')
            txt = q.exp.replace('ES', '')
            tempo = parseInt(txt, 10)
            total += tempo
        } else {
            let txt = q.exp.replace('ano', '')
            txt = q.exp.replace('s', '')
            txt = q.exp.replace('ANO', '')
            txt = q.exp.replace('S', '')
            tempo = parseInt(txt, 10) || 0
            tempo = tempo * 12
            
            total += tempo
        }
    })
    
    console.log(total / questionarios.length / 12)
}
const percRegimeTrabalho = () => {
    regimes.forEach(r => {
        let cont = questionarios.filter(q => {
            return q.regime === r.id
        }).length

        console.log(`${r.descricao}${fill(' ', 50 - r.descricao.length)}${cont}   ${formatarNumero(cont / questionarios.length * 100)}`)
    })
}

const percGrupoEtnico = () => {
    etnias.forEach(e => {
        let cont = questionarios.filter(q => {
            return q.etnia === e.id
        }).length

        console.log(`${e.descricao}${fill(' ', 50 - e.descricao.length)}${cont}   ${formatarNumero(cont / questionarios.length * 100)}`)
    })
}

const percTurnos = () => {
    turnos.forEach(t => {
        let cont = questionarios.filter(q => {
            return q.turno === t.id
        }).length

        console.log(`${t.descricao}${fill(' ', 50 - t.descricao.length)}${cont}   ${formatarNumero(cont / questionarios.length * 100)}`)
    })
}

console.log('')
console.log('')
console.log('')
mediaExp()
console.log('Percentual Regime de trabalho')
percRegimeTrabalho()
console.log('\nPercentual Grupos Étnicos')
percGrupoEtnico()
console.log('\nPercentual Turnos')
percTurnos()
