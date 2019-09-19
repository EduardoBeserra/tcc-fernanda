import pandas as pd
from importacao import importar, cargos

questionarios = importar()
data = pd.DataFrame(questionarios)

print(data.groupby(by=['cargo']).count()['arquivo'])