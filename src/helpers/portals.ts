// ---------------------------------------------------- 
// |                  PORTAL HELPERS                  |
// ---------------------------------------------------- 

// ---------------------------------------------------- 
// |                     GLOBALS                      |
// ---------------------------------------------------- 

// Define imports
import { colorChoice, colorError, colorMessage, colorSuccess } from '../infra/colors'
import { UserQuestions, LooseObject, DataReturn } from '../infra/interfaces'
import autocomplete from 'inquirer-autocomplete-prompt'
import DatePrompt from "inquirer-date-prompt"
import inquirer from 'inquirer'
import fuzzy from 'fuzzy'

// ---------------------------------------------------- 
// |                   FUNCTIONS                      |
// ---------------------------------------------------- 

export async function handlePortalReturn(portalReturn: DataReturn) {
  // Show error if needed
  if (portalReturn.error) {
    console.log(colorError(portalReturn.data))
  }

  // Show success if needed
  else console.log(colorSuccess(portalReturn.data))
}

function stripAnsi(str: string): string {
  // Remove colors and bold
  return str.replace(/\u001B\[(\d+(;\d+)*)?m/g, '')
}

export async function interactCLI(paramsCLI: UserQuestions) {
  // Define answer to return
  let response: any = ''

  // Search CLI function
  function searchCLI(answers: LooseObject, input = '') {
    return new Promise((resolve) => {
      setTimeout(() => {
        resolve(fuzzy.filter(input, (paramsCLI.choices ?? [])).map((el) => el.original))
      }, Math.random() * 470 + 30)
    })
  }

  // Inquirer helpers
  inquirer.registerPrompt('autocomplete', autocomplete)
  //@ts-ignore needed for DatePrompt
  inquirer.registerPrompt('date', DatePrompt)

  // Create needed CLI params
  const objectCLI: LooseObject = {
    type: paramsCLI.type,
    name: 'interact',
    message: colorMessage(paramsCLI.message)
  }

  // Add params for auto complete type
  if (paramsCLI.type === 'autocomplete') {
    paramsCLI.choices = paramsCLI.choices?.map(choice => colorChoice(choice))
    objectCLI.choices = paramsCLI.choices
    objectCLI.source = searchCLI
  }

  // Add params for date type
  if (paramsCLI.type === 'date') {
    objectCLI.default = new Date((paramsCLI.dateDefault ?? '')),
      objectCLI.format = { month: "short" }
  }

  // Add params for checkbox type
  if (paramsCLI.type === 'checkbox') {
    paramsCLI.choices = paramsCLI.choices?.map(choice => colorChoice(choice))
    objectCLI.choices = paramsCLI.choices
  }

  // Call CLI and return user response
  await inquirer
    .prompt(objectCLI)
    .then((answer: LooseObject) => { response = answer['interact'] })

  if (paramsCLI.type === 'checkbox') {
    for (let i = 0; i < response.length; i++) {
      response[i] = stripAnsi(response[i])
    }
  }

  // Return user response
  return paramsCLI.type === 'date' || paramsCLI.type === 'checkbox' ? response : stripAnsi(response)
}