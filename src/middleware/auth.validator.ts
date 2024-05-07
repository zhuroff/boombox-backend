import { body } from 'express-validator'

export const authValidator = [
  body('login')
    .exists()
    .trim()
    .withMessage('login.empty'),
  body('email')
    .exists()
    .withMessage('email.empty')
    .trim()
    .isEmail()
    .withMessage('email.invalid'),
  body('role')
    .exists()
    .isIn(['admin', 'user', 'listener'])
    .withMessage('role.invalid'),
  body('password')  
    .exists()
    .trim()
    .isLength({ min: 8 })
    .withMessage('password.small')
    .isLength({ max: 30 })
    .withMessage('password.huge'),
  body('passwordConfirm')
    .exists()
    .trim()
    .custom((value, { req }) => {
      if (value !== req.body.password) {
        throw new Error('password.unmatch')
      }

      return true
    })
]