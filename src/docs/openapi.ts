export const openapiSpec = {
  "openapi": "3.0.3",
  "info": { 
    "title": "Course Service API", 
    "version": "1.1.0",
    "description": "API completa para gestão de cursos, módulos e materiais com upload automático"
  },
  "paths": {
    "/courses/v1/categorias": { 
      "get": { "summary": "Listar categorias", "tags": ["categorias"], "responses": { "200": { "description": "Lista de categorias" } } }, 
      "post": { "summary": "Criar categoria", "tags": ["categorias"], "security": [{"bearerAuth":[]}], "requestBody": { "required": true, "content": { "application/json": { "schema": { "type": "object", "required": ["codigo","nome","departamento_codigo"], "properties": { "codigo": { "type": "string", "description": "Código único da categoria" }, "nome": { "type": "string", "description": "Nome da categoria" }, "descricao": { "type": "string", "description": "Descrição da categoria" }, "departamento_codigo": { "type": "string", "description": "Código do departamento associado" } } } } } }, "responses": { "201": { "description": "Categoria criada", "content": { "application/json": { "schema": { "type": "object", "properties": { "codigo": { "type": "string" }, "nome": { "type": "string" }, "descricao": { "type": "string" }, "departamento_codigo": { "type": "string" }, "ativo": { "type": "boolean" }, "criado_em": { "type": "string", "format": "date-time" } } } } } }, "400": { "description": "Dados inválidos" }, "403": { "description": "Acesso negado - apenas administradores" }, "409": { "description": "Código duplicado" } } } 
    },
    "/courses/v1/categorias/{codigo}": {
      "get": { "summary": "Obter categoria", "tags": ["categorias"], "parameters": [{ "name": "codigo", "in": "path", "required": true, "schema": { "type": "string" } }], "responses": { "200": { "description": "Dados da categoria", "content": { "application/json": { "schema": { "type": "object", "properties": { "codigo": { "type": "string" }, "nome": { "type": "string" }, "descricao": { "type": "string" }, "departamento_codigo": { "type": "string" }, "ativo": { "type": "boolean" }, "criado_em": { "type": "string", "format": "date-time" } } } } } }, "404": { "description": "Categoria não encontrada" } } },
      "put": { "summary": "Atualizar categoria", "tags": ["categorias"], "security": [{"bearerAuth":[]}], "parameters": [{ "name": "codigo", "in": "path", "required": true, "schema": { "type": "string" } }], "requestBody": { "required": true, "content": { "application/json": { "schema": { "type": "object", "properties": { "nome": { "type": "string", "description": "Nome da categoria" }, "descricao": { "type": "string", "description": "Descrição da categoria" }, "departamento_codigo": { "type": "string", "description": "Código do departamento associado" } } } } } }, "responses": { "200": { "description": "Categoria atualizada", "content": { "application/json": { "schema": { "type": "object", "properties": { "codigo": { "type": "string" }, "nome": { "type": "string" }, "descricao": { "type": "string" }, "departamento_codigo": { "type": "string" }, "ativo": { "type": "boolean" }, "criado_em": { "type": "string", "format": "date-time" } } } } } }, "400": { "description": "Dados inválidos" }, "403": { "description": "Acesso negado - apenas administradores" }, "404": { "description": "Categoria não encontrada" } } },
      "delete": { "summary": "Excluir categoria", "tags": ["categorias"], "security": [{"bearerAuth":[]}], "parameters": [{ "name": "codigo", "in": "path", "required": true, "schema": { "type": "string" } }], "responses": { "204": { "description": "Categoria excluída com sucesso" }, "403": { "description": "Acesso negado - apenas administradores" }, "404": { "description": "Categoria não encontrada" }, "409": { "description": "Categoria possui cursos associados" } } }
    },
    "/courses/v1": { 
      "get": { 
        "summary": "Listar cursos / Catálogo público", 
        "description": "Endpoint unificado que serve como:\n• Lista completa de cursos (com role-based filtering)\n• Catálogo público de cursos para alunos\n• Suporte a filtros de busca (q, categoria, instrutor, etc.)\n\n**Regras por Role:**\n• ADMIN: Vê todos os cursos com filtros opcionais\n• GERENTE: Pode ver cursos de qualquer departamento (frontend filtra por departamento do usuário)\n• INSTRUTOR: Vê apenas seus próprios cursos\n• ALUNO: Vê apenas cursos ativos (catálogo público) com filtros de busca\n\n**Importante:** A validação departamental para GERENTE é feita no frontend, não no backend.",
        "tags": ["courses", "catalog"], 
        "security": [{"bearerAuth":[]}],
        "parameters": [
          { "name": "q", "in": "query", "schema": { "type": "string" }, "description": "Busca por título ou descrição" },
          { "name": "categoria", "in": "query", "schema": { "type": "string" }, "description": "Filtrar por ID da categoria" },
          { "name": "categoria_id", "in": "query", "schema": { "type": "string" }, "description": "Alias para categoria (compatibilidade)" },
          { "name": "instrutor", "in": "query", "schema": { "type": "string" }, "description": "Filtrar por ID do instrutor" },
          { "name": "nivel", "in": "query", "schema": { "type": "string", "enum": ["Básico", "Intermediário", "Avançado"] }, "description": "Filtrar por nível de dificuldade" },
          { "name": "duracaoMax", "in": "query", "schema": { "type": "integer" }, "description": "Duração máxima em horas" },
          { "name": "departamento", "in": "query", "schema": { "type": "string" }, "description": "Código do departamento (GERENTE pode filtrar, mas frontend valida)" },
          { "name": "ativo", "in": "query", "schema": { "type": "boolean" }, "description": "Filtrar por status ativo (para INSTRUTOR)" }
        ],
        "responses": { 
          "200": { 
            "description": "Lista de cursos filtrada por role e parâmetros de busca",
            "content": {
              "application/json": {
                "schema": {
                  "type": "object",
                  "properties": {
                    "items": {
                      "type": "array",
                      "items": {
                        "type": "object",
                        "properties": {
                          "codigo": { "type": "string" },
                          "titulo": { "type": "string" },
                          "descricao": { "type": "string" },
                          "categoria_id": { "type": "string" },
                          "instrutor_id": { "type": "string" },
                          "ativo": { "type": "boolean" },
                          "duracao_estimada": { "type": "integer" },
                          "xp_oferecido": { "type": "integer" },
                          "nivel_dificuldade": { "type": "string" },
                          "departamento_codigo": { "type": "string" }
                        }
                      }
                    },
                    "total": { "type": "integer" }
                  }
                }
              }
            }
          }, 
          "400": { "description": "Parâmetros inválidos" },
          "401": { "description": "Não autenticado" },
          "403": { "description": "Acesso negado" }
        } 
      },
      "post": { "summary": "Criar curso", "tags": ["courses"], "security": [{"bearerAuth":[]}], "requestBody": { "required": true, "content": { "application/json": { "schema": { "type": "object", "required": ["codigo", "titulo"], "properties": { "codigo": { "type": "string" }, "titulo": { "type": "string" }, "descricao": { "type": "string" }, "categoria_id": { "type": "string" }, "instrutor_id": { "type": "string", "format": "uuid" }, "duracao_estimada": { "type": "integer", "description": "Duração em horas" }, "xp_oferecido": { "type": "integer" }, "nivel_dificuldade": { "type": "string", "enum": ["Básico", "Intermediário", "Avançado"] }, "pre_requisitos": { "type": "array", "items": { "type": "string" } } } } } } }, "responses": { "201": { "description": "Curso criado" }, "409": { "description": "Código duplicado" } } } 
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
                "schema": {
                  "type": "object",
                  "properties": {
                    "items": {
                      "type": "array",
                      "items": {
                        "type": "object",
                        "properties": {
                          "codigo": { "type": "string" },
                          "titulo": { "type": "string" },
                          "categoria_nome": { "type": "string" },
                          "departamento_codigo": { "type": "string" }
                        }
                      }
                    },
                    "total": { "type": "integer" }
                  }
                }
              }
            }
          },
          "404": { "description": "Categoria não encontrada" }
        }
      }
    },
    "/courses/v1/departamento/{departmentCode}": {
      "get": {
        "summary": "Listar cursos por departamento",
        "tags": ["courses"],
        "security": [{"bearerAuth":[]}],
        "parameters": [{ "name": "departmentCode", "in": "path", "required": true, "schema": { "type": "string" } }],
        "responses": {
          "200": {
            "description": "Lista de cursos do departamento",
            "content": {
              "application/json": {
                "schema": {
                  "type": "object",
                  "properties": {
                    "items": {
                      "type": "array",
                      "items": {
                        "type": "object",
                        "properties": {
                          "codigo": { "type": "string" },
                          "titulo": { "type": "string" },
                          "categoria_nome": { "type": "string" },
                          "departamento_codigo": { "type": "string" }
                        }
                      }
                    },
                    "total": { "type": "integer" }
                  }
                }
              }
            }
          },
          "403": { "description": "Acesso negado" },
          "404": { "description": "Departamento não encontrado" }
        }
      }
    },
    "/courses/v1/{codigo}": { 
      "get": { "summary": "Obter curso", "tags": ["courses"], "parameters": [{ "name": "codigo", "in": "path", "required": true, "schema": { "type": "string" } }], "responses": { "200": { "description": "Dados do curso" }, "404": { "description": "Curso não encontrado" } } }, 
      "patch": { "summary": "Atualizar curso", "description": "Atualiza curso com validação de regras de negócio baseadas no role do usuário", "tags": ["courses"], "security": [{"bearerAuth":[]}], "parameters": [{ "name": "codigo", "in": "path", "required": true, "schema": { "type": "string" } }], "requestBody": { "required": true, "content": { "application/json": { "schema": { "type": "object", "properties": { "titulo": { "type": "string" }, "descricao": { "type": "string" }, "categoria_id": { "type": "string" }, "duracao_estimada": { "type": "integer" }, "xp_oferecido": { "type": "integer" }, "nivel_dificuldade": { "type": "string", "enum": ["Básico", "Intermediário", "Avançado"] } } } } } }, "responses": { "200": { "description": "Curso atualizado" }, "403": { "description": "Não é possível editar curso com inscrições ativas" }, "404": { "description": "Curso não encontrado" } } },
      "delete": { "summary": "Deletar curso", "description": "Apenas ADMINs podem deletar cursos. Curso é desativado em vez de deletado fisicamente.", "tags": ["courses"], "security": [{"bearerAuth":[]}], "parameters": [{ "name": "codigo", "in": "path", "required": true, "schema": { "type": "string" } }], "responses": { "200": { "description": "Curso deletado com sucesso", "content": { "application/json": { "schema": { "type": "object", "properties": { "deleted": { "type": "boolean" } } } } } }, "403": { "description": "Apenas administradores podem deletar cursos" }, "404": { "description": "Curso não encontrado" } } }
    },
    "/courses/v1/{codigo}/duplicar": { 
      "post": { "summary": "Duplicar curso", "description": "Duplica um curso existente. Disponível para ADMIN, GERENTE e INSTRUTOR.", "tags": ["courses"], "security": [{"bearerAuth":[]}], "parameters": [{ "name": "codigo", "in": "path", "required": true, "schema": { "type": "string" } }], "responses": { "201": { "description": "Curso duplicado", "content": { "application/json": { "schema": { "type": "object", "properties": { "codigo_original": { "type": "string" }, "codigo_copia": { "type": "string" } } } } } }, "403": { "description": "Sem permissão para duplicar cursos" }, "404": { "description": "Curso não encontrado" } } } 
    },
    "/courses/v1/{codigo}/active": { 
      "patch": { "summary": "Alterar status ativo do curso", "tags": ["courses"], "parameters": [{ "name": "codigo", "in": "path", "required": true, "schema": { "type": "string" } }], "requestBody": { "required": true, "content": { "application/json": { "schema": { "type": "object", "required": ["active"], "properties": { "active": { "type": "boolean" } } } } } }, "responses": { "200": { "description": "Status atualizado" }, "404": { "description": "Curso não encontrado" } } } 
    },
    "/courses/v1/{codigo}/modulos": { 
      "post": { "summary": "Adicionar módulo ao curso", "tags": ["modules"], "parameters": [{ "name": "codigo", "in": "path", "required": true, "schema": { "type": "string" } }], "requestBody": { "required": true, "content": { "application/json": { "schema": { "type": "object", "required": ["titulo"], "properties": { "titulo": { "type": "string" }, "conteudo": { "type": "string" }, "ordem": { "type": "integer" }, "obrigatorio": { "type": "boolean", "default": true }, "xp": { "type": "integer", "default": 0 }, "tipo_conteudo": { "type": "string" } } } } } }, "responses": { "201": { "description": "Módulo criado" }, "404": { "description": "Curso não encontrado" } } }, 
      "get": { "summary": "Listar módulos do curso", "tags": ["modules"], "parameters": [{ "name": "codigo", "in": "path", "required": true, "schema": { "type": "string" } }], "responses": { "200": { "description": "Lista de módulos" }, "404": { "description": "Curso não encontrado" } } } 
    },
    "/courses/v1/{codigo}/modulos/{moduloId}": {
      "patch": { "summary": "Atualizar módulo", "tags": ["modules"], "parameters": [{ "name": "codigo", "in": "path", "required": true, "schema": { "type": "string" } }, { "name": "moduloId", "in": "path", "required": true, "schema": { "type": "string", "format": "uuid" } }], "requestBody": { "required": true, "content": { "application/json": { "schema": { "type": "object", "properties": { "titulo": { "type": "string" }, "conteudo": { "type": "string" }, "ordem": { "type": "integer" }, "obrigatorio": { "type": "boolean" }, "xp": { "type": "integer" }, "tipo_conteudo": { "type": "string" } } } } } }, "responses": { "200": { "description": "Módulo atualizado" }, "404": { "description": "Módulo não encontrado" } } }
    },
    "/courses/v1/modulos/{moduloId}/materiais": { 
      "post": { "summary": "Upload de material para módulo", "description": "📁 Faz upload direto via Base64. Sistema detecta automaticamente tipo, tamanho e salva no storage.\n\n🎯 **Como usar no Frontend:**\n1. Converta arquivo para Base64\n2. Envie JSON com nome_arquivo e base64\n3. Sistema detecta tipo automaticamente\n\n📋 **Exemplo de conversão:**\n```javascript\nfunction uploadFile(file, moduloId) {\n  const reader = new FileReader();\n  reader.onload = () => {\n    const base64 = reader.result.split(',')[1];\n    fetch(`/courses/v1/modulos/${moduloId}/materiais`, {\n      method: 'POST',\n      headers: { 'Content-Type': 'application/json' },\n      body: JSON.stringify({\n        nome_arquivo: file.name,\n        base64: base64\n      })\n    });\n  };\n  reader.readAsDataURL(file);\n}\n```", "tags": ["materials"], "parameters": [{ "name": "moduloId", "in": "path", "required": true, "schema": { "type": "string", "format": "uuid" } }], "requestBody": { "required": true, "content": { "application/json": { "schema": { "type": "object", "required": ["nome_arquivo", "base64"], "properties": { "nome_arquivo": { "type": "string", "description": "Nome do arquivo com extensão", "example": "apostila.pdf" }, "base64": { "type": "string", "description": "Conteúdo do arquivo em Base64 (sem prefixo data:)", "example": "JVBERi0xLjQKJcfs..." } } }, "examples": { "pdf_upload": { "summary": "Upload de PDF", "value": { "nome_arquivo": "apostila-javascript.pdf", "base64": "JVBERi0xLjQKJeLjz..." } }, "image_upload": { "summary": "Upload de Imagem", "value": { "nome_arquivo": "diagrama.png", "base64": "iVBORw0KGgoAAAANS..." } }, "video_upload": { "summary": "Upload de Vídeo", "value": { "nome_arquivo": "aula01.mp4", "base64": "AAAAIGZ0eXBpc29t..." } } } } } }, "responses": { "201": { "description": "Material enviado com sucesso", "content": { "application/json": { "schema": { "type": "object", "properties": { "created": { "type": "boolean" }, "storage_key": { "type": "string", "description": "Chave única no storage" }, "tamanho": { "type": "integer", "description": "Tamanho em bytes" }, "tipo_arquivo": { "type": "string", "description": "MIME type detectado" } } }, "example": { "created": true, "storage_key": "courses/modulos/abc123-def456/apostila-javascript.pdf", "tamanho": 2048576, "tipo_arquivo": "application/pdf" } } } }, "400": { "description": "Arquivo inválido ou tipo não suportado" }, "413": { "description": "Arquivo muito grande (máximo 50MB)" } } }, 
      "get": { "summary": "Listar materiais do módulo", "tags": ["materials"], "parameters": [{ "name": "moduloId", "in": "path", "required": true, "schema": { "type": "string", "format": "uuid" } }], "responses": { "200": { "description": "Lista de materiais com URLs de download" }, "404": { "description": "Módulo não encontrado" } } } 
    },
    "/courses/v1/me/cursos": {
      "get": {
        "summary": "Listar meus cursos (filtro opcional status=ATIVOS|INATIVOS)",
        "tags": ["instructor"],
        "security": [{"bearerAuth":[]}],
        "parameters": [ {"name":"status","in":"query","schema":{"type":"string","enum":["ATIVOS","INATIVOS"]}} ],
        "responses": {
          "200": {"description": "Lista de cursos do instrutor"},
          "403": {"description": "Acesso negado"}
        }
      }
    },
    "/courses/v1/me/cursos/reativar": {
      "patch": {
        "summary": "Reativar meus cursos inativos (INSTRUTOR ou ADMIN)",
        "tags": ["instructor"],
        "security": [{"bearerAuth":[]}],
        "requestBody": {
          "required": false,
          "content": {
            "application/json": {
              "schema": {
                "type": "object",
                "properties": {
                  "codigos": {"type": "array", "items": {"type": "string"}, "description": "Lista opcional de códigos; se omitido reativa todos"}
                }
              }
            }
          }
        },
        "responses": {
          "200": {"description": "Resumo de reativação"},
          "403": {"description": "Acesso negado"}
        }
      }
    }
  }
} as const;