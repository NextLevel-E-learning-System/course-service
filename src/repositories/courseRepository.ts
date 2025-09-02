import { withClient } from '../db.js';
export async function insertCourse(d:any){
  await withClient(c => c.query('insert into cursos (codigo, titulo, descricao, categoria_id, instrutor_id, duracao_estimada, xp_oferecido, nivel_dificuldade, ativo, pre_requisitos) values ($1,$2,$3,$4,$5,$6,$7,$8,true,$9)', [d.codigo,d.titulo,d.descricao||null,d.categoria_id||null,d.instrutor_id||null,d.duracao_estimada||null,d.xp_oferecido||null,d.nivel_dificuldade||null,d.pre_requisitos||[]]));
}
export async function findByCodigo(codigo:string){
  return withClient(async c => {
    const r = await c.query('select codigo, titulo, descricao, categoria_id, instrutor_id, duracao_estimada, xp_oferecido, nivel_dificuldade, ativo, pre_requisitos from cursos where codigo=$1', [codigo]);
    return r.rows[0];
  });
}
