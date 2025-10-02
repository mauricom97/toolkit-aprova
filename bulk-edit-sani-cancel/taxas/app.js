const { last_version } = require('./process.json')

function calculateDebitoValor(last_version) {
  // Extract relevant values
  const valorUpm = last_version.valor_upm;
  const tipoRisco = last_version.tipo_risco;
  const metragem = last_version.metragem_area || 0;

  // Check if the operation is exempt or no permit cancellation
  const isDispensado = last_version.transporte_area_fisica === 'Não' || last_version.tipo_risco === 'Dispensado';
  
  // Check if there are vehicles and get their count
  const temVeiculos = Array.isArray(last_version.adicionar_veiculo) && last_version.adicionar_veiculo.length > 0;
  const qtdVeiculos = temVeiculos ? last_version.adicionar_veiculo.length : 0;
  
  
  let debitoValor = 0;

  // Handle exempt or no cancellation cases
  if (isDispensado || last_version.cancelamento_alvara_principal === 'Não') {
    console.log('entrei aqui 1')
    debitoValor = temVeiculos ? 0.5 * valorUpm * qtdVeiculos : 0;
    console.log(debitoValor)
    return debitoValor;
  }

  // Calculate base value based on risk type
  const baseValor = tipoRisco === 'Autodeclaração' ? valorUpm :
                   tipoRisco === 'Inspeção Prévia' ? valorUpm * 2 : 0;

  // Calculate additional vehicle cost
  const veiculoAdicional = (tipoRisco === 'Autodeclaração' || tipoRisco === 'Inspeção Prévia') && temVeiculos 
    ? 0.5 * valorUpm * qtdVeiculos 
    : 0;

  // Calculate area-based cost for Inspeção Prévia
  let valorMetragem = 0;
  if (tipoRisco === 'Inspeção Prévia' && metragem > 0) {
    if (metragem <= 40) valorMetragem = 0.1 * valorUpm;
    else if (metragem <= 80) valorMetragem = 0.2 * valorUpm;
    else if (metragem <= 100) valorMetragem = 0.3 * valorUpm;
    else if (metragem <= 200) valorMetragem = 0.4 * valorUpm;
    else if (metragem <= 300) valorMetragem = 0.5 * valorUpm;
    else if (metragem <= 500) valorMetragem = 0.6 * valorUpm;
    else if (metragem <= 1000) valorMetragem = 0.8 * valorUpm;
    else if (metragem <= 1500) valorMetragem = 1.0 * valorUpm;
    else if (metragem <= 2000) valorMetragem = 1.2 * valorUpm;
    else if (metragem <= 3000) valorMetragem = 1.5 * valorUpm;
    else if (metragem <= 4000) valorMetragem = 1.9 * valorUpm;
    else if (metragem <= 5000) valorMetragem = 2.2 * valorUpm;
    else if (metragem <= 6000) valorMetragem = 2.6 * valorUpm;
    else if (metragem <= 7000) valorMetragem = 3.0 * valorUpm;
    else if (metragem <= 8000) valorMetragem = 3.4 * valorUpm;
    else if (metragem <= 9000) valorMetragem = 3.7 * valorUpm;
    else if (metragem <= 10000) valorMetragem = 4.0 * valorUpm;
    else valorMetragem = 4.4 * valorUpm;
  }

  // Sum all components
  debitoValor = baseValor + veiculoAdicional + valorMetragem;
  return debitoValor;
}

// Usage in template string
const debitoValor = calculateDebitoValor(last_version);
console.log(debitoValor)