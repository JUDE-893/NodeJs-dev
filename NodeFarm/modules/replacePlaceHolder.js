// function that replace the place holder in each string with its respective values
module.exports = (str,obj) => {
  str = str.replace(/{%PRODUCT_NAME%}/g,obj.productName);
  str = str.replace(/{%IMAGE%}/g,obj.image);
  str = str.replace(/{%FROM%}/g,obj.from);
  str = str.replace(/{%ID%}/g,obj.id);
  str = str.replace(/{%NUTRIENTS%}/g,obj.nutrients);
  str = str.replace(/{%QUANTITY%}/g,obj.quantity);
  str = str.replace(/{%PRICE%}/g,obj.price);
  str = str.replace(/{%DESCRIPTION%}/g,obj.description);
  if(!obj.organic) str = str.replace(/%IS_ORGANIC%/g,'not-organic');
  return str;
}
