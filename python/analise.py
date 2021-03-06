import pandas as pd

from importacao import importar, especialidades, cargos, perguntas, peso
from dominios import dominios

arq = ''

def imprimir(texto):
    global arq
    arq += str(texto) + '\n'


def agrupar(campo, listdesc = None):
    agrupamento = data.groupby([campo]).count()['arquivo']
    total = agrupamento.sum()
    i = 0
    while i < len(agrupamento):
        s = "{desc};{qtd};{perc}"
        desc = get_descricao(listdesc, agrupamento.index.values[i]) if listdesc else agrupamento.index.values[i]

        imprimir(s.format(desc=desc, qtd=agrupamento.values[i],
                          perc=round(agrupamento.values[i] / total * 100, 2)))
        i += 1


def get_descricao(lista, index):
    list_filter = list(filter(lambda obj: obj['id'] == index, lista))
    if len(list_filter) > 0:
        return list_filter[0]['descricao']
    return 'Descricao nao encontrada'


def agrupar_respostas(resp, cargoid = 0):
    listResp = []
    for r in resp.values:
        listResp += r
    for resp in listResp:
        resp['valor'] = peso[resp['resposta'] if resp['resposta'] else 0]
        resp['cargo'] = cargoid
    return listResp


questionarios = importar()

data = pd.DataFrame(questionarios)

imprimir('Característica;Frequência;Percentual')
imprimir('Sexo')
agrupar('genero')
imprimir('Atuação Principal')
agrupar('atuacao')
imprimir('Tempo na Especialidade')
agrupar('tempoEspec', especialidades)
imprimir('Cargo')
agrupar('cargo', cargos)
imprimir('Total;{qtd};100'.format(qtd=len(questionarios)))

imprimir('')
imprimir('')
imprimir('')

dataperg = pd.DataFrame(perguntas)

for c in cargos:
    resp = data[data['cargo'] == c['id']] ['respostas']
    if resp.count() > 0:
        imprimir('Cargo: {desc};Qtd Pessoas: {qtd}'.format(desc=c['descricao'], qtd=resp.count()))
        imprimir('Domínio;Média;Mediana;Desvio Padrão')

        for d in dominios:
            respostas = pd.DataFrame(agrupar_respostas(resp))
            respostas = respostas[respostas['dominio'] == d['id']]

            imprimir('{desc};{media};{mediana};{dp}'.format(
                desc=d['descricao'],
                media=round(respostas['valor'].mean(), 2),
                mediana=round(respostas['valor'].median(), 2),
                dp=round(respostas['valor'].std(), 2)))

        imprimir('')

for c in cargos:
    resp = data[data['cargo'] == c['id']]['respostas']
    if resp.count() > 0:
        imprimir('Cargo: {desc};Qtd Pessoas: {qtd}'.format(desc=c['descricao'], qtd=resp.count()))
        imprimir('Pergunta;Média;Mediana;Desvio Padrão')

        for p in perguntas:
            respostas = pd.DataFrame(agrupar_respostas(resp))
            respostas = respostas[respostas['id'] == p['id']]
            imprimir('{desc};{media};{mediana};{dp}'.format(
                desc=str(p['numero']) + '.' + p['descricao'],
                media=round(respostas['valor'].mean(), 2),
                mediana=round(respostas['valor'].median(), 2),
                dp=round(respostas['valor'].std(), 2)))

        imprimir('')

resp = pd.DataFrame(agrupar_respostas(data['respostas']))

imprimir('Total Geral;Qtd Pessoas: {qtd}'.format(qtd=data['respostas'].count()))
imprimir('Domínio;Média;Mediana;Desvio Padrão')
for d in dominios:    
    respostas = resp[resp['dominio'] == d['id']]
    imprimir('{desc};{media};{mediana};{dp}'.format(
        desc=d['descricao'],
        media=round(respostas['valor'].mean(), 2),
        mediana=round(respostas['valor'].median(), 2),
        dp=round(respostas['valor'].std(), 2)
    ))

imprimir('')

imprimir('Total Geral;Qtd Pessoas: {qtd}'.format(qtd=data['respostas'].count()))
imprimir('Pergunta;Média;Mediana;Desvio Padrão')
for p in perguntas:
    respostas = resp[resp['id'] == p['id']]
    imprimir('{desc};{media};{mediana};{dp}'.format(
        desc=str(p['numero']) + '.' + p['descricao'],
        media=round(respostas['valor'].mean(), 2),
        mediana=round(respostas['valor'].median(), 2),
        dp=round(respostas['valor'].std(), 2)
    ))
imprimir('')
imprimir(resp['valor'].mean())
imprimir(resp['valor'].median())
imprimir(resp['valor'].std())

#print(arq)

dom = sorted(dominios, key=lambda d: d['ordem'])

txt = 'Categoria Profissional;'
for d in dom:
    txt += d['descricao'] + ';'
txt += 'Total;DP;\n'

for c in cargos:
    txt += c['descricao'] + ';'
    respostas = data[data['cargo'] == c['id']]['respostas']
    tmp = pd.DataFrame(agrupar_respostas(respostas, c['id']))
    if not tmp.empty:
        for d in dom:
            resp = tmp[tmp['dominio'] == d['id']]
            val = round(resp['valor'].mean(), 2)
            txt += str(val) + ';'
        txt += str(round(tmp['valor'].mean(), 2)) + ';'
        txt += str(round(tmp['valor'].std(), 2)) + ';'
    txt += '\n'

txt += 'Geral;'
tmp = pd.DataFrame(agrupar_respostas(data['respostas']))
for d in dom:
    resp = tmp[tmp['dominio'] == d['id']]
    txt += str(round(resp['valor'].mean(), 2)) + ';'
txt += str(round(tmp['valor'].mean(), 2)) + ';'
txt += str(round(tmp['valor'].std(), 2)) + ';'
print(txt)
