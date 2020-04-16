import unittest
from pibic.perguntas import perguntas, dominios
import pibic.importacao as pib
import pandas as pd


class Teste(unittest.TestCase):
    def test_qtdperguntasdominio(self):
        df = pd.DataFrame(perguntas)
        ok = True
        for d in dominios:
            cont = df[df['dominio'] == d['id']]['num'].count()
            if cont != d['qtdPerguntas']:
                ok = False
        self.assertTrue(ok)

    def test_importapergunta(self):
        linha = ['27. Profissionais conseguem deixar os problemas pessoais para trás, quando estão trabalhando.', '', '', '', 'X', '', '']
        p = pib.importarpergunta(linha)
        self.assertEqual(27, p['num'])

    def test_getresposta(self):
        linha = ['27. Profissionais conseguem deixar os problemas pessoais para trás, quando estão trabalhando.', '', '', '', 'X', '', '']
        self.assertEqual(3, pib.getresposta(linha))

    def test_importcargo(self):
        linha = ['Enfermeiro de Crntro Cirurgico', '', '', '', '', '', '']
        self.assertEqual('Enfermeiro de Crntro Cirurgico', pib.importarcargo(linha)['descricao'])