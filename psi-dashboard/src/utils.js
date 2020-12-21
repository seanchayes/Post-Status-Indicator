export function titleCase ( word ) {
  let strLowerCase = word.toLowerCase();
  let wordArr = strLowerCase.split(" ").map(function(currentValue) {
    return currentValue[0].toUpperCase() + currentValue.substring(1);
  });
  return wordArr;
}

/**
 * https://stackoverflow.com/questions/1664140/js-function-to-calculate-complementary-colour/37657940
 * hexToComplimentary : Converts hex value to HSL, shifts
 * hue by 180 degrees and then converts hex, giving complimentary color
 * as a hex value
 * @param  [String] hex : hex value
 * @return [String] : complimentary color as hex value
 */

