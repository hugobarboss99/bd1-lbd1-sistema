-- ============================================================
-- INSERTS - PARTE 1
-- PESSOA
-- ============================================================

INSERT INTO PESSOA VALUES ('11111111111','Gustavo Xavier','31999990001','gustavo.xavier','$2b$12$JEIO7.jUBK/lv.Ke.LoNseaN1.4zhYzGu83GaMVqfqVbTGCnViRCC');
INSERT INTO PESSOA VALUES ('22222222222','Ana Beatriz Silva','31999990002','ana.beatriz','$2b$12$JEIO7.jUBK/lv.Ke.LoNseaN1.4zhYzGu83GaMVqfqVbTGCnViRCC');
INSERT INTO PESSOA VALUES ('33333333333','Lucas Ferreira','31999990003','lucas.ferreira','$2b$12$JEIO7.jUBK/lv.Ke.LoNseaN1.4zhYzGu83GaMVqfqVbTGCnViRCC');
INSERT INTO PESSOA VALUES ('44444444444','Maria Eduarda','31999990004','maria.eduarda','$2b$12$JEIO7.jUBK/lv.Ke.LoNseaN1.4zhYzGu83GaMVqfqVbTGCnViRCC');
INSERT INTO PESSOA VALUES ('55555555555','Pedro Henrique','31999990005','pedro.henrique','$2b$12$JEIO7.jUBK/lv.Ke.LoNseaN1.4zhYzGu83GaMVqfqVbTGCnViRCC');
INSERT INTO PESSOA VALUES ('66666666666','Fernanda Lima','31999990006','fernanda.lima','$2b$12$JEIO7.jUBK/lv.Ke.LoNseaN1.4zhYzGu83GaMVqfqVbTGCnViRCC');
INSERT INTO PESSOA VALUES ('77777777777','Gabriel Souza','31999990007','gabriel.souza','$2b$12$JEIO7.jUBK/lv.Ke.LoNseaN1.4zhYzGu83GaMVqfqVbTGCnViRCC');
INSERT INTO PESSOA VALUES ('88888888888','Camila Rocha','31999990008','camila.rocha','$2b$12$JEIO7.jUBK/lv.Ke.LoNseaN1.4zhYzGu83GaMVqfqVbTGCnViRCC');
INSERT INTO PESSOA VALUES ('99999999999','Rafael Oliveira','31999990009','rafael.oliveira','$2b$12$JEIO7.jUBK/lv.Ke.LoNseaN1.4zhYzGu83GaMVqfqVbTGCnViRCC');
INSERT INTO PESSOA VALUES ('12345678901','Juliana Martins','31999990010','juliana.martins','$2b$12$JEIO7.jUBK/lv.Ke.LoNseaN1.4zhYzGu83GaMVqfqVbTGCnViRCC');


-- ============================================================
-- ENDERECOS
-- ============================================================

INSERT INTO ENDERECO VALUES ('30110000','120','11111111111','Rua dos Andradas','Centro','Belo Horizonte','Apto 301');

INSERT INTO ENDERECO VALUES ('30120000','85','22222222222','Rua da Bahia','Funcionarios','Belo Horizonte',NULL);

INSERT INTO ENDERECO VALUES ('30130000','42','33333333333','Rua dos Timbiras','Centro','Belo Horizonte',NULL);

INSERT INTO ENDERECO VALUES ('30140000','510','44444444444','Av. Amazonas','Centro','Belo Horizonte','Bloco B');

INSERT INTO ENDERECO VALUES ('30150000','220','55555555555','Rua Espirito Santo','Lourdes','Belo Horizonte',NULL);

INSERT INTO ENDERECO VALUES ('30160000','71','66666666666','Rua Goias','Centro','Belo Horizonte',NULL);

INSERT INTO ENDERECO VALUES ('30170000','900','77777777777','Av. Cristiano Machado','Uniao','Belo Horizonte','Casa');

