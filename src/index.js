import customLeafletMap from './customLeafletMap'
import './index.scss'

let queue = []
let data = null

const settings = {
  map_individuals: el => {
    customLeafletMap(el, data.individuals,'vk_group')
  },
  map_units: el => {
    customLeafletMap(el, data.units,'vk_group')
  }
}

fetch('https://na-data-sheetsstorm.s3.us-west-2.amazonaws.com/prod/ff/wagner-maps.json').then(response => response.json()).then((_data)=>{
  data = _data
  for(let i=0; i<queue.length; i++)
    queue[i]()
})

window.renderDataViz = function(el){
  let id = el.getAttribute('id')
  let chart = settings[id]
  if(!chart) return

  if(data){
    chart(el)
  } else {
    queue.push(() => chart(el))
  }
}
