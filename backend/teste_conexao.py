import oracledb
import os


DB_USER="ADMIN"
DB_PASSWORD="TPDataBase123"
DB_DSN="tpdatabase_high"
WALLET_PASSWORD = "TPDataBase123"

# Senha ADM: TPDataBase123
# Senha Wallet: TPDataBase123

# Caminho da pasta wallet (ajuste se necessario)
WALLET_DIR = os.path.join(os.path.dirname(__file__), "wallet")


def testar_conexao():
    print(f"Procurando wallet em: {WALLET_DIR}")

    if not os.path.isdir(WALLET_DIR):
        print("ERRO: a pasta 'wallet' nao foi encontrada nesse caminho.")
        print("Confirme que voce extraiu o .zip da wallet ali.")
        return

    arquivos_wallet = os.listdir(WALLET_DIR)
    print(f"Arquivos encontrados na wallet: {arquivos_wallet}")

    if "tnsnames.ora" not in arquivos_wallet:
        print("AVISO: tnsnames.ora nao encontrado. Confirme a extracao do zip.")

    try:
        print("\nTentando conectar ao Oracle...")
        connection = oracledb.connect(
            user=DB_USER,
            password=DB_PASSWORD,
            dsn=DB_DSN,
            config_dir=WALLET_DIR,
            wallet_location=WALLET_DIR,
            wallet_password=WALLET_PASSWORD,
        )


        print("Conexao estabelecida com sucesso!\n")

        cursor = connection.cursor()
        cursor.execute("SELECT 'Conexao OK' AS resultado, SYSDATE AS data_hora FROM DUAL")
        resultado = cursor.fetchone()

        print(f"Resultado da consulta de teste: {resultado}")

        # Tenta tambem listar as tabelas do seu schema, se ja existirem
        print("\nTabelas existentes no seu schema:")
        cursor.execute("""
            SELECT table_name FROM user_tables ORDER BY table_name
        """)
        tabelas = cursor.fetchall()
        if tabelas:
            for (nome_tabela,) in tabelas:
                print(f"  - {nome_tabela}")
        else:
            print("  (nenhuma tabela encontrada ainda - normal se o DDL nao foi executado)")

        cursor.close()
        connection.close()
        print("\nTeste concluido. Conexao fechada corretamente.")

    except oracledb.Error as erro:
        print(f"\nERRO ao conectar: {erro}")
        print("\nDicas de verificacao:")
        print("  1. Usuario e senha estao corretos?")
        print("  2. O DSN (DB_DSN) corresponde a um nome de servico real no tnsnames.ora?")
        print("  3. A pasta wallet contem os arquivos cwallet.sso e tnsnames.ora?")
        print("  4. Sua rede/firewall permite conexao na porta 1522 (TCPS)?")


if __name__ == "__main__":
    testar_conexao()