INSERT INTO ENDERECO VALUES ('30180000','16','88888888888','Rua Curitiba','Centro','Belo Horizonte',NULL);

INSERT INTO ENDERECO VALUES ('30190000','430','99999999999','Rua Rio de Janeiro','Centro','Belo Horizonte',NULL);

INSERT INTO ENDERECO VALUES ('30200000','999','12345678901','Av. Afonso Pena','Centro','Belo Horizonte','Cobertura');


-- ============================================================
-- USUARIOS
-- ============================================================

INSERT INTO USUARIO (cpf_pessoa,status_conta)
VALUES ('11111111111','ATIVO');

INSERT INTO USUARIO (cpf_pessoa,status_conta)
VALUES ('22222222222','ATIVO');

INSERT INTO USUARIO (cpf_pessoa,status_conta)
VALUES ('33333333333','ATIVO');

INSERT INTO USUARIO (cpf_pessoa,status_conta)
VALUES ('44444444444','ATIVO');

INSERT INTO USUARIO (cpf_pessoa,status_conta)
VALUES ('55555555555','ATIVO');

INSERT INTO USUARIO (cpf_pessoa,status_conta)
VALUES ('66666666666','ATIVO');

INSERT INTO USUARIO (cpf_pessoa,status_conta)
VALUES ('77777777777','ATIVO');

INSERT INTO USUARIO (cpf_pessoa,status_conta)
VALUES ('88888888888','BLOQUEADO');

INSERT INTO USUARIO (cpf_pessoa,status_conta)
VALUES ('99999999999','ATIVO');

INSERT INTO USUARIO (cpf_pessoa,status_conta)
VALUES ('12345678901','ATIVO');


-- ============================================================
-- ADMINISTRADORES
-- (também são usuários)
-- ============================================================

INSERT INTO ADMINISTRADOR
VALUES ('11111111111',8500.00,DATE '2023-01-10');

INSERT INTO ADMINISTRADOR
VALUES ('44444444444',7900.00,DATE '2024-03-15');

-- ============================================================
-- CARROS
-- ============================================================

INSERT INTO CARRO VALUES (
'9BD358A4NPY123001',
'11111111111',
'Fiat',
'Argo',
2023,
18000,
'QWE1A23',
'Branco'
);

INSERT INTO CARRO VALUES (
'93HFC6600LZ123002',
'22222222222',
'Honda',
'City',
2020,
52000,
'RTY2B34',
'Prata'
);

INSERT INTO CARRO VALUES (
'93HFC2600KZ123003',
'33333333333',
'Honda',
'Civic',
2019,
61000,
'UIO3C45',
'Preto'
);

INSERT INTO CARRO VALUES (
'9BRBD48E2N123004',
'44444444444',
'Toyota',
'Corolla',
2022,
24000,
'PAS4D56',
'Cinza'
);

INSERT INTO CARRO VALUES (
'9BD358A4CP123005',
'55555555555',
'Fiat',
'Cronos',
2022,
28000,
'DFG5E67',
'Branco'
);

INSERT INTO CARRO VALUES (
'1C6SRFMT0LN123006',
'66666666666',
'Dodge',
'RAM 2500',
2020,
49000,
'GHJ6F78',
'Preto'
);

INSERT INTO CARRO VALUES (
'LGXCE4CB6S1230007',
'77777777777',
'BYD',
'Dolphin',
2025,
1200,
'JKL7G89',
'Azul'
);

INSERT INTO CARRO VALUES (
'9BWZZZ377VT123008',
'88888888888',
'Volkswagen',
'Gol',
1998,
236000,
'ZXC8H90',
'Branco'
);

INSERT INTO CARRO VALUES (
'9BHCP51AAN123009',
'99999999999',
'Hyundai',
'HB20',
2022,
27000,
'VBN9J12',
'Prata'
);

INSERT INTO CARRO VALUES (
'8AJBA3CD8A123010',
'12345678901',
'Toyota',
'Hilux',
2010,
188000,
'MNB1K23',
'Preta'
);

