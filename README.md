Aqui está o formato da documentação da API em estilo README para ser usado no GitHub:

API de Agendamentos de Quadras Esportivas

Esta API permite gerenciar quadras esportivas, consultar horários, criar e cancelar reservas.

Índice

	•	Descrição
	•	Base URL
	•	Recursos
	•	Autenticação
	•	Quadras
	•	Agendamentos
	•	Validações
	•	Erros Comuns
	•	Considerações Finais

Descrição

A API de Agendamentos de Quadras Esportivas permite que usuários visualizem quadras disponíveis, reservem horários, verifiquem agendamentos existentes e cancelem reservas.

Base URL

	•	Localhost: http://localhost:3000

Recursos

Autenticação

1. Registro de Usuário

	•	URL: /api/auth/register
	•	Método: POST
	•	Descrição: Registra um novo usuário no sistema.
	•	Body:

{
  "nome": "João Silva",
  "email": "joao@email.com",
  "telefone": "123456789",
  "senha": "senha123"
}


	•	Resposta:

{
  "id": "64f4ef3b1c232c0012b09324",
  "nome": "João Silva",
  "email": "joao@email.com",
  "telefone": "123456789"
}



2. Login de Usuário

	•	URL: /api/auth/login
	•	Método: POST
	•	Descrição: Faz login e retorna um token JWT.
	•	Body:

{
  "email": "joao@email.com",
  "senha": "senha123"
}


	•	Resposta:

{
  "token": "eyJhbGciOiJIUzI1NiIsInR5..."
}

Quadras

1. Listar Quadras

	•	URL: /api/courts
	•	Método: GET
	•	Descrição: Retorna todas as quadras cadastradas.
	•	Resposta:

[
  {
    "_id": "64f4ef3b1c232c0012b09325",
    "nome": "Quadra 1",
    "descricao": "Quadra poliesportiva",
    "foto_principal": "url-da-imagem",
    "galeria": ["url1", "url2"],
    "duracao_padrao": 60,
    "esportes_permitidos": [
      {
        "_id": "64f4ef3b1c232c0012b09326",
        "nome": "Futebol"
      }
    ]
  }
]



2. Consultar Horários Agendados

	•	URL: /api/bookings/:quadraId/reserved-times
	•	Método: GET
	•	Descrição: Retorna os horários reservados para uma quadra em uma data específica.
	•	Parâmetros de URL:
	•	quadraId: ID da quadra.
	•	Query Parameters:
	•	data: Data no formato YYYY-MM-DD (opcional, padrão: hoje).
	•	Resposta:

{
  "quadra_id": "64f4ef3b1c232c0012b09325",
  "data": "2024-11-17",
  "horarios_agendados": [
    {
      "inicio": "14:00",
      "fim": "15:00",
      "status": "pendente"
    }
  ]
}

Agendamentos

1. Criar Reserva

	•	URL: /api/bookings
	•	Método: POST
	•	Descrição: Cria uma nova reserva de quadra.
	•	Headers:
	•	Authorization: Bearer <TOKEN_JWT>
	•	Body:

{
  "quadra_id": "64f4ef3b1c232c0012b09325",
  "data": "2024-11-17",
  "horario_inicio": "14:00",
  "horario_fim": "15:00"
}


	•	Resposta:

{
  "message": "Reserva criada com sucesso.",
  "reserva": {
    "_id": "64f4ef3b1c232c0012b09399",
    "usuario_id": "64f4ef3b1c232c0012b09327",
    "quadra_id": "64f4ef3b1c232c0012b09325",
    "data": "2024-11-17",
    "horario_inicio": "14:00",
    "horario_fim": "15:00",
    "status": "pendente"
  }
}



2. Cancelar Reserva

	•	URL: /api/bookings/:id/cancel
	•	Método: PUT
	•	Descrição: Altera o status da reserva para “cancelada”.
	•	Headers:
	•	Authorization: Bearer <TOKEN_JWT>
	•	Parâmetros de URL:
	•	id: ID da reserva.
	•	Resposta:

{
  "message": "Reserva cancelada com sucesso.",
  "reserva": {
    "_id": "64f4ef3b1c232c0012b09399",
    "usuario_id": "64f4ef3b1c232c0012b09327",
    "quadra_id": "64f4ef3b1c232c0012b09325",
    "data": "2024-11-17",
    "horario_inicio": "14:00",
    "horario_fim": "15:00",
    "status": "cancelada"
  }
}

Validações

	1.	Cadastro de Usuário:
	•	Campos obrigatórios: nome, email, telefone, senha.
	2.	Reserva:
	•	Não é possível reservar horários que já estão ocupados.
	•	Não é possível reservar fora do horário de funcionamento da quadra.
	3.	Cancelamento de Reserva:
	•	Apenas o usuário que criou a reserva pode cancelá-la.

Erros Comuns

Cadastro de Usuário

	•	Email já registrado:

{
  "message": "Erro ao registrar usuário.",
  "error": "Email já cadastrado."
}



Reserva

	•	Quadra não encontrada:

{
  "message": "Quadra não encontrada."
}


	•	Horário indisponível:

{
  "message": "Horário indisponível para reserva."
}



Cancelamento de Reserva

	•	Reserva não encontrada ou não pertence ao usuário:

{
  "message": "Reserva não encontrada ou não pertence ao usuário."
}

Considerações Finais

	•	Autenticação: Apenas usuários autenticados podem criar ou cancelar reservas.
	•	Flexibilidade: O front-end pode decidir quais horários exibir como disponíveis, com base nos dados retornados.

Se precisar de mais informações ou ajustes, é só abrir uma issue ou entrar em contato! 😊

Agora, basta copiar esse conteúdo para o arquivo README.md do seu repositório no GitHub!