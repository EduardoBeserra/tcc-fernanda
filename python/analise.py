from importacao import importar, especialidades, cargos
import pandas as pd

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

print(arq)