INSERT INTO CARRO VALUES (
'9BD1105BG123011',
'11111111111',
'Fiat',
'Linea',
2016,
96000,
'POI2L34',
'Cinza'
);

INSERT INTO CARRO VALUES (
'9BGKS48G0NG123012',
'22222222222',
'Chevrolet',
'Onix',
2022,
21000,
'LKJ3M45',
'Branco'
);

INSERT INTO CARRO VALUES (
'9BD17146LC123013',
'33333333333',
'Fiat',
'Palio',
2012,
141000,
'HGF4N56',
'Vermelho'
);

INSERT INTO CARRO VALUES (
'9BG148FHCC123014',
'44444444444',
'Chevrolet',
'S10',
2012,
173000,
'QAZ5P67',
'Prata'
);

INSERT INTO CARRO VALUES (
'9BD17206MG123015',
'55555555555',
'Fiat',
'Siena',
2015,
123000,
'WSX6Q78',
'Cinza'
);

INSERT INTO CARRO VALUES (
'9BD57834PJ123016',
'66666666666',
'Fiat',
'Strada',
2023,
16000,
'EDC7R89',
'Branca'
);

INSERT INTO CARRO VALUES (
'9882261YRP123017',
'77777777777',
'Fiat',
'Toro',
2024,
9000,
'RFV8S90',
'Preta'
);

INSERT INTO CARRO VALUES (
'3N1CN7AD4ML123018',
'99999999999',
'Nissan',
'Versa',
2021,
34000,
'TGB9T12',
'Prata'
);

INSERT INTO CARRO VALUES (
'9BWDL5BZ5PP123019',
'12345678901',
'Volkswagen',
'Virtus',
2023,
17000,
'YHN1U23',
'Cinza'
);



-- ============================================================
-- FOTOS
-- ============================================================

INSERT INTO FOTO_CARRO VALUES ('9BD358A4NPY123001',0,'/images/Argo-2023.jpg');
INSERT INTO FOTO_CARRO VALUES ('93HFC6600LZ123002',0,'/images/City-2020.jpg');
INSERT INTO FOTO_CARRO VALUES ('93HFC2600KZ123003',0,'/images/Civic-2019.jpg');
INSERT INTO FOTO_CARRO VALUES ('9BRBD48E2N123004',0,'/images/Corolla-2022.jpg');
INSERT INTO FOTO_CARRO VALUES ('9BD358A4CP123005',0,'/images/Cronos.jpeg');
INSERT INTO FOTO_CARRO VALUES ('1C6SRFMT0LN123006',0,'/images/DODGE-RAM-2020.png');
INSERT INTO FOTO_CARRO VALUES ('LGXCE4CB6S1230007',0,'/images/Dolphin-2025.png');
INSERT INTO FOTO_CARRO VALUES ('9BWZZZ377VT123008',0,'/images/Gol-1998.jpg');
INSERT INTO FOTO_CARRO VALUES ('9BHCP51AAN123009',0,'/images/HB20-2022.jpg');
INSERT INTO FOTO_CARRO VALUES ('8AJBA3CD8A123010',0,'/images/Hilux-2010.jpeg');
INSERT INTO FOTO_CARRO VALUES ('9BD1105BG123011',0,'/images/Linea-2016.jpg');
INSERT INTO FOTO_CARRO VALUES ('9BGKS48G0NG123012',0,'/images/Onix-2022.png');
INSERT INTO FOTO_CARRO VALUES ('9BD17146LC123013',0,'/images/Palio-2012-1.jpeg');
INSERT INTO FOTO_CARRO VALUES ('9BD17146LC123013',0,'/images/Palio-2012-2.jpeg');
INSERT INTO FOTO_CARRO VALUES ('9BG148FHCC123014',0,'/images/S10-2012.jpg');
INSERT INTO FOTO_CARRO VALUES ('9BD17206MG123015',0,'/images/Siena1.png');
INSERT INTO FOTO_CARRO VALUES ('9BD17206MG123015',0,'/images/Siena2.png');
INSERT INTO FOTO_CARRO VALUES ('9BD57834PJ123016',0,'/images/Strada.jpg');
INSERT INTO FOTO_CARRO VALUES ('9882261YRP123017',0,'/images/Toro-2024.jpg');
INSERT INTO FOTO_CARRO VALUES ('3N1CN7AD4ML123018',0,'/images/Versa-2021.jpg');
INSERT INTO FOTO_CARRO VALUES ('9BWDL5BZ5PP123019',0,'/images/Virtus-2023.JPG');



