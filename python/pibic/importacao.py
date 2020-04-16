import csv, os
from pibic.perguntas import perguntas
import pandas as pd

ROOT_DIR = os.path.dirname(os.path.abspath(__file__))
dir = ROOT_DIR + '/arquivos/oficial/'
importBD = True
importPerguntas = True
importCargos = False
importExp = False
importRegime = False
importGeneros = False

cargos = []
regimes = []

seqcargo = 0
seqregime = 0

def getarqs():
    arqs = []
    for a in os.listdir(dir):
        if a.lower().endswith(".csv"):
            arqs.append(a)
    return arqs


def importar():
    global importBD
    arqs = getarqs()
    for a in arqs:
        lerquestionario(a)
        importBD = False

def lerquestionario(arq):
    global dir, importPerguntas, importCargos, importExp, importRegime, seqcargo, seqregime
    questionario = {
        'arquivo': arq,
        'respostas': []
    }

    linhas = csv.reader(open(dir + arq, 'r', encoding='utf-8'), delimiter=";")
    importPerguntas = True
    seqcargo = 0
    seqregime = 0

    for linha in linhas:
        if importPerguntas:
            pergunta = importarpergunta(linha)
            if pergunta:
                resposta = {
                    'id': pergunta['id'],
                    'resposta': getresposta(linha)
                }
                questionario['respostas'].append(resposta)
        elif importCargos:
            cargo = importarcargo(linha)
            if cargo:
                if importBD:
                    cargos.append(cargo)
                if linha[1].lower() == 'x':
                    questionario['cargo'] = cargo['id']
        elif importExp:
            questionario['tempo'] = linha[1]
            importExp = False
            importRegime = True
        elif importRegime:
            regime = importarregime(linha)
            if regime:
                if importBD:
                    regimes.append(regime)
                if linha[1].lower() == 'x':
                    questionario['regimeTrabalho'] = regime['id']
#testes

def importarpergunta(linha):
    global importPerguntas, importCargos

    if linha[0]:
        if linha[0].lower().__contains__('cargo'):
            importPerguntas = False
            importCargos = True
        else:
            ind = linha[0].index('.')
            pergunta = getpergunta(int(linha[0][:ind]))
            if importBD:
                pergunta['descricao'] = linha[0][ind+1:]
            return pergunta


def importarcargo(linha):
    global seqcargo, importCargos, importExp

    if linha[0]:
        if linha[0].lower().__contains__('experiencia'):
            importCargos = False
            importExp = True
        else:
            seqcargo += 1
            cargo = {
                'id': seqcargo,
                'descricao': linha[0]
            }
            return cargo


def importarregime(linha):
    global importRegime, importEtnia, seqregime

    if linha[0]:
        if linha[0].lower().__contains__('étnico'):
            importRegime = False
            importEtnia = True
        else:
            seqregime += 1
            regime = {
                'id': seqregime,
                'descricao': linha[0]
            }
            return regime


def getpergunta(id):
    for p in perguntas:
        if p['id'] == id:
            return p
    return None


def getresposta(linha):
    i = 1
    while i < 6:
        if linha[i].lower() == "x":
            return i-1
        i += 1

importar()
