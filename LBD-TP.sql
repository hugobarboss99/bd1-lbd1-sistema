-- 1. LIMPEZA 


DROP TABLE AUDITORIA_PRECO_ANUNCIO CASCADE CONSTRAINTS;
DROP TABLE PAGAMENTO CASCADE CONSTRAINTS;
DROP TABLE VENDA CASCADE CONSTRAINTS;
DROP TABLE ANUNCIO CASCADE CONSTRAINTS;
DROP TABLE MANUTENCAO CASCADE CONSTRAINTS;
DROP TABLE CARRO CASCADE CONSTRAINTS;
DROP TABLE ADMINISTRADOR CASCADE CONSTRAINTS;
DROP TABLE USUARIO CASCADE CONSTRAINTS;
DROP TABLE ENDERECO CASCADE CONSTRAINTS;
DROP TABLE PESSOA CASCADE CONSTRAINTS;
DROP TABLE FOTO_CARRO CASCADE CONSTRAINTS;

DROP SEQUENCE seq_anuncio;
DROP SEQUENCE seq_venda;




-- 2. SEQUENCES
CREATE SEQUENCE seq_anuncio START WITH 1 INCREMENT BY 1;
CREATE SEQUENCE seq_venda START WITH 1 INCREMENT BY 1;


-- 3. TABELA: PESSOA - pai

CREATE TABLE PESSOA (
    cpf       VARCHAR2(11)   PRIMARY KEY CHECK (LENGTH(cpf) = 11),
    nome      VARCHAR2(100)  NOT NULL,
    telefone  VARCHAR2(12),
    login     VARCHAR2(30)   NOT NULL UNIQUE,
    senha     VARCHAR2(100)  NOT NULL
);


-- 4. TABELA: ENDERECO (Pessoa 1:N Endereco) - PK = (cep, numero_residencia)

CREATE TABLE ENDERECO (
    cep                VARCHAR2(8)    NOT NULL,
    numero_residencia  VARCHAR2(10)   NOT NULL,
    cpf_pessoa         VARCHAR2(11)   NOT NULL REFERENCES PESSOA (cpf) ON DELETE CASCADE,
    nome_rua           VARCHAR2(100)  NOT NULL,
    nome_bairro        VARCHAR2(60)   NOT NULL,
    nome_cidade        VARCHAR2(60)   NOT NULL,
    complemento        VARCHAR2(60),
    PRIMARY KEY (cep, numero_residencia)
);


-- 5. TABELA: USUARIO 

CREATE TABLE USUARIO (
    cpf_pessoa      VARCHAR2(11)   PRIMARY KEY REFERENCES PESSOA (cpf) ON DELETE CASCADE,
    data_cadastro   DATE           DEFAULT SYSDATE NOT NULL,
    status_conta    VARCHAR2(15)   DEFAULT 'ATIVO' NOT NULL CHECK (status_conta IN ('ATIVO', 'BLOQUEADO'))
);


-- 6. TABELA: ADMINISTRADOR

CREATE TABLE ADMINISTRADOR (
    cpf_pessoa        VARCHAR2(11)   PRIMARY KEY REFERENCES PESSOA (cpf) ON DELETE CASCADE,
    salario           NUMBER(10,2)   NOT NULL,
    data_admissao     DATE           DEFAULT SYSDATE NOT NULL
);


-- 7. TABELA: CARRO - PK = chassi

CREATE TABLE CARRO (
    chassi       VARCHAR2(17)   PRIMARY KEY,
    cpf_dono     VARCHAR2(11)   NOT NULL REFERENCES USUARIO (cpf_pessoa),
    marca        VARCHAR2(40)   NOT NULL,
    modelo       VARCHAR2(40)   NOT NULL,
    ano          NUMBER(4)      NOT NULL,
    km_rodados   NUMBER(10)     DEFAULT 0 CHECK (km_rodados >= 0),
    placa        VARCHAR2(8)    NOT NULL UNIQUE,
    cor          VARCHAR2(30)
);


-- 8. TABELA: ANUNCIO (Carro 1:N Anuncio e Usuario 1:N Anuncio)