-- ============================================================
-- MANUTENCOES
-- ============================================================

INSERT INTO MANUTENCAO VALUES ('93HFC2600KZ123003',0,'Troca de oleo e filtros',450,DATE '2025-02-15');

INSERT INTO MANUTENCAO VALUES ('9BWZZZ377VT123008',0,'Troca de embreagem',1800,DATE '2024-08-10');

INSERT INTO MANUTENCAO VALUES ('9BG148FHCC123014',0,'Revisao completa',2500,DATE '2025-01-12');

INSERT INTO MANUTENCAO VALUES ('8AJBA3CD8A123010',0,'Troca de amortecedores',3200,DATE '2024-11-03');

INSERT INTO MANUTENCAO VALUES ('9BD17146LC123013',0,'Troca de pneus',2200,DATE '2025-03-20');

INSERT INTO MANUTENCAO VALUES ('9BD57834PJ123016',0,'Primeira revisao',0,DATE '2025-05-15');

-- ============================================================
-- ANUNCIOS
-- ============================================================

INSERT INTO ANUNCIO (chassi_carro, cpf_anunciante, valor_anunciado, data_publicacao, status)
VALUES ('9BD358A4NPY123001','11111111111',68500,DATE '2025-04-10','ATIVO');

INSERT INTO ANUNCIO (chassi_carro, cpf_anunciante, valor_anunciado, data_publicacao, status)
VALUES ('93HFC6600LZ123002','22222222222',91500,DATE '2025-05-02','ATIVO');

INSERT INTO ANUNCIO (chassi_carro, cpf_anunciante, valor_anunciado, data_publicacao, status)
VALUES ('93HFC2600KZ123003','33333333333',115000,DATE '2025-03-28','ATIVO');

INSERT INTO ANUNCIO (chassi_carro, cpf_anunciante, valor_anunciado, data_publicacao, status)
VALUES ('9BRBD48E2N123004','44444444444',146000,DATE '2025-02-14','ENCERRADO');

INSERT INTO ANUNCIO (chassi_carro, cpf_anunciante, valor_anunciado, data_publicacao, status)
VALUES ('9BD358A4CP123005','55555555555',74500,DATE '2025-05-11','ATIVO');

INSERT INTO ANUNCIO (chassi_carro, cpf_anunciante, valor_anunciado, data_publicacao, status)
VALUES ('1C6SRFMT0LN123006','66666666666',385000,DATE '2025-04-20','ATIVO');

INSERT INTO ANUNCIO (chassi_carro, cpf_anunciante, valor_anunciado, data_publicacao, status)
VALUES ('9BHCP51AAN123009','99999999999',77500,DATE '2025-05-15','ATIVO');

INSERT INTO ANUNCIO (chassi_carro, cpf_anunciante, valor_anunciado, data_publicacao, status)
VALUES ('8AJBA3CD8A123010','12345678901',125000,DATE '2025-01-18','ENCERRADO');

INSERT INTO ANUNCIO (chassi_carro, cpf_anunciante, valor_anunciado, data_publicacao, status)
VALUES ('9BGKS48G0NG123012','22222222222',74800,DATE '2025-05-25','ATIVO');

INSERT INTO ANUNCIO (chassi_carro, cpf_anunciante, valor_anunciado, data_publicacao, status)
VALUES ('9BD17146LC123013','33333333333',28500,DATE '2025-04-04','ATIVO');

