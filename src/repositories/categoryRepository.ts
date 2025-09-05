import { withClient } from '../db.js';

export async function listCategories(){
  return withClient(async c => {
    const r = await c.query('select codigo, nome, descricao, cor_hex from course_service.categorias order by nome');
    return r.rows;
  });
}

export async function insertCategory(d:{ codigo:string; nome:string; descricao?:string; cor_hex?:string }){
  await withClient(c => c.query('insert into course_service.categorias (codigo,nome,descricao,cor_hex) values ($1,$2,$3,$4)', [d.codigo,d.nome,d.descricao||null,d.cor_hex||null]));
}
