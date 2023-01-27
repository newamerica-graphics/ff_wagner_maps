import * as d3 from 'd3'
import '../node_modules/leaflet/dist/leaflet.css'
import './index.scss'
import { colorsets } from './lib/colors'

var L = require('leaflet');

export default function (el, data, group_attribute) {  
  var map = L.map(el).setView([51.505, -0.09], 2)
  
  L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png', {
    maxZoom: 19,
    attribution: '&copy; <a href="http://www.openstreetmap.org/copyright">OpenStreetMap</a>'
    }).addTo(map);
  
  // Add svg layer to the map
  L.svg().addTo(map);
  
  data = data.filter(d => d.latitude && d.longitude)
  let groups = [...new Set(data.map(e => e[group_attribute]))]

  let svg = d3.select(el)
    .select("svg")

  const markers = svg.selectAll("myCircles")
    .data(data)
    .join("circle")
      .attr("cx", d => map.latLngToLayerPoint([d.latitude, d.longitude]).x)
      .attr("cy", d => map.latLngToLayerPoint([d.latitude, d.longitude]).y)
      .attr("r", 2)
      .style("fill", d => colorsets.unordered[groups.indexOf(d[group_attribute])]) //TODO more efficient
      .attr("fill-opacity", .8)
      .attr("stroke", d => colorsets.unordered[groups.indexOf(d[group_attribute])]) //TODO more efficient
      .attr("stroke-width", 1)
  
  // Update circle position if something changes
  function update() {
    d3.selectAll("circle")
      .attr("cx", d => map.latLngToLayerPoint([d.latitude, d.longitude]).x)
      .attr("cy", d => map.latLngToLayerPoint([d.latitude, d.longitude]).y)
  }
  
  // If the user changes the map (zoom or drag), update circle position:
  map.on("moveend", update)
}