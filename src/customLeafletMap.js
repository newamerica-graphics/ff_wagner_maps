import * as d3 from 'd3'
import '../node_modules/leaflet/dist/leaflet.css'
import './index.scss'
import { colorsets } from './lib/colors'

var L = require('leaflet');

export default function (el, data, group_attribute, tooltip_template) {
  const pane = d3.select(el)
    .append("div")
    .attr("class", "pane")

  var baseEl = el.appendChild(document.createElement("div"))
  baseEl.classList.add("map")
  var map = L.map(baseEl).setView([25, 0], 2)
  
  L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png', {
    maxZoom: 19,
    attribution: '&copy; <a href="http://www.openstreetmap.org/copyright">OpenStreetMap</a>'
    }).addTo(map);
  
  // Add svg layer to the map
  L.svg().addTo(map);
  
  data = data.filter(d => d.latitude && d.longitude)
  let groups = [...new Set(data.map(d => d[group_attribute]))].sort()
  data.forEach(d => d.group_index = `${groups.indexOf(d[group_attribute])}`)
  groups = groups.map(g => ({ group: g, active: true }))

  var filters = pane.append("div")
    .attr("class", "filters")
    .selectAll("label") 
    .data(groups)
    .join("label")
      .text(d => d.group)
      .classed("filters__label filters__label--active", true)
      .style("color", (d, i) => colorsets.unordered.dark[i])
      .style("border-color", (d, i) => colorsets.unordered.light[i])
      .style("background-color", (d, i) => `${colorsets.unordered.light[i]}40`)
      .on("change", updateFilters) 
    .append("input")
      .attr("type", "checkbox")
      .attr("value", (d, i) => `group${i}`)
      .property("checked", d => d.active)
      .classed("filters__input", true)
  
  var selected_marker

  const svg = d3.select(baseEl)
    .select("svg")
    .attr("pointer-events", "auto")

  function updateData(data) {
    svg.selectAll("circle")
      .data(data)
      .join("circle")
        .classed(d => `group${d.group_index}`, true)
        .attr("cx", d => map.latLngToLayerPoint([d.latitude, d.longitude]).x)
        .attr("cy", d => map.latLngToLayerPoint([d.latitude, d.longitude]).y)
        .attr("r", 3)
        .style("fill", d => colorsets.unordered.light[d.group_index])
        .style("fill-opacity", .8)
        .style("stroke", d => colorsets.unordered.light[d.group_index])
        .style("stroke-width", 1)
        .on("mouseover", mouseover)
        .on("mouseleave", mouseleave)
        .on("click", onclick)
  }
  updateData(data)
  
  const tooltipWrapper = pane.append("div")
    .classed("tooltip", true)
    .style("opacity", 0)

  const tooltipClose = tooltipWrapper.append("div")
    .classed("tooltip__close", true)
    .html("✕")
    .style("opacity", 0)
    .on("click", (d, e) => {
      clearTooltip(selected_marker, selected_marker.datum())
      selected_marker = false
      tooltipClose.style("opacity", 0)
    })
  
  const tooltip = tooltipWrapper.append("div")
    .attr("class", "tooltip__content")
  
  function setTooltip(selection, d) {
    selection
      .style("stroke", "black")
      .style("stroke-width", 2)
      .raise()
    tooltipWrapper.style("opacity", 1)
    tooltip
      .html(tooltip_template(d))
  }

  function clearTooltip(selection, d) {
    selection
      .style("stroke", colorsets.unordered.light[d.group_index])
      .style("stroke-width", 1)
    tooltipWrapper.style("opacity", 0)
    tooltip
      .html("")
  }
  
  function onclick(e, d) {
    selected_marker && clearTooltip(selected_marker, selected_marker.datum())
    selected_marker = d3.select(this)
    setTooltip(selected_marker, d)
    tooltipClose.style("opacity", 1)
  }

  function mouseover(e, d) {
    !selected_marker && setTooltip(d3.select(this), d)
  }
  
  function mouseleave(e, d) {
    !selected_marker && clearTooltip(d3.select(this), d)
  }
  
  // Update circle position if something changes
  function updateMarkers() {
    d3.selectAll("circle")
      .attr("cx", d => map.latLngToLayerPoint([d.latitude, d.longitude]).x)
      .attr("cy", d => map.latLngToLayerPoint([d.latitude, d.longitude]).y)
  }

  function updateFilters(e, d) {
    let filter = d3.select(this)
    d.active = filter.select("input").property("checked")
    filter.classed("filters__label--active", d.active)
    updateData(data.filter(m => groups[m.group_index].active))
  }
  
  // If the user changes the map (zoom or drag), update circle position:
  map.on("moveend", updateMarkers)
}