INSERT INTO ANUNCIO (chassi_carro, cpf_anunciante, valor_anunciado, data_publicacao, status)
VALUES ('9BD57834PJ123016','66666666666',106000,DATE '2025-05-18','ATIVO');

INSERT INTO ANUNCIO (chassi_carro, cpf_anunciante, valor_anunciado, data_publicacao, status)
VALUES ('9882261YRP123017','77777777777',159000,DATE '2025-05-30','ATIVO');

INSERT INTO ANUNCIO (chassi_carro, cpf_anunciante, valor_anunciado, data_publicacao, status)
VALUES ('3N1CN7AD4ML123018','99999999999',83000,DATE '2025-04-16','ATIVO');

INSERT INTO ANUNCIO (chassi_carro, cpf_anunciante, valor_anunciado, data_publicacao, status)
VALUES ('9BWDL5BZ5PP123019','12345678901',116500,DATE '2025-06-01','ATIVO');

-- ============================================================
-- VENDAS
-- ============================================================

INSERT INTO VENDA (id_anuncio, cpf_comprador, data_venda, valor)
VALUES (1,'33333333333',DATE '2025-05-02',67000);

INSERT INTO VENDA (id_anuncio, cpf_comprador, data_venda, valor)
VALUES (2,'55555555555',DATE '2025-05-28',90000);

INSERT INTO VENDA (id_anuncio, cpf_comprador, data_venda, valor)
VALUES (6,'11111111111',DATE '2025-06-05',380000);

INSERT INTO VENDA (id_anuncio, cpf_comprador, data_venda, valor)
VALUES (9,'77777777777',DATE '2025-06-10',73500);

INSERT INTO VENDA (id_anuncio, cpf_comprador, data_venda, valor)
VALUES (10,'99999999999',DATE '2025-06-12',27500);

-- ============================================================
-- PAGAMENTOS
-- ============================================================

-- Venda 1

INSERT INTO PAGAMENTO VALUES (1,0,67000,'PIX','PAGO');

-- Venda 2

INSERT INTO PAGAMENTO VALUES (2,0,30000,'PIX','PAGO');
INSERT INTO PAGAMENTO VALUES (2,0,30000,'FINANCIAMENTO','PAGO');
INSERT INTO PAGAMENTO VALUES (2,0,30000,'FINANCIAMENTO','PENDENTE');

-- Venda 3

INSERT INTO PAGAMENTO VALUES (3,0,80000,'FINANCIAMENTO','PAGO');
INSERT INTO PAGAMENTO VALUES (3,0,75000,'FINANCIAMENTO','PAGO');
INSERT INTO PAGAMENTO VALUES (3,0,75000,'FINANCIAMENTO','PAGO');
INSERT INTO PAGAMENTO VALUES (3,0,75000,'FINANCIAMENTO','PENDENTE');
INSERT INTO PAGAMENTO VALUES (3,0,75000,'FINANCIAMENTO','PENDENTE');

-- Venda 4

INSERT INTO PAGAMENTO VALUES (4,0,73500,'CARTAO','PAGO');

-- Venda 5

INSERT INTO PAGAMENTO VALUES (5,0,13750,'BOLETO','PAGO');
INSERT INTO PAGAMENTO VALUES (5,0,13750,'BOLETO','PENDENTE');


-- ============================================================
-- ALTERACOES DE PRECO (gera registros de auditoria)
-- ============================================================

UPDATE ANUNCIO
SET valor_anunciado = 67000
WHERE id_anuncio = 1;

UPDATE ANUNCIO
SET valor_anunciado = 112000
WHERE id_anuncio = 3;

UPDATE ANUNCIO
SET valor_anunciado = 157000
WHERE id_anuncio = 12;

UPDATE ANUNCIO
SET valor_anunciado = 81500
WHERE id_anuncio = 14;

COMMIT;