CREATE TABLE ANUNCIO (
    id_anuncio        NUMBER(10)     DEFAULT seq_anuncio.NEXTVAL PRIMARY KEY,
    chassi_carro      VARCHAR2(17)   NOT NULL REFERENCES CARRO (chassi),
    cpf_anunciante    VARCHAR2(11)   NOT NULL REFERENCES USUARIO (cpf_pessoa),
    valor_anunciado   NUMBER(10,2)   NOT NULL CHECK (valor_anunciado > 0),
    data_publicacao   DATE           DEFAULT SYSDATE NOT NULL,
    status            VARCHAR2(15)   DEFAULT 'ATIVO' NOT NULL CHECK (status IN ('ATIVO', 'VENDIDO', 'ENCERRADO'))
);


-- 9. TABELA: VENDA (Anúncio 1:1 Venda e Usuário 1:n Venda)

CREATE TABLE VENDA (
    id_venda      NUMBER(10)     DEFAULT seq_venda.NEXTVAL PRIMARY KEY,
    id_anuncio    NUMBER(10)     NOT NULL UNIQUE REFERENCES ANUNCIO (id_anuncio),
    cpf_comprador VARCHAR2(11)   NOT NULL REFERENCES USUARIO (cpf_pessoa),
    data_venda    DATE           DEFAULT SYSDATE NOT NULL,
    valor         NUMBER(10,2)   NOT NULL CHECK (valor > 0)
);


-- 10. TABELA: PAGAMENTO (entidade fraca de Venda - PK composta)

CREATE TABLE PAGAMENTO (
    id_venda          NUMBER(10)     NOT NULL REFERENCES VENDA (id_venda) ON DELETE CASCADE,
    parcela           NUMBER(3)      DEFAULT 0 NOT NULL,
    valor             NUMBER(10,2)   NOT NULL CHECK (valor > 0),
    tipo_pagamento    VARCHAR2(20)   NOT NULL CHECK (tipo_pagamento IN ('DINHEIRO', 'CARTAO', 'BOLETO', 'FINANCIAMENTO', 'PIX')),
    status_pagamento  VARCHAR2(15)   DEFAULT 'PENDENTE' NOT NULL CHECK (status_pagamento IN ('PENDENTE', 'PAGO', 'ATRASADO')),
    PRIMARY KEY (id_venda, parcela)
);


-- 11. TABELA: MANUTENCAO (entidade fraca de Carro - PK composta)

CREATE TABLE MANUTENCAO (
    chassi_carro          VARCHAR2(17)   NOT NULL REFERENCES CARRO (chassi) ON DELETE CASCADE,
    sequencia_manutencao  NUMBER(5)      DEFAULT 0 NOT NULL,
    descricao             VARCHAR2(200)  NOT NULL,
    custo                 NUMBER(10,2)   NOT NULL CHECK (custo >= 0),
    data_manutencao       DATE           DEFAULT SYSDATE NOT NULL,
    PRIMARY KEY (chassi_carro, sequencia_manutencao)
);


-- 12. TABELA: AUDITORIA_PRECO_ANUNCIO (entidade fraca de Anuncio - PK composta)

CREATE TABLE AUDITORIA_PRECO_ANUNCIO (
    id_anuncio           NUMBER(10)     NOT NULL REFERENCES ANUNCIO (id_anuncio) ON DELETE CASCADE,
    sequencia_auditoria  NUMBER(5)      NOT NULL,
    valor_antigo         NUMBER(10,2)   NOT NULL,
    valor_novo           NUMBER(10,2)   NOT NULL,
    data_alteracao       DATE           DEFAULT SYSDATE NOT NULL,
    PRIMARY KEY (id_anuncio, sequencia_auditoria)
);

-- TABELA: FOTO_ANUNCIO (entidade fraca de Anuncio - PK composta)

CREATE TABLE FOTO_CARRO (
    chassi_carro    VARCHAR2(17)   NOT NULL REFERENCES CARRO (chassi) ON DELETE CASCADE,
    sequencia_foto  NUMBER(3)      DEFAULT 0 NOT NULL,
    url_foto        VARCHAR2(500)  NOT NULL,
    PRIMARY KEY (chassi_carro, sequencia_foto)
);


-- 13. TRIGGERS

-- TRIGGER 1 (RN03): Impede mais de um anuncio ATIVO para o mesmo chassi

CREATE OR REPLACE TRIGGER trg_unico_anuncio_ativo
BEFORE INSERT OR UPDATE OF status ON ANUNCIO
FOR EACH ROW
DECLARE
    v_qtd NUMBER;
BEGIN
    IF :NEW.status = 'ATIVO' THEN
        SELECT COUNT(*) INTO v_qtd
        FROM ANUNCIO
        WHERE chassi_carro = :NEW.chassi_carro
          AND status = 'ATIVO'
          AND id_anuncio <> :NEW.id_anuncio;

        IF v_qtd > 0 THEN
            RAISE_APPLICATION_ERROR(-20001, 'Este veiculo ja possui um anuncio ativo.');
        END IF;
    END IF;
