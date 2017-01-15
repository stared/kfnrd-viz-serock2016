/* global d3 CoincidenceGraph */

var main = {};

d3.json("data/serock2016warsztaty.json", function (error, data) {

  main.cGraph = new CoincidenceGraph("#d3graph");
  main.cGraph.g.append("text")
    .attr("x", 50)
    .attr("y", 35)
    .attr("font-size", 30)
    .text("Serock 2016 (KFnrD) - graf współuczestnictwa");
  main.cGraph.draw(data, {maxSize: 20, baseCharge: -80});
  main.cGraph.createLegend();

});
