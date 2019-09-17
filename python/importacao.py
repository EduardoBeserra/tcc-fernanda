import os, csv

dir = "./questionarios/"

importBD = True
importPerguntas = False
importCargos = False
importGeneros = False
importAtuacao = False
importEspec   = False
seqPerg = 0
seqCargo = 0
seqEspec = 0
peso = [0, 25, 50, 75, 100]

perguntas = []
cargos = []
especialidades = []


def importar():
    global importBD
    questionarios = []
    arqs = getarqs()
    for a in arqs:
        questionarios.append(lerquestionario(a))
        importBD = False
    return questionarios


def getarqs():
    arqs = []
    for a in os.listdir(dir):
        if a.lower().endswith(".csv"):
            arqs.append(a)
    return arqs


def lerquestionario(arq):
    global importPerguntas, importCargos, importGeneros, importAtuacao, importEspec, especialidades, seqPerg, seqCargo, seqEspec
    questionario = {
        "arquivo": arq,
        "respostas": []
    }

    linhas = csv.reader(open(dir + arq, encoding="UTF-8"), delimiter=";")
    importPerguntas = True

    seqPerg = 0
    seqCargo = 0
    seqEspec = 0
    for linha in linhas:
        if importPerguntas:
            pergunta = importarpergunta(linha)
            if pergunta:
                if importBD:
                    perguntas.append(pergunta)
                resposta = {
                    "id": pergunta["id"],
                    "resposta": getresposta(linha)
                }
                questionario["respostas"].append(resposta)
        elif importCargos:
            cargo = importarcargo(linha)
            if cargo:
                if importBD:
                    cargos.append(cargo)
                if linha[1].lower() == "x":
                    questionario["cargo"] = cargo["id"]
        elif importGeneros:
            if linha[0]:
                if linha[1].lower() == "x":
                    questionario["genero"] = linha[0]
                if linha[0].__contains__("PRINCIPAL:"):
                    importGeneros = False
                    importAtuacao = True
        elif importAtuacao:
            if linha[0]:
                if linha[1].lower() == "x":
                    questionario["atuacao"] = linha[0]
                if linha[0].__contains__("ESPECIALIDADE:"):
                    importAtuacao = False
                    importEspec = True
        elif importEspec:
            espec = importarespec(linha)
            if espec:
                if importBD:
                    especialidades.append(espec)
                if(linha[1].lower() == "x"):
                    questionario["tempoEspec"] = espec["id"]
    return questionario


def importarpergunta(linha):
    global seqPerg, importPerguntas, importCargos

    if linha[0]:
        if linha[0].__contains__("CARGO:"):
            importPerguntas = False
            importCargos = True
        else:
            seqPerg += 1
            pergunta = {
                "id": seqPerg
            }
            ind = linha[0].index(".")
            pergunta["numero"] = int(linha[0][:ind])
            pergunta["descricao"] = linha[0][ind+1:]
            return pergunta


def importarcargo(linha):
    global seqCargo, importCargos, importGeneros

    if linha[0]:
        if linha[0].__contains__("GENERO:"):
            importCargos = False
            importGeneros = True
        else:
            seqCargo+=1
            cargo = {
                "id": seqCargo,
                "descricao": linha[0]
            }
            return cargo


def importarespec(linha):
    global importEspec, seqEspec

    if linha[0]:
        seqEspec += 1
        espec = {
            "id": seqEspec,
            "descricao": linha[0]
        }
        return espec
    else:
        importEspec = False


def getresposta(linha):
    i = 1
    while i < 6:
        if linha[i].lower() == "x":
            return i-1
        i += 1