END;
/


-- TRIGGER 2 (RN04): Impede usuario comprar o proprio anuncio

CREATE OR REPLACE TRIGGER trg_bloqueia_compra_propria
BEFORE INSERT ON VENDA
FOR EACH ROW
DECLARE
    v_cpf_anunciante VARCHAR2(11);
BEGIN
    SELECT cpf_anunciante INTO v_cpf_anunciante
    FROM ANUNCIO
    WHERE id_anuncio = :NEW.id_anuncio;

    IF v_cpf_anunciante = :NEW.cpf_comprador THEN
        RAISE_APPLICATION_ERROR(-20002, 'Usuario nao pode comprar o proprio anuncio.');
    END IF;
END;
/


-- TRIGGER 3 (RN05): Ao registrar a venda, marca o anuncio como VENDIDO

CREATE OR REPLACE TRIGGER trg_encerra_anuncio_vendido
AFTER INSERT ON VENDA
FOR EACH ROW
BEGIN
    UPDATE ANUNCIO
    SET status = 'VENDIDO'
    WHERE id_anuncio = :NEW.id_anuncio;
END;
/


-- TRIGGER 4 (RN07): So permite venda se o anuncio estiver ATIVO

CREATE OR REPLACE TRIGGER trg_bloqueia_venda_anuncio_inativo
BEFORE INSERT ON VENDA
FOR EACH ROW
DECLARE
    v_status VARCHAR2(15);
BEGIN
    SELECT status INTO v_status
    FROM ANUNCIO
    WHERE id_anuncio = :NEW.id_anuncio;

    IF v_status != 'ATIVO' THEN
        RAISE_APPLICATION_ERROR(-20003, 'Anuncio nao esta ativo. Status atual: ' || v_status);
    END IF;
END;
/


-- TRIGGER 5 (RN08): Valida que a soma dos pagamentos nao excede o valor da venda

CREATE OR REPLACE TRIGGER trg_valida_soma_pagamento
BEFORE INSERT OR UPDATE ON PAGAMENTO
FOR EACH ROW
DECLARE
    v_total_pago   NUMBER(10,2);
    v_valor_venda  NUMBER(10,2);
BEGIN
    SELECT valor INTO v_valor_venda
    FROM VENDA
    WHERE id_venda = :NEW.id_venda;

    SELECT NVL(SUM(valor), 0) INTO v_total_pago
    FROM PAGAMENTO
    WHERE id_venda = :NEW.id_venda
      AND parcela != :NEW.parcela;

    IF (v_total_pago + :NEW.valor) > v_valor_venda THEN
        RAISE_APPLICATION_ERROR(-20004, 'Soma dos pagamentos excede o valor da venda.');
    END IF;
END;
/


-- TRIGGER 6 (RN09): Auditoria de alteracao de valor do anuncio

CREATE OR REPLACE TRIGGER trg_auditoria_preco_anuncio
AFTER UPDATE OF valor_anunciado ON ANUNCIO
FOR EACH ROW
WHEN (OLD.valor_anunciado != NEW.valor_anunciado)
DECLARE
    v_proxima_seq NUMBER;
BEGIN
    SELECT NVL(MAX(sequencia_auditoria), 0) + 1 INTO v_proxima_seq
    FROM AUDITORIA_PRECO_ANUNCIO
    WHERE id_anuncio = :OLD.id_anuncio;

    INSERT INTO AUDITORIA_PRECO_ANUNCIO (id_anuncio, sequencia_auditoria, valor_antigo, valor_novo, data_alteracao)
    VALUES (:OLD.id_anuncio, v_proxima_seq, :OLD.valor_anunciado, :NEW.valor_anunciado, SYSDATE);
END;
/


-- TRIGGER 7 (RN10): Impede excluir usuario com anuncio ativo ou pagamento pendente

CREATE OR REPLACE TRIGGER trg_bloqueia_exclusao_usuario
BEFORE DELETE ON USUARIO
FOR EACH ROW
DECLARE
    v_qtd_anuncios NUMBER;
    v_qtd_pendencias NUMBER;
