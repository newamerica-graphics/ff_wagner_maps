import * as d3 from 'd3'
import '../node_modules/leaflet/dist/leaflet.css'
import './index.scss'
import { getColorset } from './lib/colors'

var L = require('leaflet');

export default function (el, data, group_attribute, title, description, tooltip_template) {
  const baseEl = d3.select(el).html(`
  <div class="dv-header">
    <h3>${title}</h3>
    <div>${description}</div>
    <div class="dv-filters"></div>
  </div>
  <div class="dv-main">
    <div class="dv-map"></div>
    <div class="dv-tooltip"></div>
  </div>
  <div class="dv-footer">New America</div>
  `)

  var mapEl = el.querySelector(".dv-map")
  var map = L.map(mapEl).setView([25, 0], 2)
  
  L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png', {
    maxZoom: 6,
    attribution: '&copy; <a href="http://www.openstreetmap.org/copyright">OpenStreetMap</a>'
    }).addTo(map);
  
  L.svg().addTo(map);
  
  data = data.filter(d => d.latitude && d.longitude)
  let groups = [...new Set(data.map(d => d[group_attribute]))].sort()
  data.forEach(d => d.group_index = `${groups.indexOf(d[group_attribute])}`)
  groups = groups.map(g => ({ group: g, active: true }))

  baseEl.select(".dv-filters")
    .classed("dv-filters", true)
    .selectAll("label") 
    .data(groups)
    .join("label")
      .text(d => d.group)
      .classed("dv-filters__label dv-filters__label--active", true)
      .style("color", (d, i) => getColorset('lightest')[i])
      .style("background-color", (d, i) => getColorset('darkest')[i])
      .on("change", updateFilters) 
    .append("input")
      .attr("type", "checkbox")
      .attr("value", (d, i) => `group${i}`)
      .property("checked", d => d.active)
      .classed("dv-filters__input", true)
  
  var selected_marker

  const svg = d3.select(mapEl).select("svg")
    .attr("pointer-events", "auto")

  function updateData(data) {
    svg.selectAll("circle")
      .data(data)
      .join("circle")
        .classed(d => `group${d.group_index}`, true)
        .attr("cx", d => map.latLngToLayerPoint([d.latitude, d.longitude]).x)
        .attr("cy", d => map.latLngToLayerPoint([d.latitude, d.longitude]).y)
        .attr("r", 3)
        .style("fill", d => getColorset('medium')[d.group_index])
        .style("fill-opacity", .8)
        .style("stroke", d => getColorset('dark')[d.group_index])
        .style("stroke-width", 1)
        .on("mouseover", mouseover)
        .on("mouseleave", mouseleave)
        .on("click", onclick)
  }
  updateData(data)
  
  const tooltipWrapper = baseEl.select(".dv-tooltip")
    .style("opacity", 0)

  const tooltipHeader = tooltipWrapper.append("div")
    .classed("dv-tooltip__header", true)
  
  const tooltipGroup = tooltipHeader.append("div")
    .classed("dv-tooltip__group", true)

  const tooltipClose = tooltipHeader.append("div")
    .classed("dv-tooltip__close", true)
    .html("✕")
    .style("opacity", 0)
    .on("click", (d, e) => {
      clearTooltip(selected_marker, selected_marker.datum())
      selected_marker = false
      tooltipClose.style("opacity", 0)
    })

  const tooltipContent = tooltipWrapper.append("div")
    .classed("dv-tooltip__content", true)
  
  function setTooltip(selection, d) {
    selection
      .style("stroke", "black")
      .style("stroke-width", 2)
      .raise()
    tooltipWrapper.style("opacity", 1)
    tooltipHeader.style("background-color", getColorset('darker')[d.group_index])
    tooltipGroup.html(d[group_attribute])
    tooltipContent.html(tooltip_template(d))
  }

  function clearTooltip(selection, d) {
    selection
      .style("stroke", getColorset('dark')[d.group_index])
      .style("stroke-width", 1)
    tooltipWrapper.style("opacity", 0)
    tooltipContent.html("")
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
    svg.selectAll("circle")
      .attr("cx", d => map.latLngToLayerPoint([d.latitude, d.longitude]).x)
      .attr("cy", d => map.latLngToLayerPoint([d.latitude, d.longitude]).y)
      .attr("r", 2 + map.getZoom()/2)
  }

  function updateFilters(e, d) {
    let filter = d3.select(this)
    let i = groups.indexOf(d)
    d.active = filter.select("input").property("checked")
    filter.classed("dv-filters__label--active", d.active)
      .style("color",  d.active ? getColorset('lightest')[i] : getColorset('darkest')[i])
      .style("background-color", d.active ? getColorset('darkest')[i] : "transparent")
    updateData(data.filter(m => groups[m.group_index].active))
  }
  
  // If the user changes the map (zoom or drag), update circle position:
  map.on("moveend", updateMarkers)
}