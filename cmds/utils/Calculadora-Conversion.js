import axios from 'axios';

// Mapeo exhaustivo de países de Latinoamérica y sus códigos ISO / alias comunes
const LATAM_CURRENCIES = {
  // Norte y Centroamérica
  'mexico': { code: 'MXN', flag: '🇲🇽', name: 'Pesos Mexicanos', aliases: ['mxn', 'peso mexicano', 'pesos mexicanos', 'mexico', 'méxico'] },
  'guatemala': { code: 'GTQ', flag: '🇬🇹', name: 'Quetzales', aliases: ['gtq', 'quetzal', 'quetzales', 'guatemala'] },
  'honduras': { code: 'HNL', flag: '🇭🇳', name: 'Lempiras', aliases: ['hnl', 'lempira', 'lempiras', 'honduras'] },
  'el salvador': { code: 'USD', flag: '🇸🇻', name: 'Dólares (El Salvador)', aliases: ['el salvador', 'salvador'] },
  'nicaragua': { code: 'NIO', flag: '🇳🇮', name: 'Córdobas', aliases: ['nio', 'córdoba', 'cordoba', 'córdobas', 'cordobas', 'nicaragua'] },
  'costa rica': { code: 'CRC', flag: '🇨🇷', name: 'Colones Costarricenses', aliases: ['crc', 'colón costarricense', 'colon costarricense', 'colones', 'costa rica'] },
  'panama': { code: 'PAB', flag: '🇵🇦', name: 'Balboas / Dólares', aliases: ['pab', 'balboa', 'balboas', 'panamá', 'panama'] },

  // El Caribe
  'republica dominicana': { code: 'DOP', flag: '🇩🇴', name: 'Pesos Dominicanos', aliases: ['dop', 'peso dominicano', 'pesos dominicanos', 'república dominicana', 'republica dominicana', 'dominicana'] },
  'cuba': { code: 'CUP', flag: '🇨🇺', name: 'Pesos Cubanos', aliases: ['cup', 'peso cubano', 'pesos cubanos', 'cuba'] },
  'puerto rico': { code: 'USD', flag: '🇵🇷', name: 'Dólares (Puerto Rico)', aliases: ['puerto rico'] },

  // Sudamérica
  'venezuela': { code: 'VES', flag: '🇻🇪', name: 'Bolívares', aliases: ['ves', 'bs', 'bolivar', 'bolívares', 'bolivares', 'venezuela', 'bs.v'] },
  'colombia': { code: 'COP', flag: '🇨🇴', name: 'Pesos Colombianos', aliases: ['cop', 'peso colombiano', 'pesos colombianos', 'colombia'] },
  'argentina': { code: 'ARS', flag: '🇦🇷', name: 'Pesos Argentinos', aliases: ['ars', 'peso argentino', 'pesos argentinos', 'argentina'] },
  'chile': { code: 'CLP', flag: '🇨🇱', name: 'Pesos Chilenos', aliases: ['clp', 'peso chileno', 'pesos chilenos', 'chile'] },
  'peru': { code: 'PEN', flag: '🇵🇪', name: 'Soles', aliases: ['pen', 'sol', 'soles', 'soles peruanos', 'perú', 'peru'] },
  'brasil': { code: 'BRL', flag: '🇧🇷', name: 'Reales', aliases: ['brl', 'real', 'reales', 'brasil', 'brazil'] },
  'uruguay': { code: 'UYU', flag: '🇺🇾', name: 'Pesos Uruguayos', aliases: ['uyu', 'peso uruguayo', 'pesos uruguayos', 'uruguay'] },
  'paraguay': { code: 'PYG', flag: '🇵🇾', name: 'Guaraníes', aliases: ['pyg', 'guaraní', 'guarani', 'guaraníes', 'guaranies', 'paraguay'] },
  'bolivia': { code: 'BOB', flag: '🇧🇴', name: 'Bolivianos', aliases: ['bob', 'boliviano', 'bolivianos', 'bolivia'] },
  'ecuador': { code: 'USD', flag: '🇪🇨', name: 'Dólares (Ecuador)', aliases: ['ecuador'] },

  // Monedas Globales de referencia
  'usd': { code: 'USD', flag: '💵', name: 'Dólares', aliases: ['usd', 'dolar', 'dólar', 'dolares', 'dólares', 'us', 'bucks'] },
  'eur': { code: 'EUR', flag: '💶', name: 'Euros', aliases: ['eur', 'euro', 'euros'] }
};