BEGIN
    SELECT COUNT(*) INTO v_qtd_anuncios
    FROM ANUNCIO
    WHERE cpf_anunciante = :OLD.cpf_pessoa
      AND status = 'ATIVO';

    SELECT COUNT(*) INTO v_qtd_pendencias
    FROM PAGAMENTO p
    JOIN VENDA v ON p.id_venda = v.id_venda
    WHERE v.cpf_comprador = :OLD.cpf_pessoa
      AND p.status_pagamento = 'PENDENTE';

    IF v_qtd_anuncios > 0 THEN
        RAISE_APPLICATION_ERROR(-20005, 'Usuario possui anuncios ativos e nao pode ser excluido.');
    ELSIF v_qtd_pendencias > 0 THEN
        RAISE_APPLICATION_ERROR(-20006, 'Usuario possui pagamentos pendentes e nao pode ser excluido.');
    END IF;
END;
/


-- TRIGGER 8 (RN11): Usuario bloqueado nao pode anunciar nem comprar

CREATE OR REPLACE TRIGGER trg_bloqueia_usuario_bloqueado
BEFORE INSERT ON ANUNCIO
FOR EACH ROW
DECLARE
    v_status_conta VARCHAR2(15);
BEGIN
    SELECT status_conta INTO v_status_conta
    FROM USUARIO
    WHERE cpf_pessoa = :NEW.cpf_anunciante;

    IF v_status_conta = 'BLOQUEADO' THEN
        RAISE_APPLICATION_ERROR(-20007, 'Usuario bloqueado nao pode criar anuncios.');
    END IF;
END;
/

-- TRIGGER 9 (RN11): Usuario bloqueado nao pode anunciar nem comprar

CREATE OR REPLACE TRIGGER trg_bloqueia_compra_usuario_bloqueado
BEFORE INSERT ON VENDA
FOR EACH ROW
DECLARE
    v_status_conta VARCHAR2(15);
BEGIN
    SELECT status_conta INTO v_status_conta
    FROM USUARIO
    WHERE cpf_pessoa = :NEW.cpf_comprador;

    IF v_status_conta = 'BLOQUEADO' THEN
        RAISE_APPLICATION_ERROR(-20008, 'Usuario bloqueado nao pode realizar compras.');
    END IF;
END;
/


-- TRIGGER 10 (RN12) Ao concluir a venda, transfere a propriedade do veiculo (CARRO.cpf_dono) para o comprador

CREATE OR REPLACE TRIGGER trg_transfere_dono_carro
AFTER INSERT ON VENDA
FOR EACH ROW
DECLARE
    v_chassi VARCHAR2(17);
BEGIN
    SELECT chassi_carro INTO v_chassi
    FROM ANUNCIO
    WHERE id_anuncio = :NEW.id_anuncio;

    UPDATE CARRO
    SET cpf_dono = :NEW.cpf_comprador
    WHERE chassi = v_chassi;
END;
/

-- TRIGGER 11 (numeracao automatica): calcula a proxima parcela de uma Venda

CREATE OR REPLACE TRIGGER trg_numera_parcela
BEFORE INSERT ON PAGAMENTO
FOR EACH ROW
DECLARE
    v_proxima_parcela NUMBER;
BEGIN
    SELECT NVL(MAX(parcela), 0) + 1 INTO v_proxima_parcela
    FROM PAGAMENTO
    WHERE id_venda = :NEW.id_venda;

    :NEW.parcela := v_proxima_parcela;
END;
/

-- TRIGGER 12 (numeracao automatica): calcula a proxima sequencia de Manutencao

CREATE OR REPLACE TRIGGER trg_numera_manutencao
BEFORE INSERT ON MANUTENCAO
FOR EACH ROW
DECLARE
    v_proxima_seq NUMBER;
BEGIN
    SELECT NVL(MAX(sequencia_manutencao), 0) + 1 INTO v_proxima_seq
    FROM MANUTENCAO
    WHERE chassi_carro = :NEW.chassi_carro;

    :NEW.sequencia_manutencao := v_proxima_seq;
END;
/

-- TRIGGER 13 (numeracao automatica): calcula a proxima sequencia de Foto

CREATE OR REPLACE TRIGGER trg_numera_foto
BEFORE INSERT ON FOTO_CARRO
FOR EACH ROW
DECLARE
    v_proxima_seq NUMBER;
BEGIN
    SELECT NVL(MAX(sequencia_foto), 0) + 1 INTO v_proxima_seq
    FROM FOTO_CARRO
    WHERE chassi_carro = :NEW.chassi_carro;

    :NEW.sequencia_foto := v_proxima_seq;
END;
/