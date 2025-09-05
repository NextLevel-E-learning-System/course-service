import { searchCatalog } from '../repositories/catalogRepository.js';
export async function listCatalog(filters:any){
  return searchCatalog(filters);
}
