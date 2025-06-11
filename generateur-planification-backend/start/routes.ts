/*
|--------------------------------------------------------------------------
| Routes file
|--------------------------------------------------------------------------
|
| The routes file is used for defining the HTTP routes.
|
*/

import { middleware } from '#start/kernel'
const AuthController = () => import('#controllers/auth_controller')
const PlanificationsController = () => import('#controllers/planifications_controller')

import router from '@adonisjs/core/services/router'

router.get('/', async () => {
  
  return { message: 'Welcome to the API' }

})

router.group(() => {
  router.post('/register', [AuthController, 'register'])
  router.post('/login', [AuthController, 'login'])
}).prefix('/api/auth')


router.group(() => {
  router.get('/planifications', [PlanificationsController, 'index'])
  router.get('/planifications/delete/:id', [PlanificationsController, 'delete'])
  router.post('/planifications/generate', [PlanificationsController, 'generate'])
}).prefix('/api').use(middleware.auth())