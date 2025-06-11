import type { HttpContext } from '@adonisjs/core/http'
import ExcelService from '../Services/ExcelService.js'
import { customAlphabet } from 'nanoid'
import Planification from '#models/planification'

export default class PlanificationsController {

    /**
     * Display a listing of the resource.
     */
    async index({ auth }: HttpContext) {

        try{
            var plns = await Planification.query().where('userId', auth.user?.id as number).orderBy('createdAt', 'desc');
            return plns;
        }catch(error) {
            console.error('Error retrieving planifications:', error);
        }
    }

    async delete({ params, auth }: HttpContext) {
        const { id } = params;
        console.log('Deleting planification with ID:', id);
        try {
            const planification = await Planification.query().where('id', id).where('userId', auth.user?.id as number).firstOrFail();
            await planification.delete();
            console.log('Planification deleted successfully:', planification);
            return {
                message: 'Planification deleted successfully',
                planificationId: id
            };
        } catch (error) {
            console.error('Error deleting planification:', error);
            return {
                message: 'Error deleting planification',
                error: error.message
            };
        }
    }

    async generate({ auth, request }: HttpContext) {

        const { niveau, anneeScolaire, Cycle } = request.all()

        const fullName = auth.user?.fullName || 'Inconnu';  

        console.log('Received data:', { fullName, niveau, anneeScolaire, Cycle })

        // load json file at app\resources\spreadsheets\data
        const jsonFilePath = '../resources/spreadsheets/data/modules_flat.json'

        // Dynamically import the JSON file
        const modulesData = await import(jsonFilePath, { with: { type: 'json' } });

        console.log('Loaded JSON data:', modulesData.default);

        const alphabet = '0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz'

        const generateShortId = customAlphabet(alphabet, 8)

        const shortId = generateShortId()

        let data = Object.assign({ fullName, niveau, anneeScolaire, Cycle }, modulesData.default);

        //let data = modulesData.default;

        console.log('Merged data:', data);

        try {
            const oppath = await ExcelService.generateFromTemplate(data, anneeScolaire + ".xlsx", "Planification_" + anneeScolaire + "_" + shortId);
            console.log('Generated Excel file at:', oppath);
        }catch (error) {
            console.error('Error during data processing:', error);
        }

        const planificationData = {
            userId: auth.user?.id,
            shortId: shortId,
            title: `Planification informatique lycée ${anneeScolaire}`,
            anneeScolaire: anneeScolaire,
            niveau: niveau,
            matiere: 'Informatique',
            createdBy: fullName
        };

        Planification.create(planificationData).then((planification) => {
            console.log('Planification created:', planification);
            return planificationData;
        }).catch((error) => {
            console.error('Error creating planification:', error);
        });



        // steps of generating a planification
        /// Get data like: AnneeScolaire, Cycle d'enseignement, Niveau
        /// Get json files

        /// Get; Full name, Matiere, niveau, AnneeScolaire from request
        /// Get: JSON file correspending to the year selected       

        

        return {
            message: 'Planifications generated successfully'
        }
    }

}