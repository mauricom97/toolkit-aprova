const fs = require("fs");
let process = require("./atividades-local.json");

const cancelCondition =
  "if(model.cancelamento_alvara_principal === 'Não') { return true };";

const exceptions = [
  "pba_hidden",
  "risco_hidden",
  "texto_hidden",
  "cbo_risco",
  "cbo_pba",
  "cbo_ark",
];

function editHideFunction(process) {
  let { fieldGroup } = process;
  let newFieldGroup = fieldGroup.map((field) => {
    const fieldInvalid = exceptions.includes(field.key);
    if (!fieldInvalid) {
      field = editField(field);
    }
    return field;
  });
  process.fieldGroup = newFieldGroup;
  return process;
}

function editField(field) {
  let singleExpression;
  let conditionForHideExpression = field.hideExpression;
  if (conditionForHideExpression) {
    singleExpression = extractExpressionHide(conditionForHideExpression);
  }

  let conditionForHideExpressionProperties =
    field?.expressionProperties?.["templateOptions|||hidden"];
  if (conditionForHideExpressionProperties) {
    singleExpression = extractExpressionHide(
      conditionForHideExpressionProperties
    );
  }

  if (field.expressionProperties) {
    field.expressionProperties = removePropHideOfExpressionProp(
      field.expressionProperties
    );
  }

  const hideExpression = `(() => {${cancelCondition} ${singleExpression ? singleExpression : ""
    }})()`;
  field.hideExpression = hideExpression;

  return field;
}

function extractExpressionHide(expression) {
  let singleExpression;
  const isArrowFunction = expression.slice(0, 8) === "(() => {";
  if (isArrowFunction) {
    singleExpression = expression.slice(9, expression.length - 5);
    return singleExpression;
  }
  return `return ${expression}`;
}

function removePropHideOfExpressionProp(expressionProperties) {
  delete expressionProperties["templateOptions|||hidden"];
  delete expressionProperties.hideExpression;
  return expressionProperties;
}

function whiteFileJson(content) {
  const contentFile = JSON.stringify(content, null, 2);
  fs.writeFile("new-atividades-local.json", contentFile, (err) => {
    if (err) {
      console.error("Error writing file:", err);
      return;
    }
    console.log("File created with success");
  });
}

function addFieldCancel(process) {
  const fieldCancel = {
    key: "cancelamento_alvara_principal",
    type: "radio",
    templateOptions: {
      label: "Cancelar alvará do estabelecimento",
      options: [{ value: "Sim" }, { value: "Não" }],
      focus: "false",
      required: true,
    },
  };
  process.fieldGroup.unshift(fieldCancel);
  return process;
}

let newProcess = editHideFunction(process);
newProcess = addFieldCancel(newProcess);
whiteFileJson(newProcess);
