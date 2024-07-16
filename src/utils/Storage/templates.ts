import * as dbCalls from './DBCalls/templates';

/**
 * util to add a template
 * @param template - takes in template id, title and template
 */
export async function addTemplate(template: dbCalls.TemplateParams) {
  await dbCalls.addTemplate(template);
}

/**
 * util to edit an existing template
 * @param template - takes in template id, title and template
 */
export async function editTemplate(template: dbCalls.TemplateParams) {
  await dbCalls.editTemplate(template);
}

/**
 * util to delete a template from the database
 * @param templateId - takes in templateId
 */
export async function deletetemplate(templateId: string) {
  await dbCalls.deleteTemplate(templateId);
}

/**
 * util to get all templates in the database
 * @returns an array of all templates
 */
export async function getAllTemplates(): Promise<dbCalls.TemplateParams[]> {
  return await dbCalls.getAllTemplates();
}
