import pandas as pd
from importacao import importar, peso
from dominios import dominios

questionarios = importar()

txt = ''
for d in dominios:
    lista = []
    for q in questionarios:
        respostas = list(filter(lambda r: r['dominio'] == d['id'], q['respostas']))
        respostas = list(map(lambda r: {
            'arquivo': q['arquivo'],
            'pergunta': r['id'],
            'valor': peso[r['resposta'] if r['resposta'] else 0]
        }, respostas))
        lista += respostas
    print(lista)
    txt += d['descricao'] + '\n'
    for r in lista:
        txt += f"{r['arquivo']};{r['pergunta']};{r['valor']}\n"

a = open('/home/eduardo/Área de Trabalho/arqedu.csv', 'w')
a.write(txt)
a.close()
