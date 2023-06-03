import { body } from 'express-validator'

export const authValidator = [
  body('email')
    .isEmail()
    .withMessage('email'),
  body('password')
    .isLength({ min: 8 })
    .withMessage('password.small')
    .isLength({ max: 30 })
    .withMessage('password.huge'),
  body('passwordConfirm')
    .custom((value, { req }) => {
      if (value !== req.body.password) {
        throw new Error('password.unmatch')
      }

      return true
    })
]