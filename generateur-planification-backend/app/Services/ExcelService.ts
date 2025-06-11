import ExcelJS from 'exceljs'
import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url); // get the resolved path to the file
const __dirname = path.dirname(__filename); // get the name of the directory

export default class ExcelService {


  /**
   * Replaces placeholders in an Excel template and exports a new file.
   *
   * @param data JSON object with keys matching placeholders (e.g., { name: "Soufiane" })
   * @param templateFileName Excel template file name (e.g., "planification_template.xlsx")
   * @param outputName Output Excel file name (without extension)
   * @returns The path of the generated Excel file
   */
  public static async generateFromTemplate(
    data: Record<string, string>,
    templateFileName: string,
    outputName: string
  ): Promise<string> {
    const workbook = new ExcelJS.Workbook()

    const templatePath = path.join(__dirname, '../resources/spreadsheets/', templateFileName)
    await workbook.xlsx.readFile(templatePath)

    workbook.eachSheet((worksheet) => {
      worksheet.eachRow((row) => {
        row.eachCell((cell) => {
            if (typeof cell.value === 'string') {
                const matches = cell.value.match(/{{\s*(\w+)\s*}}/g)
                if (matches) {
                let newValue = cell.value
                matches.forEach((match) => {
                    const key = match.replace(/[{}]/g, '').trim()
                    const replacement = data[key] ?? ''
                    newValue = newValue.replace(match, replacement)
                })
                // Sanitize final value: remove any stray "{{ }}" still present
                newValue = newValue.replace(/{{[^{}]*}}/g, '') 
                cell.value = newValue
                }
            }
        })

      })
    })

    /*workbook.eachSheet((sheet) => {
        sheet.eachRow((row) => {
            row.eachCell((cell) => {
            if (typeof cell.value === 'string' && cell.value.includes('{{')) {
                throw new Error(`Placeholder non remplacé détecté en cellule ${cell.address}: ${cell.value}`)
            }
            })
        })
    })*/


    const outputDir = path.join(__dirname, '../../public/gen/planifications')
    if (!fs.existsSync(outputDir)) fs.mkdirSync(outputDir, { recursive: true })

    const outputPath = path.join(outputDir, `${outputName}.xlsx`)
    await workbook.xlsx.writeFile(outputPath)

    return outputPath
  }
}
