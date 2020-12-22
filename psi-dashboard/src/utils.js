export function titleCase ( word ) {
  let strLowerCase = word.toLowerCase();
  let wordArr = strLowerCase.split(" ").map(function(currentValue) {
    return currentValue[0].toUpperCase() + currentValue.substring(1);
  });
  return wordArr;
}

