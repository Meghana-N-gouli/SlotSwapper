// placeholder - add field validators as needed
function isIsoDatetime(s) {
  return !isNaN(Date.parse(s));
}
module.exports = { isIsoDatetime };
