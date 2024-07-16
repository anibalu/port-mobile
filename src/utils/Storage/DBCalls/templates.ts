import {runSimpleQuery} from './dbCommon';

export interface TemplateParams {
  templateId: string;
  title: string;
  template: string;
}

/**
 * util to add a template
 * @param template - takes in template id, title and template
 */
export async function addTemplate(template: TemplateParams) {
  await runSimpleQuery(
    `
    INSERT INTO templates (
    templateId, title, template
    ) VALUES (?,?,?);`,
    [template.templateId, template.title, template.template],
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    (tx, result) => {},
  );
}

/**
 * util to edit an existing template
 * @param template - takes in template id, title and template
 */

export async function editTemplate(template: TemplateParams) {
  await runSimpleQuery(
    `
    UPDATE templates
    SET
    title = COALESCE(?, title), 
    template = COALESCE(?, template) 
    WHERE templateId = ?;
    `,
    [template.title, template.template, template.templateId],
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    (tx, res) => {},
  );
}

/**
 * util to delete a template from the database
 * @param templateId - takes in templateId
 */
export async function deleteTemplate(templateId: string) {
  await runSimpleQuery(
    `
    DELETE FROM templates
    WHERE templateId = ?;
    `,
    [templateId],
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    (tx, result) => {},
  );
}

/**
 * util to get all templates in the database
 * @returns an array of all templates
 */
export async function getAllTemplates(): Promise<TemplateParams[]> {
  const templates: TemplateParams[] = [];
  await runSimpleQuery('SELECT * FROM templates;', [], (tx, results) => {
    const len = results.rows.length;
    for (let i = 0; i < len; i++) {
      templates.push(results.rows.item(i));
    }
  });
  return templates;
}
