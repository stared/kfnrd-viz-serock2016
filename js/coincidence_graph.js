/* global d3 Tooltip */

function CoincidenceGraph(selector) {
  "use strict";

  var width = 900,
      height = 500;

  var svg = d3.select(selector).append("svg")
    .attr("width", width)
    .attr("height", height);

  var g = svg.append("g");

  var tooltip = new Tooltip(selector);

  // for bigger numbers
  var siNumberApprox = function (x, float) {
    var prefix = d3.formatPrefix(x);
    var scaled = prefix.scale(x);
    return scaled.toFixed((float && scaled < 10) ? 1 : 0) + prefix.symbol;
  };

  this.loadCSV = function (path) {
    d3.csv(path, function (error, data) {
      return data; // TODO
    });
  };

  this.draw = function (graph, options) {

    var options = options || {};
    var maxSize = options.maxSize || 75;
    var baseCharge = options.baseCharge || -70;
    var eoThresholdMin = options.eoThresholdMin || 1.25;
    var muteCategory = options.muteCategory || false;

    // to do: allow options
    var tooltipNodeText = function (d) {
      return siNumberApprox(d.count) +
        " uczestniczących w:<br>" +
        d.name +
        "<br><br>" +
        d.name_long +
        "<br>" +
        d.prowadzacy +
        "<br><br>" +
        d.category +
        "<br>" +
        d.blok;
    };

    this.categories = _.chain(graph.nodes)
      .countBy('category')
      .keys()
      .value();

    var colors = d3.scale.category10()
      .domain(this.categories);

    graph.links = graph.links.sort(function (a, b) {
      return b.count - a.count;
    });

    // but it hides some data...
    graph.links = graph.links.filter(function (e) {
      return e.oe > eoThresholdMin; // || e.oe < 0.5;
    });

    var sizeScale = d3.scale.sqrt()
      .domain([0, d3.max(graph.nodes, function (d) { return d.count; })])
      .range([0, maxSize]);

    var maxPMI = d3.max(graph.links, function (e) { return e.pmi; });

    var opacityScale = d3.scale.pow().exponent(2)
      .domain([0, maxPMI])
      .range([0, 0.75]);

    var force = d3.layout.force()
        .charge(function (d) { return baseCharge * sizeScale(d.count); })
        .linkDistance(0)
        .gravity(0.4)
        .size([width - 200, height])
        .linkStrength(function (e) {
          return e.pmi > 0 ? Math.pow(e.pmi/maxPMI, 2) : 0;  // pow 2
        })
        .nodes(graph.nodes)
        .links(graph.links);

    var link = g.selectAll(".link")
      .data(graph.links)  // sort it
      .enter().append("line")
        .attr("class", "link")
        .style("stroke-width", function (e) { return 2 * sizeScale(e.count); })
        .style("opacity", function (e) { return opacityScale(e.pmi); })
        .on("mouseover", function (e) {
          console.log(e);
          if (muteCategory && !!e.source.category && !!e.target.category) {
            // do przemyślenia
            var text = siNumberApprox(e.count) + " uczestniczących zarazem w:<br>" +
                       e.source.category + ": " + e.source.name + " i " + e.target.category + ": " + e.target.name + "<br><br>" +
                       e.oe.toFixed(1) + "x bardziej prawdopodobna kombinacja niż losowo";
          } else {
            var text = siNumberApprox(e.count) + " uczestniczących zarazem w:<br>" +
                       e.source.name + " i " + e.target.name + "<br><br>" +
                       e.oe.toFixed(1) + "x bardziej prawdopodobna kombinacja niż losowo";
          }
          tooltip.show(text);
        })
        .on("mouseout", function () {
          tooltip.out();
        });

    var node = g.selectAll(".node")
      .data(graph.nodes)
      .enter().append("circle")
        .attr("class", "node")
        .attr("r", function (d) { return sizeScale(d.count); })
        .style("fill", function (d) {
          return colors(d.category);
        })
        .on("mouseover", function (d) {
          tooltip.show(tooltipNodeText(d));
        })
        .on("mouseout", function () {
          tooltip.out();
        });

    var label = g.selectAll(".label")
      .data(graph.nodes)
      .enter().append("text")
        .attr("class", "label")
        .style("font-size", function (d) { return 0.7 * sizeScale(d.count); })
        .text(function (d) { return d.label; });

    var drag = force.drag();
    node.call(drag);

    force.start();

    force.on("tick", function() {
        node.attr("cx", function(d) { return d.x; })
            .attr("cy", function(d) { return d.y; });

        label.attr("x", function(d) { return d.x; })
             .attr("y", function(d) { return d.y; });

        link.attr("x1", function(e) { return e.source.x; })
            .attr("y1", function(e) { return e.source.y; })
            .attr("x2", function(e) { return e.target.x; })
            .attr("y2", function(e) { return e.target.y; });
    });

  };

  this.createLegend = function () {

    var colors = d3.scale.category10()
      .domain(this.categories);

    var legend = new Legend(selector + " svg");

    legend.g.attr("transform", "translate(650, 50)");

    var legendList = this.categories.map(function (cat) {
      return {name: cat, color: colors(cat)};
    })

    legend.create(legendList);

  };

  this.remove = function () {
    svg.remove();
  }

}
