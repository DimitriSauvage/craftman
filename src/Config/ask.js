const inquirer = require("inquirer");
const helpers = require("./helpers");

inquirer.registerPrompt(
  "autocomplete",
  require("inquirer-autocomplete-prompt")
);

const getDefaultConfig = variable => ({
  name: variable.name,
  message: variable.message || `What ${variable.name} ?`
});

const questionsConfig = {
  text: variable => ({
    ...getDefaultConfig(variable),
    type: "input"
  }),
  choices: variable => ({
    ...getDefaultConfig(variable),
    type: "list",
    choices: variable.choices
  }),
  file: variable => ({
    ...getDefaultConfig(variable),
    type: "autocomplete",
    source: (_, fileName) =>
      new Promise(r =>
        r(
          helpers
            .getFiles(variable.path || "./")
            .filter(
              f =>
                !fileName ||
                f.toLowerCase().indexOf(fileName.toLowerCase()) != -1
            )
            .filter(f => {
              if (!variable.matchRegex) return true;
              const regexMatch = new RegExp(variable.matchRegex);
              return regexMatch.test(f);
            })
            .filter(
              f =>
                !variable.matchString ||
                f.toLowerCase().indexOf(variable.matchString.toLowerCase()) !=
                  -1
            )
        )
      )
  })
};

module.exports = async variables => {
  const questions = Object.keys(variables).map(name => {
    const variable = variables[name];
    return questionsConfig[variable.type]({ name, ...variable });
  });

  return await inquirer.prompt(questions);
};