export default {
  command: ['calc', 'calcular', 'calculadora', 'convertir', 'dolar', 'divisa', 'moneda', 'tasas'],
  category: 'utils',
  description: 'Calculadora matemática avanzada y conversor de divisas para Latinoamérica.',

  run: async ({ msg, text, usedPrefix, command }) => {
    try {
      if (!text && command !== 'tasas') {
        return msg.reply(
          `《✤》 Ingresa una consulta de divisas o matemática. Ejemplo:\n` +
          `> *${usedPrefix}${command} 5+6*\n` +
          `> *${usedPrefix}${command} 100 usd a pesos colombianos*\n` +
          `> *${usedPrefix}${command} 50 soles en mexico*\n` +
          `> *${usedPrefix}tasas*`
        );
      }

      const queryText = (command === 'tasas' && !text) ? 'tasas' : text;
      const responseText = await processQuery(queryText);
      await msg.reply(responseText);

    } catch (e) {
      console.error('Error en comando calculadora:', e);
      await msg.reply('❌ Error al procesar la consulta.');
    }
  }
};

async function processQuery(input) {
  const cleanInput = input.toLowerCase().replace(/¿|\?/g, '').trim();

  // Si pide ver el listado de tasas
  if (cleanInput === 'tasas' || cleanInput === 'tasa' || cleanInput === 'divisas' || cleanInput === 'monedas') {
    return await showAllLatamRates();
  }

  // Detectar si contiene nombres de monedas, países o términos de cambio
  const isCurrencyQuery = Object.values(LATAM_CURRENCIES).some(c => 
    c.aliases.some(alias => cleanInput.includes(alias))
  ) || cleanInput.includes('cambio') || cleanInput.includes('conversión') || cleanInput.includes('tasa');

  if (isCurrencyQuery) {
    return await handleLatamCurrencyConversion(cleanInput);
  }

  // Si no es consulta financiera, evaluar operación matemática
  return handleMathEvaluation(cleanInput);
}

async function handleLatamCurrencyConversion(text) {
  try {
    // Obtener tasas de cambio en tiempo real actualizadas diariamente
    const res = await axios.get('https://open.er-api.com/v6/latest/USD', { timeout: 8000 });
    const rates = res.data?.rates || {};

    // Extraer monto numérico si existe
    const numberMatch = text.match(/[\d,.]+/);
    let amount = numberMatch ? parseFloat(numberMatch[0].replace(',', '')) : 1;
    if (isNaN(amount) || amount <= 0) amount = 1;

    // Identificar moneda de origen y moneda de destino según los alias encontrados
    let sourceCurrency = null;
    let targetCurrency = null;

    // Detectar patrones tipo "X a Y" o "X en Y"
    const splitParts = text.split(/\ba\b|\ben\b|\bpor\b/);

    if (splitParts.length >= 2) {
      const leftPart = splitParts[0];
      const rightPart = splitParts[1];

      sourceCurrency = findCurrencyInText(leftPart);
      targetCurrency = findCurrencyInText(rightPart);
    }

    // Si no se detectó origen, por defecto se asume USD si habla de dólares o no se especifica
    if (!sourceCurrency) {
      sourceCurrency = findCurrencyInText(text) || LATAM_CURRENCIES['usd'];
    }

    // Si el usuario pregunta "1 dólar en México" o "1300 bs en pesos mexicanos"
    if (!targetCurrency) {
      // Buscar una segunda moneda mencionada distinta
      for (const key in LATAM_CURRENCIES) {
        const item = LATAM_CURRENCIES[key];
        if (item.code !== sourceCurrency.code && item.aliases.some(a => text.includes(a))) {
          targetCurrency = item;
          break;
        }
      }
    }

    // Caso 1: Conversión entre dos monedas específicas (ej. Bs a MXN, Soles a COP)
    if (sourceCurrency && targetCurrency && sourceCurrency.code !== targetCurrency.code) {
      const rateSource = rates[sourceCurrency.code] || 1;
      const rateTarget = rates[targetCurrency.code] || 1;

      // Convertir origen -> USD -> destino
      const amountInUsd = amount / rateSource;
      const convertedValue = amountInUsd * rateTarget;

      return `💱 *Conversión de Divisas (Latinoamérica)*\n\n` +
             `${sourceCurrency.flag} *${amount.toLocaleString()} ${sourceCurrency.name} (${sourceCurrency.code})*\n` +
             `⬇️ equivalen a:\n` +
             `${targetCurrency.flag} *${convertedValue.toLocaleString('es-MX', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} ${targetCurrency.name} (${targetCurrency.code})*\n\n` +
             `📈 *Tasa de Referencia:* 1 USD = ${(rates[targetCurrency.code] || 1).toFixed(2)} ${targetCurrency.code}`;
    }

    // Caso 2: De USD a un país específico (ej. 1 USD a Venezuela / México / Colombia)
    const target = targetCurrency || sourceCurrency;
    const usdRate = rates[target.code] || 1;
    const totalConverted = amount * usdRate;

    return `💱 *Conversión de Divisas (Tasa en Vivo)*\n\n` +
           `💵 *${amount.toLocaleString()} USD*\n` +
           `⬇️ equivalen aproximadamente a:\n` +
           `${target.flag} *${totalConverted.toLocaleString('es-MX', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} ${target.name} (${target.code})*\n\n` +
           `📈 *Tasa oficial:* 1 USD = ${usdRate.toFixed(2)} ${target.code}`;

  } catch (err) {
    console.error('Error al obtener tasas de cambio:', err.message);
    return `❌ No se pudo conectar con el servicio financiero en este momento. Inténtalo de nuevo más tarde.`;
  }
}

