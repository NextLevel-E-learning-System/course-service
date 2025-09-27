export const openapiSpec = {
  "openapi": "3.0.3",
  "info": { 
    "title": "Course Service API", 
    "version": "2.0.0",
    "description": "API completa para gestão de cursos, módulos e materiais com padrão de resposta unificado: sucesso sempre inclui mensagem, erros seguem formato { erro, mensagem }"
  },
  "components": {
    "securitySchemes": {
      "bearerAuth": {
        "type": "http",
        "scheme": "bearer",
        "bearerFormat": "JWT",
        "description": "JWT token obtido via auth-service"
      }
    },
    "schemas": {
      "ErrorResponse": {
        "type": "object",
        "required": ["erro", "mensagem"],
        "properties": {
          "erro": {
            "type": "string",
            "description": "Código do erro em snake_case",
            "example": "dados_invalidos"
          },
          "mensagem": {
            "type": "string", 
            "description": "Descrição legível do erro",
            "example": "Os dados fornecidos são inválidos"
          },
          "detalhes": {
            "type": "array",
            "items": {"type": "object"},
            "description": "Detalhes específicos de validação (opcional)"
          }
        }
      },
      "CourseResponse": {
        "type": "object",
        "required": ["curso", "mensagem"],
        "properties": {
          "curso": {"$ref": "#/components/schemas/Course"},
          "mensagem": {"type": "string", "example": "Curso obtido com sucesso"}
        }
      },
      "CoursesListResponse": {
        "type": "object", 
        "required": ["items", "mensagem"],
        "properties": {
          "items": {
            "type": "array",
            "items": {"$ref": "#/components/schemas/Course"}
          },
          "total": {"type": "integer"},
          "mensagem": {"type": "string", "example": "Cursos listados com sucesso"}
        }
      },
      "CategoryResponse": {
        "type": "object",
        "required": ["categoria", "mensagem"], 
        "properties": {
          "categoria": {"$ref": "#/components/schemas/Category"},
          "mensagem": {"type": "string", "example": "Categoria obtida com sucesso"}
        }
      },
      "CategoriesListResponse": {
        "type": "object",
        "required": ["items", "mensagem"],
        "properties": {
          "items": {
            "type": "array", 
            "items": {"$ref": "#/components/schemas/Category"}
          },
          "mensagem": {"type": "string", "example": "Categorias listadas com sucesso"}
        }
      },
      "ModuleResponse": {
        "type": "object",
        "required": ["modulo", "mensagem"],
        "properties": {
          "modulo": {"$ref": "#/components/schemas/Module"},
          "mensagem": {"type": "string", "example": "Módulo criado com sucesso"}
        }
      },
      "ModulesListResponse": {
        "type": "object",
        "required": ["items", "mensagem"],
        "properties": {
          "items": {
            "type": "array",
            "items": {"$ref": "#/components/schemas/Module"}
          },
          "mensagem": {"type": "string", "example": "Módulos listados com sucesso"}
        }
      },
      "MaterialResponse": {
        "type": "object",
        "required": ["material", "mensagem"],
        "properties": {
          "material": {"$ref": "#/components/schemas/Material"},
          "mensagem": {"type": "string", "example": "Material adicionado com sucesso"}
        }
      },
      "MaterialsListResponse": {
        "type": "object",
        "required": ["items", "mensagem"],
        "properties": {
          "items": {
            "type": "array",
            "items": {"$ref": "#/components/schemas/Material"}
          },
          "mensagem": {"type": "string", "example": "Materiais listados com sucesso"}
        }
      },
      "DuplicateCourseResponse": {
        "type": "object",
        "required": ["duplicacao", "mensagem"],
        "properties": {
          "duplicacao": {
            "type": "object",
            "properties": {
              "codigo_original": {"type": "string"},
              "codigo_copia": {"type": "string"}
            }
          },
          "mensagem": {"type": "string", "example": "Curso duplicado com sucesso"}
        }
      },
      "SuccessResponse": {
        "type": "object",
        "required": ["mensagem"],
        "properties": {
          "mensagem": {"type": "string"}
        }
      },
      "Course": {
        "type": "object",
        "properties": {
          "codigo": {"type": "string"},
          "titulo": {"type": "string"},
          "descricao": {"type": "string"},
          "categoria_id": {"type": "string"},
          "instrutor_id": {"type": "string"},
          "ativo": {"type": "boolean"},
          "duracao_estimada": {"type": "integer"},
          "xp_oferecido": {"type": "integer"},
          "nivel_dificuldade": {"type": "string"},
          "pre_requisitos": {"type": "array", "items": {"type": "string"}},
          "categoria_nome": {"type": "string"},
          "departamento_codigo": {"type": "string"},
          "instrutor_nome": {"type": "string"},
          "total_inscricoes": {"type": "integer"},
          "total_conclusoes": {"type": "integer"},
          "taxa_conclusao": {"type": "number"},
          "media_conclusao": {"type": "number", "nullable": true},
          "total_modulos": {"type": "integer"},
          "criado_em": {"type": "string", "format": "date-time"},
          "atualizado_em": {"type": "string", "format": "date-time"}
        }
      },
      "Category": {
        "type": "object",
        "properties": {
          "codigo": {"type": "string"},
          "nome": {"type": "string"},
          "descricao": {"type": "string"},
          "departamento_codigo": {"type": "string"},
          "ativo": {"type": "boolean"},
          "criado_em": {"type": "string", "format": "date-time"}
        }
      },
      "Module": {
        "type": "object",
        "properties": {
          "id": {"type": "string", "format": "uuid"},
          "titulo": {"type": "string"},
          "conteudo": {"type": "string", "nullable": true},
          "ordem": {"type": "integer"},
          "obrigatorio": {"type": "boolean"},
          "xp": {"type": "integer"},
          "tipo_conteudo": {"type": "string", "nullable": true},
          "criado_em": {"type": "string", "format": "date-time"},
          "atualizado_em": {"type": "string", "format": "date-time"}
        }
      },
      "Material": {
        "type": "object",
        "properties": {
          "id": {"type": "string"},
          "nome_arquivo": {"type": "string"},
          "tipo_arquivo": {"type": "string"},
          "storage_key": {"type": "string"},
          "tamanho": {"type": "integer"},
          "download_url": {"type": "string", "description": "URL pré-assinada para download (válida por 5 minutos)"},
          "criado_em": {"type": "string", "format": "date-time"}
        }
      }
    }
  },
  "paths": {
    "/courses/v1/categorias": { 
      "get": { 
        "summary": "Listar categorias", 
        "tags": ["categorias"], 
        "responses": { 
          "200": { 
            "description": "Lista de categorias", 
            "content": { 
              "application/json": { 
                "schema": {"$ref": "#/components/schemas/CategoriesListResponse"} 
              } 
            } 
          } 
        } 
      }, 
      "post": { 
        "summary": "Criar categoria", 
        "description": "Cria nova categoria de curso.\n\n**Segurança:** Validação de acesso controlada pelo API Gateway", 
        "tags": ["categorias"], 
        "security": [{"bearerAuth":[]}], 
        "requestBody": { 
          "required": true, 
          "content": { 
            "application/json": { 
              "schema": { 
                "type": "object", 
                "required": ["codigo","nome","departamento_codigo"], 
                "properties": { 
                  "codigo": { "type": "string", "description": "Código único da categoria" }, 
                  "nome": { "type": "string", "description": "Nome da categoria" }, 
                  "descricao": { "type": "string", "description": "Descrição da categoria" }, 
                  "departamento_codigo": { "type": "string", "description": "Código do departamento associado" } 
                } 
              } 
            } 
          } 
        }, 
        "responses": { 
          "201": { 
            "description": "Categoria criada com sucesso", 
            "content": { 
              "application/json": { 
                "schema": {"$ref": "#/components/schemas/CategoryResponse"} 
              } 
            } 
          }, 
          "400": { 
            "description": "Dados inválidos", 
            "content": { 
              "application/json": { 
                "schema": {"$ref": "#/components/schemas/ErrorResponse"} 
              } 
            } 
          }, 
          "401": { 
            "description": "Token de autorização necessário", 
            "content": { 
              "application/json": { 
                "schema": {"$ref": "#/components/schemas/ErrorResponse"} 
              } 
            } 
          }, 
          "409": { 
            "description": "Categoria já existe", 
            "content": { 
              "application/json": { 
                "schema": {"$ref": "#/components/schemas/ErrorResponse"},
                "example": {
                  "erro": "categoria_ja_existe",
                  "mensagem": "Já existe uma categoria com este código"
                }
              } 
            } 
          } 
        } 
      } 
    },
    "/courses/v1/categorias/{codigo}": {
      "get": { 
        "summary": "Obter categoria", 
        "tags": ["categorias"], 
        "parameters": [{ "name": "codigo", "in": "path", "required": true, "schema": { "type": "string" } }], 
        "responses": { 
          "200": { 
            "description": "Dados da categoria", 
            "content": { 
              "application/json": { 
                "schema": {"$ref": "#/components/schemas/CategoryResponse"} 
              } 
            } 
          }, 
          "404": { 
            "description": "Categoria não encontrada", 
            "content": { 
              "application/json": { 
                "schema": {"$ref": "#/components/schemas/ErrorResponse"},
                "example": {
                  "erro": "categoria_nao_encontrada",
                  "mensagem": "Categoria não encontrada"
                }
              } 
            } 
          } 
        } 
      },
      "put": { 
        "summary": "Atualizar categoria", 
        "description": "Atualiza dados de uma categoria existente.\n\n**Segurança:** Validação de acesso controlada pelo API Gateway", 
        "tags": ["categorias"], 
        "security": [{"bearerAuth":[]}], 
        "parameters": [{ "name": "codigo", "in": "path", "required": true, "schema": { "type": "string" } }], 
        "requestBody": { 
          "required": true, 
          "content": { 
            "application/json": { 
              "schema": { 
                "type": "object", 
                "properties": { 
                  "nome": { "type": "string", "description": "Nome da categoria" }, 
                  "descricao": { "type": "string", "description": "Descrição da categoria" }, 
                  "departamento_codigo": { "type": "string", "description": "Código do departamento associado" } 
                } 
              } 
            } 
          } 
        }, 
        "responses": { 
          "200": { 
            "description": "Categoria atualizada com sucesso", 
            "content": { 
              "application/json": { 
                "schema": {"$ref": "#/components/schemas/CategoryResponse"} 
              } 
            } 
          }, 
          "400": { 
            "description": "Dados inválidos", 
            "content": { 
              "application/json": { 
                "schema": {"$ref": "#/components/schemas/ErrorResponse"} 
              } 
            } 
          }, 
          "401": { 
            "description": "Token de autorização necessário", 
            "content": { 
              "application/json": { 
                "schema": {"$ref": "#/components/schemas/ErrorResponse"} 
              } 
            } 
          }, 
          "404": { 
            "description": "Categoria não encontrada", 
            "content": { 
              "application/json": { 
                "schema": {"$ref": "#/components/schemas/ErrorResponse"} 
              } 
            } 
          } 
        } 
      },
      "delete": { 
        "summary": "Excluir categoria", 
        "description": "Exclui uma categoria se não houver cursos associados.\n\n**Segurança:** Validação de acesso controlada pelo API Gateway", 
        "tags": ["categorias"], 
        "security": [{"bearerAuth":[]}], 
        "parameters": [{ "name": "codigo", "in": "path", "required": true, "schema": { "type": "string" } }], 
        "responses": { 
          "200": { 
            "description": "Categoria excluída com sucesso", 
            "content": { 
              "application/json": { 
                "schema": {"$ref": "#/components/schemas/SuccessResponse"},
                "example": {
                  "mensagem": "Categoria excluída com sucesso"
                }
              } 
            } 
          }, 
          "401": { 
            "description": "Token de autorização necessário", 
            "content": { 
              "application/json": { 
                "schema": {"$ref": "#/components/schemas/ErrorResponse"} 
              } 
            } 
          }, 
          "404": { 
            "description": "Categoria não encontrada", 
            "content": { 
              "application/json": { 
                "schema": {"$ref": "#/components/schemas/ErrorResponse"} 
              } 
            } 
          }, 
          "409": { 
            "description": "Categoria possui cursos associados", 
            "content": { 
              "application/json": { 
                "schema": {"$ref": "#/components/schemas/ErrorResponse"},
                "example": {
                  "erro": "categoria_possui_cursos",
                  "mensagem": "Não é possível excluir categoria que possui cursos associados"
                }
              } 
            } 
          } 
        } 
      }
    },
    "/courses/v1": { 
      "get": { 
        "summary": "Listar todos os cursos", 
        "description": "Endpoint unificado que retorna cursos com filtros opcionais:\n• Retorna TODOS os cursos (ativos e inativos) por padrão\n• Suporte a filtros de busca (q, categoria, instrutor, etc.)\n• Filtragem por status ativo opcional via parâmetro\n• Filtragem por departamento e categoria\n\n**⚠️ Validação de acesso:** Feita no API Gateway, não no service\n**✅ Filtros disponíveis:** Todos funcionam independente de role\n**🔒 Segurança:** Role-based access controlado pela infraestrutura",
        "tags": ["courses", "catalog"], 
        "security": [{"bearerAuth":[]}],
        "parameters": [
          { "name": "q", "in": "query", "schema": { "type": "string" }, "description": "Busca por título ou descrição" },
          { "name": "categoria", "in": "query", "schema": { "type": "string" }, "description": "Filtrar por ID da categoria" },
          { "name": "categoria_id", "in": "query", "schema": { "type": "string" }, "description": "Alias para categoria (compatibilidade)" },
          { "name": "instrutor", "in": "query", "schema": { "type": "string" }, "description": "Filtrar por ID do instrutor" },
          { "name": "nivel", "in": "query", "schema": { "type": "string", "enum": ["Iniciante", "Intermediário", "Avançado"] }, "description": "Filtrar por nível de dificuldade" },
          { "name": "duracaoMax", "in": "query", "schema": { "type": "integer" }, "description": "Duração máxima em horas" },
          { "name": "departamento", "in": "query", "schema": { "type": "string" }, "description": "Código do departamento para filtrar cursos" },
          { "name": "ativo", "in": "query", "schema": { "type": "boolean" }, "description": "Filtrar por status ativo (true) ou inativo (false)" }
        ],
        "responses": { 
          "200": { 
            "description": "Lista de cursos com filtros aplicados",
            "content": {
              "application/json": {
                "schema": {"$ref": "#/components/schemas/CoursesListResponse"}
              }
            }
          }, 
          "400": { 
            "description": "Parâmetros de filtro inválidos", 
            "content": { 
              "application/json": { 
                "schema": {"$ref": "#/components/schemas/ErrorResponse"} 
              } 
            } 
          },
          "401": { 
            "description": "Token de autorização necessário", 
            "content": { 
              "application/json": { 
                "schema": {"$ref": "#/components/schemas/ErrorResponse"} 
              } 
            } 
          }
        } 
      },
      "post": { 
        "summary": "Criar curso", 
        "tags": ["courses"], 
        "security": [{"bearerAuth":[]}], 
        "requestBody": { 
          "required": true, 
          "content": { 
            "application/json": { 
              "schema": { 
                "type": "object", 
                "required": ["codigo", "titulo"], 
                "properties": { 
                  "codigo": { "type": "string" }, 
                  "titulo": { "type": "string" }, 
                  "descricao": { "type": "string" }, 
                  "categoria_id": { "type": "string" }, 
                  "instrutor_id": { "type": "string", "format": "uuid" }, 
                  "duracao_estimada": { "type": "integer", "description": "Duração em horas" }, 
                  "xp_oferecido": { "type": "integer" }, 
                  "nivel_dificuldade": { "type": "string", "enum": ["Iniciante", "Intermediário", "Avançado"] }, 
                  "pre_requisitos": { "type": "array", "items": { "type": "string" } } 
                } 
              } 
            } 
          } 
        }, 
        "responses": { 
          "201": { 
            "description": "Curso criado com sucesso", 
            "content": { 
              "application/json": { 
                "schema": {"$ref": "#/components/schemas/CourseResponse"} 
              } 
            } 
          }, 
          "400": { 
            "description": "Dados inválidos", 
            "content": { 
              "application/json": { 
                "schema": {"$ref": "#/components/schemas/ErrorResponse"} 
              } 
            } 
          }, 
          "409": { 
            "description": "Curso já existe", 
            "content": { 
              "application/json": { 
                "schema": {"$ref": "#/components/schemas/ErrorResponse"},
                "example": {
                  "erro": "codigo_duplicado",
                  "mensagem": "Já existe um curso com este código"
                }
              } 
            } 
          } 
        } 
      } 
    },
    "/courses/v1/categoria/{categoriaId}": {
      "get": {
        "summary": "Listar cursos por categoria",
        "tags": ["courses"],
        "parameters": [{ "name": "categoriaId", "in": "path", "required": true, "schema": { "type": "string" } }],
        "responses": {
          "200": {
            "description": "Lista de cursos da categoria",
            "content": {
              "application/json": {
                "schema": {"$ref": "#/components/schemas/CoursesListResponse"}
              }
            }
          },
          "404": { 
            "description": "Categoria não encontrada", 
            "content": { 
              "application/json": { 
                "schema": {"$ref": "#/components/schemas/ErrorResponse"} 
              } 
            } 
          }
        }
      }
    },
    "/courses/v1/departamento/{departmentCode}": {
      "get": {
        "summary": "Listar cursos por departamento",
        "description": "Retorna todos os cursos (ativos e inativos) de um departamento específico.\n\n**Segurança:** Validação de acesso controlada pelo API Gateway",
        "tags": ["courses"],
        "security": [{"bearerAuth":[]}],
        "parameters": [{ "name": "departmentCode", "in": "path", "required": true, "schema": { "type": "string" } }],
        "responses": {
          "200": {
            "description": "Lista de cursos do departamento",
            "content": {
              "application/json": {
                "schema": {"$ref": "#/components/schemas/CoursesListResponse"}
              }
            }
          },
          "401": { 
            "description": "Token de autorização necessário", 
            "content": { 
              "application/json": { 
                "schema": {"$ref": "#/components/schemas/ErrorResponse"} 
              } 
            } 
          },
          "404": { 
            "description": "Departamento não encontrado", 
            "content": { 
              "application/json": { 
                "schema": {"$ref": "#/components/schemas/ErrorResponse"} 
              } 
            } 
          }
        }
      }
    },
    "/courses/v1/{codigo}": { 
      "get": { 
        "summary": "Obter curso com estatísticas e módulos", 
        "description": "Retorna dados completos do curso incluindo:\n• Informações básicas do curso\n• Dados do instrutor (nome completo)\n• Estatísticas de progresso (inscrições, conclusões, taxa de conclusão)\n• Lista completa de módulos ordenados\n• Pré-requisitos do curso", 
        "tags": ["courses"], 
        "parameters": [{ "name": "codigo", "in": "path", "required": true, "schema": { "type": "string" } }], 
        "responses": { 
          "200": { 
            "description": "Dados completos do curso",
            "content": {
              "application/json": {
                "schema": {"$ref": "#/components/schemas/CourseResponse"}
              }
            }
          }, 
          "404": { 
            "description": "Curso não encontrado", 
            "content": { 
              "application/json": { 
                "schema": {"$ref": "#/components/schemas/ErrorResponse"},
                "example": {
                  "erro": "curso_nao_encontrado",
                  "mensagem": "Curso não encontrado"
                }
              } 
            } 
          } 
        } 
      }, 
      "patch": { 
        "summary": "Atualizar curso", 
        "description": "Atualiza curso com validação de regras de negócio:\n• ❌ Não permite edição se houver inscrições ativas\n• ✅ Validação de acesso controlada pelo API Gateway", 
        "tags": ["courses"], 
        "security": [{"bearerAuth":[]}], 
        "parameters": [{ "name": "codigo", "in": "path", "required": true, "schema": { "type": "string" } }], 
        "requestBody": { 
          "required": true, 
          "content": { 
            "application/json": { 
              "schema": { 
                "type": "object", 
                "properties": { 
                  "titulo": { "type": "string" }, 
                  "descricao": { "type": "string" }, 
                  "categoria_id": { "type": "string" }, 
                  "duracao_estimada": { "type": "integer" }, 
                  "xp_oferecido": { "type": "integer" }, 
                  "nivel_dificuldade": { "type": "string", "enum": ["Iniciante", "Intermediário", "Avançado"] } 
                } 
              } 
            } 
          } 
        }, 
        "responses": { 
          "200": { 
            "description": "Curso atualizado com sucesso", 
            "content": { 
              "application/json": { 
                "schema": {"$ref": "#/components/schemas/CourseResponse"} 
              } 
            } 
          }, 
          "400": { 
            "description": "Dados inválidos", 
            "content": { 
              "application/json": { 
                "schema": {"$ref": "#/components/schemas/ErrorResponse"} 
              } 
            } 
          }, 
          "403": { 
            "description": "Não é possível editar curso com inscrições ativas", 
            "content": { 
              "application/json": { 
                "schema": {"$ref": "#/components/schemas/ErrorResponse"},
                "example": {
                  "erro": "curso_com_inscricoes_ativas",
                  "mensagem": "Não é possível editar curso com inscrições ativas"
                }
              } 
            } 
          }, 
          "404": { 
            "description": "Curso não encontrado", 
            "content": { 
              "application/json": { 
                "schema": {"$ref": "#/components/schemas/ErrorResponse"} 
              } 
            } 
          } 
        } 
      },
      "delete": { 
        "summary": "Deletar curso", 
        "description": "Desativa o curso em vez de deletar fisicamente.\n\n**Segurança:** Validação de acesso controlada pelo API Gateway", 
        "tags": ["courses"], 
        "security": [{"bearerAuth":[]}], 
        "parameters": [{ "name": "codigo", "in": "path", "required": true, "schema": { "type": "string" } }], 
        "responses": { 
          "200": { 
            "description": "Curso desativado com sucesso", 
            "content": { 
              "application/json": { 
                "schema": {
                  "type": "object",
                  "properties": {
                    "inactivated": { "type": "boolean" },
                    "mensagem": { "type": "string" }
                  }
                },
                "example": {
                  "inactivated": true,
                  "mensagem": "Curso desativado com sucesso"
                }
              } 
            } 
          }, 
          "401": { 
            "description": "Token de autorização necessário", 
            "content": { 
              "application/json": { 
                "schema": {"$ref": "#/components/schemas/ErrorResponse"} 
              } 
            } 
          }, 
          "404": { 
            "description": "Curso não encontrado", 
            "content": { 
              "application/json": { 
                "schema": {"$ref": "#/components/schemas/ErrorResponse"} 
              } 
            } 
          } 
        } 
      }
    },
    "/courses/v1/{codigo}/duplicar": { 
      "post": { 
        "summary": "Duplicar curso", 
        "description": "Duplica um curso existente.\n\n**Segurança:** Validação de acesso controlada pelo API Gateway", 
        "tags": ["courses"], 
        "security": [{"bearerAuth":[]}], 
        "parameters": [{ "name": "codigo", "in": "path", "required": true, "schema": { "type": "string" } }], 
        "responses": { 
          "201": { 
            "description": "Curso duplicado com sucesso", 
            "content": { 
              "application/json": { 
                "schema": {"$ref": "#/components/schemas/DuplicateCourseResponse"} 
              } 
            } 
          }, 
          "401": { 
            "description": "Token de autorização necessário", 
            "content": { 
              "application/json": { 
                "schema": {"$ref": "#/components/schemas/ErrorResponse"} 
              } 
            } 
          }, 
          "404": { 
            "description": "Curso não encontrado", 
            "content": { 
              "application/json": { 
                "schema": {"$ref": "#/components/schemas/ErrorResponse"} 
              } 
            } 
          }, 
          "500": { 
            "description": "Erro interno ao duplicar curso", 
            "content": { 
              "application/json": { 
                "schema": {"$ref": "#/components/schemas/ErrorResponse"} 
              } 
            } 
          } 
        } 
      } 
    },
    "/courses/v1/{codigo}/active": { 
      "patch": { 
        "summary": "Alterar status ativo do curso", 
        "tags": ["courses"], 
        "security": [{"bearerAuth":[]}],
        "parameters": [{ "name": "codigo", "in": "path", "required": true, "schema": { "type": "string" } }], 
        "requestBody": { 
          "required": true, 
          "content": { 
            "application/json": { 
              "schema": { 
                "type": "object", 
                "required": ["active"], 
                "properties": { 
                  "active": { "type": "boolean" } 
                } 
              } 
            } 
          } 
        }, 
        "responses": { 
          "200": { 
            "description": "Status atualizado com sucesso", 
            "content": { 
              "application/json": { 
                "schema": {"$ref": "#/components/schemas/CourseResponse"} 
              } 
            } 
          }, 
          "400": { 
            "description": "Dados inválidos", 
            "content": { 
              "application/json": { 
                "schema": {"$ref": "#/components/schemas/ErrorResponse"} 
              } 
            } 
          }, 
          "404": { 
            "description": "Curso não encontrado", 
            "content": { 
              "application/json": { 
                "schema": {"$ref": "#/components/schemas/ErrorResponse"} 
              } 
            } 
          } 
        } 
      } 
    },
    "/courses/v1/{codigo}/modulos": { 
      "post": { 
        "summary": "Adicionar módulo ao curso", 
        "tags": ["modules"], 
        "security": [{"bearerAuth":[]}],
        "parameters": [{ "name": "codigo", "in": "path", "required": true, "schema": { "type": "string" } }], 
        "requestBody": { 
          "required": true, 
          "content": { 
            "application/json": { 
              "schema": { 
                "type": "object", 
                "required": ["titulo"], 
                "properties": { 
                  "titulo": { "type": "string" }, 
                  "conteudo": { "type": "string" }, 
                  "ordem": { "type": "integer" }, 
                  "obrigatorio": { "type": "boolean", "default": true }, 
                  "xp": { "type": "integer", "default": 0 }, 
                  "tipo_conteudo": { "type": "string" } 
                } 
              } 
            } 
          } 
        }, 
        "responses": { 
          "201": { 
            "description": "Módulo criado com sucesso", 
            "content": { 
              "application/json": { 
                "schema": {"$ref": "#/components/schemas/ModuleResponse"} 
              } 
            } 
          }, 
          "400": { 
            "description": "Dados inválidos", 
            "content": { 
              "application/json": { 
                "schema": {"$ref": "#/components/schemas/ErrorResponse"} 
              } 
            } 
          }, 
          "404": { 
            "description": "Curso não encontrado", 
            "content": { 
              "application/json": { 
                "schema": {"$ref": "#/components/schemas/ErrorResponse"} 
              } 
            } 
          } 
        } 
      }, 
      "get": { 
        "summary": "Listar módulos do curso", 
        "tags": ["modules"], 
        "parameters": [{ "name": "codigo", "in": "path", "required": true, "schema": { "type": "string" } }], 
        "responses": { 
          "200": { 
            "description": "Lista completa de módulos ordenados por ordem",
            "content": {
              "application/json": {
                "schema": {"$ref": "#/components/schemas/ModulesListResponse"}
              }
            }
          }, 
          "404": { 
            "description": "Curso não encontrado", 
            "content": { 
              "application/json": { 
                "schema": {"$ref": "#/components/schemas/ErrorResponse"} 
              } 
            } 
          } 
        } 
      } 
    },
    "/courses/v1/{codigo}/modulos/{moduloId}": {
      "patch": { 
        "summary": "Atualizar módulo", 
        "tags": ["modules"], 
        "security": [{"bearerAuth":[]}],
        "parameters": [
          { "name": "codigo", "in": "path", "required": true, "schema": { "type": "string" } }, 
          { "name": "moduloId", "in": "path", "required": true, "schema": { "type": "string", "format": "uuid" } }
        ], 
        "requestBody": { 
          "required": true, 
          "content": { 
            "application/json": { 
              "schema": { 
                "type": "object", 
                "properties": { 
                  "titulo": { "type": "string" }, 
                  "conteudo": { "type": "string" }, 
                  "ordem": { "type": "integer" }, 
                  "obrigatorio": { "type": "boolean" }, 
                  "xp": { "type": "integer" }, 
                  "tipo_conteudo": { "type": "string" } 
                } 
              } 
            } 
          } 
        }, 
        "responses": { 
          "200": { 
            "description": "Módulo atualizado com sucesso", 
            "content": { 
              "application/json": { 
                "schema": {"$ref": "#/components/schemas/ModuleResponse"} 
              } 
            } 
          }, 
          "400": { 
            "description": "Dados inválidos", 
            "content": { 
              "application/json": { 
                "schema": {"$ref": "#/components/schemas/ErrorResponse"} 
              } 
            } 
          }, 
          "404": { 
            "description": "Módulo não encontrado", 
            "content": { 
              "application/json": { 
                "schema": {"$ref": "#/components/schemas/ErrorResponse"} 
              } 
            } 
          } 
        } 
      }
    },
    "/courses/v1/modulos/{moduloId}/materiais": { 
      "post": { "summary": "Upload de material para módulo", "description": "📁 Faz upload direto via Base64. Sistema detecta automaticamente tipo, tamanho e salva no storage.\n\n🎯 **Como usar no Frontend:**\n1. Converta arquivo para Base64\n2. Envie JSON com nome_arquivo e base64\n3. Sistema detecta tipo automaticamente\n\n📋 **Exemplo de conversão:**\n```javascript\nfunction uploadFile(file, moduloId) {\n  const reader = new FileReader();\n  reader.onload = () => {\n    const base64 = reader.result.split(',')[1];\n    fetch(`/courses/v1/modulos/${moduloId}/materiais`, {\n      method: 'POST',\n      headers: { 'Content-Type': 'application/json' },\n      body: JSON.stringify({\n        nome_arquivo: file.name,\n        base64: base64\n      })\n    });\n  };\n  reader.readAsDataURL(file);\n}\n```", "tags": ["materials"], "parameters": [{ "name": "moduloId", "in": "path", "required": true, "schema": { "type": "string", "format": "uuid" } }], "requestBody": { "required": true, "content": { "application/json": { "schema": { "type": "object", "required": ["nome_arquivo", "base64"], "properties": { "nome_arquivo": { "type": "string", "description": "Nome do arquivo com extensão", "example": "apostila.pdf" }, "base64": { "type": "string", "description": "Conteúdo do arquivo em Base64 (sem prefixo data:)", "example": "JVBERi0xLjQKJcfs..." } } }, "examples": { "pdf_upload": { "summary": "Upload de PDF", "value": { "nome_arquivo": "apostila-javascript.pdf", "base64": "JVBERi0xLjQKJeLjz..." } }, "image_upload": { "summary": "Upload de Imagem", "value": { "nome_arquivo": "diagrama.png", "base64": "iVBORw0KGgoAAAANS..." } }, "video_upload": { "summary": "Upload de Vídeo", "value": { "nome_arquivo": "aula01.mp4", "base64": "AAAAIGZ0eXBpc29t..." } } } } } },         "responses": { 
          "201": { 
            "description": "Material enviado com sucesso", 
            "content": { 
              "application/json": { 
                "schema": {"$ref": "#/components/schemas/MaterialResponse"}
              } 
            } 
          }, 
          "400": { 
            "description": "Arquivo inválido ou tipo não suportado", 
            "content": { 
              "application/json": { 
                "schema": {"$ref": "#/components/schemas/ErrorResponse"},
                "examples": {
                  "base64_obrigatorio": {
                    "summary": "Base64 obrigatório",
                    "value": {
                      "erro": "base64_obrigatorio",
                      "mensagem": "Campo base64 é obrigatório para upload"
                    }
                  },
                  "tipo_invalido": {
                    "summary": "Tipo de arquivo não suportado",
                    "value": {
                      "erro": "tipo_invalido",
                      "mensagem": "Tipo de arquivo não suportado"
                    }
                  }
                }
              } 
            } 
          }, 
          "413": { 
            "description": "Arquivo muito grande (máximo 50MB)", 
            "content": { 
              "application/json": { 
                "schema": {"$ref": "#/components/schemas/ErrorResponse"} 
              } 
            } 
          } 
        } }, 
      "get": { 
        "summary": "Listar materiais do módulo", 
        "tags": ["materials"], 
        "security": [{"bearerAuth":[]}],
        "parameters": [{ "name": "moduloId", "in": "path", "required": true, "schema": { "type": "string", "format": "uuid" } }], 
        "responses": { 
          "200": { 
            "description": "Lista de materiais com URLs de download", 
            "content": { 
              "application/json": { 
                "schema": {"$ref": "#/components/schemas/MaterialsListResponse"} 
              } 
            } 
          }, 
          "404": { 
            "description": "Módulo não encontrado", 
            "content": { 
              "application/json": { 
                "schema": {"$ref": "#/components/schemas/ErrorResponse"} 
              } 
            } 
          } 
        } 
      } 
    }
  }
} as const;