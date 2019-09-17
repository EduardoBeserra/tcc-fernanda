import pandas as pd

from importacao import importar, especialidades, cargos, perguntas
from dominios import dominios

arq = ''

def imprimir(texto):
    global arq
    arq += texto + '\n'


def agrupar(campo, listdesc = None):
    agrupamento = data.groupby([campo]).count()['arquivo']
    total = agrupamento.sum()
    i = 0
    while i < len(agrupamento):
        s = "{desc};{qtd};{perc}"
        desc = get_descricao(listdesc, agrupamento.index.values[i]) if listdesc else agrupamento.index.values[i]

        imprimir(s.format(desc=desc, qtd=agrupamento.values[i],
                          perc=round(agrupamento.values[i] / total * 100, 3)))
        i += 1


def get_descricao(lista, index):
    list_filter = list(filter(lambda obj: obj['id'] == index, lista))
    if len(list_filter) > 0:
        return list_filter[0]['descricao']
    return 'Descricao nao encontrada'


questionarios = importar()

print(questionarios[0])

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
    resp = data[data['cargo'] == c['id']]['respostas']
    if resp.count() > 0:
        imprimir('Cargo: {desc};Qtd Pessoas: {qtd}'.format(desc=c['descricao'], qtd=resp.count()))
        imprimir('Domínio;Média;Mediana;Desvio Padrão')

        for d in dominios:
            pdom = dataperg[dataperg['dominio'] == d['id']]
            imprimir(d['descricao'] + ' e coisas')

        imprimir('')

print(arq)

'''
dataperg = pd.DataFrame(perguntas)
for d in dominios:
    a = dataperg[dataperg['dominio'] == d['id']]
    print('Dom. {id} - {desc} , qtdPerg: {qtd}, somaPerg: {soma}'.format(id=d['id'], desc=d['descricao'], qtd=d['qtd'], soma=a['id'].count()))
'''
