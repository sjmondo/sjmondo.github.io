// Set the dimensions and margins of the graph
let margin = {top: 30, right: 30, bottom: 30, left: 30};
let width = 600 - margin.left - margin.right;
let height = 600 - margin.top - margin.bottom;

// append the svg object to the body of the page
var svg = d3.select("#macplot")
    .append("svg")
    .attr("width", width + margin.left + margin.right)
    .attr("height", height + margin.top + margin.bottom)
    .append("g")
    .attr("transform",
	  "translate(" + margin.left + "," + margin.top + ")");

//Read the data
function loadData() {
    let details = d3.tsv("Piromy1_MAC_features.tsv", function(d) {
	return {
	    MC_id : d.MC_ID,
	    x_axis : +d.length,
	    y_axis : +d.num_mods,
	    scaffold : d.scf,
	    start : d.start,
	    end : d.end,
	    present_at_promoters : d.present_at_promoter,
	    proteinIds : d.proteinIds,
	    strands : d.protein_strand
	};
    });
    return details;
};

function showData(data) {
    // Calculate min, max
    let x_min_max = d3.extent(data, d => d.x_axis);
    let y_min_max = d3.extent(data, d => d.y_axis);
    
    // Add X axis
    var x = d3.scaleLinear()
        .domain(x_min_max)
        .range([0, width]);
    svg.append("g")
        .attr("transform", "translate(0," + height + ")")
        .call(d3.axisBottom(x));

    // Add Y axis
    var y = d3.scaleLinear()
        .domain(y_min_max)
        .range([ height, 0]);
    svg.append("g")
        .call(d3.axisLeft(y));

    // Color scale: give me a specie name, I return a color
    var color_promoters = d3.scaleOrdinal()
        .domain(["yes", "no"])
        .range(["#008000", "#c7c4b8"]);
    let scaff_u = [...new Set(data.map(d => d.scaffold))];
    var color_scaffs = d3.scaleOrdinal()
        .domain(scaff_u)
        .range(d3.schemeSet2);

    // Define the div for the tooltip
    var div = d3.select("body").append("div")
        .attr("class", "tooltip")
        .style("opacity", 0);

    // Add dots
    svg.append('g')
        .selectAll("circle")
        .data(data)
        .enter()
        .append("circle")
        .attr("cx", d => x(d.x_axis))
        .attr("cy", d => y(d.y_axis))
        .attr("r", 3)
        .style("fill", "#c7c4b8")
        .style("opacity", 0.8)
        .on("mouseover", function(event, d) {
	    div.transition()
	        .duration(200)
	        .style("opacity", .9);
	    div.html("<b>MC" + d.MC_id + ", location: "  + d.scaffold + ":" + d.start + "-" + d.end + "</b><br/>ProteinId(s): " + d.proteinIds + " strand(s): " + d.strands)
	        .style("left", (event.pageX) + "px")
	        .style("top", (event.pageY - 28) + "px");
	})
        .on("mouseout", function(d) {
	    div.transition()
	        .duration(500)
	        .style("opacity", 0);
	});

    // Buttons for change color
    d3.select("#color_by_scaffs").on("click", function() {
	svg.selectAll("circle")
	    .data(data)
	    .style("fill", d => color_scaffs(d.scaffolds));
	add_legend(svg_legend, scaff_u, color_scaffs);
    });
    d3.select("#color_promoter_MACs").on("click", function() {
	svg.selectAll("circle")
	    .data(data)
	    .style("fill", d => color_promoters(d.present_at_promoters));
	add_legend(svg_legend, ["present at a promoter", "not present at a promoter"], color_promoters);
    });

    // Add Legend
    let svg_legend = create_svg_legend();
}

function create_svg_legend() {
    // Select the svg area
    let margin = {top: 30, right: 30, bottom: 30, left: 30};
    let width = 500 - margin.left - margin.right;
    let height = 500 - margin.top - margin.bottom;
    let svg_legend = d3.select("#legend")
        .append("svg")
        .attr("width", width + margin.left + margin.right)
        .attr("height", height + margin.top + margin.bottom)
        .append("g")
        .attr("transform",
	      "translate(" + margin.left + "," + margin.top + ")");
    return svg_legend;
}

function add_legend(svg_legend, legends, color) {
    // Remove previous one
    svg_legend.html("");

    // Add dots
    let circle = svg_legend.selectAll("circle")
	.data(legends);
    circle.enter()
	.append("circle")
        .attr("cx", 50)
        .attr("cy", (d, i) => 100 + i * 25)
        .attr("r", 7)
        .style("fill", d => color(d));

    // Add one dot in the legend for each name.
    // 100 is where the first dot appears. 25 is the distance between dots
    svg_legend.selectAll("text")
	.data(legends)
	.enter()
	.append("text")
        .attr("x", 70)
        .attr("y", (d,i) => 100 + i * 25)
        .style("fill", d => color(d))
        .text(d => d)
        .attr("text-anchor", "left")
        .style("alignment-baseline", "middle");
};

loadData().then(showData);
