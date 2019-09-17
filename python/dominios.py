dominios = [{
    'id': 1,
    'descricao': 'Trabalho em equipe',
    'qtd': 6
}, {
    'id': 2,
    'descricao': 'Clima de segurança',
    'qtd': 7
}, {
    'id': 3,
    'descricao': 'Satisfação no trabalho',
    'qtd': 5
}, {
    'id': 4,
    'descricao': 'Percepção de estresse',
    'qtd': 4
}, {
    'id': 5,
    'descricao': 'Percepção de gerência',
    'qtd': 11 #6
}, {
    'id': 6,
    'descricao': 'Condição de trabalho',
    'qtd': 3
}, {
    'id': 7,
    'descricao': 'Fator',
    'qtd': 5
}]


def vincular_dominios(perguntas):
    for p in perguntas:
        if p['id'] <= 6:
            p['dominio'] = 1
        elif p['id'] <= 13:
            p['dominio'] = 2
        elif p['id'] == 14 or p['id'] >= 38:
            p['dominio'] = 7
        elif p['id'] <= 19:
            p['dominio'] = 3
        elif p['id'] <= 23:
            p['dominio'] = 4
        elif p['id'] <= 34:
            p['dominio'] = 5
        elif p['id'] <= 37:
            p['dominio'] = 6