function findCurrencyInText(str) {
  for (const key in LATAM_CURRENCIES) {
    const item = LATAM_CURRENCIES[key];
    if (item.aliases.some(alias => str.includes(alias))) {
      return item;
    }
  }
  return null;
}

async function showAllLatamRates() {
  try {
    const res = await axios.get('https://open.er-api.com/v6/latest/USD', { timeout: 8000 });
    const rates = res.data?.rates || {};

    let msg = `🌎 *Tasas de Cambio de Latinoamérica (Base 1 USD)*:\n\n`;

    const uniqueCountries = [
      'venezuela', 'mexico', 'colombia', 'argentina', 'peru', 
      'chile', 'brasil', 'guatemala', 'honduras', 'nicaragua', 
      'costa rica', 'republica dominicana', 'uruguay', 'paraguay', 'bolivia'
    ];

    uniqueCountries.forEach(countryKey => {
      const info = LATAM_CURRENCIES[countryKey];
      if (info && rates[info.code]) {
        msg += `${info.flag} *${info.name}:* ${rates[info.code].toFixed(2)} ${info.code}\n`;
      }
    });

    msg += `\n💶 1 EUR = ${(rates['EUR'] || 1).toFixed(2)} USD`;
    return msg;
  } catch (e) {
    return `❌ Error al obtener el resumen de divisas de Latinoamérica.`;
  }
}

function handleMathEvaluation(text) {
  try {
    let sanitized = text
      .replace(/cuánto es|cuanto es|cuánto vale|cuanto vale|cuanto son|cuánto son/g, '')
      .replace(/multiplicado por|multiplica|por|x|\*/g, '*')
      .replace(/dividido entre|divide entre|entre|\//g, '/')
      .replace(/más|mas|\+/g, '+')
      .replace(/menos|\-/g, '-')
      .replace(/[^0-9+\-*/().]/g, '')
      .trim();

    if (!sanitized || sanitized.length === 0) {
      return 'No pude reconocer una operación matemática válida. Prueba escribiendo: *.calc 5+6* o *.calc 10/4*';
    }

    if (!/^[0-9+\-*/().\s]+$/.test(sanitized)) {
      return '❌ La expresión matemática contiene caracteres no permitidos.';
    }

    const evalResult = Function(`'use strict'; return (${sanitized})`)();

    if (isNaN(evalResult) || !isFinite(evalResult)) {
      return '❌ El resultado no es un número válido o contiene división por cero.';
    }

    return `🔢 *Resultado Matemático*\n\n> *Operación:* ${sanitized}\n> *Resultado:* *${evalResult.toLocaleString()}*`;
  } catch (e) {
    return '❌ No pude interpretar la operación matemática. Asegúrate de escribirla correctamente (ej: 5+6, 10/4, 5*6).';
  }
}