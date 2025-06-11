import type { HttpContext } from '@adonisjs/core/http'
import User from '#models/user'
import { registerUserValidator } from '#validators/register_user'
import { loginUserValidator } from '#validators/login_user'

export default class AuthController {

public async register({ request, response }: HttpContext) {
    try {
        const data = await request.validateUsing(registerUserValidator)
        const user = await User.create(data)
        const token = await User.accessTokens.create(user)
        return { user, token }
    }catch(error) {

        if (error.messages) {
            return response.badRequest({
            status: 'error',
            error_code: 'VALIDATION_ERROR',
            error_message: error.messages.map((e: any) => e.message).join(', '),
            })
        
        }

        return response.internalServerError({
            status: 'error',
            error_code: 'SERVER_ERROR',
            error_message: 'Une erreur interne est survenue.',
        })
    }
}

public async login({ request, response }: HttpContext) {

    try {
        const { email, password } = await request.validateUsing(loginUserValidator)

        const user = await User.verifyCredentials(email, password)
        const token = await User.accessTokens.create(user)
        
        return { user, token }
    } catch (error) {
        if (error.messages) {
            return response.badRequest({
            status: 'error',
            error_code: 'VALIDATION_ERROR',
            error_message: error.messages.map((e: any) => e.message).join(', '),
        })
      }

      // Cas d'identifiants invalides (verifyCredentials échoue)
      if (error.code === "E_INVALID_CREDENTIALS") {
        return response.unauthorized({
          status: 'error',
          error_code: 'AUTH_FAILED',
          error_message: 'Adresse e-mail ou mot de passe incorrect.',
        })
      }

      return error
    }
}

}