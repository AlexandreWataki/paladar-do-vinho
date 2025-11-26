import os

# Pega a pasta onde este script está
pasta_atual = os.path.dirname(os.path.abspath(__file__))

print(f"📂 Listando arquivos em: {pasta_atual}\n")
print("-" * 30)

arquivos = os.listdir(pasta_atual)
encontrou = False

for arquivo in arquivos:
    # Se o nome tiver "vinho", mostra com destaque
    if "vinho" in arquivo.lower():
        print(f"✅ ACHEI: '{arquivo}'")
        encontrou = True
    else:
        # Mostra outros arquivos só para conferência
        print(f"   Arquivo: {arquivo}")

print("-" * 30)

if encontrou:
    print("Use o nome EXATO que apareceu acima no seu código (dentro das aspas ' ').")
else:
    print("❌ Não encontrei nenhum arquivo com 'vinho' no nome nesta pasta.")