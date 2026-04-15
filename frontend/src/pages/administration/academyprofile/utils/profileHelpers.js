export const countryNames = {
  TN: 'Tunisia', DZ: 'Algeria', MA: 'Morocco',
  LY: 'Libya', EG: 'Egypt', MR: 'Mauritania'
};

export const getCountryName = (code) => countryNames[code] || code || 'Not specified';
