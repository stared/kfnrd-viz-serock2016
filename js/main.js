/* global d3 CoincidenceGraph */

var main = {};

d3.json("data/serock2016warsztaty.json", function (error, data) {

  main.cGraph = new CoincidenceGraph("#d3graph");
  main.cGraph.draw(data, {maxSize: 20, baseCharge: -80});
  main.cGraph.createLegend();

});
