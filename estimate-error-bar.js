
var EstimateErrorBar = function(){

	var _svgContainer;

	function create(data, options){

		var labelWidth = options.maxWidth * 0.1;
		var labelHeight = options.maxHeight * 0.5;
		var barWidth = options.maxWidth - (labelWidth * 2);
		var barHeight = options.maxHeight - labelHeight;

		var greenMax = options.greenMax;
		var yellowMax = options.yellowMax;
		var redMax = options.redMax;

		// find our max (better handle max > 10 just in case)
		if(+data.params['percentile-90'] > redMax){
			redMax = Math.ceil(+data.params['percentile-90'] * 1.1);
		}

		// setup the SVG container
		_svgContainer = d3.select("#"+options.containerId).append("svg")
			.attr("width", options.maxWidth)
			.attr("height", options.maxHeight);

		// create our scale
		var linearScale = d3.scaleLinear()
			.domain([0, redMax]) // set data domain
			.range([0, barWidth]); // and fit to pixel range

		// labels
		var minLabel = _svgContainer.append("text")
			.attr("x", labelWidth / 2)
			.attr("y", barHeight * 0.666)
			.attr("font-family", options.fontFamily)
			.attr("font-size", options.fontSize)
			.style("text-anchor", "middle")
			.text(0);
		var maxLabel = _svgContainer.append("text")
			.attr("x", barWidth + (labelWidth / 2))
			.attr("y", barHeight * 0.666)
			.attr("width", labelWidth)
			.attr("font-family", options.fontFamily)
			.style("text-anchor", "middle")
			.attr("font-size", options.fontSize)
			.text(redMax);

		var unitsLabel = data.params.units + ' / ' + data.params['context-units'];
		var axisLabel = _svgContainer.append("text")
			.attr("x", (barWidth + labelWidth) / 2)
			.attr("y", barHeight + labelHeight)
			.attr("width", labelWidth)
			.attr("font-family", options.fontFamily)
			.attr("font-size", options.fontSize)
			.style("text-anchor", "middle")
			.text(unitsLabel);

		// coloured rectangles
		var green = _svgContainer.append("rect")
			.attr("x", labelWidth)
			.attr("y", 0)
			.attr("fill", "#7ec891")
			.attr("width", linearScale(greenMax))
			.attr("height", barHeight);

		var yellow = _svgContainer.append("rect")
			.attr("x", linearScale(greenMax))
			.attr("y", 0)
			.attr("fill", "#f5c85b")
			.attr("width", linearScale(yellowMax) - linearScale(greenMax))
			.attr("height", barHeight);

		var red = _svgContainer.append("rect")
			.attr("x", linearScale(yellowMax))
			.attr("y", 0)
			.attr("fill", "#fe5e69")
			.attr("width", linearScale(redMax) - linearScale(yellowMax))
			.attr("height", barHeight);

		// min/max lines, ad connect them
		var scaledMin = linearScale(+data.params['percentile-10']);
		var minLine = _svgContainer.append("line")
			.attr("x1", scaledMin)
			.attr("y1", 5)
			.attr("x2", scaledMin)
			.attr("y2", barHeight - 5)
			.attr("stroke-width", 2)
			.attr("stroke", "#444");

		var scaledMax = linearScale(+data.params['percentile-90']);
		var maxLine = _svgContainer.append("line")
			.attr("x1", scaledMax)
			.attr("y1", 5)
			.attr("x2", scaledMax)
			.attr("y2", barHeight - 5)
			.attr("stroke-width", 2)
			.attr("stroke", "#444");

		var connectingLine = _svgContainer.append("line")
			.attr("x1", scaledMin)
			.attr("y1", barHeight / 2)
			.attr("x2", scaledMax)
			.attr("y2", barHeight / 2)
			.attr("stroke-width", 2)
			.attr("stroke", "#444");

		// median circle needs to go in a block so we can center text
		var scaledMedian = linearScale(+data.params['median']);
		var medianBlock = _svgContainer.append("g")
			.attr("transform", function(d){ return "translate("+scaledMedian+","+barHeight / 2+")" });

		// create the circle
		var circleRadius = barHeight / 3;
		var circle = medianBlock.append("circle")
			.attr("r", circleRadius)
			.attr("fill", "#444");

		// create text for the block
		medianBlock.append("text")
			.attr("dx", function(d){ return -options.fontSize / 4; })
			.attr("dy", function(d){ return options.fontSize / 3; })
			.attr("font-size", options.fontSize)
			.style("fill", "#FFF")
			.text(data.params['median']);

		// tooltip
		var tooltipText = "Median estimate is "+data.params['median'] + " "+ unitsLabel;
		var tooltip = d3.select("body")
			.append("div")
			.style("position", "absolute")
			.style("z-index", "99999")
			.style("visibility", "hidden")
			.style("font-family", options.fontFamily)
			.style("font-size", options.fontSize)
			.attr("class", "estimate-bar-tooltip")
			.text(tooltipText);
		_svgContainer.on("mouseover", function(){return tooltip.style("visibility", "visible");})
			.on("mousemove", function(){return tooltip.style("top", (event.pageY-50)+"px").style("left",(event.pageX+10)+"px");})
			.on("mouseout", function(){return tooltip.style("visibility", "hidden");});
	}

	function destroy(){
		_svgContainer.selectAll("*").remove();
	}

	return {
		create: create,
		destroy: destroy
	}

}();

